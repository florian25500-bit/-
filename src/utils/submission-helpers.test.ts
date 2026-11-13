import test from 'node:test';
import assert from 'node:assert/strict';
import { removeSubmissionFromState } from './submission-helpers';
import { AssessmentResult } from '../types';

function makeSubmission(id: string, title = `Task ${id}`): AssessmentResult {
  return {
    id,
    submission_id: id,
    task_id: `task-${id}`,
    task_title: title,
    task_level: 'B2',
    task_category: 'Stellungnahme',
    original_text: 'Beispieltext für den Test.',
    word_count: 185,
    total_score: 78,
    grade: 'C',
    cefr_estimate: 'B2',
    cefr_confidence: 'high',
    cefr_summary_th: 'สรุปผล',
    main_weakness_th: 'ไวยากรณ์',
    main_strength_th: 'การลำดับความคิด',
    cefr_profile: {
      task_fulfillment: 'B2',
      content_development: 'B2',
      vocabulary: 'B2',
      grammar: 'B1+',
      cohesion: 'B2',
      register: 'B2',
      mechanics: 'B2',
    },
    category_scores: [],
    strengths: ['ดี'],
    weaknesses: ['ควรพัฒนา'],
    errors: [],
    writing_versions: {
      corrected: 'Beispieltext für den Test.',
      b2_improved: 'Beispieltext für den Test.',
      c1_model: 'Beispieltext für den Test.',
    },
    learning_recommendations: [],
    rubric_version: '2.0',
    created_at: '2026-11-10T10:00:00.000Z',
  };
}

test('removeSubmissionFromState deletes the matching submission and selects the next one when active', () => {
  const s1 = makeSubmission('sub-1');
  const s2 = makeSubmission('sub-2');
  const s3 = makeSubmission('sub-3');

  const outcome = removeSubmissionFromState([s1, s2, s3], 'sub-1', 'sub-1');
  assert.equal(outcome.removed, true);
  assert.deepEqual(
    outcome.nextSubmissions.map((s) => s.id),
    ['sub-2', 'sub-3']
  );
  assert.equal(outcome.nextCurrentAssessment?.id, 'sub-2');
});

test('removeSubmissionFromState keeps currentAssessment unchanged when deleting a different item', () => {
  const s1 = makeSubmission('sub-1');
  const s2 = makeSubmission('sub-2');

  const outcome = removeSubmissionFromState([s1, s2], 'sub-1', 'sub-2');
  assert.equal(outcome.removed, true);
  assert.deepEqual(
    outcome.nextSubmissions.map((s) => s.id),
    ['sub-1']
  );
  assert.equal(outcome.nextCurrentAssessment?.id, 'sub-1');
});

test('removeSubmissionFromState handles deleting the last item and unknown IDs gracefully', () => {
  const s1 = makeSubmission('sub-1');

  const emptyOutcome = removeSubmissionFromState([s1], 'sub-1', 'sub-1');
  assert.equal(emptyOutcome.removed, true);
  assert.equal(emptyOutcome.nextSubmissions.length, 0);
  assert.equal(emptyOutcome.nextCurrentAssessment, null);

  const noopOutcome = removeSubmissionFromState([s1], null, 'non-existent');
  assert.equal(noopOutcome.removed, false);
  assert.equal(noopOutcome.nextSubmissions.length, 1);
  assert.equal(noopOutcome.nextCurrentAssessment, null);
});
