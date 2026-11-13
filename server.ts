import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { SAMPLE_TASKS } from './src/data/sampleTasks';
import { GRAMMAR_LESSONS } from './src/data/grammarLessons';
import { INITIAL_VOCABULARY } from './src/data/sampleVocabulary';
import {
  countGermanWords,
} from './src/utils/scoring';
import {
  AssessmentResult,
  CEFRProfile,
  ExtendedCEFR,
  RequirementEvaluation,
  WritingTask,
} from './src/types';
import {
  isPredominantlyGerman,
  ASSESSMENT_RESPONSE_SCHEMA,
  validateAndAlignErrors,
  validateAssessmentPayload,
  calculateMedianCefr,
  calibrateEvidenceScores,
  normalizeLessonId,
} from './src/utils/assessment-core';

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
let tasksStore = [...SAMPLE_TASKS];
let vocabularyStore = [...INITIAL_VOCABULARY];
let submissionsStore: AssessmentResult[] = [];

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

// Tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  const { level, category } = req.query;
  let filtered = [...tasksStore];
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
  const { level } = req.query;
  let pool = [...tasksStore];
  if (level && typeof level === 'string') {
    pool = pool.filter((t) => t.cefr_level === level.toUpperCase());
  }
  if (pool.length === 0) pool = [...tasksStore];
  const randomIndex = Math.floor(Math.random() * pool.length);
  res.json({
    task: pool[randomIndex],
    total_in_pool: pool.length,
    total_all: tasksStore.length,
  });
});

app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const task = tasksStore.find((t) => t.id === req.params.id || t.task_id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json({ task });
});

// Generate new task using Gemini 4 Hydrogen
app.post('/api/tasks/generate', async (req: Request, res: Response) => {
  try {
    const { level = 'B2', category = 'Stellungnahme', topic = 'Alltag & Technologie' } = req.body;

    if (!aiClient) {
      return res.status(503).json({
        error: 'ระบบ AI ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์',
      });
    }

    const prompt = `You are a certified German exam creator specializing in CEFR ${level} (Goethe-Zertifikat / telc).
Create an authentic German writing task for category "${category}" on topic "${topic}".
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
      id: `task-${Date.now()}`,
      task_id: parsed.task_id || `DE-${level}-${Date.now().toString().slice(-3)}`,
      language: 'de',
      cefr_level: level,
      category,
      topic: parsed.topic || topic,
      title: parsed.title || `${category}: ${topic}`,
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

    tasksStore.push(newTask);
    return res.json({ task: newTask });
  } catch (error: any) {
    console.error('Error generating task:', error);
    const classified = classifyGeminiError(error);
    res.status(classified.status).json({ error: classified.message, code: classified.code });
  }
});

// Primary Real AI Assessment API (Individualized, Standard CEFR Rubric, Zero Templates)
app.post('/api/assess', async (req: Request, res: Response) => {
  try {
    const { task_id, original_text } = req.body;

    if (!original_text || typeof original_text !== 'string' || original_text.trim().length === 0) {
      return res.status(400).json({ error: 'กรุณาเขียนข้อความภาษาเยอรมันก่อนส่งตรวจประเมิน' });
    }

    const normalizedText = original_text.replace(/\r\n/g, '\n');

    if (normalizedText.length > 25000) {
      return res.status(400).json({ error: 'ข้อความยาวเกินกำหนด (สูงสุด 25,000 ตัวอักษร)' });
    }

    // Language Verification Pre-Check
    const langCheck = isPredominantlyGerman(normalizedText);
    if (!langCheck.isGerman) {
      return res.status(400).json({ error: langCheck.reason });
    }

    const task = tasksStore.find((t) => t.id === task_id || t.task_id === task_id);
    if (!task) {
      return res.status(404).json({ error: `ไม่พบโจทย์รหัส ${task_id}` });
    }

    if (!aiClient) {
      return res.status(503).json({
        error: 'ระบบตรวจข้อสอบ AI ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์',
        code: 'AI_NOT_CONFIGURED',
        retryable: false,
      });
    }

    const wordCount = countGermanWords(normalizedText);
    const lessonCatalogText = GRAMMAR_LESSONS.map(
      (l) => `- ${l.id}: ${l.german_title} (${l.topic}, ${l.cefr_level})`
    ).join('\n');

    const levelExpectationsMap: Record<string, string> = {
      A1: `TARGET EXAM LEVEL A1 (Start Deutsch 1 / Goethe-Zertifikat A1):
- Grade numeric rubric scores strictly AGAINST A1 EXPECTATIONS (NOT B2/C1!).
- An A1 learner who fulfills all 3 Leitpunkte clearly in simple Hauptsätze (S-V-O), uses basic everyday vocabulary, appropriate du/Sie greeting/closing, and meets 30-50 words deserves 85-100/100 for THIS A1 exam.
- Do NOT deduct points for absence of Nebensätze, Passiv, Konjunktiv II, or advanced B2/C1 connectors. Only penalize missing Leitpunkte, incomprehensible grammar/conjugation, wrong V2 word order, missing noun capitalization, or register mismatch.
- In cefr_profile & cefr_estimate, honestly report the demonstrated CEFR sub-level (typically A1 or A2 if above-level structures appear).`,
      A2: `TARGET EXAM LEVEL A2 (Goethe-Zertifikat A2 / telc Deutsch A2):
- Grade numeric rubric scores strictly AGAINST A2 EXPECTATIONS.
- Expect simple everyday narration/requests, basic Perfekt (haben/sein + Partizip II) or Präteritum (war/hatte), Modalverben, simple connectors (und, aber, denn, oder, weil, dass), and appropriate du/Sie register within 50-80 words.
- Do NOT penalize for lacking C1 Nominalstil or B2 zweigliedrige Konnektoren. Focus on Leitpunkte coverage, basic verb placement, Kasus basics, and clear everyday communication.`,
      B1: `TARGET EXAM LEVEL B1 (Goethe-Zertifikat B1 / telc Deutsch B1):
- Grade numeric rubric scores AGAINST B1 EXPECTATIONS (80-115 words).
- Expect coherent connected text, accurate Nebensätze (weil, obwohl, wenn, dass with Verbletztstellung), reasoned opinions/experiences, and everyday-to-intermediate vocabulary.`,
      B2: `TARGET EXAM LEVEL B2 (Goethe-Zertifikat B2 / telc Deutsch B2):
- Grade numeric rubric scores AGAINST B2 EXPECTATIONS (160-220 words).
- Expect differentiated pros/cons argumentation or formal complaint precision, varied B2 connectors (einerseits... andererseits, hingegen, infolgedessen), Passiv/Konjunktiv II range, and consistent formal register.`,
      C1: `TARGET EXAM LEVEL C1 (Goethe-Zertifikat C1 / TestDaF):
- Grade numeric rubric scores AGAINST C1 EXPECTATIONS (240-330 words).
- Expect academic/analytical precision, Nominalstil, Funktionsverbgefüge, nuanced hedging/concession, complex syntax, and critical synthesis across all Leitpunkte.`,
    };

    const levelCalibrationInstruction = levelExpectationsMap[task.cefr_level] || levelExpectationsMap.B2;

    const assessmentSystemPrompt = `ROLE:
You are a senior certified German examiner (Goethe-Institut & telc) evaluating an individual learner's German writing submission against CEFR A1, A2, B1, B2, and C1 standards and a strict 100-point rubric.

${levelCalibrationInstruction}

ABSOLUTE ANTI-TEMPLATE & INDIVIDUALIZATION MANDATE:
- Every single sentence of feedback MUST be written specifically for THIS submission and THIS learner.
- NEVER output generic boilerplate, stock praise, or templated phrases (e.g., never say "ควรแบ่งย่อหน้าให้ชัดเจน" or "ควรเพิ่มคำเชื่อม" generically without analyzing and quoting the exact sentences/connectors the learner actually wrote).
- Cite exact German phrases from the learner's text in „...“ quotes inside your Thai feedback so the learner sees concrete proof of why they earned each score.
- Evaluate strictly and realistically for target level ${task.cefr_level}: reward genuine strengths when earned, penalize missing Leitpunkte, off-topic content (Thema verfehlt), register mismatches, grammatical errors, and severe under-length (Unterlänge) according to real Goethe/telc standards.

RUBRIC (100 POINTS TOTAL, CALIBRATED FOR LEVEL ${task.cefr_level}):
1. task_fulfillment (0-20): Coverage of every Leitpunkt, text-type conventions, relevance to prompt, and adherence to target word count (${task.min_words}-${task.max_words} words).
2. content_development (0-15): Clarity, detail, and logical progression appropriate for level ${task.cefr_level}.
3. vocabulary (0-20): Lexical range, precision, collocations, and appropriateness for target level ${task.cefr_level}.
4. grammar (0-20): Morphological accuracy (Kasus, Genus, Konjugation, Deklination) and syntax expected at level ${task.cefr_level}.
5. cohesion (0-15): Coherence, text flow, and natural connector usage expected at level ${task.cefr_level}.
6. register (0-5): Appropriateness of formality (Sie vs. du/ihr), tone, and salutation/closing if email/letter/complaint.
7. mechanics (0-5): Spelling, German noun capitalization (Großschreibung), umlauts/ß, and punctuation (Kommasetzung).

REQUIREMENT EVALUATIONS (Leitpunkte):
- Produce one item per requirement in the task's requirements list in the exact order given.
- Set status to 'fulfilled', 'partial', or 'missing'.
- Provide verbatim German evidence_quote from the learner's text (or "" if missing) and specific Thai comment_th explaining what was achieved or still needed.

ERROR ANALYSIS RULES:
- Inspect the text sentence by sentence for REAL errors (GRAMMAR, VOCABULARY, COHESION, MECHANICS, STYLE).
- For every error, "original_text" MUST be an EXACT character-for-character verbatim substring copied directly from the learner's text (case and punctuation exact) so the UI can highlight it.
- Do NOT invent errors on correct German phrases. If the text has zero errors, return an empty errors array [].
- Explain every error thoroughly in natural Thai ("explanation_th") tailored to why that specific mistake occurred in their sentence, name the German rule ("rule"), and include 1-2 examples ("german" + "thai").

THREE INDIVIDUALIZED WRITING VERSIONS:
- corrected: Fix ONLY the errors in the learner's text while preserving their exact ideas, sentence flow, and voice.
- b2_improved: Rewrite and expand the learner's OWN ideas and viewpoints (keep their actual stance/examples) to solid B2 exam standard.
- c1_model: Transform the learner's OWN thesis and arguments into sophisticated C1 academic German (Nominalstil, Funktionsverbgefüge, nuanced connectors), fulfilling all task Leitpunkte.

LEARNING RECOMMENDATIONS:
- Provide 2-4 personalized recommendations directly triggered by the actual errors or weaknesses observed in THIS submission (or next-level refinement if error-free).
- Each recommendation must pick the closest matching "lesson_id" from this catalog:
${lessonCatalogText}
- In "reason_th" and "action_th", reference the learner's actual sentences/mistakes from this submission and give a concrete revision drill.

LANGUAGE RULES:
- All feedback_th, cefr_summary_th, main_strength_th, main_weakness_th, individual_coaching_note_th, strengths, weaknesses, comment_th, explanation_th, reason_th, action_th, and example.thai MUST be in clear, natural Thai (with German quotes where helpful).
- Keep Thai explanations concise, incisive, and actionable.`;

    const userPrompt = `EXAM TASK:
- Task ID: ${task.task_id}
- Target CEFR Level: ${task.cefr_level}
- Category: ${task.category}
- Title: ${task.title}
- Instructions: ${task.instructions}
- Required Leitpunkte (evaluate each one):
${task.requirements.map((r, idx) => `  ${idx + 1}. ${r}`).join('\n')}
- Target Word Count: ${task.min_words}–${task.max_words} words

LEARNER'S SUBMISSION (${wordCount} words):
"""
${normalizedText}
"""`;

    const parsed = await generateWithRetry(async () => {
      const controllerTimeoutMs = 45000;
      const geminiPromise = aiClient!.models.generateContent({
        model: GEMINI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: assessmentSystemPrompt,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: ASSESSMENT_RESPONSE_SCHEMA,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT: Gemini assessment exceeded 55s')), controllerTimeoutMs)
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
    }, 3);

    // Evidence-backed error alignment & hallucination elimination
    const validatedErrors = validateAndAlignErrors(parsed.errors, normalizedText);

    // Evidence-backed numeric calibration (preserves individualized AI feedback_th)
    const calibration = calibrateEvidenceScores(
      parsed.category_scores,
      validatedErrors,
      wordCount,
      task
    );

    const fallbackCefr = task.cefr_level;
    const profile: CEFRProfile = {
      task_fulfillment: parsed.cefr_profile?.task_fulfillment || fallbackCefr,
      content_development: parsed.cefr_profile?.content_development || fallbackCefr,
      vocabulary: parsed.cefr_profile?.vocabulary || fallbackCefr,
      grammar: parsed.cefr_profile?.grammar || fallbackCefr,
      cohesion: parsed.cefr_profile?.cohesion || fallbackCefr,
      register: parsed.cefr_profile?.register || fallbackCefr,
      mechanics: parsed.cefr_profile?.mechanics || fallbackCefr,
    };

    if (wordCount < task.min_words * 0.5) {
      const capLevel: ExtendedCEFR = wordCount < task.min_words * 0.28 || wordCount < 40 ? 'A1' : 'A2';
      (Object.keys(profile) as (keyof CEFRProfile)[]).forEach((k) => {
        profile[k] = capLevel;
      });
    }

    const medianCefr = calculateMedianCefr(profile, wordCount, task.min_words);

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
          topic: rec?.topic || 'Grammatik & Ausdruck',
          priority: ['high', 'medium', 'low'].includes(rec?.priority) ? rec.priority : 'medium',
          lesson_id: normalizeLessonId(rec?.lesson_id, rec?.topic),
          reason_th: rec?.reason_th || '',
          action_th: rec?.action_th || '',
        }))
      : [];

    const result: AssessmentResult = {
      id: `assess-${Date.now()}`,
      submission_id: `sub-${Date.now()}`,
      task_id: task.id,
      task_title: task.title,
      task_level: task.cefr_level,
      task_category: task.category,
      original_text: normalizedText,
      word_count: wordCount,
      total_score: calibration.totalScore,
      grade: calibration.grade,
      cefr_estimate: medianCefr,
      cefr_confidence: ['high', 'medium', 'low'].includes(parsed.cefr_confidence) ? parsed.cefr_confidence : 'medium',
      cefr_summary_th: parsed.cefr_summary_th,
      main_weakness_th: parsed.main_weakness_th,
      main_strength_th: parsed.main_strength_th,
      individual_coaching_note_th: parsed.individual_coaching_note_th,
      requirement_evaluations: requirementEvaluations,
      cefr_profile: profile,
      category_scores: calibration.verifiedScores,
      errors: validatedErrors,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter((s: any) => typeof s === 'string' && s.trim()) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.filter((w: any) => typeof w === 'string' && w.trim()) : [],
      writing_versions: {
        corrected: parsed.writing_versions.corrected,
        b2_improved: parsed.writing_versions.b2_improved,
        c1_model: parsed.writing_versions.c1_model,
      },
      learning_recommendations: normalizedRecommendations,
      rubric_version: '3.0',
      engine: 'ai',
      model_name: GEMINI_MODEL,
      prompt_version: '3.0-individualized',
      quality: {
        adjustments: calibration.adjustments,
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
app.get('/api/lessons', (_req: Request, res: Response) => {
  res.json({ lessons: GRAMMAR_LESSONS });
});

app.get('/api/lessons/:id', (req: Request, res: Response) => {
  const lesson = GRAMMAR_LESSONS.find((l) => l.id === req.params.id);
  if (!lesson) {
    return res.status(404).json({ error: 'Lesson not found' });
  }
  res.json({ lesson });
});

// Vocabulary Bank
app.get('/api/vocabulary', (_req: Request, res: Response) => {
  res.json({ vocabulary: vocabularyStore });
});

app.post('/api/vocabulary', (req: Request, res: Response) => {
  const { word, meaning_th, example_sentence, example_translation_th, cefr_level = 'B2', part_of_speech = 'Noun', article } = req.body;
  if (!word || !meaning_th) {
    return res.status(400).json({ error: 'Word and meaning are required' });
  }

  const newItem = {
    id: `vocab-${Date.now()}`,
    word,
    article,
    part_of_speech,
    meaning_th,
    example_sentence: example_sentence || '',
    example_translation_th: example_translation_th || '',
    cefr_level,
    created_at: new Date().toISOString(),
  };

  vocabularyStore.unshift(newItem);
  res.json({ item: newItem });
});

app.delete('/api/vocabulary/:id', (req: Request, res: Response) => {
  const initialLength = vocabularyStore.length;
  vocabularyStore = vocabularyStore.filter((v) => v.id !== req.params.id);
  res.json({ success: vocabularyStore.length < initialLength });
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
