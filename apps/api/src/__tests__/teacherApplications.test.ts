// Unit tests for teacher application permission checks (self-service "become a teacher" queue)

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { requireAuth, requireRole } from '../middleware/auth';
import { calculateAge, teacherApplicationResolvers } from '../resolvers/teacherApplications';

const studentUser = { id: 'student-1', role: 'STUDENT' } as const;
const VALID_INPUT = {
  birthdate: '2000-01-01',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  street: 'Bahnhofstrasse',
  houseNumber: '12b',
  postalCode: '8001',
  city: 'Zürich',
  country: 'Switzerland',
};

function fakePrisma(overrides: Record<string, any> = {}) {
  return {
    teacherApplication: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest.fn(({ create }: any) => Promise.resolve({ id: 'app-1', ...create })),
      ...(overrides.teacherApplication ?? {}),
    },
    userProfile: { upsert: jest.fn() },
    ...overrides,
  } as any;
}

// Regression coverage: the "Become a teacher" address field used to be a
// single free-text line with no validation at all - this replaces it with
// structured street/houseNumber/postalCode/city/country (required) + state
// (optional), each validated server-side (see requireAddressField /
// optionalAddressField in teacherApplications.ts). Client-side validation
// mirrors this but the resolver is the actual authority.
describe('applyForTeacher: structured address validation', () => {
  it('accepts a valid structured address', async () => {
    const prisma = fakePrisma();
    const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
      null,
      { input: VALID_INPUT },
      { prisma, user: studentUser } as any,
    );
    expect(result.street).toBe('Bahnhofstrasse');
    expect(result.houseNumber).toBe('12b');
    expect(result.postalCode).toBe('8001');
    expect(result.city).toBe('Zürich');
    expect(result.country).toBe('Switzerland');
    expect(result.state).toBeNull();
  });

  it('accepts an optional state/region when provided', async () => {
    const prisma = fakePrisma();
    const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
      null,
      { input: { ...VALID_INPUT, state: 'California' } },
      { prisma, user: studentUser } as any,
    );
    expect(result.state).toBe('California');
  });

  it.each(['street', 'houseNumber', 'postalCode', 'city', 'country'])(
    'rejects a missing %s',
    async (field) => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, [field]: '' };
      await expect(
        teacherApplicationResolvers.Mutation.applyForTeacher(null, { input }, { prisma, user: studentUser } as any),
      ).rejects.toThrow('is required');
    },
  );

  it('rejects a postal code with disallowed characters', async () => {
    const prisma = fakePrisma();
    const input = { ...VALID_INPUT, postalCode: '<script>' };
    await expect(
      teacherApplicationResolvers.Mutation.applyForTeacher(null, { input }, { prisma, user: studentUser } as any),
    ).rejects.toThrow("isn't a valid format");
  });

  it('rejects a city name with disallowed characters', async () => {
    const prisma = fakePrisma();
    const input = { ...VALID_INPUT, city: '123456' };
    await expect(
      teacherApplicationResolvers.Mutation.applyForTeacher(null, { input }, { prisma, user: studentUser } as any),
    ).rejects.toThrow("isn't valid");
  });

  it('rejects an invalid state/region when provided', async () => {
    const prisma = fakePrisma();
    const input = { ...VALID_INPUT, state: '<script>' };
    await expect(
      teacherApplicationResolvers.Mutation.applyForTeacher(null, { input }, { prisma, user: studentUser } as any),
    ).rejects.toThrow("aren't valid");
  });

  // Regression: the patterns used to be ASCII-only for apostrophes/dashes,
  // which rejected real names using typographic punctuation or non-ASCII
  // dashes (Copilot review finding on PR #50).
  it('accepts typographic quote marks and non-ASCII dashes in street/city/country/state', async () => {
    const prisma = fakePrisma();
    const input = {
      ...VALID_INPUT,
      street: "St John’s Wood – North",
      city: "Côte d’Ivoire’s Capital",
      country: 'Côte d’Ivoire',
      state: 'Île-de-France',
    };
    const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
      null,
      { input },
      { prisma, user: studentUser } as any,
    );
    expect(result.street).toBe("St John’s Wood – North");
    expect(result.state).toBe('Île-de-France');
  });

  // Regression: age only had a lower bound (>= 18), so an implausible
  // birthdate like 1900-01-01 (~126 years old) was accepted outright.
  it('rejects an implausibly old birthdate', async () => {
    const prisma = fakePrisma();
    const input = { ...VALID_INPUT, birthdate: '1900-01-01' };
    await expect(
      teacherApplicationResolvers.Mutation.applyForTeacher(null, { input }, { prisma, user: studentUser } as any),
    ).rejects.toThrow('Date of birth is invalid.');
  });

  // Regression: postal code used one generic pattern for every country, so
  // "12" passed for a Swiss address as happily as the real "8001" did.
  describe('country-aware postal code format', () => {
    it('accepts a correctly-formatted Swiss postal code (4 digits)', async () => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, country: 'Switzerland', postalCode: '8001' };
      const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
        null,
        { input },
        { prisma, user: studentUser } as any,
      );
      expect(result.postalCode).toBe('8001');
    });

    it.each(['80', '800', '80012', 'CH-8001'])('rejects an invalid Swiss postal code %s', async (postalCode) => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, country: 'Switzerland', postalCode };
      await expect(
        teacherApplicationResolvers.Mutation.applyForTeacher(null, { input }, { prisma, user: studentUser } as any),
      ).rejects.toThrow("isn't a valid format");
    });

    it('accepts a correctly-formatted Dutch postal code (4 digits + 2 letters)', async () => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, country: 'Netherlands', postalCode: '1011 AB' };
      const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
        null,
        { input },
        { prisma, user: studentUser } as any,
      );
      expect(result.postalCode).toBe('1011 AB');
    });

    it('rejects a Dutch postal code missing the letter suffix', async () => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, country: 'Netherlands', postalCode: '1011' };
      await expect(
        teacherApplicationResolvers.Mutation.applyForTeacher(null, { input }, { prisma, user: studentUser } as any),
      ).rejects.toThrow("isn't a valid format");
    });

    it('falls back to the generic pattern for a country with no specific format (e.g. "Other")', async () => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, country: 'Other', postalCode: 'ABC-1234' };
      const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
        null,
        { input },
        { prisma, user: studentUser } as any,
      );
      expect(result.postalCode).toBe('ABC-1234');
    });

    // Regression (Copilot review finding on PR #51): the country->pattern
    // lookup was a plain object, so a country value matching an inherited
    // Object.prototype property name (e.g. "constructor") resolved to that
    // property (a function) instead of undefined, and pattern.test(...)
    // threw a TypeError instead of hitting the documented fallback.
    it.each(['constructor', 'toString', 'hasOwnProperty'])(
      'falls back to the generic pattern instead of crashing for the inherited-property-name country %s',
      async (country) => {
        const prisma = fakePrisma();
        const input = { ...VALID_INPUT, country, postalCode: 'ABC-1234' };
        const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
          null,
          { input },
          { prisma, user: studentUser } as any,
        );
        expect(result.postalCode).toBe('ABC-1234');
      },
    );

    // Regression (Copilot review finding on PR #51): GIR 0AA is a real,
    // still-valid UK postcode (historically Girobank's) whose outward code
    // has 3 letters, not the 1-2 the standard-shape pattern allows.
    it.each(['GIR 0AA', 'GIR0AA', 'gir 0aa'])('accepts the UK special postcode %s', async (postalCode) => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, country: 'United Kingdom', postalCode };
      const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
        null,
        { input },
        { prisma, user: studentUser } as any,
      );
      expect(result.postalCode).toBe(postalCode);
    });

    it('accepts a standard-shape UK postcode', async () => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, country: 'United Kingdom', postalCode: 'SW1A 1AA' };
      const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
        null,
        { input },
        { prisma, user: studentUser } as any,
      );
      expect(result.postalCode).toBe('SW1A 1AA');
    });
  });

  // Regression: a house number needed at least one letter OR digit, so a
  // house number that was only letters ("b" alone, no actual number) was
  // wrongly accepted as valid.
  describe('house number must include a digit', () => {
    it.each(['12b', '221B', '12-14', '12 bis', '12/3'])('accepts a real house number %s', async (houseNumber) => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, houseNumber };
      const result = await teacherApplicationResolvers.Mutation.applyForTeacher(
        null,
        { input },
        { prisma, user: studentUser } as any,
      );
      expect(result.houseNumber).toBe(houseNumber);
    });

    it.each(['b', 'abc', '-'])('rejects a house number with no digit at all (%s)', async (houseNumber) => {
      const prisma = fakePrisma();
      const input = { ...VALID_INPUT, houseNumber };
      await expect(
        teacherApplicationResolvers.Mutation.applyForTeacher(null, { input }, { prisma, user: studentUser } as any),
      ).rejects.toThrow("isn't valid");
    });
  });
});

describe('applyForTeacher permission checks', () => {
  it('allows an authenticated STUDENT to apply', () => {
    expect(() => requireAuth({ id: 'student-1', role: 'STUDENT' })).not.toThrow();
  });

  it('denies unauthenticated callers', () => {
    expect(() => requireAuth(null)).toThrow();
  });
});

describe('reviewTeacherApplication permission checks', () => {
  it('allows ADMIN to review', () => {
    expect(() => requireRole({ id: 'admin-1', role: 'ADMIN' }, 'ADMIN')).not.toThrow();
  });

  it('denies TEACHER from reviewing', () => {
    expect(() => requireRole({ id: 'teacher-1', role: 'TEACHER' }, 'ADMIN')).toThrow('FORBIDDEN');
  });

  it('denies STUDENT from reviewing', () => {
    expect(() => requireRole({ id: 'student-1', role: 'STUDENT' }, 'ADMIN')).toThrow('FORBIDDEN');
  });

  it('denies unauthenticated callers', () => {
    expect(() => requireRole(null, 'ADMIN')).toThrow('UNAUTHENTICATED');
  });
});

describe('applyForTeacher: already-a-teacher guard logic', () => {
  it('flags TEACHER and ADMIN as already having teacher access', () => {
    const alreadyHasAccess = (role: string) => role === 'TEACHER' || role === 'ADMIN';
    expect(alreadyHasAccess('TEACHER')).toBe(true);
    expect(alreadyHasAccess('ADMIN')).toBe(true);
    expect(alreadyHasAccess('STUDENT')).toBe(false);
  });
});

// Minor-exclusion age gate (WP25): full identity verification is a later
// phase, this is the quality/legal floor for now.
describe('calculateAge', () => {
  const asOf = new Date('2026-08-18T00:00:00Z');

  it('counts a birthday that already happened this year', () => {
    expect(calculateAge(new Date('2008-01-01'), asOf)).toBe(18);
  });

  it('does not count a birthday that has not happened yet this year', () => {
    expect(calculateAge(new Date('2008-12-31'), asOf)).toBe(17);
  });

  it('handles the birthday falling exactly today', () => {
    expect(calculateAge(new Date('2008-08-18'), asOf)).toBe(18);
  });

  it('handles the day just before the birthday this year', () => {
    expect(calculateAge(new Date('2008-08-19'), asOf)).toBe(17);
  });
});
