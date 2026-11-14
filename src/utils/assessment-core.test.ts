import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPredominantlyGerman,
  validateAndAlignErrors,
  calibrateEvidenceScores,
  calculateMedianCefr,
  normalizeCefrProfile,
  validateAssessmentPayload,
  normalizeLessonId,
  validateAttachedImageInput,
  stripUndefinedDeep,
  MAX_IMAGE_BYTES,
  buildGoetheExamVerdict,
  getGoethePraedikat,
} from './assessment-core';
import { WritingTask, CEFRProfile, CategoryScoreItem } from '../types';

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

test('calibrateEvidenceScores caps scores on short exam texts while preserving individualized AI feedback', () => {
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

test('calculateMedianCefr computes true median CEFR and returns null when undetermined or insufficient', () => {
  const profile: CEFRProfile = {
    task_fulfillment: 'B1',
    content_development: 'B1+',
    vocabulary: 'B2',
    grammar: 'B2',
    cohesion: 'B2',
    register: 'B1',
    mechanics: 'B2+',
  };

  assert.equal(calculateMedianCefr(profile, 80, 0, 'B2'), 'B2');
  assert.equal(calculateMedianCefr(profile, 8, 0, 'B1'), null, 'Too few words must not guess CEFR level');
  assert.equal(calculateMedianCefr(profile, 60, 0, 'UNDETERMINED'), null, 'UNDETERMINED from AI must stay null');

  const sparseProfile = normalizeCefrProfile({
    task_fulfillment: 'UNDETERMINED',
    content_development: 'UNDETERMINED',
    vocabulary: 'B1',
    grammar: 'UNDETERMINED',
    cohesion: 'UNDETERMINED',
    register: 'B1',
    mechanics: 'A2',
  });
  assert.equal(sparseProfile.grammar, null);
  assert.equal(calculateMedianCefr(sparseProfile, 40, 0, 'B1'), null, 'Fewer than 4 rated sub-skills must return null');
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

test('normalizeLessonId maps topics and IDs to valid grammar lesson IDs including A1/A2 and writing craft', () => {
  assert.equal(normalizeLessonId('lesson-praesens-satzbau', 'anything'), 'lesson-praesens-satzbau');
  assert.equal(normalizeLessonId('lesson-negation-zeitangaben-a1', 'anything'), 'lesson-negation-zeitangaben-a1');
  assert.equal(normalizeLessonId('lesson-perfekt-modalverben', 'anything'), 'lesson-perfekt-modalverben');
  assert.equal(normalizeLessonId(undefined, 'Präsens V2 W-Fragen A1'), 'lesson-praesens-satzbau');
  assert.equal(normalizeLessonId(undefined, 'Negation nicht/kein Zeitangaben'), 'lesson-negation-zeitangaben-a1');
  assert.equal(normalizeLessonId(undefined, 'Brief Anrede Grußformel Register'), 'lesson-brief-anrede-schluss');
  assert.equal(normalizeLessonId(undefined, 'Kommasetzung und das/dass'), 'lesson-kommasetzung-rechtschreibung');
  assert.equal(normalizeLessonId(undefined, 'Relativsätze und um zu'), 'lesson-relativsaetze');
  assert.equal(normalizeLessonId(undefined, 'Redemittel Stellungnahme Beschwerde'), 'lesson-stellungnahme-redemittel');
  assert.equal(normalizeLessonId(undefined, 'Partizipialattribute und Konjunktiv I'), 'lesson-partizipialattribute-c1');
  assert.equal(normalizeLessonId(undefined, 'Perfekt und Modalverben A2'), 'lesson-perfekt-modalverben');
  assert.equal(normalizeLessonId('lesson-kasus', 'anything'), 'lesson-kasus');
  assert.equal(normalizeLessonId(undefined, 'Dativ und Genitiv Kasus'), 'lesson-kasus');
  assert.equal(normalizeLessonId(undefined, 'Zweiteilige Konnektoren'), 'lesson-konnektoren-b2');
  assert.equal(normalizeLessonId(undefined, 'Konjunktiv II Höflichkeit'), 'lesson-konjunktiv-2');
  assert.equal(normalizeLessonId(undefined, 'Nominalisierung C1'), 'lesson-nominalisierung');
});

test('calibrateEvidenceScores does not penalize a valid 35-word A1 submission or Free Writing submission as Unterlänge', () => {
  const a1Task: WritingTask = {
    id: 't-a1-test',
    task_id: 'EXAM-A1-001',
    language: 'de',
    cefr_level: 'A1',
    category: 'E-Mail',
    topic: 'Geburtstagsparty',
    title: 'Geburtstagsparty: Einladung schreiben',
    instructions: 'Schreiben Sie eine kurze E-Mail (30–50 Wörter).',
    requirements: ['Warum schreiben Sie?', 'Wann und wo?', 'Was mitbringen?'],
    min_words: 30,
    max_words: 50,
    time_limit_minutes: 15,
    task_version: '4.0',
  };

  const freeTask: WritingTask = {
    ...a1Task,
    id: 'free-writing',
    task_id: 'FREE-WRITING',
    category: 'Freier Text',
    min_words: 0,
    max_words: 0,
    requirements: [],
  };

  const rawScores = {
    task_fulfillment: { score: 19, feedback_th: 'ตอบครบทั้ง 3 ประเด็น' },
    content_development: { score: 13, feedback_th: 'ข้อมูลชัดเจนเหมาะสม' },
    vocabulary: { score: 18, feedback_th: 'ใช้คำศัพท์พื้นฐานได้ถูกต้อง' },
    grammar: { score: 18, feedback_th: 'ผันกริยาและตำแหน่ง V2 ถูกต้อง' },
    cohesion: { score: 13, feedback_th: 'เชื่อมประโยคด้วย und / aber ได้ดี' },
    register: { score: 5, feedback_th: 'ใช้ภาษาเป็นกันเองเหมาะสม' },
    mechanics: { score: 5, feedback_th: 'สะกดถูกต้อง' },
  };

  const resultA1 = calibrateEvidenceScores(rawScores, [], 35, a1Task);
  assert.equal(resultA1.adjustments.length, 0);
  assert.equal(resultA1.totalScore, 91);
  assert.equal(resultA1.grade, 'A');

  const resultFree = calibrateEvidenceScores(rawScores, [], 20, freeTask);
  assert.equal(resultFree.adjustments.length, 0);
  assert.equal(resultFree.totalScore, 91);
});

test('validateAttachedImageInput accepts valid PNG/JPEG/WEBP payloads and rejects invalid or oversized inputs', () => {
  const sampleBase64 = Buffer.from('hello-image-bytes').toString('base64');
  const validPng = validateAttachedImageInput({
    name: 'essay.png',
    mimeType: 'image/png',
    data: `data:image/png;base64,${sampleBase64}`,
  });
  assert.equal(validPng.valid, true);
  assert.equal(validPng.image?.mimeType, 'image/png');
  assert.equal(validPng.image?.data, sampleBase64);

  const invalidType = validateAttachedImageInput({
    name: 'doc.pdf',
    mimeType: 'application/pdf',
    data: sampleBase64,
  });
  assert.equal(invalidType.valid, false);

  const tooBigBase64 = 'A'.repeat(Math.ceil((MAX_IMAGE_BYTES + 1024) * 4 / 3));
  const oversized = validateAttachedImageInput({
    name: 'huge.jpg',
    mimeType: 'image/jpeg',
    data: tooBigBase64,
  });
  assert.equal(oversized.valid, false);
});

test('stripUndefinedDeep omits undefined fields safely for Firestore', () => {
  const cleaned = stripUndefinedDeep({
    id: '123',
    custom_prompt: undefined,
    cefr_estimate: null,
    nested: { a: 1, b: undefined },
  });
  assert.equal('custom_prompt' in cleaned, false);
  assert.equal(cleaned.cefr_estimate, null);
  assert.deepEqual(cleaned.nested, { a: 1 });
});

test('getGoethePraedikat and buildGoetheExamVerdict evaluate pass/fail at 60/100 and map all 4 official criteria', () => {
  assert.equal(getGoethePraedikat(95).praedikat_de, 'sehr gut');
  assert.equal(getGoethePraedikat(82).praedikat_de, 'gut');
  assert.equal(getGoethePraedikat(74).praedikat_de, 'befriedigend');
  assert.equal(getGoethePraedikat(60).praedikat_de, 'ausreichend');
  assert.equal(getGoethePraedikat(60).passed, true);
  assert.equal(getGoethePraedikat(59).praedikat_de, 'nicht bestanden');
  assert.equal(getGoethePraedikat(59).passed, false);

  const categories: CategoryScoreItem[] = [
    { category: 'task_fulfillment', label_de: 'Aufgabenbewältigung', label_en: 'Task', score: 15, max_score: 20, feedback_th: 'ครบประเด็น' },
    { category: 'content_development', label_de: 'Inhalt', label_en: 'Content', score: 10, max_score: 15, feedback_th: 'มีเหตุผล' },
    { category: 'vocabulary', label_de: 'Wortschatz', label_en: 'Vocabulary', score: 14, max_score: 20, feedback_th: 'คำศัพท์ตรงบริบท' },
    { category: 'grammar', label_de: 'Grammatik', label_en: 'Grammar', score: 12, max_score: 20, feedback_th: 'V2 ถูกต้อง' },
    { category: 'cohesion', label_de: 'Kohärenz', label_en: 'Cohesion', score: 10, max_score: 15, feedback_th: 'เชื่อมประโยคดี' },
    { category: 'register', label_de: 'Register', label_en: 'Register', score: 4, max_score: 5, feedback_th: 'สุภาพเหมาะสม' },
    { category: 'mechanics', label_de: 'Rechtschreibung', label_en: 'Mechanics', score: 4, max_score: 5, feedback_th: 'สะกดถูก' },
  ];

  const passVerdict = buildGoetheExamVerdict(69, categories, 'B1', 'exam');
  assert.equal(passVerdict.passed, true);
  assert.equal(passVerdict.pass_threshold, 60);
  assert.equal(passVerdict.points_margin, 9);
  assert.equal(passVerdict.praedikat_de, 'ausreichend');
  assert.equal(passVerdict.official_criteria.length, 4);
  const criteriaSum = passVerdict.official_criteria.reduce((s, c) => s + c.score, 0);
  const criteriaMax = passVerdict.official_criteria.reduce((s, c) => s + c.max_score, 0);
  assert.equal(criteriaSum, 69);
  assert.equal(criteriaMax, 100);

  const failVerdict = buildGoetheExamVerdict(48, categories, 'B2', 'exam');
  assert.equal(failVerdict.passed, false);
  assert.equal(failVerdict.points_margin, -12);
  assert.equal(failVerdict.praedikat_de, 'nicht bestanden');
});




