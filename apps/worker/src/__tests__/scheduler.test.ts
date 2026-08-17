import pino from 'pino';
import { JobRegistry } from '../scheduler.js';
import type { Job } from '../jobs/types.js';

const silentLogger = pino({ level: 'silent' });
const fakePrisma = {} as any;

function flushAsync() {
  return new Promise((resolve) => setImmediate(resolve));
}

describe('JobRegistry', () => {
  it('rejects duplicate job keys', () => {
    const registry = new JobRegistry(fakePrisma, silentLogger);
    const job: Job = { key: 'dup', schedule: '* * * * *', run: async () => {} };
    registry.register(job);
    expect(() => registry.register(job)).toThrow(/already registered/);
  });

  it('rejects an invalid cron schedule', () => {
    const registry = new JobRegistry(fakePrisma, silentLogger);
    const job: Job = { key: 'bad-schedule', schedule: 'not-a-cron', run: async () => {} };
    expect(() => registry.register(job)).toThrow(/invalid cron schedule/);
  });

  it('runs a healthy job to completion via runNow', async () => {
    const registry = new JobRegistry(fakePrisma, silentLogger);
    const run = jest.fn().mockResolvedValue(undefined);
    registry.register({ key: 'ok', schedule: '* * * * *', run });
    await registry.runNow('ok');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('isolates a failing job: it retries with backoff and does not throw out of runNow', async () => {
    jest.useFakeTimers();
    try {
      const registry = new JobRegistry(fakePrisma, silentLogger);
      let calls = 0;
      const run = jest.fn().mockImplementation(async () => {
        calls += 1;
        if (calls < 3) throw new Error('transient failure');
      });
      registry.register({ key: 'flaky', schedule: '* * * * *', run });

      const runNowPromise = registry.runNow('flaky');
      // First attempt fails synchronously inside runNow's try/catch, so
      // runNow itself resolves once the first attempt is isolated.
      await runNowPromise;
      expect(calls).toBe(1);

      // Advance past the first backoff window to trigger the retry.
      await jest.advanceTimersByTimeAsync(1_000);
      expect(calls).toBe(2);

      await jest.advanceTimersByTimeAsync(2_000);
      expect(calls).toBe(3);

      registry.stop();
    } finally {
      jest.useRealTimers();
    }
  });

  it('does not let one job\'s permanent failure affect another job', async () => {
    const registry = new JobRegistry(fakePrisma, silentLogger);
    const failing = jest.fn().mockRejectedValue(new Error('always fails'));
    const healthy = jest.fn().mockResolvedValue(undefined);
    registry.register({ key: 'failing', schedule: '* * * * *', run: failing });
    registry.register({ key: 'healthy', schedule: '* * * * *', run: healthy });

    await Promise.all([registry.runNow('failing'), registry.runNow('healthy')]);
    await flushAsync();

    expect(failing).toHaveBeenCalledTimes(1);
    expect(healthy).toHaveBeenCalledTimes(1);
  });

  it('exposes registered job keys', () => {
    const registry = new JobRegistry(fakePrisma, silentLogger);
    registry.register({ key: 'a', schedule: '* * * * *', run: async () => {} });
    registry.register({ key: 'b', schedule: '* * * * *', run: async () => {} });
    expect(registry.registeredJobKeys.sort()).toEqual(['a', 'b']);
  });
});
