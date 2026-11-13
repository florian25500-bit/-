import test from 'node:test';
import assert from 'node:assert/strict';
import { EXAM_PROMPTS_POOL } from '../data/examPromptsPool';
import { GRAMMAR_LESSONS } from '../data/grammarLessons';
import { INITIAL_VOCABULARY } from '../data/sampleVocabulary';
import { CEFRLevel } from '../types';

test('EXAM_PROMPTS_POOL has 840 standardized tasks evenly split (168 per CEFR level A1–C1)', () => {
  assert.equal(EXAM_PROMPTS_POOL.length, 840);

  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const idSet = new Set<string>();
  const taskIdSet = new Set<string>();

  for (const level of levels) {
    const levelTasks = EXAM_PROMPTS_POOL.filter((t) => t.cefr_level === level);
    assert.equal(levelTasks.length, 168, `Expected 168 tasks for ${level}, got ${levelTasks.length}`);
  }

  for (const task of EXAM_PROMPTS_POOL) {
    assert.ok(!idSet.has(task.id), `Duplicate id: ${task.id}`);
    assert.ok(!taskIdSet.has(task.task_id), `Duplicate task_id: ${task.task_id}`);
    idSet.add(task.id);
    taskIdSet.add(task.task_id);
  }
});

test('EXAM_PROMPTS_POOL difficulty, word counts, time limits, and Leitpunkte scale progressively A1 -> C1', () => {
  const byLevel = (lvl: CEFRLevel) => EXAM_PROMPTS_POOL.filter((t) => t.cefr_level === lvl);

  const a1 = byLevel('A1');
  const a2 = byLevel('A2');
  const b1 = byLevel('B1');
  const b2 = byLevel('B2');
  const c1 = byLevel('C1');

  assert.ok(a1.every((t) => t.min_words >= 30 && t.max_words <= 55 && t.time_limit_minutes === 15 && t.requirements.length === 3));
  assert.ok(a2.every((t) => t.min_words >= 50 && t.max_words <= 85 && t.time_limit_minutes === 20 && t.requirements.length === 4));
  assert.ok(b1.every((t) => t.min_words >= 80 && t.max_words <= 120 && t.time_limit_minutes >= 20 && t.time_limit_minutes <= 25 && t.requirements.length === 4));
  assert.ok(b2.every((t) => t.min_words >= 160 && t.max_words <= 220 && t.time_limit_minutes >= 30 && t.requirements.length === 4));
  assert.ok(c1.every((t) => t.min_words >= 240 && t.max_words <= 330 && t.time_limit_minutes >= 40 && t.requirements.length === 4));

  // Verify A1 uses simple concrete categories (E-Mail / Brief), not Erörterung
  assert.ok(a1.every((t) => t.category === 'E-Mail' || t.category === 'Brief'));
  assert.ok(a2.every((t) => t.category === 'E-Mail' || t.category === 'Brief'));
  // Verify B1 avoids C1-style Abhandlung/Erörterung
  assert.ok(b1.every((t) => t.category !== 'Erörterung' && t.category !== 'Bericht'));
});

test('GRAMMAR_LESSONS and INITIAL_VOCABULARY include A1 and A2 foundational content', () => {
  const lessonLevels = new Set(GRAMMAR_LESSONS.map((l) => l.cefr_level));
  assert.ok(lessonLevels.has('A1'));
  assert.ok(lessonLevels.has('A2'));
  assert.ok(GRAMMAR_LESSONS.some((l) => l.id === 'lesson-praesens-satzbau' && l.cefr_level === 'A1'));
  assert.ok(GRAMMAR_LESSONS.some((l) => l.id === 'lesson-perfekt-modalverben' && l.cefr_level === 'A2'));

  const vocabLevels = new Set(INITIAL_VOCABULARY.map((v) => v.cefr_level));
  assert.ok(vocabLevels.has('A1'));
  assert.ok(vocabLevels.has('A2'));
});
