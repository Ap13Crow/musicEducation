// Unit tests for the event-classification job's response validation (WP13).
// The job itself (batching, DB updates, cron schedule) needs a live AI
// provider and DB to exercise meaningfully - what's tested here is the
// guard that decides whether a model's JSON reply is trustworthy enough to
// write, which is exactly the boundary where a misbehaving/hallucinating
// model could otherwise corrupt ExternalEventProjection rows with tags
// outside the platform's controlled vocabulary.

import { isValidResult } from '../jobs/event-classification';

describe('isValidResult', () => {
  it('accepts a well-formed result with all fields populated', () => {
    expect(isValidResult({ instruments: ['Violin', 'Piano'], musicStyles: ['Classical'], skillLevel: 'INTERMEDIATE' })).toBe(true);
  });

  it('accepts empty arrays and a null skill level', () => {
    expect(isValidResult({ instruments: [], musicStyles: [], skillLevel: null })).toBe(true);
  });

  it('accepts a missing skillLevel key', () => {
    expect(isValidResult({ instruments: [], musicStyles: [] })).toBe(true);
  });

  it('rejects an instrument outside the controlled vocabulary', () => {
    expect(isValidResult({ instruments: ['Kazoo'], musicStyles: [], skillLevel: null })).toBe(false);
  });

  it('rejects a music style outside the controlled vocabulary', () => {
    expect(isValidResult({ instruments: [], musicStyles: ['Dubstep'], skillLevel: null })).toBe(false);
  });

  it('rejects a skill level outside the controlled vocabulary', () => {
    expect(isValidResult({ instruments: [], musicStyles: [], skillLevel: 'EXPERT' })).toBe(false);
  });

  it('rejects a non-array instruments field', () => {
    expect(isValidResult({ instruments: 'Violin', musicStyles: [], skillLevel: null })).toBe(false);
  });

  it('rejects null and non-object input', () => {
    expect(isValidResult(null)).toBe(false);
    expect(isValidResult('not an object')).toBe(false);
    expect(isValidResult(42)).toBe(false);
  });
});
