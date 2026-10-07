// Gallica rate-limits aggressively - confirmed live: a second image request
// 429'd seconds after the first, and the SRU search endpoint 429s under
// back-to-back load too. Every network call in this package goes through
// this wrapper so the library-ingest job, the admin on-demand pull, and the
// teacher-facing manifest/import preview all get the same protection
// regardless of which process makes the call.
export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  /** Injectable for tests - real callers never need to pass this. */
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function fetchWithRetry(url: string | URL, init: RequestInit, opts: RetryOptions = {}): Promise<Response> {
  const retries = opts.retries ?? 3;
  const baseDelayMs = opts.baseDelayMs ?? 2000;
  const sleep = opts.sleep ?? defaultSleep;

  let response: Response;
  for (let attempt = 0; ; attempt += 1) {
    response = await fetch(url, init);
    if (response.status !== 429 || attempt >= retries) return response;
    await sleep(baseDelayMs * 2 ** attempt);
  }
}
