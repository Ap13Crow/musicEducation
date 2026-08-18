import { TicketmasterAdapter, normalizeEvent } from '../discovery/ticketmaster.js';

const SAMPLE_EVENT = {
  id: 'vvG1zZbrb8sfaG',
  name: 'An Evening of Chopin',
  url: 'https://www.ticketmaster.com/event/vvG1zZbrb8sfaG',
  images: [
    { url: 'https://example.invalid/small.jpg', width: 300, height: 168 },
    { url: 'https://example.invalid/large.jpg', width: 1024, height: 576 },
    { url: 'https://example.invalid/square.jpg', width: 500, height: 500 },
  ],
  dates: {
    start: { dateTime: '2026-09-12T19:00:00Z' },
    end: { dateTime: '2026-09-12T21:00:00Z' },
    timezone: 'Europe/Zurich',
  },
  priceRanges: [{ min: 25, max: 120, currency: 'CHF' }],
  classifications: [
    { segment: { name: 'Music' }, genre: { name: 'Classical' } },
    { segment: { name: 'Undefined' }, genre: { name: 'Undefined' } },
  ],
  _embedded: {
    venues: [
      {
        name: 'Tonhalle Zürich',
        city: { name: 'Zurich' },
        country: { countryCode: 'CH' },
        location: { latitude: '47.3653', longitude: '8.5449' },
      },
    ],
  },
};

describe('normalizeEvent', () => {
  const fetchedAt = new Date('2026-08-18T00:00:00Z');

  it('maps a Ticketmaster event to the normalized shape', () => {
    const result = normalizeEvent(SAMPLE_EVENT, fetchedAt);
    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      provider: 'TICKETMASTER',
      providerId: 'vvG1zZbrb8sfaG',
      title: 'An Evening of Chopin',
      url: 'https://www.ticketmaster.com/event/vvG1zZbrb8sfaG',
      venueName: 'Tonhalle Zürich',
      city: 'Zurich',
      country: 'CH',
      minPrice: 25,
      maxPrice: 120,
      currency: 'CHF',
    });
    expect(result!.startsAt.toISOString()).toBe('2026-09-12T19:00:00.000Z');
    expect(result!.fetchedAt).toBe(fetchedAt);
    expect(result!.expiresAt!.getTime()).toBeGreaterThan(fetchedAt.getTime());
  });

  it('picks the widescreen (16:9) image over other aspect ratios', () => {
    const result = normalizeEvent(SAMPLE_EVENT, fetchedAt);
    expect(result!.imageUrl).toBe('https://example.invalid/large.jpg');
  });

  it('drops "Undefined" placeholder classifications and de-duplicates', () => {
    const result = normalizeEvent(SAMPLE_EVENT, fetchedAt);
    expect(result!.classifications).toEqual(['Music', 'Classical']);
  });

  it('always sets the required attribution string', () => {
    const result = normalizeEvent(SAMPLE_EVENT, fetchedAt);
    expect(result!.attribution).toMatch(/Ticketmaster/);
  });

  it('returns null for a payload missing required fields', () => {
    expect(normalizeEvent({ id: 'x' }, fetchedAt)).toBeNull();
    expect(normalizeEvent({}, fetchedAt)).toBeNull();
  });
});

describe('TicketmasterAdapter', () => {
  const originalKey = process.env.TICKETMASTER_API_KEY;

  afterEach(() => {
    if (originalKey === undefined) delete process.env.TICKETMASTER_API_KEY;
    else process.env.TICKETMASTER_API_KEY = originalKey;
  });

  it('is not configured without an API key', () => {
    delete process.env.TICKETMASTER_API_KEY;
    expect(new TicketmasterAdapter().isConfigured()).toBe(false);
  });

  it('is configured once an API key is set', () => {
    process.env.TICKETMASTER_API_KEY = 'test-key';
    expect(new TicketmasterAdapter().isConfigured()).toBe(true);
  });

  it('search() returns no results and makes no request without a key', async () => {
    delete process.env.TICKETMASTER_API_KEY;
    const results = await new TicketmasterAdapter().search({
      countryCode: 'CH',
      startDateTime: new Date(),
      endDateTime: new Date(),
    });
    expect(results).toEqual([]);
  });
});
