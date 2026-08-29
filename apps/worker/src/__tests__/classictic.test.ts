import { ClassicticAdapter, normalizeEvent, isSafeClassicticUrl } from '../discovery/classictic.js';

// Sanitized fixture matching the real shape returned by Classictic's
// official affiliate "event list widget" (?format=json) - recorded during
// integration testing against the documented endpoint, with image URLs and
// identifying details replaced. CI never calls the live endpoint.
const SAMPLE_EVENT = {
  event_id: '2054636',
  event: 'Medieval Dinner New Year’s Eve',
  start_stamp: '1798742700',
  start_time: '2026-12-31T19:45:00+01:00',
  sale_end_stamp: '1798569900',
  sale_end_time: '2026-12-29T19:45:00+01:00',
  description: 'A fantastic New Year’s Eve dinner and show.',
  venue_id: '3324',
  venue: 'Restaurant Krcma U Pavouka',
  city_id: '6',
  city: 'Prague',
  pictures: {
    desktop: [{ url: 'https://example.invalid/desktop.jpg' }],
    mobile: [{ url: 'https://example.invalid/mobile.jpg' }],
  },
  link: 'https://www.classictic.com/en/event/2054636/?r=999999',
};

const API_EVENT = {
  event_date_id: '192955',
  title: 'Strauss & Mozart Concerts',
  start_stamp: '1798742700',
  sale_end_stamp: '1798569900',
  event_url: 'https://www.classictic.com/en/strauss___mozart_concerts/10006/192955/',
  venue: { id: 300, name: 'Mozarthaus Vienna' },
  city: { id: 1, name: 'Vienna' },
  country: { id: 1, name: 'Austria' },
  min_price: '35.00',
  max_price: '90.00',
  currency: 'EUR',
  genre: [{ name: 'Classical Concert' }],
};

describe('normalizeEvent', () => {
  const fetchedAt = new Date('2026-08-18T00:00:00Z');

  it('maps a Classictic event to the normalized shape', () => {
    const result = normalizeEvent(SAMPLE_EVENT, fetchedAt);
    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      provider: 'CLASSICTIC',
      providerId: '2054636',
      title: 'Medieval Dinner New Year’s Eve',
      url: 'https://www.classictic.com/en/event/2054636/?r=999999',
      imageUrl: 'https://example.invalid/desktop.jpg',
      venueName: 'Restaurant Krcma U Pavouka',
      city: 'Prague',
      country: null,
      minPrice: null,
      maxPrice: null,
      currency: null,
      classifications: [],
    });
    expect(result!.startsAt.toISOString()).toBe('2026-12-31T18:45:00.000Z');
    // sale_end_time becomes expiresAt - the withdrawal signal the existing
    // "is this external event still visible" rule already uses.
    expect(result!.expiresAt?.toISOString()).toBe('2026-12-29T18:45:00.000Z');
  });

  it('falls back to the mobile picture when no desktop picture is present', () => {
    const result = normalizeEvent({ ...SAMPLE_EVENT, pictures: { mobile: [{ url: 'https://example.invalid/mobile-only.jpg' }] } }, fetchedAt);
    expect(result?.imageUrl).toBe('https://example.invalid/mobile-only.jpg');
  });

  it('handles a missing sale_end_time (no expiry known)', () => {
    const { sale_end_time, sale_end_stamp, ...rest } = SAMPLE_EVENT;
    const result = normalizeEvent(rest, fetchedAt);
    expect(result?.expiresAt).toBeNull();
  });

  it.each([
    ['missing event_id', { ...SAMPLE_EVENT, event_id: undefined }],
    ['missing title', { ...SAMPLE_EVENT, event: undefined }],
    ['missing/invalid start_time', { ...SAMPLE_EVENT, start_time: 'not-a-date', start_stamp: 'not-a-date' }],
  ])('rejects malformed data: %s', (_label, malformed) => {
    expect(normalizeEvent(malformed, fetchedAt)).toBeNull();
  });

  it('normalizes the official API field names, prices, and nested locations', () => {
    const result = normalizeEvent(API_EVENT, fetchedAt);
    expect(result).toMatchObject({
      provider: 'CLASSICTIC',
      providerId: '192955',
      title: 'Strauss & Mozart Concerts',
      url: 'https://www.classictic.com/en/strauss___mozart_concerts/10006/192955/',
      venueName: 'Mozarthaus Vienna',
      city: 'Vienna',
      country: 'Austria',
      minPrice: 35,
      maxPrice: 90,
      currency: 'EUR',
      classifications: ['Classical Concert'],
    });
    expect(result?.startsAt.toISOString()).toBe('2026-12-31T18:45:00.000Z');
  });

  it('sanitizes an unsafe outbound link by using a token-free Classictic event URL', () => {
    const result = normalizeEvent({ ...SAMPLE_EVENT, link: 'https://evil.example/redirect?r=999999' }, fetchedAt);
    expect(result?.url).toBe('https://www.classictic.com/en/event/2054636/');
  });
});

describe('isSafeClassicticUrl', () => {
  it('accepts an https classictic.com URL', () => {
    expect(isSafeClassicticUrl('https://www.classictic.com/en/event/123/?r=999999')).toBe(true);
  });
  it('accepts a classictic.com subdomain', () => {
    expect(isSafeClassicticUrl('https://account.classictic.com/en/event/123/')).toBe(true);
  });
  it('rejects a different domain entirely', () => {
    expect(isSafeClassicticUrl('https://not-classictic.com/en/event/123/')).toBe(false);
  });
  it('rejects a lookalike domain (classictic.com.evil.example)', () => {
    expect(isSafeClassicticUrl('https://classictic.com.evil.example/x')).toBe(false);
  });
  it('rejects API URLs that could expose the private token', () => {
    expect(isSafeClassicticUrl('https://www.classictic.com/en/api/search/json/private-token/')).toBe(false);
  });
  it('rejects non-string input', () => {
    expect(isSafeClassicticUrl(null)).toBe(false);
    expect(isSafeClassicticUrl(undefined)).toBe(false);
    expect(isSafeClassicticUrl(42)).toBe(false);
  });
});

describe('ClassicticAdapter', () => {
  const originalToken = process.env.CLASSICTIC_API_TOKEN;
  const originalId = process.env.CLASSICTIC_AFFILIATE_ID;
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    if (originalToken === undefined) delete process.env.CLASSICTIC_API_TOKEN;
    else process.env.CLASSICTIC_API_TOKEN = originalToken;
    if (originalId === undefined) delete process.env.CLASSICTIC_AFFILIATE_ID;
    else process.env.CLASSICTIC_AFFILIATE_ID = originalId;
  });

  it('is not configured when Classictic credentials are unset', () => {
    delete process.env.CLASSICTIC_API_TOKEN;
    delete process.env.CLASSICTIC_AFFILIATE_ID;
    expect(new ClassicticAdapter().isConfigured()).toBe(false);
  });

  it('is configured when CLASSICTIC_API_TOKEN is set', () => {
    process.env.CLASSICTIC_API_TOKEN = 'test-token';
    delete process.env.CLASSICTIC_AFFILIATE_ID;
    expect(new ClassicticAdapter().isConfigured()).toBe(true);
  });

  it('still supports the legacy CLASSICTIC_AFFILIATE_ID fallback', () => {
    delete process.env.CLASSICTIC_API_TOKEN;
    process.env.CLASSICTIC_AFFILIATE_ID = 'test-affiliate-id';
    expect(new ClassicticAdapter().isConfigured()).toBe(true);
  });

  it('search() returns [] without making a request when unconfigured', async () => {
    delete process.env.CLASSICTIC_API_TOKEN;
    delete process.env.CLASSICTIC_AFFILIATE_ID;
    const results = await new ClassicticAdapter().search({ countryCode: '', startDateTime: new Date(), endDateTime: new Date() });
    expect(results).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('searches the official paginated API when CLASSICTIC_API_TOKEN is set', async () => {
    process.env.CLASSICTIC_API_TOKEN = 'test-token';
    delete process.env.CLASSICTIC_AFFILIATE_ID;
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ events: [API_EVENT] }),
    } as Response);

    const results = await new ClassicticAdapter().search({
      countryCode: '',
      startDateTime: new Date('2026-08-29T00:00:00Z'),
      endDateTime: new Date('2027-02-25T00:00:00Z'),
      size: 50,
    });

    expect(results).toHaveLength(1);
    const requestUrl = String(fetchSpy.mock.calls[0][0]);
    expect(requestUrl).toContain('https://www.classictic.com/en/api/search/json/test-token/');
    expect(requestUrl).toContain('from_timestamp=');
    expect(requestUrl).toContain('until_timestamp=');
    expect(requestUrl).toContain('page=1');
    expect(requestUrl).toContain('range=50');
  });
});
