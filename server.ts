import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { SAMPLE_TASKS } from './src/data/sampleTasks';
import { GRAMMAR_LESSONS } from './src/data/grammarLessons';
import { INITIAL_VOCABULARY } from './src/data/sampleVocabulary';
import { ENGLISH_EXAM_PROMPTS_POOL } from './src/data/englishExamPromptsPool';
import { ENGLISH_GRAMMAR_LESSONS } from './src/data/englishGrammarLessons';
import { ENGLISH_VOCABULARY } from './src/data/englishVocabulary';
import {
  countGermanWords,
} from './src/utils/scoring';
import {
  AppLanguage,
  AssessmentMode,
  AssessmentResult,
  CEFRLevel,
  CEFRProfile,
  RequirementEvaluation,
  TargetLevelOption,
  TaskCategory,
  UserEntitlement,
  WritingTask,
} from './src/types';
import {
  isPredominantlyGerman,
  isPredominantlyEnglish,
  getAssessmentResponseSchema,
  validateAndAlignErrors,
  validateAssessmentPayload,
  calculateMedianCefr,
  normalizeCefrProfile,
  calibrateEvidenceScores,
  rescaleCategoryScoresForLevel,
  normalizeLessonId,
  validateAttachedImageInput,
  baseCefrFromExtended,
  MIN_WORDS_FOR_CEFR_EVALUATION,
  buildGoetheExamVerdict,
} from './src/utils/assessment-core';
import { getRubricMaxScoreForLevel, getRubricWeightsForLevel } from './src/utils/scoring';
import {
  ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSCODE,
  isAdminEmail,
  isValidPublicUserId,
  normalizePublicUserId,
} from './src/utils/user-id';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const cliPort = Number(process.argv[portArgIndex + 1]);
    if (Number.isFinite(cliPort) && cliPort > 0) return cliPort;
  }
  const envPort = Number(process.env.PORT);
  const defaultAppPort = Number(process.env.DEFAULT_APP_PORT);
  if (
    process.env.NODE_ENV !== 'production' &&
    envPort === Number(process.env.NGINX_PORT) &&
    Number.isFinite(defaultAppPort) &&
    defaultAppPort > 0
  ) {
    return defaultAppPort;
  }
  return Number.isFinite(envPort) && envPort > 0 ? envPort : (defaultAppPort || 3000);
}

const app = express();
const PORT = resolvePort();

app.use(express.json({ limit: '10mb' }));

// In-memory data stores for session/demo
let germanTasksStore = [...SAMPLE_TASKS];
let englishTasksStore = [...ENGLISH_EXAM_PROMPTS_POOL];
let germanVocabularyStore = [...INITIAL_VOCABULARY];
let englishVocabularyStore = [...ENGLISH_VOCABULARY];
let submissionsStore: AssessmentResult[] = [];

// Persistent server JSON store for Admin Gate Passcode, User Directory, and User Entitlements
interface ServerAppDb {
  admin_gate: {
    admin_email: string;
    passcode: string;
    updated_at: string;
  };
  entitlements: Record<string, UserEntitlement>;
  user_directory: Record<
    string,
    {
      publicId: string;
      uid: string;
      displayName: string;
      createdAt: string;
    }
  >;
}

const DATA_DIR = path.resolve(__dirname, '.data');
const APP_DB_PATH = path.join(DATA_DIR, 'app_db.json');
const ADMIN_HMAC_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  `ds-admin-secret-${crypto.createHash('sha256').update(process.env.GEMINI_API_KEY || 'deutschschreiben-2026').digest('hex').slice(0, 24)}`;

function ensureAppDb(): ServerAppDb {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(APP_DB_PATH)) {
    const initial: ServerAppDb = {
      admin_gate: {
        admin_email: ADMIN_EMAIL,
        passcode: DEFAULT_ADMIN_PASSCODE,
        updated_at: new Date().toISOString(),
      },
      entitlements: {},
      user_directory: {},
    };
    fs.writeFileSync(APP_DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(APP_DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<ServerAppDb>;
    return {
      admin_gate: parsed.admin_gate?.passcode
        ? {
            admin_email: parsed.admin_gate.admin_email || ADMIN_EMAIL,
            passcode: parsed.admin_gate.passcode,
            updated_at: parsed.admin_gate.updated_at || new Date().toISOString(),
          }
        : {
            admin_email: ADMIN_EMAIL,
            passcode: DEFAULT_ADMIN_PASSCODE,
            updated_at: new Date().toISOString(),
          },
      entitlements: parsed.entitlements || {},
      user_directory: parsed.user_directory || {},
    };
  } catch {
    const fallback: ServerAppDb = {
      admin_gate: {
        admin_email: ADMIN_EMAIL,
        passcode: DEFAULT_ADMIN_PASSCODE,
        updated_at: new Date().toISOString(),
      },
      entitlements: {},
      user_directory: {},
    };
    fs.writeFileSync(APP_DB_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function saveAppDb(dbData: ServerAppDb): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(APP_DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');
}

// Seed admin gate DB on boot so Ff0872559580 exists immediately in DB
ensureAppDb();

function signAdminToken(uid: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid,
      email: email.trim().toLowerCase(),
      exp: Date.now() + 1000 * 60 * 60 * 12,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_HMAC_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyAdminToken(token: string | undefined | null): { uid: string; email: string } | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', ADMIN_HMAC_SECRET).update(payload).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!parsed?.email || !isAdminEmail(parsed.email)) return null;
    if (typeof parsed.exp !== 'number' || parsed.exp < Date.now()) return null;
    return { uid: parsed.uid || '', email: parsed.email };
  } catch {
    return null;
  }
}

function requireAdminAuth(req: Request, res: Response): { uid: string; email: string } | null {
  const token = req.header('x-admin-token');
  const verified = verifyAdminToken(token);
  if (!verified) {
    res.status(401).json({ error: 'ต้องยืนยันรหัสผ่านเฉพาะผู้ดูแลระบบก่อนเข้าถึงส่วนนี้' });
    return null;
  }
  return verified;
}

// Initialize Google GenAI client only if a real API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY' && geminiApiKey.trim().length > 15) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const GEMINI_MODEL = 'gemini-4-hydrogen';

function classifyGeminiError(err: any): { status: number; code: string; message: string; retryable: boolean } {
  const rawMessage = String(err?.message || err || '');
  const statusCode = Number(err?.status || err?.code || 0);

  if (statusCode === 403 || rawMessage.includes('PERMISSION_DENIED') || rawMessage.includes('API_KEY_INVALID') || statusCode === 400 && rawMessage.toLowerCase().includes('api key')) {
    return {
      status: 503,
      code: 'API_KEY_ERROR',
      message: 'การเชื่อมต่อ Gemini API ไม่ผ่านการยืนยันสิทธิ์ กรุณาตรวจสอบ GEMINI_API_KEY ใน Settings > Secrets',
      retryable: false,
    };
  }
  if (statusCode === 429 || rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
    return {
      status: 429,
      code: 'RATE_LIMITED',
      message: 'ขณะนี้มีผู้ใช้งานระบบ AI หนาแน่น (Rate Limit) กรุณารอสักครู่แล้วกดส่งตรวจใหม่อีกครั้ง',
      retryable: true,
    };
  }
  if (statusCode === 404 || rawMessage.includes('NOT_FOUND')) {
    return {
      status: 502,
      code: 'MODEL_NOT_FOUND',
      message: `ไม่พบโมเดล AI (${GEMINI_MODEL}) กรุณาตรวจสอบการตั้งค่าโมเดลบนเซิร์ฟเวอร์`,
      retryable: false,
    };
  }
  if (rawMessage.includes('TIMEOUT') || rawMessage.toLowerCase().includes('timeout')) {
    return {
      status: 504,
      code: 'AI_TIMEOUT',
      message: 'ระบบ AI ใช้เวลาประมวลผลนานเกินกำหนด กรุณากดส่งตรวจใหม่อีกครั้ง',
      retryable: true,
    };
  }
  return {
    status: 502,
    code: 'AI_UNAVAILABLE',
    message: 'ระบบ AI ไม่สามารถประมวลผลคำตอบได้ในขณะนี้ กรุณาลองส่งตรวจใหม่อีกครั้ง',
    retryable: true,
  };
}

function isTransientError(err: any): boolean {
  const status = Number(err?.status || err?.code || 0);
  const msg = String(err?.message || '').toLowerCase();
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  return (
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('fetch failed') ||
    msg.includes('resource_exhausted') ||
    msg.includes('unavailable') ||
    msg.includes('invalid json')
  );
}

async function generateWithRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt === maxAttempts || !isTransientError(err)) {
        throw err;
      }
      const backoffMs = 800 * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
  throw lastError;
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'DeutschSchreiben AI',
    version: '2.0.0',
    model: GEMINI_MODEL,
    geminiConfigured: !!aiClient,
  });
});

// User ID Directory & Entitlement APIs
app.post('/api/users/register-id', (req: Request, res: Response) => {
  const { publicId, uid, displayName } = req.body || {};
  const normalizedId = normalizePublicUserId(String(publicId || ''));
  if (!isValidPublicUserId(normalizedId) || typeof uid !== 'string' || !uid.trim()) {
    return res.status(400).json({ error: 'Invalid publicId or uid' });
  }
  const dbData = ensureAppDb();
  const existing = dbData.user_directory[normalizedId];
  dbData.user_directory[normalizedId] = {
    publicId: normalizedId,
    uid: existing?.uid || uid.trim(),
    displayName:
      (typeof displayName === 'string' && displayName.trim().slice(0, 80)) ||
      existing?.displayName ||
      'ผู้เรียน',
    createdAt: existing?.createdAt || new Date().toISOString(),
  };
  saveAppDb(dbData);
  return res.json({ ok: true, publicId: normalizedId });
});

app.get('/api/entitlements/:publicId', (req: Request, res: Response) => {
  const normalizedId = normalizePublicUserId(String(req.params.publicId || ''));
  if (!isValidPublicUserId(normalizedId)) {
    return res.status(400).json({ error: 'Invalid publicId format' });
  }
  const dbData = ensureAppDb();
  const ent = dbData.entitlements[normalizedId] || null;
  return res.json({ entitlement: ent });
});

// Admin Passcode Verification & Feature Granting APIs
app.post('/api/admin/verify-passcode', (req: Request, res: Response) => {
  const { uid = '', email = '', passcode = '' } = req.body || {};
  if (!isAdminEmail(String(email))) {
    return res.status(403).json({ verified: false, error: 'อีเมลนี้ไม่มีสิทธิ์ผู้ดูแลระบบ' });
  }
  const dbData = ensureAppDb();
  if (String(passcode).trim() !== dbData.admin_gate.passcode) {
    return res.status(401).json({
      verified: false,
      error: 'รหัสผ่านเฉพาะไม่ถูกต้อง กรุณากรอกรหัสผ่านให้ตรงกับฐานข้อมูล',
    });
  }
  const adminToken = signAdminToken(String(uid || 'admin'), String(email));
  return res.json({
    verified: true,
    adminToken,
    adminEmail: dbData.admin_gate.admin_email,
  });
});

app.get('/api/admin/entitlements', (req: Request, res: Response) => {
  const admin = requireAdminAuth(req, res);
  if (!admin) return;
  const dbData = ensureAppDb();
  const entitlements = Object.values(dbData.entitlements).sort(
    (a, b) => new Date(b.granted_at || 0).getTime() - new Date(a.granted_at || 0).getTime()
  );
  const directory = Object.values(dbData.user_directory);
  return res.json({ entitlements, directory });
});

app.post('/api/admin/entitlements', (req: Request, res: Response) => {
  const admin = requireAdminAuth(req, res);
  if (!admin) return;
  const { publicId, english_writing_enabled = true, note = '' } = req.body || {};
  const normalizedId = normalizePublicUserId(String(publicId || ''));
  if (!isValidPublicUserId(normalizedId)) {
    return res.status(400).json({
      error: 'รูปแบบ User ID ไม่ถูกต้อง (ต้องเป็น DS- ตามด้วยตัวอักษร/เลข 8 หลัก เช่น DS-7F9A2C1B)',
    });
  }
  const dbData = ensureAppDb();
  const entitlement: UserEntitlement = {
    publicId: normalizedId,
    english_writing_enabled: Boolean(english_writing_enabled),
    granted_by: admin.email,
    granted_at: new Date().toISOString(),
    note: typeof note === 'string' ? note.trim().slice(0, 140) : '',
  };
  dbData.entitlements[normalizedId] = entitlement;
  saveAppDb(dbData);
  return res.json({ entitlement });
});

app.post('/api/admin/passcode', (req: Request, res: Response) => {
  const admin = requireAdminAuth(req, res);
  if (!admin) return;
  const { passcode } = req.body || {};
  const trimmed = typeof passcode === 'string' ? passcode.trim() : '';
  if (trimmed.length < 6 || trimmed.length > 64) {
    return res.status(400).json({ error: 'รหัสผ่านเฉพาะต้องมีความยาว 6–64 ตัวอักษร' });
  }
  const dbData = ensureAppDb();
  dbData.admin_gate = {
    admin_email: admin.email,
    passcode: trimmed,
    updated_at: new Date().toISOString(),
  };
  saveAppDb(dbData);
  return res.json({ ok: true, updated_at: dbData.admin_gate.updated_at });
});

// Tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  const { level, category, language } = req.query;
  const lang: AppLanguage = language === 'en' ? 'en' : 'de';
  let filtered = lang === 'en' ? [...englishTasksStore] : [...germanTasksStore];
  if (level && typeof level === 'string') {
    filtered = filtered.filter((t) => t.cefr_level === level.toUpperCase());
  }
  if (category && typeof category === 'string') {
    filtered = filtered.filter((t) => t.category === category);
  }
  res.json({ tasks: filtered });
});

// Randomly draw a standardized central exam task
app.get('/api/tasks/random', (req: Request, res: Response) => {
  const { level, language } = req.query;
  const lang: AppLanguage = language === 'en' ? 'en' : 'de';
  const basePool = lang === 'en' ? englishTasksStore : germanTasksStore;
  let pool = [...basePool];
  if (level && typeof level === 'string') {
    pool = pool.filter((t) => t.cefr_level === level.toUpperCase());
  }
  if (pool.length === 0) pool = [...basePool];
  const randomIndex = Math.floor(Math.random() * pool.length);
  res.json({
    task: pool[randomIndex],
    total_in_pool: pool.length,
    total_all: basePool.length,
  });
});

app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const allTasks = [...germanTasksStore, ...englishTasksStore];
  const task = allTasks.find((t) => t.id === req.params.id || t.task_id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ task });
});

// Generate new task using Gemini 4 Hydrogen
app.post('/api/tasks/generate', async (req: Request, res: Response) => {
  try {
    const { level = 'B2', category, topic = 'Alltag & Technologie', language = 'de' } = req.body;
    const lang: AppLanguage = language === 'en' ? 'en' : 'de';
    const resolvedCategory = category || (lang === 'en' ? 'Opinion Essay' : 'Stellungnahme');

    if (!aiClient) {
      return res.status(503).json({
        error: 'ระบบ AI ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์',
      });
    }

    const prompt =
      lang === 'en'
        ? `You are a certified English exam creator specializing in CEFR ${level} (Cambridge Assessment English).
Create an authentic English writing task for category "${resolvedCategory}" on topic "${topic}".
Return valid JSON matching the schema.`
        : `You are a certified German exam creator specializing in CEFR ${level} (Goethe-Zertifikat / telc).
Create an authentic German writing task for category "${resolvedCategory}" on topic "${topic}".
Return valid JSON matching the schema.`;

    const aiResponse = await generateWithRetry(() =>
      aiClient!.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            required: ['title', 'instructions', 'requirements', 'min_words', 'max_words', 'time_limit_minutes', 'sample_outline'],
            properties: {
              task_id: { type: Type.STRING },
              topic: { type: Type.STRING },
              title: { type: Type.STRING },
              instructions: { type: Type.STRING },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              min_words: { type: Type.INTEGER },
              max_words: { type: Type.INTEGER },
              time_limit_minutes: { type: Type.INTEGER },
              sample_outline: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      })
    );

    const parsed = JSON.parse((aiResponse.text || '{}').trim());
    const newTask: WritingTask = {
      id: `task-${lang}-${Date.now()}`,
      task_id: parsed.task_id || `${lang.toUpperCase()}-${level}-${Date.now().toString().slice(-3)}`,
      language: lang,
      cefr_level: level,
      category: resolvedCategory,
      topic: parsed.topic || topic,
      title: parsed.title || `${resolvedCategory}: ${topic}`,
      instructions: parsed.instructions,
      requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
      min_words:
        parsed.min_words ||
        (level === 'A1' ? 30 : level === 'A2' ? 50 : level === 'B1' ? 80 : level === 'B2' ? 160 : 240),
      max_words:
        parsed.max_words ||
        (level === 'A1' ? 50 : level === 'A2' ? 80 : level === 'B1' ? 115 : level === 'B2' ? 220 : 330),
      time_limit_minutes:
        parsed.time_limit_minutes ||
        (level === 'A1' ? 15 : level === 'A2' ? 20 : level === 'B1' ? 25 : level === 'B2' ? 35 : 45),
      task_version: '4.0',
      sample_outline: parsed.sample_outline,
    };

    if (lang === 'en') {
      englishTasksStore.push(newTask);
    } else {
      germanTasksStore.push(newTask);
    }
    return res.json({ task: newTask });
  } catch (error: any) {
    console.error('Error generating task:', error);
    const classified = classifyGeminiError(error);
    res.status(classified.status).json({ error: classified.message, code: classified.code });
  }
});

const VALID_CATEGORIES: TaskCategory[] = [
  'E-Mail',
  'Brief',
  'Stellungnahme',
  'Erörterung',
  'Bericht',
  'Beschwerde',
  'Freier Text',
  'Email',
  'Formal Letter',
  'Opinion Essay',
  'Argumentative Essay',
  'Report',
  'Complaint Letter',
  'Free Writing',
];
const VALID_CEFR_TARGETS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

// Primary Real AI Assessment API (Individualized, Standard CEFR Rubric, Exam + Free Writing + Multimodal Image, DE & EN)
app.post('/api/assess', async (req: Request, res: Response) => {
  try {
    const {
      task_id,
      original_text,
      mode = 'exam',
      language = 'de',
      custom_prompt,
      target_level = 'AUTO',
      task_category,
      attached_image,
    } = req.body;

    const assessmentLanguage: AppLanguage = language === 'en' ? 'en' : 'de';
    const isEn = assessmentLanguage === 'en';
    const assessmentMode: AssessmentMode = mode === 'free' ? 'free' : 'exam';
    const rawTypedText = typeof original_text === 'string' ? original_text : '';
    const normalizedText = rawTypedText.replace(/\r\n/g, '\n');

    if (normalizedText.length > 25000) {
      return res.status(400).json({ error: 'ข้อความยาวเกินกำหนด (สูงสุด 25,000 ตัวอักษร)' });
    }

    // Validate optional attached image
    let validatedImage: {
      name: string;
      mimeType: 'image/png' | 'image/jpeg' | 'image/webp';
      data: string;
      sizeBytes: number;
    } | null = null;

    if (attached_image !== undefined && attached_image !== null) {
      const imgCheck = validateAttachedImageInput(attached_image);
      if (!imgCheck.valid || !imgCheck.image) {
        return res.status(400).json({ error: imgCheck.error || 'ไฟล์รูปภาพไม่ถูกต้อง' });
      }
      validatedImage = imgCheck.image;
    }

    if (normalizedText.trim().length === 0 && !validatedImage) {
      return res.status(400).json({
        error: isEn
          ? 'กรุณาเขียนข้อความภาษาอังกฤษ หรือแนบไฟล์รูปภาพงานเขียนก่อนส่งตรวจประเมิน'
          : 'กรุณาเขียนข้อความภาษาเยอรมัน หรือแนบไฟล์รูปภาพงานเขียนก่อนส่งตรวจประเมิน',
      });
    }

    // Language verification pre-check when typed text has enough words (or when no image is attached)
    if (normalizedText.trim().length > 0 && (!validatedImage || countGermanWords(normalizedText) >= 5)) {
      if (isEn) {
        const langCheck = isPredominantlyEnglish(normalizedText);
        if (!langCheck.isEnglish) {
          return res.status(400).json({ error: langCheck.reason });
        }
      } else {
        const langCheck = isPredominantlyGerman(normalizedText);
        if (!langCheck.isGerman) {
          return res.status(400).json({ error: langCheck.reason });
        }
      }
    }

    const trimmedCustomPrompt =
      typeof custom_prompt === 'string' ? custom_prompt.replace(/\r\n/g, '\n').trim() : '';
    if (trimmedCustomPrompt.length > 4000) {
      return res.status(400).json({ error: 'โจทย์เพิ่มเติมยาวเกินกำหนด (สูงสุด 4,000 ตัวอักษร)' });
    }

    const normalizedTargetLevel: TargetLevelOption = VALID_CEFR_TARGETS.includes(target_level)
      ? target_level
      : 'AUTO';
    const defaultFreeCat: TaskCategory = isEn ? 'Free Writing' : 'Freier Text';
    const normalizedCategory: TaskCategory = VALID_CATEGORIES.includes(task_category)
      ? task_category
      : defaultFreeCat;

    let task: WritingTask;
    if (assessmentMode === 'free') {
      const derivedTitle = trimmedCustomPrompt
        ? trimmedCustomPrompt.length > 72
          ? `${trimmedCustomPrompt.slice(0, 69)}...`
          : trimmedCustomPrompt
        : validatedImage
        ? isEn
          ? 'งานเขียนภาษาอังกฤษอิสระ (แนบไฟล์รูปภาพ)'
          : 'งานเขียนอิสระ (แนบไฟล์รูปภาพ)'
        : isEn
        ? 'งานเขียนภาษาอังกฤษอิสระ (Free English Writing)'
        : 'งานเขียนอิสระ (Free Writing)';

      task = {
        id: 'free-writing',
        task_id: isEn ? 'EN-FREE-WRITING' : 'FREE-WRITING',
        language: assessmentLanguage,
        cefr_level: normalizedTargetLevel === 'AUTO' ? 'B1' : normalizedTargetLevel,
        category: normalizedCategory,
        topic: isEn ? 'Free English Writing' : 'Freies Schreiben',
        title: derivedTitle,
        instructions:
          trimmedCustomPrompt ||
          (isEn
            ? 'ตรวจประเมินงานเขียนภาษาอังกฤษอิสระโดยไม่กำหนดโจทย์ตายตัว วิเคราะห์ความถูกต้อง ความชัดเจน และการสื่อสารตามหลักภาษาอังกฤษมาตรฐานสากล'
            : 'ตรวจประเมินงานเขียนภาษาเยอรมันอิสระโดยไม่กำหนดโจทย์ตายตัว วิเคราะห์ความถูกต้อง ความชัดเจน และการสื่อสารตามหลักภาษาเยอรมันจริง'),
        requirements: [],
        min_words: 0,
        max_words: 0,
        time_limit_minutes: 0,
        task_version: '4.1-free',
      };
    } else {
      const pool = isEn ? englishTasksStore : germanTasksStore;
      const foundTask =
        pool.find((t) => t.id === task_id || t.task_id === task_id) ||
        [...germanTasksStore, ...englishTasksStore].find((t) => t.id === task_id || t.task_id === task_id);
      if (!foundTask) {
        return res.status(404).json({ error: `ไม่พบโจทย์รหัส ${task_id}` });
      }
      task = foundTask;
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'ระบบตรวจข้อสอบ AI ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์',
        code: 'AI_NOT_CONFIGURED',
        retryable: false,
      });
    }

    const typedWordCount = countGermanWords(normalizedText);
    const activeLessons = isEn ? ENGLISH_GRAMMAR_LESSONS : GRAMMAR_LESSONS;
    const lessonCatalogText = activeLessons
      .map((l) => `- ${l.id}: ${l.german_title} (${l.topic}, ${l.cefr_level})`)
      .join('\n');

    const levelExpectationsMap: Record<string, string> = isEn
      ? {
          A1: `TARGET EXAM LEVEL A1 (CEFR A1 English — 25-POINT RUBRIC):
- Grade numeric rubric scores strictly AGAINST A1 EXPECTATIONS on the 25-POINT SCALE (total max = 25).
- An A1 learner who fulfills all task prompts clearly in simple SVO sentences (Present Simple / Present Continuous), uses basic everyday vocabulary, appropriate greeting/closing, and meets 30-50 words deserves 21-25/25 for THIS A1 exam.
- Do NOT deduct points for absence of passive voice, conditionals, or B2/C1 connectors. Only penalize missing task points, wrong verb conjugation / S-V agreement, incomprehensible syntax, or register mismatch.`,
          A2: `TARGET EXAM LEVEL A2 (Cambridge A2 Key / CEFR A2 — 25-POINT RUBRIC):
- Grade numeric rubric scores strictly AGAINST A2 EXPECTATIONS on the 25-POINT SCALE (total max = 25).
- Expect simple narration/invitations/requests, accurate Past Simple & future (going to/will), basic modals (can, must, should), simple connectors (and, but, because, so, although), and appropriate greeting/closing within 50-80 words (deserves 21-25/25 when fulfilled cleanly).
- Do NOT penalize for lacking C1 inversion or advanced academic lexis.`,
          B1: `TARGET EXAM LEVEL B1 (Cambridge B1 Preliminary / CEFR B1 — 100-POINT RUBRIC):
- Grade numeric rubric scores AGAINST B1 EXPECTATIONS on the 100-POINT SCALE (80-115 words).
- Expect coherent paragraphing, accurate complex clauses (although, because, if-clauses type 1/2, relative clauses), reasoned opinions/experiences, and intermediate vocabulary.`,
          B2: `TARGET EXAM LEVEL B2 (Cambridge B2 First / CEFR B2 — 100-POINT RUBRIC):
- Grade numeric rubric scores AGAINST B2 EXPECTATIONS on the 100-POINT SCALE (160-220 words).
- Expect differentiated pros/cons essays or formal complaint/report precision, varied linking words (however, furthermore, nevertheless, on the one hand... on the other hand), conditionals/passives, and consistent register.`,
          C1: `TARGET EXAM LEVEL C1 (Cambridge C1 Advanced / CEFR C1 — 100-POINT RUBRIC):
- Grade numeric rubric scores AGAINST C1 EXPECTATIONS on the 100-POINT SCALE (240-330 words).
- Expect academic/analytical precision, inversion, participle clauses, hedging, cleft sentences, sophisticated collocations, and cohesive synthesis across all prompt points.`,
          AUTO: `OPEN / FREE CEFR CALIBRATION (NO FIXED EXAM LEVEL — 100-POINT RUBRIC):
- The learner did NOT lock a target CEFR exam level.
- Grade numeric rubric scores fairly on the 100-POINT SCALE based on communicative clarity, grammatical accuracy, natural English phrasing, cohesion, and how well the learner answered their optional custom prompt / attached prompt image (if any).
- Do NOT apply artificial word-count deductions just because a free-writing piece is shorter or longer than a standard exam format.`,
        }
      : {
          A1: `TARGET EXAM LEVEL A1 (Start Deutsch 1 / Goethe-Zertifikat A1 — 25-POINT RUBRIC):
- Grade numeric rubric scores strictly AGAINST A1 EXPECTATIONS on the 25-POINT SCALE (total max = 25).
- An A1 learner who fulfills all Leitpunkte clearly in simple Hauptsätze (S-V-O), uses basic everyday vocabulary, appropriate du/Sie greeting/closing, and meets 30-50 words deserves 21-25/25 for THIS A1 exam.
- Do NOT deduct points for absence of Nebensätze, Passiv, Konjunktiv II, or advanced B2/C1 connectors. Only penalize missing Leitpunkte, incomprehensible grammar/conjugation, wrong V2 word order, missing noun capitalization, or register mismatch.`,
          A2: `TARGET EXAM LEVEL A2 (Goethe-Zertifikat A2 / telc Deutsch A2 — 25-POINT RUBRIC):
- Grade numeric rubric scores strictly AGAINST A2 EXPECTATIONS on the 25-POINT SCALE (total max = 25).
- Expect simple everyday narration/requests, basic Perfekt (haben/sein + Partizip II) or Präteritum (war/hatte), Modalverben, simple connectors (und, aber, denn, oder, weil, dass), and appropriate du/Sie register within 50-80 words (deserves 21-25/25 when fulfilled cleanly).
- Do NOT penalize for lacking C1 Nominalstil or B2 zweigliedrige Konnektoren.`,
          B1: `TARGET EXAM LEVEL B1 (Goethe-Zertifikat B1 / telc Deutsch B1 — 100-POINT RUBRIC):
- Grade numeric rubric scores AGAINST B1 EXPECTATIONS on the 100-POINT SCALE (80-115 words).
- Expect coherent connected text, accurate Nebensätze (weil, obwohl, wenn, dass with Verbletztstellung), reasoned opinions/experiences, and everyday-to-intermediate vocabulary.`,
          B2: `TARGET EXAM LEVEL B2 (Goethe-Zertifikat B2 / telc Deutsch B2 — 100-POINT RUBRIC):
- Grade numeric rubric scores AGAINST B2 EXPECTATIONS on the 100-POINT SCALE (160-220 words).
- Expect differentiated pros/cons argumentation or formal complaint precision, varied B2 connectors (einerseits... andererseits, hingegen, infolgedessen), Passiv/Konjunktiv II range, and consistent formal register.`,
          C1: `TARGET EXAM LEVEL C1 (Goethe-Zertifikat C1 / TestDaF — 100-POINT RUBRIC):
- Grade numeric rubric scores AGAINST C1 EXPECTATIONS on the 100-POINT SCALE (240-330 words).
- Expect academic/analytical precision, Nominalstil, Funktionsverbgefüge, nuanced hedging/concession, complex syntax, and critical synthesis across all Leitpunkte.`,
          AUTO: `OPEN / FREE CEFR CALIBRATION (NO FIXED EXAM LEVEL — 100-POINT RUBRIC):
- The learner did NOT lock a target CEFR exam level.
- Grade numeric rubric scores fairly on the 100-POINT SCALE based on communicative clarity, grammatical accuracy, natural phrasing, cohesion, and how well the learner answered their optional custom prompt / attached prompt image (if any).
- Do NOT apply artificial word-count deductions just because a free-writing piece is shorter or longer than a standard exam format.`,
        };

    const calibrationKey =
      assessmentMode === 'free' && normalizedTargetLevel === 'AUTO' ? 'AUTO' : task.cefr_level;
    const levelCalibrationInstruction = levelExpectationsMap[calibrationKey] || levelExpectationsMap.AUTO;
    const activeWeights = getRubricWeightsForLevel(calibrationKey);
    const activeMaxScore = getRubricMaxScoreForLevel(calibrationKey);
    const activeResponseSchema = getAssessmentResponseSchema(calibrationKey, assessmentLanguage);

    const multimodalInstruction = validatedImage
      ? `
MULTIMODAL IMAGE HANDLING (AN IMAGE IS ATTACHED):
- Inspect the attached image carefully. It may be:
  (A) a photo/screenshot of a writing prompt, task sheet, instructions, or chart/diagram, OR
  (B) a photo/scan of the learner's handwritten or printed ${isEn ? 'English' : 'German'} writing, OR both.
- If the learner's typed text is empty (or fewer than 5 words) and the image contains ${isEn ? 'English' : 'German'} writing by the learner: transcribe that ${isEn ? 'English' : 'German'} text accurately into "transcribed_text", and base ALL error highlights ("original_text" exact substrings), scoring, and rewritten versions on that transcribed text.
- If the learner typed an essay and the image shows a prompt/question/chart: evaluate how accurately the learner's text addresses the prompt/information shown in the image.
- If the image is unreadable, blurry, or contains no ${isEn ? 'English' : 'German'} writing while typed text is also empty: state this honestly in Thai, set cefr_estimate and cefr_profile skills to "UNDETERMINED", and cefr_confidence to "insufficient".`
      : '';

    const assessmentSystemPrompt = isEn
      ? `ROLE:
You are a senior certified English examiner (Cambridge Assessment English & CEFR) evaluating an individual learner's English writing submission against realistic CEFR standards and a strict ${activeMaxScore}-point rubric (${activeMaxScore === 25 ? 'A1/A2 25-point writing standard' : 'B1-C1 100-point writing standard'}).

${levelCalibrationInstruction}
${multimodalInstruction}

REALISTIC CEFR EVALUATION & HONEST "UNDETERMINED" RULE (CRITICAL):
- Assess the CEFR level strictly and realistically based ONLY on actual linguistic evidence demonstrated in the learner's English writing.
- NEVER guess, inflate, or force a CEFR level (such as defaulting to A1 or B1) when the text does NOT provide enough linguistic evidence to determine a level reliably.
- Return "UNDETERMINED" (for "cefr_estimate" and/or individual skills in "cefr_profile") and set "cefr_confidence" to "insufficient" whenever:
  * The submission has fewer than ~15 meaningful English words, or consists only of isolated fragments, greetings, or copied prompt words without original English sentences;
  * The text is unintelligible, corrupted, or predominantly non-English;
  * An image was submitted without typed text and could not be read reliably as English writing;
  * Specific sub-skills (e.g., cohesion or content_development) have no observable evidence in a tiny sample (set those sub-skills to "UNDETERMINED").
- When CEFR is "UNDETERMINED", clearly explain in Thai inside "cefr_summary_th" why a CEFR level could not be assigned yet (without inventing a fake level).

ABSOLUTE ANTI-TEMPLATE & INDIVIDUALIZATION MANDATE:
- Every single sentence of feedback MUST be written specifically for THIS submission and THIS learner.
- NEVER output generic boilerplate or stock praise.
- Cite exact English phrases from the learner's text in "..." quotes inside your Thai feedback so the learner sees concrete proof of why they earned each score.

RUBRIC (${activeMaxScore} POINTS TOTAL — INTEGER SCORES ONLY, DO NOT EXCEED EACH MAX):
1. task_fulfillment (0-${activeWeights.task_fulfillment}): ${
          assessmentMode === 'free'
            ? trimmedCustomPrompt || validatedImage
              ? 'How clearly and completely the text addresses the learner-provided prompt / attached prompt image and achieves its communicative goal.'
              : 'Clarity of communicative purpose, topic focus, and completeness of message (do not penalize for lacking an exam prompt in free-writing mode).'
            : `Coverage of every task bullet point, text-type conventions, relevance to prompt, and adherence to target word count (${task.min_words}-${task.max_words} words).`
        }
2. content_development (0-${activeWeights.content_development}): Clarity, detail, supporting ideas, and logical progression.
3. vocabulary (0-${activeWeights.vocabulary}): Lexical range, precision, collocations, and natural word choice.
4. grammar (0-${activeWeights.grammar}): Tense accuracy, subject-verb agreement, articles, prepositions, clauses, and sentence variety.
5. cohesion (0-${activeWeights.cohesion}): Paragraphing, coherence, text flow, and natural linking words.
6. register (0-${activeWeights.register}): Appropriateness of formality (formal vs. informal tone) and opening/closing conventions.
7. mechanics (0-${activeWeights.mechanics}): Spelling, capitalization, comma/semicolon usage, and punctuation.

REQUIREMENT EVALUATIONS (Task Points):
${
  assessmentMode === 'exam'
    ? `- Produce one item per requirement in the task's requirements list in the exact order given.`
    : `- If a custom prompt or prompt image specifies distinct points/questions, evaluate each point. If there is NO prompt (pure free writing), return an empty array [].`
}
- Set status to 'fulfilled', 'partial', or 'missing'.

ERROR ANALYSIS RULES:
- Inspect the effective English text sentence by sentence for REAL errors (GRAMMAR, VOCABULARY, COHESION, MECHANICS, STYLE).
- For every error, "original_text" MUST be an EXACT character-for-character verbatim substring copied directly from the learner's text (or from "transcribed_text" if transcribed from image) so the UI can highlight it.
- Do NOT invent errors on correct English phrases. If the text has zero errors, return an empty errors array [].
- Explain every error thoroughly in natural Thai ("explanation_th"), name the English grammar/writing rule ("rule"), and include 1-2 examples (put the English example inside the "german" property and Thai translation inside "thai").

THREE INDIVIDUALIZED WRITING VERSIONS (ENGLISH):
- corrected: Fix ONLY the errors in the learner's English text while preserving their exact ideas, sentence flow, and voice.
- b2_improved: Rewrite and expand the learner's OWN ideas to solid B2 English standard with stronger linking words and collocations.
- c1_model: Elevate the learner's OWN thesis and arguments into sophisticated C1 academic English.

LEARNING RECOMMENDATIONS:
- Provide 2-4 personalized recommendations directly triggered by the actual errors or weaknesses observed in THIS submission (or next-level refinement if error-free).
- Each recommendation must pick the closest matching "lesson_id" from this English lesson catalog:
${lessonCatalogText}

LANGUAGE RULES:
- All feedback_th, cefr_summary_th, main_strength_th, main_weakness_th, individual_coaching_note_th, strengths, weaknesses, comment_th, explanation_th, reason_th, action_th, and example.thai MUST be in clear, natural Thai (with English quotes where helpful).`
      : `ROLE:
You are a senior certified German examiner (Goethe-Institut & telc) evaluating an individual learner's German writing submission against realistic CEFR standards and a strict ${activeMaxScore}-point rubric (${activeMaxScore === 25 ? 'Goethe A1/A2 25-point Schreiben standard' : 'Goethe B1-C1 100-point Schreiben standard'}).

${levelCalibrationInstruction}
${multimodalInstruction}

REALISTIC CEFR EVALUATION & HONEST "UNDETERMINED" RULE (CRITICAL):
- Assess the CEFR level strictly and realistically based ONLY on actual linguistic evidence demonstrated in the learner's German writing.
- NEVER guess, inflate, or force a CEFR level (such as defaulting to A1 or B1) when the text does NOT provide enough linguistic evidence to determine a level reliably.
- Return "UNDETERMINED" (for "cefr_estimate" and/or individual skills in "cefr_profile") and set "cefr_confidence" to "insufficient" whenever:
  * The submission has fewer than ~15 meaningful German words, or consists only of isolated fragments, greetings, or copied prompt words without original German sentences;
  * The text is unintelligible, corrupted, or predominantly non-German;
  * An image was submitted without typed text and could not be read reliably as German writing;
  * Specific sub-skills (e.g., cohesion or content_development) have no observable evidence in a tiny sample (set those sub-skills to "UNDETERMINED").
- When CEFR is "UNDETERMINED", clearly explain in Thai inside "cefr_summary_th" why a CEFR level could not be assigned yet (without inventing a fake level).

ABSOLUTE ANTI-TEMPLATE & INDIVIDUALIZATION MANDATE:
- Every single sentence of feedback MUST be written specifically for THIS submission and THIS learner.
- NEVER output generic boilerplate or stock praise.
- Cite exact German phrases from the learner's text in „...“ quotes inside your Thai feedback so the learner sees concrete proof of why they earned each score.

RUBRIC (${activeMaxScore} POINTS TOTAL — INTEGER SCORES ONLY, DO NOT EXCEED EACH MAX):
1. task_fulfillment (0-${activeWeights.task_fulfillment}): ${
          assessmentMode === 'free'
            ? trimmedCustomPrompt || validatedImage
              ? 'How clearly and completely the text addresses the learner-provided prompt / attached prompt image and achieves its communicative goal.'
              : 'Clarity of communicative purpose, topic focus, and completeness of message (do not penalize for lacking an exam prompt in free-writing mode).'
            : `Coverage of every Leitpunkt, text-type conventions, relevance to prompt, and adherence to target word count (${task.min_words}-${task.max_words} words).`
        }
2. content_development (0-${activeWeights.content_development}): Clarity, detail, and logical progression.
3. vocabulary (0-${activeWeights.vocabulary}): Lexical range, precision, and collocations.
4. grammar (0-${activeWeights.grammar}): Morphological accuracy (Kasus, Genus, Konjugation, Deklination) and syntax.
5. cohesion (0-${activeWeights.cohesion}): Coherence, text flow, and natural connector usage.
6. register (0-${activeWeights.register}): Appropriateness of formality (Sie vs. du/ihr) and tone.
7. mechanics (0-${activeWeights.mechanics}): Spelling, German noun capitalization (Großschreibung), umlauts/ß, and punctuation.

REQUIREMENT EVALUATIONS (Leitpunkte):
${
  assessmentMode === 'exam'
    ? `- Produce one item per requirement in the task's requirements list in the exact order given.`
    : `- If a custom prompt or prompt image specifies distinct points/questions, evaluate each point. If there is NO prompt (pure free writing), return an empty array [].`
}
- Set status to 'fulfilled', 'partial', or 'missing'.

ERROR ANALYSIS RULES:
- Inspect the effective German text sentence by sentence for REAL errors (GRAMMAR, VOCABULARY, COHESION, MECHANICS, STYLE).
- For every error, "original_text" MUST be an EXACT character-for-character verbatim substring copied directly from the learner's text (or from "transcribed_text" if transcribed from image) so the UI can highlight it.
- Do NOT invent errors on correct German phrases. If the text has zero errors, return an empty errors array [].
- Explain every error thoroughly in natural Thai ("explanation_th"), name the German rule ("rule"), and include 1-2 examples ("german" + "thai").

THREE INDIVIDUALIZED WRITING VERSIONS:
- corrected: Fix ONLY the errors in the learner's text while preserving their exact ideas, sentence flow, and voice.
- b2_improved: Rewrite and expand the learner's OWN ideas to solid B2 standard.
- c1_model: Elevate the learner's OWN thesis and arguments into sophisticated C1 academic German.

LEARNING RECOMMENDATIONS:
- Provide 2-4 personalized recommendations directly triggered by the actual errors or weaknesses observed in THIS submission (or next-level refinement if error-free).
- Each recommendation must pick the closest matching "lesson_id" from this catalog:
${lessonCatalogText}

LANGUAGE RULES:
- All feedback_th, cefr_summary_th, main_strength_th, main_weakness_th, individual_coaching_note_th, strengths, weaknesses, comment_th, explanation_th, reason_th, action_th, and example.thai MUST be in clear, natural Thai (with German quotes where helpful).`;

    const emptyTypedHint = isEn
      ? '(ผู้เรียนไม่ได้พิมพ์ข้อความในช่อง — กรุณาอ่านและถอดความข้อความภาษาอังกฤษจากรูปภาพที่แนบ)'
      : '(ผู้เรียนไม่ได้พิมพ์ข้อความในช่อง — กรุณาอ่านและถอดความข้อความภาษาเยอรมันจากรูปภาพที่แนบ)';

    const userPrompt =
      assessmentMode === 'free'
        ? `ASSESSMENT MODE: FREE / OPEN WRITING (${isEn ? 'English' : 'German'})
- Target CEFR Reference: ${normalizedTargetLevel === 'AUTO' ? 'Automatic (evaluate strictly from actual text; return UNDETERMINED if insufficient evidence)' : normalizedTargetLevel}
- Requested Text Type: ${normalizedCategory}
- Optional Custom Prompt / Instructions provided by learner: ${trimmedCustomPrompt ? trimmedCustomPrompt : '(ไม่ได้ระบุโจทย์ — ตรวจประเมินงานเขียนอิสระ)'}
- Attached Image: ${validatedImage ? `Yes (${validatedImage.name})` : 'No'}

LEARNER'S TYPED TEXT (${typedWordCount} words):
"""
${normalizedText.trim() ? normalizedText : emptyTypedHint}
"""`
        : `EXAM TASK (${isEn ? 'English Writing' : 'German Writing'}):
- Task ID: ${task.task_id}
- Target CEFR Level: ${task.cefr_level}
- Category: ${task.category}
- Title: ${task.title}
- Instructions: ${task.instructions}
- Required Points (evaluate each one):
${task.requirements.map((r, idx) => `  ${idx + 1}. ${r}`).join('\n')}
- Target Word Count: ${task.min_words}–${task.max_words} words
- Attached Image: ${validatedImage ? `Yes (${validatedImage.name})` : 'No'}

LEARNER'S SUBMISSION (${typedWordCount} words):
"""
${normalizedText.trim() ? normalizedText : emptyTypedHint}
"""`;

    const contentsPayload = validatedImage
      ? {
          parts: [
            {
              inlineData: {
                mimeType: validatedImage.mimeType,
                data: validatedImage.data,
              },
            },
            { text: userPrompt },
          ],
        }
      : userPrompt;

    const parsed = await generateWithRetry(async () => {
      const controllerTimeoutMs = 35000;
      const geminiPromise = aiClient!.models.generateContent({
        model: GEMINI_MODEL,
        contents: contentsPayload,
        config: {
          systemInstruction: assessmentSystemPrompt,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: activeResponseSchema,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT: Gemini assessment exceeded 35s')), controllerTimeoutMs)
      );

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      const jsonText = (response.text || '').trim();
      if (!jsonText) {
        throw new Error('INVALID JSON: Empty response from Gemini');
      }

      let data: any;
      try {
        data = JSON.parse(jsonText);
      } catch {
        throw new Error('INVALID JSON: Malformed JSON from Gemini');
      }

      const payloadCheck = validateAssessmentPayload(data);
      if (!payloadCheck.valid) {
        throw new Error(`INVALID JSON: ${payloadCheck.reason}`);
      }
      return data;
    }, 2);

    const transcribedTextRaw =
      typeof parsed.transcribed_text === 'string'
        ? parsed.transcribed_text.replace(/\r\n/g, '\n').trim()
        : '';
    const usedTranscription = normalizedText.trim().length === 0 && transcribedTextRaw.length > 0;
    const effectiveText = usedTranscription ? transcribedTextRaw : normalizedText;

    if (!effectiveText.trim()) {
      return res.status(400).json({
        error: isEn
          ? 'ไม่พบข้อความภาษาอังกฤษที่อ่านได้ในช่องพิมพ์หรือรูปภาพที่แนบ กรุณาตรวจสอบความคมชัดของรูปภาพหรือพิมพ์ข้อความเพิ่มเติม'
          : 'ไม่พบข้อความภาษาเยอรมันที่อ่านได้ในช่องพิมพ์หรือรูปภาพที่แนบ กรุณาตรวจสอบความคมชัดของรูปภาพหรือพิมพ์ข้อความเพิ่มเติม',
      });
    }

    const effectiveWordCount = countGermanWords(effectiveText);

    // Evidence-backed error alignment & hallucination elimination
    const validatedErrors = validateAndAlignErrors(parsed.errors, effectiveText);

    // Evidence-backed numeric calibration (preserves individualized AI feedback_th)
    const calibration = calibrateEvidenceScores(
      parsed.category_scores,
      validatedErrors,
      effectiveWordCount,
      task
    );

    // Realistic CEFR profile & overall estimate (null when evidence is insufficient)
    const profile: CEFRProfile = normalizeCefrProfile(parsed.cefr_profile);
    const medianCefr = calculateMedianCefr(
      profile,
      effectiveWordCount,
      task.min_words,
      parsed.cefr_estimate
    );

    const cefrConfidence: AssessmentResult['cefr_confidence'] =
      medianCefr === null
        ? 'insufficient'
        : ['high', 'medium', 'low', 'insufficient'].includes(parsed.cefr_confidence)
        ? parsed.cefr_confidence
        : 'medium';

    const adjustments = [...calibration.adjustments];
    let cefrSummaryTh =
      typeof parsed.cefr_summary_th === 'string' ? parsed.cefr_summary_th.trim() : '';

    if (medianCefr === null) {
      const insufficientReason =
        effectiveWordCount < MIN_WORDS_FOR_CEFR_EVALUATION
          ? `ข้อความมีจำนวน ${effectiveWordCount} คำ ซึ่งน้อยกว่าเกณฑ์ขั้นต่ำ (${MIN_WORDS_FOR_CEFR_EVALUATION} คำ) ที่ใช้ประเมินสมรรถนะ CEFR ได้อย่างแม่นยำ ระบบจึงไม่ระบุระดับ CEFR`
          : 'หลักฐานทางภาษาในงานเขียนยังไม่เพียงพอที่จะจัดระดับ CEFR ได้อย่างน่าเชื่อถือ ระบบจึงไม่ระบุระดับ CEFR';

      if (!adjustments.includes(insufficientReason)) {
        adjustments.push(insufficientReason);
      }
      if (!cefrSummaryTh) {
        cefrSummaryTh = insufficientReason;
      }
    }

    const requirementEvaluations: RequirementEvaluation[] = Array.isArray(parsed.requirement_evaluations)
      ? parsed.requirement_evaluations.map((item: any, idx: number) => ({
          requirement: item?.requirement || task.requirements[idx] || `ประเด็นที่ ${idx + 1}`,
          status: ['fulfilled', 'partial', 'missing'].includes(item?.status) ? item.status : 'partial',
          evidence_quote: typeof item?.evidence_quote === 'string' ? item.evidence_quote.trim() : '',
          comment_th: typeof item?.comment_th === 'string' ? item.comment_th.trim() : '',
        }))
      : [];

    const normalizedRecommendations = Array.isArray(parsed.learning_recommendations)
      ? parsed.learning_recommendations.map((rec: any) => ({
          topic: rec?.topic || (isEn ? 'Grammar & Expression' : 'Grammatik & Ausdruck'),
          priority: ['high', 'medium', 'low'].includes(rec?.priority) ? rec.priority : 'medium',
          lesson_id: normalizeLessonId(rec?.lesson_id, rec?.topic, assessmentLanguage),
          reason_th: rec?.reason_th || '',
          action_th: rec?.action_th || '',
        }))
      : [];

    const resolvedTaskLevel: AssessmentResult['task_level'] =
      assessmentMode === 'free' && normalizedTargetLevel === 'AUTO'
        ? medianCefr
          ? baseCefrFromExtended(medianCefr)
          : 'UNSPECIFIED'
        : task.cefr_level;

    // If Free Writing AUTO detected A1 or A2, rescale the 100-point AUTO scores cleanly to the 25-point A1-A2 scale
    let finalCategoryScores = calibration.verifiedScores;
    let finalTotalScore = calibration.totalScore;
    let finalMaxTotalScore = calibration.maxTotalScore;
    let finalGrade = calibration.grade;

    if (
      assessmentMode === 'free' &&
      normalizedTargetLevel === 'AUTO' &&
      (resolvedTaskLevel === 'A1' || resolvedTaskLevel === 'A2')
    ) {
      const rescaled = rescaleCategoryScoresForLevel(calibration.verifiedScores, resolvedTaskLevel);
      finalCategoryScores = rescaled.rescaledScores;
      finalTotalScore = rescaled.totalScore;
      finalMaxTotalScore = rescaled.maxTotalScore;
      finalGrade = rescaled.grade;
    }

    const result: AssessmentResult = {
      id: `assess-${Date.now()}`,
      submission_id: `sub-${Date.now()}`,
      language: assessmentLanguage,
      task_id: task.id,
      task_title: task.title,
      task_level: resolvedTaskLevel,
      task_category: task.category,
      assessment_mode: assessmentMode,
      ...(trimmedCustomPrompt ? { custom_prompt: trimmedCustomPrompt } : {}),
      ...(validatedImage ? { attached_image_name: validatedImage.name } : {}),
      ...(assessmentMode === 'free' ? { target_level_option: normalizedTargetLevel } : {}),
      ...(usedTranscription ? { transcribed_from_image: true } : {}),
      original_text: effectiveText,
      word_count: effectiveWordCount,
      total_score: finalTotalScore,
      max_total_score: finalMaxTotalScore,
      grade: finalGrade,
      cefr_estimate: medianCefr,
      cefr_confidence: cefrConfidence,
      cefr_summary_th: cefrSummaryTh,
      main_weakness_th: parsed.main_weakness_th,
      main_strength_th: parsed.main_strength_th,
      individual_coaching_note_th: parsed.individual_coaching_note_th,
      requirement_evaluations: requirementEvaluations,
      goethe_verdict: buildGoetheExamVerdict(
        finalTotalScore,
        finalCategoryScores,
        resolvedTaskLevel,
        assessmentMode,
        finalMaxTotalScore,
        assessmentLanguage
      ),
      cefr_profile: profile,
      category_scores: finalCategoryScores,
      errors: validatedErrors,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter((s: any) => typeof s === 'string' && s.trim()) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.filter((w: any) => typeof w === 'string' && w.trim()) : [],
      writing_versions: {
        corrected: parsed.writing_versions.corrected,
        b2_improved: parsed.writing_versions.b2_improved,
        c1_model: parsed.writing_versions.c1_model,
      },
      learning_recommendations: normalizedRecommendations,
      rubric_version: '3.2',
      engine: 'ai',
      model_name: GEMINI_MODEL,
      prompt_version: isEn ? '3.3-en-level-scales' : '3.2-level-scales',
      quality: {
        adjustments,
        is_fallback: false,
      },
      created_at: new Date().toISOString(),
    };

    return res.json({ assessment: result });
  } catch (error: any) {
    console.error('Assessment AI error:', error);
    const classified = classifyGeminiError(error);
    return res.status(classified.status).json({
      error: classified.message,
      code: classified.code,
      retryable: classified.retryable,
    });
  }
});

// Submissions History & Stats (Secured per-user: essays are stored per user in Firestore / Local Vault)
app.get('/api/history', (_req: Request, res: Response) => {
  res.json({
    submissions: [],
    total: 0,
    average_score: 0,
    notice: 'User submission history is securely partitioned per authenticated user in Firestore & local client vault.',
  });
});

app.get('/api/history/:id', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Individual submissions are stored privately in user vault.' });
});

// Lessons
app.get('/api/lessons', (req: Request, res: Response) => {
  const lang: AppLanguage = req.query.language === 'en' ? 'en' : 'de';
  res.json({ lessons: lang === 'en' ? ENGLISH_GRAMMAR_LESSONS : GRAMMAR_LESSONS });
});

app.get('/api/lessons/:id', (req: Request, res: Response) => {
  const allLessons = [...GRAMMAR_LESSONS, ...ENGLISH_GRAMMAR_LESSONS];
  const lesson = allLessons.find((l) => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  res.json({ lesson });
});

// Vocabulary Bank
app.get('/api/vocabulary', (req: Request, res: Response) => {
  const lang: AppLanguage = req.query.language === 'en' ? 'en' : 'de';
  res.json({ vocabulary: lang === 'en' ? englishVocabularyStore : germanVocabularyStore });
});

app.post('/api/vocabulary', (req: Request, res: Response) => {
  const { word, meaning_th, example_sentence, example_translation_th, cefr_level = 'B2', part_of_speech = 'Noun', article, language = 'de' } = req.body;
  if (!word || !meaning_th) {
    return res.status(400).json({ error: 'Word and meaning are required' });
  }

  const lang: AppLanguage = language === 'en' ? 'en' : 'de';
  const newItem = {
    id: `vocab-${Date.now()}`,
    language: lang,
    word,
    article,
    part_of_speech,
    meaning_th,
    example_sentence: example_sentence || '',
    example_translation_th: example_translation_th || '',
    cefr_level,
    created_at: new Date().toISOString(),
  };

  if (lang === 'en') {
    englishVocabularyStore.unshift(newItem);
  } else {
    germanVocabularyStore.unshift(newItem);
  }
  res.json({ item: newItem });
});

app.delete('/api/vocabulary/:id', (req: Request, res: Response) => {
  const beforeDe = germanVocabularyStore.length;
  const beforeEn = englishVocabularyStore.length;
  germanVocabularyStore = germanVocabularyStore.filter((v) => v.id !== req.params.id);
  englishVocabularyStore = englishVocabularyStore.filter((v) => v.id !== req.params.id);
  res.json({
    success: germanVocabularyStore.length < beforeDe || englishVocabularyStore.length < beforeEn,
  });
});

// Vite middleware in dev, static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DeutschSchreiben AI] Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
