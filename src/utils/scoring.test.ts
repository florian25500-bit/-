import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGrade,
  calculateTotalScore,
  countGermanWords,
  countParagraphs,
  deriveCefrSummary,
  RUBRIC_WEIGHTS,
} from './scoring';
import { CategoryScoreItem } from '../types';

test('calculateGrade maps scores strictly according to specification', () => {
  assert.equal(calculateGrade(95), 'A');
  assert.equal(calculateGrade(90), 'A');
  assert.equal(calculateGrade(89), 'B');
  assert.equal(calculateGrade(80), 'B');
  assert.equal(calculateGrade(75), 'C');
  assert.equal(calculateGrade(70), 'C');
  assert.equal(calculateGrade(65), 'D');
  assert.equal(calculateGrade(60), 'D');
  assert.equal(calculateGrade(55), 'E');
  assert.equal(calculateGrade(50), 'E');
  assert.equal(calculateGrade(49), 'F');
  assert.equal(calculateGrade(20), 'F');
});

test('calculateTotalScore clamps individual category scores and computes sum and grade', () => {
  const sampleScores: CategoryScoreItem[] = [
    { category: 'task_fulfillment', label_de: 'Aufgabenbewältigung', label_en: 'Task', score: 18, max_score: 20, feedback_th: 'ดี' },
    { category: 'content_development', label_de: 'Inhalt', label_en: 'Content', score: 13, max_score: 15, feedback_th: 'ดี' },
    { category: 'vocabulary', label_de: 'Wortschatz', label_en: 'Vocab', score: 17, max_score: 20, feedback_th: 'ดี' },
    { category: 'grammar', label_de: 'Grammatik', label_en: 'Grammar', score: 14, max_score: 20, feedback_th: 'ดี' },
    { category: 'cohesion', label_de: 'Kohärenz', label_en: 'Cohesion', score: 13, max_score: 15, feedback_th: 'ดี' },
    { category: 'register', label_de: 'Register', label_en: 'Register', score: 4, max_score: 5, feedback_th: 'ดี' },
    { category: 'mechanics', label_de: 'Rechtschreibung', label_en: 'Mechanics', score: 3, max_score: 5, feedback_th: 'ดี' },
  ];

  const result = calculateTotalScore(sampleScores);
  assert.equal(result.total, 82);
  assert.equal(result.grade, 'B');
});

test('countGermanWords handles German umlauts and punctuation properly', () => {
  const germanText = 'Obwohl es regnet, gehe ich mit meinen Brüdern spazieren, weil das Wetter schön ist.';
  const count = countGermanWords(germanText);
  assert.equal(count, 14);

  assert.equal(countGermanWords(''), 0);
  assert.equal(countGermanWords('   '), 0);
});

test('countParagraphs counts non-empty paragraphs', () => {
  const text = 'Erster Absatz.\n\nZweiter Absatz mit zwei Sätzen.\n\nDritter Absatz.';
  assert.equal(countParagraphs(text), 3);
});

test('deriveCefrSummary detects insufficient evidence when text is too short', () => {
  const profile = {
    task_fulfillment: 'B2',
    content_development: 'B2',
    vocabulary: 'B2',
    grammar: 'B2',
    cohesion: 'B2',
    register: 'B2',
    mechanics: 'B2',
  } as any;

  // target min_words: 180, wordCount: 40 (< 50%)
  const summary = deriveCefrSummary('B2', 40, 180, profile);
  assert.equal(summary.confidence, 'low');
  assert.match(summary.summaryTh, /หลักฐานการเขียนไม่เพียงพอ/);
});

test('deriveCefrSummary computes B2 with high confidence when B2 skills dominate', () => {
  const profile = {
    task_fulfillment: 'B2',
    content_development: 'B2',
    vocabulary: 'B2',
    grammar: 'B1+',
    cohesion: 'B2',
    register: 'B2',
    mechanics: 'B2',
  } as any;

  const summary = deriveCefrSummary('B2', 195, 180, profile);
  assert.equal(summary.estimate, 'B2');
  assert.equal(summary.confidence, 'high');
});

import { evaluateTextLinguistically } from './germanEvaluator';
import { SAMPLE_TASKS } from '../data/sampleTasks';

test('evaluateTextLinguistically gives Grade F and A1 to very short text', () => {
  const shortResult = evaluateTextLinguistically(SAMPLE_TASKS[0], 'Hallo wie geht es dir');
  assert.equal(shortResult.grade, 'F');
  assert.equal(shortResult.cefr_estimate, 'A1');
  assert.ok(shortResult.total_score < 25, 'Score should be below 25 for 5 words on a B2 180-word task');
});

test('evaluateTextLinguistically detects Nebensatz verb order and noun capitalization errors', () => {
  const textWithErrors = `Ich bin zu Hause geblieben, weil ich habe keine zeit gehabt. Außerdem ich bin sehr müde.`;
  const result = evaluateTextLinguistically(SAMPLE_TASKS[0], textWithErrors);
  const nebensatzErr = result.errors.find((e) => e.rule.includes('Nebensatz'));
  assert.ok(nebensatzErr, 'Should detect Nebensatz word order error');
  assert.equal(nebensatzErr?.category, 'GRAMMAR');
});

test('evaluateTextLinguistically correctly scores 31 words on B2 task with A1 and no contradictory praise', () => {
  const b2Task = SAMPLE_TASKS.find((t) => t.cefr_level === 'B2') || SAMPLE_TASKS[0];
  const text31Words = 'In der heutigen Gesellschaft spielen moderne Medien eine sehr große Rolle. Viele Menschen nutzen das Smartphone jeden Tag. Deshalb müssen wir über die Folgen diskutieren, weil es wichtig für unsere Zukunft ist.';
  const result = evaluateTextLinguistically(b2Task, text31Words);

  assert.equal(result.grade, 'F');
  assert.equal(result.cefr_estimate, 'A1');
  assert.equal(result.cefr_profile.grammar, 'A1');
  assert.equal(result.cefr_profile.task_fulfillment, 'A1');
  assert.equal(result.cefr_profile.vocabulary, 'A1');

  // Verify grammar feedback does NOT falsely praise a failing short text
  const grammarItem = result.category_scores.find((c) => c.category === 'grammar');
  assert.ok(grammarItem, 'Grammar item must exist');
  assert.ok(!grammarItem.feedback_th.includes('ถูกต้องแม่นยำ'), 'Must not claim grammar is accurate when length is deficient');
  assert.match(grammarItem.feedback_th, /ข้อความสั้นเกินไป|ไม่เพียงพอ/);

  // Total score must be under 30 (severe under-length)
  assert.ok(result.total_score <= 25, `Total score should be <= 25 for 31 words on B2 task (actual: ${result.total_score})`);
});

