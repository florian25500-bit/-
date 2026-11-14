import { Type, Schema } from '@google/genai';
import {
  AssessedCEFR,
  AssessmentError,
  AssessmentMode,
  CategoryScoreItem,
  CEFRLevel,
  CEFRProfile,
  ExtendedCEFR,
  GoetheExamVerdict,
  GoetheOfficialCriterion,
  GoethePraedikat,
  Grade,
  WritingTask,
} from '../types';
import {
  calculateGrade,
  getRubricMaxScoreForLevel,
  getRubricWeightsForLevel,
  isBasicLevel,
  TOTAL_MAX_SCORE,
  TOTAL_MAX_SCORE_A1_A2,
} from './scoring';

export const ALLOWED_IMAGE_MIMES = ['image/png', 'image/jpeg', 'image/webp'] as const;
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIMES)[number];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export const VALID_LESSON_IDS = [
  'lesson-praesens-satzbau',
  'lesson-negation-zeitangaben-a1',
  'lesson-perfekt-modalverben',
  'lesson-brief-anrede-schluss',
  'lesson-nebensaetze',
  'lesson-kasus',
  'lesson-wechselpraepositionen',
  'lesson-adjektivendungen',
  'lesson-kommasetzung-rechtschreibung',
  'lesson-relativsaetze',
  'lesson-konnektoren-b2',
  'lesson-stellungnahme-redemittel',
  'lesson-passiv',
  'lesson-konjunktiv-2',
  'lesson-nominalisierung',
  'lesson-partizipialattribute-c1',
] as const;

export const CEFR_SUBLEVEL_ENUM: ExtendedCEFR[] = ['A1', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+'];
export const CEFR_SCHEMA_ENUM = [...CEFR_SUBLEVEL_ENUM, 'UNDETERMINED'];

export function validateAttachedImageInput(raw: any): {
  valid: boolean;
  image?: { name: string; mimeType: AllowedImageMime; data: string; sizeBytes: number };
  error?: string;
} {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'ข้อมูลไฟล์รูปภาพไม่ถูกต้อง' };
  }

  let rawData = typeof raw.data === 'string' ? raw.data.trim() : '';
  let rawMime = typeof raw.mimeType === 'string' ? raw.mimeType.trim().toLowerCase() : '';

  const dataUrlMatch = rawData.match(/^data:([^;]+);base64,(.+)$/s);
  if (dataUrlMatch) {
    if (!rawMime) {
      rawMime = dataUrlMatch[1].trim().toLowerCase();
    }
    rawData = dataUrlMatch[2];
  }

  if (rawMime === 'image/jpg') {
    rawMime = 'image/jpeg';
  }

  if (!(ALLOWED_IMAGE_MIMES as readonly string[]).includes(rawMime)) {
    return {
      valid: false,
      error: 'รองรับเฉพาะไฟล์รูปภาพ PNG, JPG/JPEG หรือ WEBP เท่านั้น',
    };
  }

  const cleanBase64 = rawData.replace(/\s+/g, '');
  if (!cleanBase64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(cleanBase64)) {
    return {
      valid: false,
      error: 'รูปแบบข้อมูลรูปภาพ Base64 ไม่ถูกต้อง',
    };
  }

  const padding = cleanBase64.endsWith('==') ? 2 : cleanBase64.endsWith('=') ? 1 : 0;
  const sizeBytes = Math.max(0, Math.floor((cleanBase64.length * 3) / 4) - padding);
  if (sizeBytes === 0) {
    return { valid: false, error: 'ไฟล์รูปภาพว่างเปล่า' };
  }
  if (sizeBytes > MAX_IMAGE_BYTES) {
    return {
      valid: false,
      error: 'ไฟล์รูปภาพมีขนาดใหญ่เกินกำหนด (สูงสุด 5 MB)',
    };
  }

  const rawName = typeof raw.name === 'string' ? raw.name.trim() : '';
  const safeName = (rawName || 'attached-image').slice(0, 160);

  return {
    valid: true,
    image: {
      name: safeName,
      mimeType: rawMime as AllowedImageMime,
      data: cleanBase64,
      sizeBytes,
    },
  };
}

export function baseCefrFromExtended(level: ExtendedCEFR): CEFRLevel {
  if (level.startsWith('A1')) return 'A1';
  if (level.startsWith('A2')) return 'A2';
  if (level.startsWith('B1')) return 'B1';
  if (level.startsWith('B2')) return 'B2';
  return 'C1';
}

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value as Record<string, any>)) {
      if (v !== undefined) {
        out[k] = stripUndefinedDeep(v);
      }
    }
    return out as T;
  }
  return value;
}

export function normalizeLessonId(lessonId?: string, topic?: string): string {
  const candidate = (lessonId || '').trim().toLowerCase();
  if ((VALID_LESSON_IDS as readonly string[]).includes(candidate)) {
    return candidate;
  }
  const combined = `${candidate} ${(topic || '').toLowerCase()}`;
  if (combined.includes('konjunktiv ii') || combined.includes('konjunktiv 2') || (combined.includes('konjunktiv') && !/\bkonjunktiv\s*i\b/.test(combined))) {
    return 'lesson-konjunktiv-2';
  }
  if (combined.includes('partizipial') || /\bkonjunktiv\s*i\b/.test(combined) || combined.includes('indirekte rede') || combined.includes('akademisch') || combined.includes('wissenschaft')) {
    return 'lesson-partizipialattribute-c1';
  }
  if (combined.includes('negation') || combined.includes('nicht/kein') || combined.includes('zeitangabe') || combined.includes('possessiv')) {
    return 'lesson-negation-zeitangaben-a1';
  }
  if (combined.includes('anrede') || combined.includes('gruß') || combined.includes('brief') || combined.includes('e-mail') || combined.includes('register') || combined.includes('sie/du') || combined.includes('höflich')) {
    return 'lesson-brief-anrede-schluss';
  }
  if (combined.includes('komma') || combined.includes('zeichensetzung') || combined.includes('rechtschreibung') || combined.includes('großschreibung') || combined.includes('das/dass') || combined.includes('mechanics')) {
    return 'lesson-kommasetzung-rechtschreibung';
  }
  if (combined.includes('relativ') || combined.includes('infinitiv') || combined.includes('um zu') || combined.includes('um...zu')) {
    return 'lesson-relativsaetze';
  }
  if (combined.includes('stellungnahme') || combined.includes('redemittel') || combined.includes('beschwerde') || combined.includes('argument') || combined.includes('aufbau') || combined.includes('gliederung')) {
    return 'lesson-stellungnahme-redemittel';
  }
  if (combined.includes('präsens') || combined.includes('praesens') || combined.includes('v2') || combined.includes('w-frage') || combined.includes('trennbar') || combined.includes('grundlagen') || combined.includes('a1')) {
    return 'lesson-praesens-satzbau';
  }
  if (combined.includes('perfekt') || combined.includes('partizip') || combined.includes('modalverb') || combined.includes('präteritum') || combined.includes('a2')) {
    return 'lesson-perfekt-modalverben';
  }
  if (combined.includes('nebensatz') || combined.includes('word_order') || combined.includes('word order') || combined.includes('verbletzt') || combined.includes('weil') || combined.includes('obwohl') || combined.includes('satzbau')) {
    return 'lesson-nebensaetze';
  }
  if (combined.includes('wechsel') || combined.includes('wohin') || combined.includes('präposition')) {
    return 'lesson-wechselpraepositionen';
  }
  if (combined.includes('kasus') || combined.includes('dativ') || combined.includes('akkusativ') || combined.includes('genitiv') || combined.includes('artikel')) {
    return 'lesson-kasus';
  }
  if (combined.includes('konnektor') || combined.includes('kohäsion') || combined.includes('cohesion') || combined.includes('inversion') || combined.includes('คำเชื่อม')) {
    return 'lesson-konnektoren-b2';
  }
  if (combined.includes('passiv')) {
    return 'lesson-passiv';
  }
  if (combined.includes('adjektiv') || combined.includes('deklination')) {
    return 'lesson-adjektivendungen';
  }
  if (combined.includes('nominal') || combined.includes('fvg') || combined.includes('funktionsverb')) {
    return 'lesson-nominalisierung';
  }
  return 'lesson-nebensaetze';
}

/**
 * Common German function words and markers to verify German language presence
 */
const GERMAN_CORE_WORDS = new Set([
  'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
  'und', 'in', 'zu', 'von', 'mit', 'auf', 'für', 'nicht', 'im', 'am', 'aus', 'an',
  'ist', 'sind', 'war', 'waren', 'haben', 'hat', 'hatte', 'werden', 'wird', 'wurde',
  'kann', 'muss', 'soll', 'will', 'darf', 'es', 'er', 'sie', 'wir', 'ich', 'du', 'ihr',
  'auch', 'als', 'wie', 'nach', 'bei', 'oder', 'aber', 'wenn', 'dass', 'weil', 'sehr',
  'über', 'durch', 'noch', 'nur', 'doch', 'vor', 'zur', 'zum', 'man', 'diese', 'dieser',
  'mehr', 'schon', 'immer', 'hier', 'da', 'dann', 'so', 'selbst', 'wieder', 'unter',
  'meiner', 'meine', 'mein', 'unser', 'ihre', 'ihr', 'ihrem', 'seine', 'sein', 'viele'
]);

/**
 * 1. German Language Verification Pre-Check
 */
export function isPredominantlyGerman(text: string): { isGerman: boolean; reason?: string } {
  if (!text || typeof text !== 'string') {
    return { isGerman: false, reason: 'ไม่พบข้อความงานเขียน' };
  }

  const clean = text.trim();
  const words = (clean.toLowerCase().match(/[\p{L}\p{N}_\-ßäöüÄÖÜ]+/gu) || []);

  if (words.length < 5) {
    return {
      isGerman: false,
      reason: 'ข้อความสั้นเกินไปสำหรับการประเมิน (กรุณาเขียนอย่างน้อย 5 คำภาษาเยอรมัน)',
    };
  }

  // Check for Thai characters
  const thaiCharCount = (clean.match(/[\u0E00-\u0E7F]/g) || []).length;
  if (thaiCharCount > clean.length * 0.25) {
    return {
      isGerman: false,
      reason: 'ตรวจพบภาษาไทยในสัดส่วนสูง กรุณาเขียนเรียงความด้วยภาษาเยอรมันตามโจทย์',
    };
  }

  // Count core German words
  let germanWordCount = 0;
  for (const w of words) {
    if (GERMAN_CORE_WORDS.has(w)) {
      germanWordCount++;
    }
  }

  // Check umlauts / Eszett presence
  const hasGermanSpecialChars = /[äöüÄÖÜß]/.test(clean);

  // If text is long enough and contains at least some German indicators
  const germanRatio = germanWordCount / words.length;

  if (words.length >= 15 && germanWordCount < 2 && !hasGermanSpecialChars) {
    return {
      isGerman: false,
      reason: 'ไม่พบโครงสร้างภาษาเยอรมัน กรุณาตรวจสอบว่าข้อความเขียนด้วยภาษาเยอรมัน',
    };
  }

  return { isGerman: true };
}

/**
 * 2. Strict ResponseSchema for Gemini (25-point scale for A1-A2, 100-point scale for B1-C1/AUTO)
 */
export function getAssessmentResponseSchema(
  level?: CEFRLevel | 'UNSPECIFIED' | 'AUTO' | string | null
): Schema {
  const weights = getRubricWeightsForLevel(level);
  return {
    type: Type.OBJECT,
    required: [
      'category_scores',
      'cefr_profile',
      'requirement_evaluations',
      'errors',
      'strengths',
      'weaknesses',
      'cefr_estimate',
      'cefr_confidence',
      'cefr_summary_th',
      'main_weakness_th',
      'main_strength_th',
      'individual_coaching_note_th',
      'writing_versions',
      'learning_recommendations',
    ],
    properties: {
      category_scores: {
        type: Type.OBJECT,
        required: [
          'task_fulfillment',
          'content_development',
          'vocabulary',
          'grammar',
          'cohesion',
          'register',
          'mechanics',
        ],
        properties: {
          task_fulfillment: {
            type: Type.OBJECT,
            required: ['score', 'feedback_th'],
            properties: {
              score: { type: Type.INTEGER, description: `Integer points 0-${weights.task_fulfillment}` },
              feedback_th: {
                type: Type.STRING,
                description: 'Specific Thai critique citing exact phrases or Leitpunkte from this learner text.',
              },
            },
          },
          content_development: {
            type: Type.OBJECT,
            required: ['score', 'feedback_th'],
            properties: {
              score: { type: Type.INTEGER, description: `Integer points 0-${weights.content_development}` },
              feedback_th: {
                type: Type.STRING,
                description: 'Specific Thai critique of argument depth, logic, and examples in this learner text.',
              },
            },
          },
          vocabulary: {
            type: Type.OBJECT,
            required: ['score', 'feedback_th'],
            properties: {
              score: { type: Type.INTEGER, description: `Integer points 0-${weights.vocabulary}` },
              feedback_th: {
                type: Type.STRING,
                description: 'Specific Thai critique quoting German words/collocations used by the learner.',
              },
            },
          },
          grammar: {
            type: Type.OBJECT,
            required: ['score', 'feedback_th'],
            properties: {
              score: { type: Type.INTEGER, description: `Integer points 0-${weights.grammar}` },
              feedback_th: {
                type: Type.STRING,
                description: 'Specific Thai critique of grammatical accuracy and sentence structures actually written.',
              },
            },
          },
          cohesion: {
            type: Type.OBJECT,
            required: ['score', 'feedback_th'],
            properties: {
              score: { type: Type.INTEGER, description: `Integer points 0-${weights.cohesion}` },
              feedback_th: {
                type: Type.STRING,
                description: 'Specific Thai critique referencing actual connectors and paragraph transitions in the text.',
              },
            },
          },
          register: {
            type: Type.OBJECT,
            required: ['score', 'feedback_th'],
            properties: {
              score: { type: Type.INTEGER, description: `Integer points 0-${weights.register}` },
              feedback_th: {
                type: Type.STRING,
                description: 'Specific Thai critique of tone, formality (Sie/du), and text-type conventions.',
              },
            },
          },
          mechanics: {
            type: Type.OBJECT,
            required: ['score', 'feedback_th'],
            properties: {
              score: { type: Type.INTEGER, description: `Integer points 0-${weights.mechanics}` },
              feedback_th: {
                type: Type.STRING,
                description: 'Specific Thai critique of spelling, noun capitalization, umlauts, and comma placement.',
              },
            },
          },
        },
      },
    cefr_profile: {
      type: Type.OBJECT,
      required: [
        'task_fulfillment',
        'content_development',
        'vocabulary',
        'grammar',
        'cohesion',
        'register',
        'mechanics',
      ],
      properties: {
        task_fulfillment: { type: Type.STRING, enum: CEFR_SCHEMA_ENUM },
        content_development: { type: Type.STRING, enum: CEFR_SCHEMA_ENUM },
        vocabulary: { type: Type.STRING, enum: CEFR_SCHEMA_ENUM },
        grammar: { type: Type.STRING, enum: CEFR_SCHEMA_ENUM },
        cohesion: { type: Type.STRING, enum: CEFR_SCHEMA_ENUM },
        register: { type: Type.STRING, enum: CEFR_SCHEMA_ENUM },
        mechanics: { type: Type.STRING, enum: CEFR_SCHEMA_ENUM },
      },
    },
    requirement_evaluations: {
      type: Type.ARRAY,
      description: 'One entry per task requirement (Leitpunkt), evaluating whether this specific essay fulfilled it.',
      items: {
        type: Type.OBJECT,
        required: ['requirement', 'status', 'evidence_quote', 'comment_th'],
        properties: {
          requirement: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['fulfilled', 'partial', 'missing'] },
          evidence_quote: {
            type: Type.STRING,
            description: 'Verbatim quote from learner text supporting this point, or empty string if missing.',
          },
          comment_th: { type: Type.STRING },
        },
      },
    },
    errors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          'id',
          'category',
          'subcategory',
          'original_text',
          'corrected_text',
          'explanation_th',
          'rule',
          'severity',
          'confidence',
          'examples',
        ],
        properties: {
          id: { type: Type.STRING },
          category: {
            type: Type.STRING,
            enum: ['GRAMMAR', 'VOCABULARY', 'COHESION', 'MECHANICS', 'STYLE'],
          },
          subcategory: { type: Type.STRING },
          original_text: {
            type: Type.STRING,
            description: 'EXACT character-for-character substring as it appears in the learner original text',
          },
          corrected_text: { type: Type.STRING },
          explanation_th: { type: Type.STRING },
          rule: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['minor', 'major'] },
          confidence: { type: Type.NUMBER },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ['german', 'thai'],
              properties: {
                german: { type: Type.STRING },
                thai: { type: Type.STRING },
              },
            },
          },
        },
      },
    },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-4 specific Thai bullets quoting effective phrases/structures from this submission.',
    },
    weaknesses: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '2-4 specific Thai bullets citing actual problems or missed points in this submission.',
    },
    cefr_estimate: {
      type: Type.STRING,
      enum: CEFR_SCHEMA_ENUM,
      description: 'Assessed CEFR level based strictly on linguistic evidence, or UNDETERMINED if the text lacks enough evidence to classify.',
    },
    cefr_confidence: { type: Type.STRING, enum: ['high', 'medium', 'low', 'insufficient'] },
    transcribed_text: {
      type: Type.STRING,
      description: 'If an image of handwritten/printed German writing was provided and typed text was empty, provide the exact transcribed German text; otherwise empty string.',
    },
    cefr_summary_th: { type: Type.STRING },
    main_weakness_th: { type: Type.STRING },
    main_strength_th: { type: Type.STRING },
    individual_coaching_note_th: {
      type: Type.STRING,
      description: 'Personal 2-3 sentence mentor feedback in Thai addressing the learner directly about their exact essay.',
    },
    writing_versions: {
      type: Type.OBJECT,
      required: ['corrected', 'b2_improved', 'c1_model'],
      properties: {
        corrected: {
          type: Type.STRING,
          description: 'Minimal error-corrected version of the learner text keeping their exact ideas and structure.',
        },
        b2_improved: {
          type: Type.STRING,
          description: 'The learner own ideas rewritten and expanded to solid B2 exam standard.',
        },
        c1_model: {
          type: Type.STRING,
          description: 'The learner own thesis and arguments elevated to academic C1 standard.',
        },
      },
    },
      learning_recommendations: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          required: ['topic', 'priority', 'lesson_id', 'reason_th', 'action_th'],
          properties: {
            topic: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
            lesson_id: {
              type: Type.STRING,
              enum: [...VALID_LESSON_IDS],
            },
            reason_th: { type: Type.STRING },
            action_th: { type: Type.STRING },
          },
        },
      },
    },
  };
}

export const ASSESSMENT_RESPONSE_SCHEMA: Schema = getAssessmentResponseSchema('B2');

export function validateAssessmentPayload(parsed: any): { valid: boolean; reason?: string } {
  if (!parsed || typeof parsed !== 'object') {
    return { valid: false, reason: 'AI response is not a JSON object' };
  }
  const requiredCategories = [
    'task_fulfillment',
    'content_development',
    'vocabulary',
    'grammar',
    'cohesion',
    'register',
    'mechanics',
  ];
  if (!parsed.category_scores || typeof parsed.category_scores !== 'object') {
    return { valid: false, reason: 'Missing category_scores' };
  }
  for (const key of requiredCategories) {
    const item = parsed.category_scores[key];
    if (!item || typeof item.score !== 'number' || typeof item.feedback_th !== 'string' || !item.feedback_th.trim()) {
      return { valid: false, reason: `Missing or incomplete category_scores.${key}` };
    }
  }
  if (!parsed.cefr_profile || typeof parsed.cefr_profile !== 'object') {
    return { valid: false, reason: 'Missing cefr_profile' };
  }
  if (!parsed.writing_versions || typeof parsed.writing_versions.corrected !== 'string' || !parsed.writing_versions.corrected.trim()) {
    return { valid: false, reason: 'Missing writing_versions.corrected' };
  }
  if (!Array.isArray(parsed.errors)) {
    return { valid: false, reason: 'Missing errors array' };
  }
  return { valid: true };
}

/**
 * 3. Evidence-Backed Error Validation & Precise Offset Calculation
 */
export function validateAndAlignErrors(
  rawErrors: any[],
  originalText: string
): AssessmentError[] {
  if (!Array.isArray(rawErrors) || !originalText) return [];

  const verified: AssessmentError[] = [];
  const searchLower = originalText.toLowerCase();
  const usedRanges: { start: number; end: number }[] = [];

  for (let i = 0; i < rawErrors.length; i++) {
    const err = rawErrors[i];
    if (!err || typeof err !== 'object') continue;

    const snippet = (err.original_text || '').trim();
    if (!snippet) continue;

    // Discard if corrected_text is identical (not a real error)
    if (err.corrected_text && snippet.toLowerCase() === err.corrected_text.trim().toLowerCase()) {
      continue;
    }

    // Check confidence threshold if provided
    if (typeof err.confidence === 'number' && err.confidence < 0.6) {
      continue;
    }

    // Locate occurrence in original text
    const snippetLower = snippet.toLowerCase();
    let foundIndex = -1;
    let searchFrom = 0;

    while (searchFrom < searchLower.length) {
      const idx = searchLower.indexOf(snippetLower, searchFrom);
      if (idx === -1) break;

      // Ensure no exact overlap with existing error ranges
      const endIdx = idx + snippet.length;
      const overlaps = usedRanges.some(
        (r) => (idx >= r.start && idx < r.end) || (endIdx > r.start && endIdx <= r.end)
      );

      if (!overlaps) {
        foundIndex = idx;
        break;
      }
      searchFrom = idx + 1;
    }

    // If completely missing from text, discard this hallucination!
    if (foundIndex === -1) {
      continue;
    }

    const startOffset = foundIndex;
    const endOffset = foundIndex + snippet.length;
    usedRanges.push({ start: startOffset, end: endOffset });

    const examples = Array.isArray(err.examples)
      ? err.examples.map((ex: any) => ({
          german: ex.german || '',
          thai: ex.thai || '',
        }))
      : [];

    verified.push({
      id: err.id || `err-${i + 1}-${Date.now()}`,
      category: ['GRAMMAR', 'VOCABULARY', 'COHESION', 'MECHANICS', 'STYLE'].includes(err.category)
        ? err.category
        : 'GRAMMAR',
      subcategory: err.subcategory || 'General',
      original_text: originalText.substring(startOffset, endOffset),
      corrected_text: err.corrected_text || snippet,
      explanation_th: err.explanation_th || 'ควรปรับแก้ให้ตรงตามหลักภาษา',
      rule: err.rule || 'Grammatikregel',
      severity: err.severity === 'major' ? 'major' : 'minor',
      confidence: typeof err.confidence === 'number' ? err.confidence : 0.9,
      start_offset: startOffset,
      end_offset: endOffset,
      examples,
    });
  }

  // Sort by appearance in original text
  return verified.sort((a, b) => a.start_offset - b.start_offset);
}

/**
 * 4. Realistic CEFR Resolution & Median Calculation (no guessing when evidence is insufficient)
 */
const CEFR_ORDER: ExtendedCEFR[] = ['A1', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+'];
export const MIN_WORDS_FOR_CEFR_EVALUATION = 15;

export function parseAssessedCefr(value: unknown): AssessedCEFR {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim() as ExtendedCEFR;
  return CEFR_ORDER.includes(trimmed) ? trimmed : null;
}

export function normalizeCefrProfile(rawProfile: Record<string, any> | undefined | null): CEFRProfile {
  return {
    task_fulfillment: parseAssessedCefr(rawProfile?.task_fulfillment),
    content_development: parseAssessedCefr(rawProfile?.content_development),
    vocabulary: parseAssessedCefr(rawProfile?.vocabulary),
    grammar: parseAssessedCefr(rawProfile?.grammar),
    cohesion: parseAssessedCefr(rawProfile?.cohesion),
    register: parseAssessedCefr(rawProfile?.register),
    mechanics: parseAssessedCefr(rawProfile?.mechanics),
  };
}

export function calculateMedianCefr(
  profile: CEFRProfile,
  wordCount?: number,
  _minWords?: number,
  rawCefrEstimate?: unknown
): AssessedCEFR {
  if (typeof wordCount === 'number' && wordCount < MIN_WORDS_FOR_CEFR_EVALUATION) {
    return null;
  }

  if (typeof rawCefrEstimate === 'string' && rawCefrEstimate.trim().toUpperCase() === 'UNDETERMINED') {
    return null;
  }

  const ratedRanks = Object.values(profile)
    .filter((lvl): lvl is ExtendedCEFR => lvl !== null && CEFR_ORDER.includes(lvl))
    .map((lvl) => CEFR_ORDER.indexOf(lvl))
    .sort((a, b) => a - b);

  // Require a majority of sub-skills (at least 4 of 7) to have assessable CEFR evidence
  if (ratedRanks.length < 4) {
    return null;
  }

  const medianIndex = ratedRanks[Math.floor(ratedRanks.length / 2)];
  return CEFR_ORDER[medianIndex] || null;
}

/**
 * 5. Evidence-Backed Score Calibration & Sanity Adjustments
 *    Supports 25-point rubric (A1-A2) and 100-point rubric (B1-C1 / AUTO).
 */
export function calibrateEvidenceScores(
  rawScores: Record<string, any>,
  verifiedErrors: AssessmentError[],
  wordCount: number,
  task: WritingTask
): {
  verifiedScores: CategoryScoreItem[];
  totalScore: number;
  maxTotalScore: number;
  grade: Grade;
  adjustments: string[];
} {
  const adjustments: string[] = [];
  const weights = getRubricWeightsForLevel(task.cefr_level);
  const maxTotalScore = getRubricMaxScoreForLevel(task.cefr_level);
  const is25Scale = maxTotalScore === TOTAL_MAX_SCORE_A1_A2;

  const taskScore = Math.max(0, Math.min(weights.task_fulfillment, Number(rawScores.task_fulfillment?.score ?? 0)));
  const contentScore = Math.max(0, Math.min(weights.content_development, Number(rawScores.content_development?.score ?? 0)));
  const vocabScore = Math.max(0, Math.min(weights.vocabulary, Number(rawScores.vocabulary?.score ?? 0)));
  const grammarScore = Math.max(0, Math.min(weights.grammar, Number(rawScores.grammar?.score ?? 0)));
  const cohesionScore = Math.max(0, Math.min(weights.cohesion, Number(rawScores.cohesion?.score ?? 0)));
  const registerScore = Math.max(0, Math.min(weights.register, Number(rawScores.register?.score ?? 0)));
  const mechanicsScore = Math.max(0, Math.min(weights.mechanics, Number(rawScores.mechanics?.score ?? 0)));

  let finalTask = taskScore;
  let finalContent = contentScore;
  let finalVocab = vocabScore;
  let finalGrammar = grammarScore;
  let finalCohesion = cohesionScore;
  let finalRegister = registerScore;
  let finalMechanics = mechanicsScore;

  const taskFeedback = rawScores.task_fulfillment?.feedback_th?.trim() || '';
  const contentFeedback = rawScores.content_development?.feedback_th?.trim() || '';
  const vocabFeedback = rawScores.vocabulary?.feedback_th?.trim() || '';
  const grammarFeedback = rawScores.grammar?.feedback_th?.trim() || '';
  const cohesionFeedback = rawScores.cohesion?.feedback_th?.trim() || '';
  const registerFeedback = rawScores.register?.feedback_th?.trim() || '';
  const mechanicsFeedback = rawScores.mechanics?.feedback_th?.trim() || '';

  // Word count constraint check (Unterlänge standard):
  // Applied only for standardized exam tasks with a defined minimum word count (min_words > 0).
  if (task.min_words > 0 && wordCount < task.min_words * 0.5) {
    const severeCutoff = Math.max(10, Math.round(task.min_words * 0.28));
    const isSevere = wordCount < severeCutoff;

    const capTask = is25Scale ? (isSevere ? 1 : 2) : isSevere ? 3 : 6;
    const capContent = is25Scale ? (isSevere ? 0 : 1) : isSevere ? 1 : 3;
    const capVocab = is25Scale ? (isSevere ? 1 : 2) : isSevere ? 4 : 6;
    const capGrammar = is25Scale ? (isSevere ? 1 : 2) : isSevere ? 4 : 6;
    const capCohesion = is25Scale ? (isSevere ? 0 : 1) : isSevere ? 1 : 3;
    const capRegister = is25Scale ? 0 : 1;
    const capMechanics = is25Scale ? 1 : isSevere ? 2 : 3;

    if (finalTask > capTask) finalTask = capTask;
    if (finalContent > capContent) finalContent = capContent;
    if (finalVocab > capVocab) finalVocab = capVocab;
    if (finalGrammar > capGrammar) finalGrammar = capGrammar;
    if (finalCohesion > capCohesion) finalCohesion = capCohesion;
    if (finalRegister > capRegister) finalRegister = capRegister;
    if (finalMechanics > capMechanics) finalMechanics = capMechanics;

    adjustments.push(
      `จำนวนคำ (${wordCount} คำ) คิดเป็นเพียง ${Math.round((wordCount / task.min_words) * 100)}% ของเกณฑ์ขั้นต่ำ (${task.min_words} คำ) ระบบปรับเทียบเพดานคะแนนตามเกณฑ์ Unterlänge ของสถาบันเกอเธ่และ telc`
    );
  } else if (task.min_words > 0 && wordCount < task.min_words * 0.8) {
    const mildTaskCap = is25Scale ? 4 : 14;
    if (finalTask > mildTaskCap) {
      finalTask = mildTaskCap;
      adjustments.push(
        `จำนวนคำ (${wordCount} คำ) ต่ำกว่าเกณฑ์ขั้นต่ำ (${task.min_words} คำ) ปรับลดเพดานคะแนนการตอบโจทย์ไม่เกิน ${mildTaskCap}/${weights.task_fulfillment}`
      );
    }
  } else if (task.min_words === 0 && wordCount > 0 && wordCount < 10) {
    const shortContentCap = is25Scale ? 1 : 6;
    const shortCohesionCap = is25Scale ? 1 : 6;
    if (finalContent > shortContentCap) finalContent = shortContentCap;
    if (finalCohesion > shortCohesionCap) finalCohesion = shortCohesionCap;
    adjustments.push(
      `งานเขียนอิสระมีจำนวน ${wordCount} คำ (สั้นกว่า 10 คำ) จึงจำกัดคะแนนด้านการพัฒนาเนื้อหาและการเชื่อมโยงความตามหลักฐานที่มี`
    );
  }

  // Grammar error evidence constraint
  const majorGrammarErrors = verifiedErrors.filter(
    (e) => e.category === 'GRAMMAR' && e.severity === 'major'
  ).length;
  const totalGrammarErrors = verifiedErrors.filter((e) => e.category === 'GRAMMAR').length;

  const majorGrammarCap = is25Scale ? 3 : 12;
  const totalGrammarCap = is25Scale ? 4 : 14;

  if (majorGrammarErrors >= 3 && finalGrammar > majorGrammarCap) {
    finalGrammar = majorGrammarCap;
    adjustments.push(
      `พบข้อผิดพลาดไวยากรณ์ระดับสำคัญ ${majorGrammarErrors} จุด ปรับเพดานคะแนนไวยากรณ์ไม่เกิน ${majorGrammarCap}/${weights.grammar}`
    );
  } else if (totalGrammarErrors >= 3 && finalGrammar > totalGrammarCap) {
    finalGrammar = totalGrammarCap;
    adjustments.push(
      `พบข้อผิดพลาดไวยากรณ์รวม ${totalGrammarErrors} จุด ปรับคะแนนไวยากรณ์ไม่เกิน ${totalGrammarCap}/${weights.grammar}`
    );
  }

  // Vocabulary error evidence constraint
  const vocabErrors = verifiedErrors.filter((e) => e.category === 'VOCABULARY').length;
  const vocabCap = is25Scale ? 4 : 14;
  if (vocabErrors >= 3 && finalVocab > vocabCap) {
    finalVocab = vocabCap;
    adjustments.push(
      `พบข้อผิดพลาดด้านคำศัพท์ ${vocabErrors} จุด ปรับคะแนนคำศัพท์ไม่เกิน ${vocabCap}/${weights.vocabulary}`
    );
  }

  // Mechanics error constraint
  const mechanicsErrors = verifiedErrors.filter((e) => e.category === 'MECHANICS').length;
  const mechanicsCap = is25Scale ? 1 : 3;
  if (mechanicsErrors >= 3 && finalMechanics > mechanicsCap) {
    finalMechanics = mechanicsCap;
    adjustments.push(`พบข้อผิดพลาดด้านการสะกดหรือเครื่องหมาย ${mechanicsErrors} จุด ปรับคะแนนอักขรวิธี`);
  }

  const categoryItems: CategoryScoreItem[] = [
    {
      category: 'task_fulfillment',
      label_de: 'Aufgabenbewältigung',
      label_en: 'Task Fulfillment',
      score: finalTask,
      max_score: weights.task_fulfillment,
      feedback_th: taskFeedback,
    },
    {
      category: 'content_development',
      label_de: 'Inhalt & Entwicklung',
      label_en: 'Content Development',
      score: finalContent,
      max_score: weights.content_development,
      feedback_th: contentFeedback,
    },
    {
      category: 'vocabulary',
      label_de: 'Wortschatz',
      label_en: 'Vocabulary',
      score: finalVocab,
      max_score: weights.vocabulary,
      feedback_th: vocabFeedback,
    },
    {
      category: 'grammar',
      label_de: 'Grammatik',
      label_en: 'Grammar',
      score: finalGrammar,
      max_score: weights.grammar,
      feedback_th: grammarFeedback,
    },
    {
      category: 'cohesion',
      label_de: 'Kohärenz & Kohäsion',
      label_en: 'Cohesion',
      score: finalCohesion,
      max_score: weights.cohesion,
      feedback_th: cohesionFeedback,
    },
    {
      category: 'register',
      label_de: 'Register & Stil',
      label_en: 'Register & Style',
      score: finalRegister,
      max_score: weights.register,
      feedback_th: registerFeedback,
    },
    {
      category: 'mechanics',
      label_de: 'Rechtschreibung',
      label_en: 'Mechanics',
      score: finalMechanics,
      max_score: weights.mechanics,
      feedback_th: mechanicsFeedback,
    },
  ];

  const totalScore = categoryItems.reduce((acc, curr) => acc + curr.score, 0);
  const grade = calculateGrade(totalScore, maxTotalScore);

  return {
    verifiedScores: categoryItems,
    totalScore,
    maxTotalScore,
    grade,
    adjustments,
  };
}

/**
 * Rescales an existing CategoryScoreItem[] (e.g. 100-point AUTO output) to the level-appropriate scale (25 for A1-A2, 100 for B1-C1).
 */
export function rescaleCategoryScoresForLevel(
  categoryScores: CategoryScoreItem[],
  targetLevel: CEFRLevel | 'UNSPECIFIED'
): {
  rescaledScores: CategoryScoreItem[];
  totalScore: number;
  maxTotalScore: number;
  grade: Grade;
} {
  const weights = getRubricWeightsForLevel(targetLevel);
  const maxTotalScore = getRubricMaxScoreForLevel(targetLevel);
  const rescaledScores = categoryScores.map((cat) => {
    const newMax = weights[cat.category];
    if (cat.max_score === newMax) {
      return cat;
    }
    const ratio = cat.max_score > 0 ? cat.score / cat.max_score : 0;
    const scaled = Math.max(0, Math.min(newMax, Math.round(ratio * newMax)));
    return {
      ...cat,
      score: scaled,
      max_score: newMax,
    };
  });
  const totalScore = rescaledScores.reduce((acc, c) => acc + c.score, 0);
  const grade = calculateGrade(totalScore, maxTotalScore);
  return { rescaledScores, totalScore, maxTotalScore, grade };
}

export function getAssessmentMaxScore(assessment: {
  max_total_score?: number;
  category_scores?: CategoryScoreItem[];
  task_level?: CEFRLevel | 'UNSPECIFIED';
}): number {
  if (typeof assessment.max_total_score === 'number' && assessment.max_total_score > 0) {
    return assessment.max_total_score;
  }
  if (Array.isArray(assessment.category_scores) && assessment.category_scores.length > 0) {
    const sum = assessment.category_scores.reduce((acc, c) => acc + (c.max_score || 0), 0);
    if (sum > 0) return sum;
  }
  return getRubricMaxScoreForLevel(assessment.task_level);
}

export const GOETHE_PASS_THRESHOLD = 60;
export const GOETHE_PASS_THRESHOLD_A1_A2 = 15;

export function getGoethePassThreshold(maxScore = TOTAL_MAX_SCORE): number {
  return maxScore === TOTAL_MAX_SCORE_A1_A2 ? GOETHE_PASS_THRESHOLD_A1_A2 : GOETHE_PASS_THRESHOLD;
}

export interface GoethePraedikatTier {
  range: string;
  min: number;
  max: number;
  praedikat_de: GoethePraedikat;
  label_th: string;
}

export const GOETHE_PRAEDIKAT_SCALE: GoethePraedikatTier[] = [
  { range: '90–100', min: 90, max: 100, praedikat_de: 'sehr gut', label_th: 'ผ่านเกณฑ์ระดับดีเยี่ยม' },
  { range: '80–89', min: 80, max: 89, praedikat_de: 'gut', label_th: 'ผ่านเกณฑ์ระดับดี' },
  { range: '70–79', min: 70, max: 79, praedikat_de: 'befriedigend', label_th: 'ผ่านเกณฑ์ระดับปานกลาง' },
  { range: '60–69', min: 60, max: 69, praedikat_de: 'ausreichend', label_th: 'ผ่านเกณฑ์ขั้นต่ำ (Bestanden)' },
  { range: '0–59', min: 0, max: 59, praedikat_de: 'nicht bestanden', label_th: 'ไม่ผ่านเกณฑ์ขั้นต่ำ 60%' },
];

export const GOETHE_PRAEDIKAT_SCALE_25: GoethePraedikatTier[] = [
  { range: '23–25', min: 23, max: 25, praedikat_de: 'sehr gut', label_th: 'ผ่านเกณฑ์ระดับดีเยี่ยม (≥90%)' },
  { range: '20–22', min: 20, max: 22, praedikat_de: 'gut', label_th: 'ผ่านเกณฑ์ระดับดี (80–89%)' },
  { range: '18–19', min: 18, max: 19, praedikat_de: 'befriedigend', label_th: 'ผ่านเกณฑ์ระดับปานกลาง (70–79%)' },
  { range: '15–17', min: 15, max: 17, praedikat_de: 'ausreichend', label_th: 'ผ่านเกณฑ์ขั้นต่ำ (Bestanden 60%+)' },
  { range: '0–14', min: 0, max: 14, praedikat_de: 'nicht bestanden', label_th: 'ไม่ผ่านเกณฑ์ขั้นต่ำ 15/25 (60%)' },
];

export function getGoethePraedikatScale(maxScore = TOTAL_MAX_SCORE): GoethePraedikatTier[] {
  return maxScore === TOTAL_MAX_SCORE_A1_A2 ? GOETHE_PRAEDIKAT_SCALE_25 : GOETHE_PRAEDIKAT_SCALE;
}

export function getGoethePraedikat(
  score: number,
  maxScore = TOTAL_MAX_SCORE
): {
  praedikat_de: GoethePraedikat;
  praedikat_th: string;
  passed: boolean;
} {
  const safeMax = maxScore > 0 ? maxScore : TOTAL_MAX_SCORE;
  const clamped = Math.max(0, Math.min(safeMax, Math.round(score)));
  const pct = (clamped / safeMax) * 100;
  const passThreshold = getGoethePassThreshold(safeMax);
  const passed = clamped >= passThreshold;

  if (pct >= 90) {
    return { praedikat_de: 'sehr gut', praedikat_th: 'ผ่านเกณฑ์ระดับดีเยี่ยม (sehr gut)', passed };
  }
  if (pct >= 80) {
    return { praedikat_de: 'gut', praedikat_th: 'ผ่านเกณฑ์ระดับดี (gut)', passed };
  }
  if (pct >= 70) {
    return { praedikat_de: 'befriedigend', praedikat_th: 'ผ่านเกณฑ์ระดับปานกลาง (befriedigend)', passed };
  }
  if (passed) {
    return { praedikat_de: 'ausreichend', praedikat_th: 'ผ่านเกณฑ์ขั้นต่ำ (ausreichend)', passed };
  }
  return {
    praedikat_de: 'nicht bestanden',
    praedikat_th: `ไม่ผ่านเกณฑ์ขั้นต่ำ ${passThreshold}/${safeMax} คะแนน (nicht bestanden)`,
    passed,
  };
}

export function buildGoetheExamVerdict(
  totalScore: number,
  categoryScores: CategoryScoreItem[],
  targetLevel: CEFRLevel | 'UNSPECIFIED',
  assessmentMode: AssessmentMode = 'exam',
  explicitMaxScore?: number
): GoetheExamVerdict {
  const categoryMaxSum = categoryScores.reduce((acc, c) => acc + (c.max_score || 0), 0);
  const maxScore =
    explicitMaxScore && explicitMaxScore > 0
      ? explicitMaxScore
      : categoryMaxSum > 0
      ? categoryMaxSum
      : getRubricMaxScoreForLevel(targetLevel);

  const weights = getRubricWeightsForLevel(
    maxScore === TOTAL_MAX_SCORE_A1_A2 ? 'A1' : targetLevel
  );
  const passThreshold = getGoethePassThreshold(maxScore);

  const findCat = (key: CategoryScoreItem['category']) =>
    categoryScores.find((c) => c.category === key);

  const taskCat = findCat('task_fulfillment');
  const contentCat = findCat('content_development');
  const registerCat = findCat('register');
  const cohesionCat = findCat('cohesion');
  const vocabCat = findCat('vocabulary');
  const grammarCat = findCat('grammar');
  const mechanicsCat = findCat('mechanics');

  const taskMax = taskCat?.max_score ?? weights.task_fulfillment;
  const contentMax = contentCat?.max_score ?? weights.content_development;
  const registerMax = registerCat?.max_score ?? weights.register;
  const cohesionMax = cohesionCat?.max_score ?? weights.cohesion;
  const vocabMax = vocabCat?.max_score ?? weights.vocabulary;
  const grammarMax = grammarCat?.max_score ?? weights.grammar;
  const mechanicsMax = mechanicsCat?.max_score ?? weights.mechanics;

  const aufgabenScore = (taskCat?.score ?? 0) + (contentCat?.score ?? 0) + (registerCat?.score ?? 0);
  const aufgabenMax = taskMax + contentMax + registerMax;

  const kohaerenzScore = cohesionCat?.score ?? 0;
  const kohaerenzMax = cohesionMax;

  const wortschatzScore = vocabCat?.score ?? 0;
  const wortschatzMax = vocabMax;

  const strukturenScore = (grammarCat?.score ?? 0) + (mechanicsCat?.score ?? 0);
  const strukturenMax = grammarMax + mechanicsMax;

  const computedTotal = Math.round(totalScore);
  const { praedikat_de, praedikat_th, passed } = getGoethePraedikat(computedTotal, maxScore);
  const pointsMargin = computedTotal - passThreshold;

  const examNameMap: Record<CEFRLevel | 'UNSPECIFIED', string> = {
    A1: 'Goethe-Zertifikat A1: Start Deutsch 1 (Schreiben)',
    A2: 'Goethe-Zertifikat A2 (Modul Schreiben)',
    B1: 'Goethe-Zertifikat B1 (Modul Schreiben)',
    B2: 'Goethe-Zertifikat B2 (Modul Schreiben)',
    C1: 'Goethe-Zertifikat C1 (Modul Schreiben)',
    UNSPECIFIED: 'เกณฑ์มาตรฐาน Goethe-Zertifikat (Modul Schreiben)',
  };

  const examName = examNameMap[targetLevel] || examNameMap.UNSPECIFIED;

  const summaryTh = passed
    ? `ผ่านเกณฑ์สอบ ${examName} ด้วยคะแนน ${computedTotal} / ${maxScore} คะแนน (${praedikat_de}) — สูงกว่าเกณฑ์ขั้นต่ำ ${passThreshold} คะแนนอยู่ +${pointsMargin} คะแนน`
    : `ยังไม่ผ่านเกณฑ์สอบ ${examName} ได้คะแนน ${computedTotal} / ${maxScore} คะแนน (${praedikat_de}) — ขาดอีก ${Math.abs(pointsMargin)} คะแนนจึงจะถึงเกณฑ์ผ่าน ${passThreshold} / ${maxScore}`;

  const moduleNoteTh =
    assessmentMode === 'free'
      ? isBasicLevel(targetLevel) || maxScore === TOTAL_MAX_SCORE_A1_A2
        ? `หมายเหตุ: ชิ้นนี้ตรวจในโหมดงานเขียนอิสระระดับ ${targetLevel} โดยใช้เกณฑ์คะแนนเต็ม 25 คะแนนตามมาตรฐาน Goethe A1–A2 (เกณฑ์ผ่าน 15/25 คะแนน หรือ 60%)`
        : 'หมายเหตุ: ชิ้นนี้ตรวจในโหมดงานเขียนอิสระ โดยเทียบคะแนนจากเกณฑ์ 4 ด้านทางการของ Goethe-Institut เต็ม 100 คะแนน (เกณฑ์ผ่าน 60/100 คะแนน)'
      : isBasicLevel(targetLevel) || maxScore === TOTAL_MAX_SCORE_A1_A2
      ? 'เกณฑ์ทางการ Goethe A1/A2: พาร์ท Schreiben มีคะแนนเต็ม 25 คะแนน (จากคะแนนรวมทั้งฉบับ 100 คะแนน) โดยต้องทำได้ตั้งแต่ 15 / 25 คะแนน (60%) ขึ้นไปจึงถือว่าผ่านเกณฑ์ของพาร์ทนี้'
      : 'เกณฑ์ทางการ Goethe B1–C1: ข้อสอบระบบโมดูล (Modulare Prüfung) แยกตรวจพาร์ท Schreiben เต็ม 100 คะแนน ต้องได้ตั้งแต่ 60 / 100 คะแนนขึ้นไปจึงถือว่าสอบผ่าน (bestanden)';

  const combineFeedback = (...parts: (string | undefined)[]) =>
    parts
      .map((p) => (p || '').trim())
      .filter(Boolean)
      .join(' • ');

  const officialCriteria: GoetheOfficialCriterion[] = [
    {
      criterion_de: 'Aufgabenerfüllung',
      criterion_th: 'การตอบโจทย์ครบถ้วนตามประเด็น (Leitpunkte), เนื้อหา และระดับภาษา (Register)',
      score: aufgabenScore,
      max_score: aufgabenMax,
      percentage: aufgabenMax > 0 ? Math.round((aufgabenScore / aufgabenMax) * 100) : 0,
      mapped_categories_label: `Aufgabenbewältigung (${taskCat?.score ?? 0}/${taskMax}) + Inhalt (${contentCat?.score ?? 0}/${contentMax}) + Register (${registerCat?.score ?? 0}/${registerMax})`,
      official_rule_th:
        'ตรวจความครบถ้วนของทุกประเด็นบังคับ (Inhaltspunkte), ความตรงตามประเภทงานเขียน, ระดับความสุภาพ (Sie/du) และเกณฑ์ความยาว (Unterlänge)',
      scored_feedback_th: combineFeedback(
        taskCat?.feedback_th,
        contentCat?.feedback_th,
        registerCat?.feedback_th
      ),
    },
    {
      criterion_de: 'Kohärenz',
      criterion_th: 'โครงสร้าง การลำดับความคิด และความเชื่อมโยงของข้อความ',
      score: kohaerenzScore,
      max_score: kohaerenzMax,
      percentage: kohaerenzMax > 0 ? Math.round((kohaerenzScore / kohaerenzMax) * 100) : 0,
      mapped_categories_label: `Kohärenz & Kohäsion (${cohesionCat?.score ?? 0}/${cohesionMax})`,
      official_rule_th:
        'ตรวจการจัดแบ่งย่อหน้า (บทนำ-เนื้อหา-สรุป), ความต่อเนื่องของเหตุผล และการใช้คำเชื่อม (Konnektoren) อย่างเป็นธรรมชาติ',
      scored_feedback_th: cohesionCat?.feedback_th || '',
    },
    {
      criterion_de: 'Wortschatz',
      criterion_th: 'ขอบเขตและความแม่นยำในการเลือกใช้คำศัพท์',
      score: wortschatzScore,
      max_score: wortschatzMax,
      percentage: wortschatzMax > 0 ? Math.round((wortschatzScore / wortschatzMax) * 100) : 0,
      mapped_categories_label: `Wortschatz (${vocabCat?.score ?? 0}/${vocabMax})`,
      official_rule_th:
        'ตรวจความหลากหลายของคลังคำศัพท์ การเลือกใช้คำร่วม (Kollokationen) และความเหมาะสมกับระดับ CEFR ที่สอบ',
      scored_feedback_th: vocabCat?.feedback_th || '',
    },
    {
      criterion_de: 'Strukturen',
      criterion_th: 'ไวยากรณ์ โครงสร้างประโยค และการสะกด/วรรคตอน',
      score: strukturenScore,
      max_score: strukturenMax,
      percentage: strukturenMax > 0 ? Math.round((strukturenScore / strukturenMax) * 100) : 0,
      mapped_categories_label: `Grammatik (${grammarCat?.score ?? 0}/${grammarMax}) + Rechtschreibung (${mechanicsCat?.score ?? 0}/${mechanicsMax})`,
      official_rule_th:
        'ตรวจความถูกต้องของกริยา ตำแหน่งคำ (V2/Verbletzt) การก (Kasus) รูปพจน์ ตัวพิมพ์ใหญ่คำนาม (Großschreibung) และเครื่องหมายจุลภาค',
      scored_feedback_th: combineFeedback(grammarCat?.feedback_th, mechanicsCat?.feedback_th),
    },
  ];

  return {
    exam_name: examName,
    target_level: targetLevel,
    score: computedTotal,
    max_score: maxScore,
    pass_threshold: passThreshold,
    passed,
    praedikat_de,
    praedikat_th,
    points_margin: pointsMargin,
    summary_th: summaryTh,
    module_note_th: moduleNoteTh,
    official_criteria: officialCriteria,
  };
}

