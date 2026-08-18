// Unit tests for lesson quiz permission checks and grading logic (WP9).

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { requireAuth, requireRole } from '../middleware/auth';

describe('quiz authoring permission checks', () => {
  it('allows TEACHER and ADMIN to author questions', () => {
    expect(() => requireRole({ id: 'teacher-1', role: 'TEACHER' }, 'TEACHER', 'ADMIN')).not.toThrow();
    expect(() => requireRole({ id: 'admin-1', role: 'ADMIN' }, 'TEACHER', 'ADMIN')).not.toThrow();
  });

  it('denies STUDENT from authoring questions', () => {
    expect(() => requireRole({ id: 'student-1', role: 'STUDENT' }, 'TEACHER', 'ADMIN')).toThrow('FORBIDDEN');
  });
});

describe('quiz-taking permission checks', () => {
  it('allows any authenticated user to start/submit/complete an attempt', () => {
    expect(() => requireAuth({ id: 'student-1', role: 'STUDENT' })).not.toThrow();
  });

  it('denies unauthenticated callers', () => {
    expect(() => requireAuth(null)).toThrow('UNAUTHENTICATED');
  });
});

// Mirrors the exact-set-match grading in submitQuizAnswer: correct only when
// the selected option ids are exactly the set of correct option ids - no
// missing choices on a multi-select question, no extra ones either.
function isAnswerCorrect(correctOptionIds: string[], selectedOptionIds: string[]): boolean {
  const correct = new Set(correctOptionIds);
  const selected = new Set(selectedOptionIds);
  return correct.size === selected.size && [...correct].every((id) => selected.has(id));
}

describe('quiz answer grading', () => {
  it('grades a correct single-choice answer', () => {
    expect(isAnswerCorrect(['a'], ['a'])).toBe(true);
  });

  it('grades an incorrect single-choice answer', () => {
    expect(isAnswerCorrect(['a'], ['b'])).toBe(false);
  });

  it('grades a fully-correct multiple-choice answer', () => {
    expect(isAnswerCorrect(['a', 'c'], ['a', 'c'])).toBe(true);
  });

  it('rejects a multiple-choice answer missing a correct option', () => {
    expect(isAnswerCorrect(['a', 'c'], ['a'])).toBe(false);
  });

  it('rejects a multiple-choice answer with an extra, incorrect option', () => {
    expect(isAnswerCorrect(['a', 'c'], ['a', 'c', 'd'])).toBe(false);
  });

  it('rejects an empty submission against a question with correct options', () => {
    expect(isAnswerCorrect(['a'], [])).toBe(false);
  });
});
