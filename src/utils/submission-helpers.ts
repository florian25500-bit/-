import { AssessmentResult } from '../types';

export interface RemoveSubmissionOutcome {
  nextSubmissions: AssessmentResult[];
  nextCurrentAssessment: AssessmentResult | null;
  removed: boolean;
}

/**
 * Pure helper to remove a submission by ID from list and update the active assessment pointer cleanly.
 */
export function removeSubmissionFromState(
  submissions: AssessmentResult[],
  currentAssessmentId: string | null,
  targetId: string
): RemoveSubmissionOutcome {
  const nextSubmissions = submissions.filter((sub) => sub.id !== targetId);
  const removed = nextSubmissions.length !== submissions.length;

  let nextCurrentAssessment: AssessmentResult | null = null;
  if (currentAssessmentId !== null) {
    if (currentAssessmentId === targetId) {
      nextCurrentAssessment = nextSubmissions[0] ?? null;
    } else {
      nextCurrentAssessment =
        nextSubmissions.find((sub) => sub.id === currentAssessmentId) ?? null;
    }
  }

  return {
    nextSubmissions,
    nextCurrentAssessment,
    removed,
  };
}
