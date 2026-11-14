import { CategoryScoreItem, CEFRLevel, ExtendedCEFR, Grade } from '../types';

export const RUBRIC_WEIGHTS = {
  task_fulfillment: 20,
  content_development: 15,
  vocabulary: 20,
  grammar: 20,
  cohesion: 15,
  register: 5,
  mechanics: 5,
} as const;

export const RUBRIC_WEIGHTS_A1_A2 = {
  task_fulfillment: 6,
  content_development: 3,
  vocabulary: 5,
  grammar: 5,
  cohesion: 3,
  register: 1,
  mechanics: 2,
} as const;

export type RubricWeightMap = {
  readonly task_fulfillment: number;
  readonly content_development: number;
  readonly vocabulary: number;
  readonly grammar: number;
  readonly cohesion: number;
  readonly register: number;
  readonly mechanics: number;
};

export const TOTAL_MAX_SCORE = 100;
export const TOTAL_MAX_SCORE_A1_A2 = 25;

export function isBasicLevel(level?: CEFRLevel | 'UNSPECIFIED' | 'AUTO' | string | null): boolean {
  return level === 'A1' || level === 'A2';
}

export function getRubricMaxScoreForLevel(
  level?: CEFRLevel | 'UNSPECIFIED' | 'AUTO' | string | null
): 25 | 100 {
  return isBasicLevel(level) ? TOTAL_MAX_SCORE_A1_A2 : TOTAL_MAX_SCORE;
}

export function getRubricWeightsForLevel(
  level?: CEFRLevel | 'UNSPECIFIED' | 'AUTO' | string | null
): RubricWeightMap {
  return isBasicLevel(level) ? RUBRIC_WEIGHTS_A1_A2 : RUBRIC_WEIGHTS;
}

/**
 * Calculates grade based on percentage of maxScore (supports both 25-point A1-A2 and 100-point B1-C1 rubrics)
 */
export function calculateGrade(score: number, maxScore = TOTAL_MAX_SCORE): Grade {
  const safeMax = maxScore > 0 ? maxScore : TOTAL_MAX_SCORE;
  const pct = Math.round((score / safeMax) * 100);
  if (pct >= 90) return 'A';
  if (pct >= 80) return 'B';
  if (pct >= 70) return 'C';
  if (pct >= 60) return 'D';
  if (pct >= 50) return 'E';
  return 'F';
}

/**
 * Verifies category scores, caps at max, and calculates sum
 */
export function calculateTotalScore(
  categoryScores: CategoryScoreItem[],
  level?: CEFRLevel | 'UNSPECIFIED' | 'AUTO' | string | null
): {
  total: number;
  maxTotal: number;
  grade: Grade;
  verifiedScores: CategoryScoreItem[];
} {
  const weights = level ? getRubricWeightsForLevel(level) : RUBRIC_WEIGHTS;
  let total = 0;
  let maxTotal = 0;
  const verifiedScores = categoryScores.map((cat) => {
    const max = level
      ? weights[cat.category]
      : cat.max_score || RUBRIC_WEIGHTS[cat.category] || 20;
    const clampedScore = Math.max(0, Math.min(cat.score, max));
    total += clampedScore;
    maxTotal += max;
    return {
      ...cat,
      score: clampedScore,
      max_score: max,
    };
  });

  const effectiveMax = maxTotal > 0 ? maxTotal : getRubricMaxScoreForLevel(level);
  const roundedTotal = Math.round(total * 10) / 10;
  const grade = calculateGrade(roundedTotal, effectiveMax);

  return {
    total: roundedTotal,
    maxTotal: effectiveMax,
    grade,
    verifiedScores,
  };
}

/**
 * Counts German words accurately
 */
export function countGermanWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  // Match whitespace-separated tokens, handling German characters
  const words = trimmed.match(/[\p{L}\p{N}_\-ßäöüÄÖÜ]+/gu);
  return words ? words.length : 0;
}

/**
 * Counts characters without excessive whitespace
 */
export function countGermanChars(text: string): number {
  if (!text) return 0;
  return text.length;
}

/**
 * Counts non-empty paragraphs
 */
export function countParagraphs(text: string): number {
  if (!text) return 0;
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;
}

/**
 * Estimates reading time in minutes
 */
export function estimateReadingTimeMinutes(words: number): number {
  return Math.ceil(words / 120);
}

/**
 * Evaluates CEFR estimate and confidence based on skill profile and word count
 */
export function deriveCefrSummary(
  targetLevel: CEFRLevel,
  wordCount: number,
  minWords: number,
  profile: Record<string, ExtendedCEFR>
): {
  estimate: ExtendedCEFR;
  confidence: 'high' | 'medium' | 'low';
  summaryTh: string;
} {
  // If word count is less than 50% of minimum requirement, evidence is insufficient
  if (wordCount < minWords * 0.5) {
    const severeCutoff = Math.max(12, Math.round(minWords * 0.3));
    const isVeryShort = wordCount < severeCutoff;
    const level: ExtendedCEFR = isVeryShort ? 'A1' : 'A2';
    return {
      estimate: level,
      confidence: 'low',
      summaryTh: `หลักฐานการเขียนไม่เพียงพอต่อการประเมินระดับ ${targetLevel} เนื่องจากจำนวนคำ (${wordCount} คำ) ต่ำกว่า 50% ของเกณฑ์ขั้นต่ำ (${minWords} คำ) ผลประเมินเชิงประจักษ์อยู่ในระดับ ${level}`,
    };
  }

  const levels = Object.values(profile);
  const countC1 = levels.filter((l) => l.startsWith('C1')).length;
  const countB2 = levels.filter((l) => l.startsWith('B2')).length;
  const countB1 = levels.filter((l) => l.startsWith('B1')).length;
  const countA2 = levels.filter((l) => l.startsWith('A2')).length;
  const countA1 = levels.filter((l) => l.startsWith('A1')).length;

  let estimate: ExtendedCEFR = 'B1';
  let confidence: 'high' | 'medium' | 'low' = 'medium';

  if (countA1 + countA2 >= 4) {
    estimate = countA1 >= 4 ? 'A1' : 'A2';
    confidence = 'high';
  } else if (countC1 >= 5) {
    estimate = 'C1';
    confidence = 'high';
  } else if (countC1 >= 3 && countB2 >= 3) {
    estimate = 'B2+';
    confidence = 'high';
  } else if (countB2 >= 4) {
    estimate = 'B2';
    confidence = 'high';
  } else if (countB2 >= 2 && countB1 <= 3) {
    estimate = 'B1+';
    confidence = 'medium';
  } else if (countB1 >= 4) {
    estimate = 'B1';
    confidence = 'high';
  } else {
    estimate = 'A2+';
    confidence = 'medium';
  }

  if (wordCount < minWords) {
    confidence = 'medium';
  }

  const summaryTh = `ระดับประเมินภาพรวมคือ ${estimate} โดยผู้เรียนแสดงความสามารถในการถ่ายทอดข้อความได้สอดคล้องกับกรอบมาตรฐาน CEFR ระดับ ${estimate.replace('+', '')}`;

  return { estimate, confidence, summaryTh };
}
