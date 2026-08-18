// Unit tests for the onboarding assessment (WP12): permission checks and the
// AssessmentQuestion.question field resolver. The real fixes this work
// package made - submitAssessmentAnswer actually persisting answers (it was
// a silent no-op before, so every assessment scored 0/0 and always came out
// BEGINNER/0 XP), the upsert preventing double-counting on re-answer, and
// the DeepSeek-backed report with a deterministic fallback - were verified
// end-to-end against a real local Postgres during development, the same
// ritual used for the deploy/database/identity bootstrap files.

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { requireAuth } from '../middleware/auth';
import { assessmentResolvers } from '../resolvers/assessments';

describe('assessment permission checks', () => {
  it('allows any authenticated user to start/submit/complete an assessment', () => {
    expect(() => requireAuth({ id: 'student-1', role: 'STUDENT' })).not.toThrow();
  });

  it('denies unauthenticated callers', () => {
    expect(() => requireAuth(null)).toThrow('UNAUTHENTICATED');
  });
});

describe('AssessmentQuestion.question field resolver', () => {
  it('maps the prompt column to the public question field', () => {
    const row = { id: 'q1', prompt: 'How many strings does a violin have?' };
    expect(assessmentResolvers.AssessmentQuestion.question(row)).toBe('How many strings does a violin have?');
  });
});
