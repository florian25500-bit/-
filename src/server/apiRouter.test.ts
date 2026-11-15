import test from 'node:test';
import assert from 'node:assert/strict';
import { handleApiRequest, type EdgeKVNamespace } from './apiRouter';
import workerEntry from '../../worker/index';

function createMemoryKv(): EdgeKVNamespace {
  const store = new Map<string, string>();
  return {
    async get(key: string, type?: 'text' | 'json') {
      const val = store.get(key);
      if (val === undefined) return null;
      return type === 'json' ? JSON.parse(val) : val;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
    async delete(key: string) {
      store.delete(key);
    },
  };
}

function buildMockAssessmentJson(isA1 = false) {
  const max = isA1
    ? { task_fulfillment: 5, content_development: 3, vocabulary: 4, grammar: 4, cohesion: 2, register: 1, mechanics: 2 }
    : { task_fulfillment: 16, content_development: 12, vocabulary: 15, grammar: 16, cohesion: 12, register: 4, mechanics: 4 };

  return JSON.stringify({
    category_scores: {
      task_fulfillment: { score: max.task_fulfillment, feedback_th: 'ตอบครบทุกประเด็นที่กำหนดชัดเจน' },
      content_development: { score: max.content_development, feedback_th: 'ลำดับเนื้อหาและรายละเอียดครบถ้วน' },
      vocabulary: { score: max.vocabulary, feedback_th: 'ใช้คำศัพท์ได้เหมาะสมกับระดับ' },
      grammar: { score: max.grammar, feedback_th: 'โครงสร้างประโยคและคำกริยาถูกต้องดี' },
      cohesion: { score: max.cohesion, feedback_th: 'การเชื่อมโยงประโยคลื่นไหล' },
      register: { score: max.register, feedback_th: 'ระดับภาษาถูกต้องเหมาะสม' },
      mechanics: { score: max.mechanics, feedback_th: 'สะกดคำและตัวพิมพ์ใหญ่คำนามถูกต้อง' },
    },
    cefr_profile: {
      task_fulfillment: isA1 ? 'A1' : 'B2',
      content_development: isA1 ? 'A1' : 'B2',
      vocabulary: isA1 ? 'A1' : 'B2',
      grammar: isA1 ? 'A1' : 'B2',
      cohesion: isA1 ? 'A1' : 'B2',
      register: isA1 ? 'A1' : 'B2',
      mechanics: isA1 ? 'A1' : 'B2',
    },
    requirement_evaluations: [
      {
        requirement: 'ประเด็นหลักข้อที่ 1',
        status: 'fulfilled',
        evidence_quote: 'am Samstag',
        comment_th: 'ระบุวันเวลาได้ชัดเจน',
      },
    ],
    errors: [],
    strengths: ['สื่อสารชัดเจนตรงประเด็น'],
    weaknesses: ['สามารถเพิ่มคำเชื่อมให้หลากหลายขึ้น'],
    cefr_estimate: isA1 ? 'A1' : 'B2',
    cefr_confidence: 'high',
    transcribed_text: '',
    cefr_summary_th: isA1 ? 'ระดับ A1 ตามเกณฑ์มาตรฐาน' : 'ระดับ B2 ตามเกณฑ์มาตรฐาน',
    main_weakness_th: 'ควรเพิ่มความหลากหลายของคำเชื่อม',
    main_strength_th: 'โครงสร้างประโยคหลักถูกต้องและชัดเจน',
    individual_coaching_note_th: 'งานเขียนนี้สื่อสารได้ตรงตามเป้าหมายและชัดเจนมาก',
    writing_versions: {
      corrected: 'Liebe Anna, am Samstag mache ich eine Geburtstagsparty.',
      b2_improved: 'Liebe Anna, am kommenden Samstag veranstalte ich eine Geburtstagsfeier.',
      c1_model: 'Liebe Anna, anlässlich meines Geburtstages lade ich dich herzlich ein.',
    },
    learning_recommendations: [
      {
        topic: 'Konnektoren & Satzbau',
        priority: 'medium',
        lesson_id: 'lesson-konnektoren-satzbau-praxis',
        reason_th: 'ช่วยเชื่อมประโยคให้ลื่นไหลขึ้น',
        action_th: 'ฝึกใช้ denn, aber และ weil ในประโยคสั้นๆ',
      },
    ],
  });
}

test('Cloudflare API router handles health, CORS preflight, tasks, and lessons cleanly', async () => {
  const kv = createMemoryKv();

  const corsRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/assess', { method: 'OPTIONS' })
  );
  assert.equal(corsRes.status, 204);
  assert.equal(corsRes.headers.get('Access-Control-Allow-Origin'), '*');

  const healthRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/health'),
    { RUNTIME: 'cloudflare-worker', GEMINI_API_KEY: 'test-gemini-key-1234567890', DEUTSCHSCHREIBEN_KV: kv }
  );
  assert.equal(healthRes.status, 200);
  const health = (await healthRes.json()) as any;
  assert.equal(health.runtime, 'cloudflare-worker');
  assert.equal(health.geminiConfigured, true);
  assert.equal(health.kvConfigured, true);

  const tasksRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/tasks?level=A1')
  );
  const tasksJson = (await tasksRes.json()) as any;
  assert.equal(tasksRes.status, 200);
  assert.equal(tasksJson.tasks.length, 168);

  const lessonsRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/lessons/lesson-tekamolo-satzbau')
  );
  assert.equal(lessonsRes.status, 200);
  const lessonJson = (await lessonsRes.json()) as any;
  assert.equal(lessonJson.lesson.id, 'lesson-tekamolo-satzbau');
});

test('Cloudflare API router persists custom vocabulary in Cloudflare KV across requests', async () => {
  const kv = createMemoryKv();

  const postRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/vocabulary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: 'nichtsdestotrotz',
        part_of_speech: 'Connector',
        meaning_th: 'อย่างไรก็ตาม (ทางการ)',
        example_sentence: 'Es regnet; nichtsdestotrotz gehen wir spazieren.',
        cefr_level: 'C1',
      }),
    }),
    { DEUTSCHSCHREIBEN_KV: kv }
  );
  assert.equal(postRes.status, 200);
  const created = (await postRes.json()) as any;
  assert.equal(created.item.word, 'nichtsdestotrotz');

  const listRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/vocabulary'),
    { DEUTSCHSCHREIBEN_KV: kv }
  );
  const listJson = (await listRes.json()) as any;
  assert.ok(listJson.vocabulary.some((v: any) => v.id === created.item.id));

  const delRes = await handleApiRequest(
    new Request(`https://example.workers.dev/api/vocabulary/${created.item.id}`, {
      method: 'DELETE',
    }),
    { DEUTSCHSCHREIBEN_KV: kv }
  );
  const delJson = (await delRes.json()) as any;
  assert.equal(delJson.success, true);

  const afterDelRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/vocabulary'),
    { DEUTSCHSCHREIBEN_KV: kv }
  );
  const afterDelJson = (await afterDelRes.json()) as any;
  assert.ok(!afterDelJson.vocabulary.some((v: any) => v.id === created.item.id));
});

test('Cloudflare API router validates /api/assess and runs full A1 (25-pt) & B2 (100-pt) AI grading flow', async () => {
  // Missing body -> 400
  const emptyRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'free', original_text: '   ' }),
    })
  );
  assert.equal(emptyRes.status, 400);

  // Missing API key -> 503
  const noKeyRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'free',
        original_text:
          'Liebe Anna, am Samstag mache ich eine Geburtstagsparty zu Hause. Die Party beginnt um 18 Uhr. Kannst du bitte einen Kuchen mitbringen?',
      }),
    })
  );
  assert.equal(noKeyRes.status, 503);

  // A1 task with mock Gemini client -> 25-point scale & Goethe pass
  const tasksRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/tasks?level=A1')
  );
  const a1Task = ((await tasksRes.json()) as any).tasks[0];

  const a1AssessRes = await handleApiRequest(
    new Request('https://example.workers.dev/api/assess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'exam',
        task_id: a1Task.id,
        original_text:
          'Liebe Anna, am Samstag mache ich eine Geburtstagsparty zu Hause. Die Party beginnt um 18 Uhr. Kannst du bitte einen Kuchen mitbringen? Ich freue mich sehr auf dich! Viele Grüße, Tim',
      }),
    }),
    {
      RUNTIME: 'cloudflare-worker',
      GEMINI_API_KEY: 'valid-mock-key-1234567890',
      createGeminiClient: () => ({
        models: {
          generateContent: async () => ({ text: buildMockAssessmentJson(true) }),
        },
      }),
    }
  );
  assert.equal(a1AssessRes.status, 200);
  const a1Data = (await a1AssessRes.json()) as any;
  assert.equal(a1Data.assessment.max_total_score, 25);
  assert.equal(a1Data.assessment.total_score, 21);
  assert.equal(a1Data.assessment.goethe_verdict.passed, true);
  assert.equal(a1Data.assessment.goethe_verdict.pass_threshold, 15);
});

test('Cloudflare Worker entrypoint routes /api/* to Edge API and static paths to ASSETS with security headers', async () => {
  let assetsFetchCalled = false;
  const mockAssets = {
    async fetch(req: Request | string) {
      assetsFetchCalled = true;
      const url = typeof req === 'string' ? req : req.url;
      return new Response(`<html>SPA:${url}</html>`, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    },
  };

  const apiResp = await workerEntry.fetch(
    new Request('https://example.workers.dev/api/health'),
    { ASSETS: mockAssets }
  );
  assert.equal(apiResp.status, 200);
  assert.equal(assetsFetchCalled, false);
  const health = (await apiResp.json()) as any;
  assert.equal(health.runtime, 'cloudflare-worker');

  const spaResp = await workerEntry.fetch(
    new Request('https://example.workers.dev/editor'),
    { ASSETS: mockAssets }
  );
  assert.equal(assetsFetchCalled, true);
  assert.equal(spaResp.status, 200);
  assert.equal(spaResp.headers.get('Cross-Origin-Opener-Policy'), 'same-origin-allow-popups');
  assert.equal(spaResp.headers.get('X-Content-Type-Options'), 'nosniff');
});
