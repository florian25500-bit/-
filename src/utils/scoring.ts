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

export const TOTAL_MAX_SCORE = 100;

/**
 * Calculates grade based strictly on 100-point rubric
 */
export function calculateGrade(score: number): Grade {
  const rounded = Math.round(score);
  if (rounded >= 90) return 'A';
  if (rounded >= 80) return 'B';
  if (rounded >= 70) return 'C';
  if (rounded >= 60) return 'D';
  if (rounded >= 50) return 'E';
  return 'F';
}

/**
 * Verifies category scores, caps at max, and calculates sum
 */
export function calculateTotalScore(categoryScores: CategoryScoreItem[]): {
  total: number;
  grade: Grade;
  verifiedScores: CategoryScoreItem[];
} {
  let total = 0;
  const verifiedScores = categoryScores.map((cat) => {
    const max = RUBRIC_WEIGHTS[cat.category] || cat.max_score || 20;
    const clampedScore = Math.max(0, Math.min(cat.score, max));
    total += clampedScore;
    return {
      ...cat,
      score: clampedScore,
      max_score: max,
    };
  });

  const roundedTotal = Math.round(total * 10) / 10;
  const grade = calculateGrade(roundedTotal);

  return {
    total: roundedTotal,
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
    const isVeryShort = wordCount < minWords * 0.3 || wordCount < 40;
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
