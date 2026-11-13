import { Type, Schema } from '@google/genai';
import {
  AssessmentError,
  AssessmentResult,
  CategoryScoreItem,
  CEFRProfile,
  ExtendedCEFR,
  Grade,
  WritingTask,
  WritingVersions,
} from '../types';
import {
  calculateGrade,
  RUBRIC_WEIGHTS,
} from './scoring';

export const VALID_LESSON_IDS = [
  'lesson-praesens-satzbau',
  'lesson-perfekt-modalverben',
  'lesson-nebensaetze',
  'lesson-kasus',
  'lesson-wechselpraepositionen',
  'lesson-konnektoren-b2',
  'lesson-passiv',
  'lesson-konjunktiv-2',
  'lesson-adjektivendungen',
  'lesson-nominalisierung',
] as const;

export const CEFR_SUBLEVEL_ENUM = ['A1', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+'];

export function normalizeLessonId(lessonId?: string, topic?: string): string {
  const candidate = (lessonId || '').trim().toLowerCase();
  if ((VALID_LESSON_IDS as readonly string[]).includes(candidate)) {
    return candidate;
  }
  const combined = `${candidate} ${(topic || '').toLowerCase()}`;
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
  if (combined.includes('konjunktiv')) {
    return 'lesson-konjunktiv-2';
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
 * 2. Strict ResponseSchema for Gemini to eliminate missing keys and fake defaults
 */
export const ASSESSMENT_RESPONSE_SCHEMA: Schema = {
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
            score: { type: Type.INTEGER, description: 'Points 0-20' },
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
            score: { type: Type.INTEGER, description: 'Points 0-15' },
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
            score: { type: Type.INTEGER, description: 'Points 0-20' },
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
            score: { type: Type.INTEGER, description: 'Points 0-20' },
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
            score: { type: Type.INTEGER, description: 'Points 0-15' },
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
            score: { type: Type.INTEGER, description: 'Points 0-5' },
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
            score: { type: Type.INTEGER, description: 'Points 0-5' },
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
        task_fulfillment: { type: Type.STRING, enum: CEFR_SUBLEVEL_ENUM },
        content_development: { type: Type.STRING, enum: CEFR_SUBLEVEL_ENUM },
        vocabulary: { type: Type.STRING, enum: CEFR_SUBLEVEL_ENUM },
        grammar: { type: Type.STRING, enum: CEFR_SUBLEVEL_ENUM },
        cohesion: { type: Type.STRING, enum: CEFR_SUBLEVEL_ENUM },
        register: { type: Type.STRING, enum: CEFR_SUBLEVEL_ENUM },
        mechanics: { type: Type.STRING, enum: CEFR_SUBLEVEL_ENUM },
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
    cefr_estimate: { type: Type.STRING, enum: CEFR_SUBLEVEL_ENUM },
    cefr_confidence: { type: Type.STRING, enum: ['high', 'medium', 'low'] },
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
 * 4. Derive CEFR overall estimate from median of sub-skills
 */
const CEFR_ORDER: ExtendedCEFR[] = ['A1', 'A2', 'A2+', 'B1', 'B1+', 'B2', 'B2+', 'C1', 'C1+'];

export function calculateMedianCefr(
  profile: CEFRProfile,
  wordCount?: number,
  minWords?: number
): ExtendedCEFR {
  if (wordCount && minWords && wordCount < minWords * 0.5) {
    const severeCutoff = Math.max(12, Math.round(minWords * 0.3));
    return wordCount < severeCutoff ? 'A1' : 'A2';
  }

  const levels = Object.values(profile) as ExtendedCEFR[];
  const ranks = levels
    .map((lvl) => {
      const idx = CEFR_ORDER.indexOf(lvl);
      return idx >= 0 ? idx : 3; // Default to B1 (index 3)
    })
    .sort((a, b) => a - b);

  const medianIndex = ranks[Math.floor(ranks.length / 2)];
  return CEFR_ORDER[medianIndex] || 'B1';
}

/**
 * 5. Evidence-Backed Score Calibration & Sanity Adjustments
 */
export function calibrateEvidenceScores(
  rawScores: Record<string, any>,
  verifiedErrors: AssessmentError[],
  wordCount: number,
  task: WritingTask
): {
  verifiedScores: CategoryScoreItem[];
  totalScore: number;
  grade: Grade;
  adjustments: string[];
} {
  const adjustments: string[] = [];

  const taskScore = Math.max(0, Math.min(20, Number(rawScores.task_fulfillment?.score ?? 16)));
  const contentScore = Math.max(0, Math.min(15, Number(rawScores.content_development?.score ?? 12)));
  const vocabScore = Math.max(0, Math.min(20, Number(rawScores.vocabulary?.score ?? 16)));
  const grammarScore = Math.max(0, Math.min(20, Number(rawScores.grammar?.score ?? 14)));
  const cohesionScore = Math.max(0, Math.min(15, Number(rawScores.cohesion?.score ?? 12)));
  const registerScore = Math.max(0, Math.min(5, Number(rawScores.register?.score ?? 4)));
  const mechanicsScore = Math.max(0, Math.min(5, Number(rawScores.mechanics?.score ?? 4)));

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

  // Word count constraint check (Unterlänge standard): adjust numeric caps transparently
  // without overwriting the AI's individualized essay-specific feedback.
  if (wordCount < task.min_words * 0.5) {
    const severeCutoff = Math.max(10, Math.round(task.min_words * 0.28));
    const isSevere = wordCount < severeCutoff;
    const capTask = isSevere ? 3 : 6;
    const capContent = isSevere ? 1 : 3;
    const capVocab = isSevere ? 4 : 6;
    const capGrammar = isSevere ? 4 : 6;
    const capCohesion = isSevere ? 1 : 3;
    const capRegister = 1;
    const capMechanics = isSevere ? 2 : 3;

    if (finalTask > capTask) finalTask = capTask;
    if (finalContent > capContent) finalContent = capContent;
    if (finalVocab > capVocab) finalVocab = capVocab;
    if (finalGrammar > capGrammar) finalGrammar = capGrammar;
    if (finalCohesion > capCohesion) finalCohesion = capCohesion;
    if (finalRegister > capRegister) finalRegister = capRegister;
    if (finalMechanics > capMechanics) finalMechanics = capMechanics;

    adjustments.push(
      `จำนวนคำ (${wordCount} คำ) คิดเป็นเพียง ${Math.round((wordCount / task.min_words) * 100)}% ของเกณฑ์ขั้นต่ำ (${task.min_words} คำ) ระบบปรับเทียบเพดานคะแนนและระดับ CEFR ตามเกณฑ์ Unterlänge ของสถาบันเกอเธ่และ telc`
    );
  } else if (wordCount < task.min_words * 0.8) {
    if (finalTask > 14) {
      finalTask = 14;
      adjustments.push(`จำนวนคำ (${wordCount} คำ) ต่ำกว่าเกณฑ์ขั้นต่ำ (${task.min_words} คำ) ปรับลดเพดานคะแนนการตอบโจทย์ไม่เกิน 14/20`);
    }
  }

  // Grammar error evidence constraint
  const majorGrammarErrors = verifiedErrors.filter(
    (e) => e.category === 'GRAMMAR' && e.severity === 'major'
  ).length;
  const totalGrammarErrors = verifiedErrors.filter((e) => e.category === 'GRAMMAR').length;

  if (majorGrammarErrors >= 3 && finalGrammar > 12) {
    finalGrammar = 12;
    adjustments.push(`พบข้อผิดพลาดไวยากรณ์ระดับสำคัญ ${majorGrammarErrors} จุด ปรับเพดานคะแนนไวยากรณ์ไม่เกิน 12/20`);
  } else if (totalGrammarErrors >= 3 && finalGrammar > 14) {
    finalGrammar = 14;
    adjustments.push(`พบข้อผิดพลาดไวยากรณ์รวม ${totalGrammarErrors} จุด ปรับคะแนนไวยากรณ์ไม่เกิน 14/20`);
  }

  // Vocabulary error evidence constraint
  const vocabErrors = verifiedErrors.filter((e) => e.category === 'VOCABULARY').length;
  if (vocabErrors >= 3 && finalVocab > 14) {
    finalVocab = 14;
    adjustments.push(`พบข้อผิดพลาดด้านคำศัพท์ ${vocabErrors} จุด ปรับคะแนนคำศัพท์ไม่เกิน 14/20`);
  }

  // Mechanics error constraint
  const mechanicsErrors = verifiedErrors.filter((e) => e.category === 'MECHANICS').length;
  if (mechanicsErrors >= 3 && finalMechanics > 3) {
    finalMechanics = 3;
    adjustments.push(`พบข้อผิดพลาดด้านการสะกดหรือเครื่องหมาย ${mechanicsErrors} จุด ปรับคะแนนอักขรวิธี`);
  }

  const categoryItems: CategoryScoreItem[] = [
    {
      category: 'task_fulfillment',
      label_de: 'Aufgabenbewältigung',
      label_en: 'Task Fulfillment',
      score: finalTask,
      max_score: 20,
      feedback_th: taskFeedback,
    },
    {
      category: 'content_development',
      label_de: 'Inhalt & Entwicklung',
      label_en: 'Content Development',
      score: finalContent,
      max_score: 15,
      feedback_th: contentFeedback,
    },
    {
      category: 'vocabulary',
      label_de: 'Wortschatz',
      label_en: 'Vocabulary',
      score: finalVocab,
      max_score: 20,
      feedback_th: vocabFeedback,
    },
    {
      category: 'grammar',
      label_de: 'Grammatik',
      label_en: 'Grammar',
      score: finalGrammar,
      max_score: 20,
      feedback_th: grammarFeedback,
    },
    {
      category: 'cohesion',
      label_de: 'Kohärenz & Kohäsion',
      label_en: 'Cohesion',
      score: finalCohesion,
      max_score: 15,
      feedback_th: cohesionFeedback,
    },
    {
      category: 'register',
      label_de: 'Register & Stil',
      label_en: 'Register & Style',
      score: finalRegister,
      max_score: 5,
      feedback_th: registerFeedback,
    },
    {
      category: 'mechanics',
      label_de: 'Rechtschreibung',
      label_en: 'Mechanics',
      score: finalMechanics,
      max_score: 5,
      feedback_th: mechanicsFeedback,
    },
  ];

  const totalScore = categoryItems.reduce((acc, curr) => acc + curr.score, 0);
  const grade = calculateGrade(totalScore);

  return {
    verifiedScores: categoryItems,
    totalScore,
    grade,
    adjustments,
  };
}
