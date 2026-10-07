import { fetchWithRetry } from '../retry.js';

function mockFetchSequence(statuses: number[]) {
  let call = 0;
  (global as any).fetch = jest.fn(async () => {
    const status = statuses[Math.min(call, statuses.length - 1)];
    call += 1;
    return { status, ok: status >= 200 && status < 300 };
  });
  return () => call;
}

describe('fetchWithRetry', () => {
  afterEach(() => jest.resetAllMocks());

  it('returns immediately on a non-429 response, without sleeping', async () => {
    mockFetchSequence([200]);
    const sleep = jest.fn().mockResolvedValue(undefined);
    const response = await fetchWithRetry('https://example.invalid', {}, { sleep });
    expect(response.status).toBe(200);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('retries on 429 with exponential backoff until a non-429 response arrives', async () => {
    const callCount = mockFetchSequence([429, 429, 200]);
    const delays: number[] = [];
    const sleep = jest.fn(async (ms: number) => {
      delays.push(ms);
    });
    const response = await fetchWithRetry('https://example.invalid', {}, { baseDelayMs: 1000, sleep });
    expect(response.status).toBe(200);
    expect(callCount()).toBe(3);
    expect(delays).toEqual([1000, 2000]);
  });

  it('gives up and returns the last 429 response once retries are exhausted', async () => {
    mockFetchSequence([429, 429, 429, 429]);
    const sleep = jest.fn().mockResolvedValue(undefined);
    const response = await fetchWithRetry('https://example.invalid', {}, { retries: 2, baseDelayMs: 1000, sleep });
    expect(response.status).toBe(429);
    expect(sleep).toHaveBeenCalledTimes(2);
  });
});
