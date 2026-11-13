import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPredominantlyGerman,
  validateAndAlignErrors,
  calibrateEvidenceScores,
  calculateMedianCefr,
  validateAssessmentPayload,
  normalizeLessonId,
} from './assessment-core';
import { WritingTask, CEFRProfile } from '../types';

test('isPredominantlyGerman verifies German and rejects non-German text', () => {
  const german = isPredominantlyGerman(
    'In der heutigen Gesellschaft spielen Anglizismen eine sehr wichtige Rolle. Deshalb sollten wir das Thema diskutieren.'
  );
  assert.equal(german.isGerman, true);

  const thai = isPredominantlyGerman('นี่คือข้อความภาษาไทยที่ผู้เรียนพิมพ์เข้ามาเพื่อทดสอบระบบประเมิน');
  assert.equal(thai.isGerman, false);
  assert.match(thai.reason || '', /ภาษาไทย/);

  const shortText = isPredominantlyGerman('Hallo Welt');
  assert.equal(shortText.isGerman, false);
  assert.match(shortText.reason || '', /สั้นเกินไป/);
});

test('validateAndAlignErrors computes offsets and discards hallucinated errors', () => {
  const text = 'Ich gehe nach Hause, weil ich habe keine Zeit.';
  const rawErrors = [
    {
      id: 'e1',
      category: 'GRAMMAR',
      subcategory: 'Word Order',
      original_text: 'weil ich habe keine Zeit',
      corrected_text: 'weil ich keine Zeit habe',
      explanation_th: 'ใน Nebensatz กริยาแท้ต้องอยู่ท้ายประโยค',
      rule: 'Verbletztstellung',
      severity: 'major',
      confidence: 0.95,
      examples: [{ german: 'weil er müde ist', thai: 'เพราะเขาเหนื่อย' }],
    },
    {
      id: 'e2',
      category: 'VOCABULARY',
      subcategory: 'Choice',
      original_text: 'dieses Wort existiert gar nicht im Text',
      corrected_text: 'Korrektur',
      explanation_th: 'หลอนขึ้นมา',
      rule: 'N/A',
      severity: 'minor',
      confidence: 0.9,
      examples: [],
    },
  ];

  const validated = validateAndAlignErrors(rawErrors, text);

  assert.equal(validated.length, 1);
  assert.equal(validated[0].original_text, 'weil ich habe keine Zeit');
  assert.equal(validated[0].start_offset, 21);
  assert.equal(validated[0].end_offset, 45);
  assert.equal(text.substring(validated[0].start_offset, validated[0].end_offset), 'weil ich habe keine Zeit');
});

test('calibrateEvidenceScores caps scores on short texts while preserving individualized AI feedback', () => {
  const mockTask: WritingTask = {
    id: 't-test',
    task_id: 'DE-B2-001',
    language: 'de',
    cefr_level: 'B2',
    category: 'Stellungnahme',
    topic: 'Test Topic',
    title: 'Test',
    instructions: 'Write essay',
    requirements: ['R1', 'R2'],
    min_words: 200,
    max_words: 250,
    time_limit_minutes: 30,
    task_version: '1.0',
  };

  const customTaskFeedback = 'ผู้เรียนเปิดประเด็นเรื่อง „Medien“ ได้ตรงหัวข้อ แต่ยังไม่ได้ตอบประเด็น R2';
  const rawScores = {
    task_fulfillment: { score: 18, feedback_th: customTaskFeedback },
    content_development: { score: 14, feedback_th: 'มีตัวอย่างเดียว ยังขาดการขยายผล' },
    vocabulary: { score: 18, feedback_th: 'ใช้คำว่า „Gesellschaft“ ได้ถูกต้อง' },
    grammar: { score: 18, feedback_th: 'ประโยคหลัก „Spielen moderne Medien...“ ถูกต้อง' },
    cohesion: { score: 13, feedback_th: 'ใช้ „Deshalb“ เชื่อมประโยคได้ดี' },
    register: { score: 4, feedback_th: 'ภาษาสุภาพเหมาะสม' },
    mechanics: { score: 4, feedback_th: 'สะกดถูกต้อง' },
  };

  const resultShort = calibrateEvidenceScores(rawScores, [], 40, mockTask);
  const taskItem = resultShort.verifiedScores.find((s) => s.category === 'task_fulfillment');
  const contentItem = resultShort.verifiedScores.find((s) => s.category === 'content_development');

  assert.ok((taskItem?.score || 0) <= 10, 'Task fulfillment score must be capped to <= 10');
  assert.ok((contentItem?.score || 0) <= 6, 'Content score must be capped to <= 6');
  assert.ok(resultShort.adjustments.length > 0, 'Adjustments list must document reason');
  assert.equal(taskItem?.feedback_th, customTaskFeedback, 'Must preserve individualized AI feedback instead of template');
});

test('calculateMedianCefr computes true median CEFR from sub-skills', () => {
  const profile: CEFRProfile = {
    task_fulfillment: 'B1',
    content_development: 'B1+',
    vocabulary: 'B2',
    grammar: 'B2',
    cohesion: 'B2',
    register: 'B1',
    mechanics: 'B2+',
  };

  const median = calculateMedianCefr(profile);
  assert.equal(median, 'B2');
});

test('validateAssessmentPayload rejects incomplete responses and accepts full payloads', () => {
  assert.equal(validateAssessmentPayload(null).valid, false);
  assert.equal(validateAssessmentPayload({ category_scores: {} }).valid, false);

  const valid = validateAssessmentPayload({
    category_scores: {
      task_fulfillment: { score: 15, feedback_th: 'ดี' },
      content_development: { score: 12, feedback_th: 'ดี' },
      vocabulary: { score: 16, feedback_th: 'ดี' },
      grammar: { score: 14, feedback_th: 'ดี' },
      cohesion: { score: 12, feedback_th: 'ดี' },
      register: { score: 4, feedback_th: 'ดี' },
      mechanics: { score: 4, feedback_th: 'ดี' },
    },
    cefr_profile: { task_fulfillment: 'B2' },
    writing_versions: { corrected: 'Korrigierter Text.' },
    errors: [],
  });
  assert.equal(valid.valid, true);
});

test('normalizeLessonId maps topics and IDs to valid grammar lesson IDs', () => {
  assert.equal(normalizeLessonId('lesson-kasus', 'anything'), 'lesson-kasus');
  assert.equal(normalizeLessonId(undefined, 'Dativ und Genitiv Kasus'), 'lesson-kasus');
  assert.equal(normalizeLessonId(undefined, 'Zweiteilige Konnektoren'), 'lesson-konnektoren-b2');
  assert.equal(normalizeLessonId(undefined, 'Konjunktiv II Höflichkeit'), 'lesson-konjunktiv-2');
  assert.equal(normalizeLessonId(undefined, 'Nominalisierung C1'), 'lesson-nominalisierung');
});

