process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { reviewResolvers } from '../resolvers/reviews';

const studentUser = { id: 'student-1', role: 'STUDENT' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

describe('Review.comment field resolver', () => {
  it('reads the DB column `body` back out as `comment` (public GraphQL field name differs from the Prisma column)', () => {
    const resolver = (reviewResolvers as any).Review.comment;
    expect(resolver({ body: 'Wonderful masterclass.' })).toBe('Wonderful masterclass.');
    expect(resolver({ body: null })).toBeNull();
    expect(resolver({})).toBeNull();
  });
});

describe('Query.reviews', () => {
  it('filters to public reviews for exactly the given courseId/eventId/bookingId, paginating like the nested Course.reviews/Event.reviews resolvers', async () => {
    const findMany = jest.fn().mockResolvedValue([{ id: 'review-1' }]);
    const count = jest.fn().mockResolvedValue(1);
    const prisma = fakePrisma({ review: { findMany, count } });

    const result = await (reviewResolvers as any).Query.reviews(null, { courseId: 'course-1' }, { prisma } as any);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isPublic: true, courseId: 'course-1' } }),
    );
    expect(result.nodes).toEqual([{ id: 'review-1' }]);
    expect(result.pageInfo.totalCount).toBe(1);
  });

  it('works unauthenticated (no requireAuth call) - it is a public browsing query, same as Course.reviews', async () => {
    const prisma = fakePrisma({
      review: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    });
    await expect(
      (reviewResolvers as any).Query.reviews(null, { eventId: 'event-1' }, { prisma } as any),
    ).resolves.toBeDefined();
  });
});

describe('createReview - comment persistence', () => {
  it('saves input.comment into the DB column `body`', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'review-3' });
    const prisma = fakePrisma({ review: { create } });

    await reviewResolvers.Mutation.createReview(
      null,
      { input: { rating: 4, comment: 'Great evening.' } },
      { prisma, user: studentUser } as any,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ body: 'Great evening.' }) }),
    );
  });
});

describe('createReview - external event gating and XP crediting', () => {
  it('rejects evaluating an external event with no engagement row at all', async () => {
    const prisma = fakePrisma({
      externalEventEngagement: { findUnique: jest.fn().mockResolvedValue(null) },
    });
    await expect(
      reviewResolvers.Mutation.createReview(
        null,
        { input: { rating: 5, externalEventProjectionId: 'evt-1' } },
        { prisma, user: studentUser } as any,
      ),
    ).rejects.toThrow('Confirm your attendance before evaluating this event.');
  });

  it('rejects evaluating an external event whose attendance was never confirmed', async () => {
    const prisma = fakePrisma({
      externalEventEngagement: {
        findUnique: jest.fn().mockResolvedValue({ id: 'eng-1', attendanceConfirmedAt: null }),
      },
    });
    await expect(
      reviewResolvers.Mutation.createReview(
        null,
        { input: { rating: 5, externalEventProjectionId: 'evt-1' } },
        { prisma, user: studentUser } as any,
      ),
    ).rejects.toThrow('Confirm your attendance before evaluating this event.');
  });

  it('creates the review and credits XP exactly once when attendance was confirmed', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'review-1' });
    const xpAwardCreate = jest.fn().mockResolvedValue({});
    const gamificationUpdate = jest.fn().mockResolvedValue({});
    const engagementUpdate = jest.fn().mockResolvedValue({});
    const prisma = fakePrisma({
      externalEventEngagement: {
        findUnique: jest.fn().mockResolvedValue({ id: 'eng-1', attendanceConfirmedAt: new Date() }),
        update: engagementUpdate,
      },
      review: { create },
      xpAward: { create: xpAwardCreate },
      gamificationProfile: { update: gamificationUpdate },
      $transaction: jest.fn((ops: any[]) => Promise.all(ops)),
    });

    const result = await reviewResolvers.Mutation.createReview(
      null,
      { input: { rating: 5, externalEventProjectionId: 'evt-1' } },
      { prisma, user: studentUser } as any,
    );

    expect(result).toEqual({ id: 'review-1' });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'student-1', rating: 5, externalEventProjectionId: 'evt-1' }),
      }),
    );
    // awardXpOnce writes via a single $transaction call, not two separate calls.
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(xpAwardCreate).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'student-1', reason: 'EVENT_ATTENDED', refId: 'external:evt-1', amount: 40 }) }),
    );
    expect(engagementUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_externalEventProjectionId: { userId: 'student-1', externalEventProjectionId: 'evt-1' } },
        data: expect.objectContaining({ xpAwardedAt: expect.any(Date) }),
      }),
    );
  });

  it('does not touch external-event engagement/XP at all for a course review', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'review-2' });
    const engagementFindUnique = jest.fn();
    const xpAwardCreate = jest.fn();
    const prisma = fakePrisma({
      enrollment: { findUnique: jest.fn().mockResolvedValue({ id: 'enroll-1' }) },
      review: { create },
      reviewAggregate: undefined,
      externalEventEngagement: { findUnique: engagementFindUnique },
      xpAward: { create: xpAwardCreate },
    });
    (prisma as any).review.aggregate = jest.fn().mockResolvedValue({ _avg: { rating: 5 }, _count: 1 });
    (prisma as any).course = { update: jest.fn().mockResolvedValue({}) };

    await reviewResolvers.Mutation.createReview(
      null,
      { input: { rating: 5, courseId: 'course-1' } },
      { prisma, user: studentUser } as any,
    );

    expect(engagementFindUnique).not.toHaveBeenCalled();
    expect(xpAwardCreate).not.toHaveBeenCalled();
  });
});
