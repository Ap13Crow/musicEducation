// Regression coverage for the 2026-11-22 finding that anyone, without
// signing in, could read every teacher's account email, notification email
// and role through public queries such as
//   { teachers { nodes { user { email profile { notificationEmail } } } } }
// Contact details are now readable only by the user themself, an admin, or
// the teacher of one of the user's bookings (see lib/contactVisibility.ts).

process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { userResolvers } from '../resolvers/users';
import { bookingResolvers } from '../resolvers/bookings';
import { CONTACT_VISIBLE_TO } from '../lib/contactVisibility';

const target = { id: 'user-1', email: 'camille.example@gmail.com', profile: null };
const self = { id: 'user-1', role: 'STUDENT' };
const admin = { id: 'admin-1', role: 'ADMIN' };
const stranger = { id: 'user-2', role: 'TEACHER' };

function ctx(user: any, prisma: any = {}) {
  return { user, prisma } as any;
}

describe('User contact fields', () => {
  const User = userResolvers.User as any;

  it.each([
    ['anonymous', null],
    ['another user', stranger],
  ])('hides email, username and email fallback name from %s', async (_label, viewer) => {
    const prisma = { userProfile: { findUnique: jest.fn().mockResolvedValue(null) } };
    expect(User.email(target, {}, ctx(viewer))).toBeNull();
    expect(await User.username(target, {}, ctx(viewer))).toBe('user-1');
    expect(await User.displayName(target, {}, ctx(viewer, prisma))).toBe('Musician');
  });

  it.each([
    ['the user themself', self],
    ['an admin', admin],
  ])('shows contact fields to %s', async (_label, viewer) => {
    expect(User.email(target, {}, ctx(viewer))).toBe('camille.example@gmail.com');
    expect(await User.username(target, {}, ctx(viewer))).toBe('camille.example');
  });

  it('shows the email to a viewer a parent resolver vouched for', () => {
    const stamped = { ...target, [CONTACT_VISIBLE_TO]: stranger.id };
    expect(User.email(stamped, {}, ctx(stranger))).toBe('camille.example@gmail.com');
    expect(User.email(stamped, {}, ctx({ id: 'user-3', role: 'TEACHER' }))).toBeNull();
  });

  it('returns no enrollments to other viewers without touching the database', async () => {
    const findMany = jest.fn();
    const result = await User.enrollments(target, {}, ctx(stranger, { enrollment: { findMany, count: jest.fn() } }));
    expect(result.nodes).toEqual([]);
    expect(findMany).not.toHaveBeenCalled();
  });

  it('hides the notification email from other viewers', () => {
    const profile = { userId: 'user-1', notificationEmail: 'private@example.org' };
    const UserProfile = userResolvers.UserProfile as any;
    expect(UserProfile.notificationEmail(profile, {}, ctx(null))).toBeNull();
    expect(UserProfile.notificationEmail(profile, {}, ctx(stranger))).toBeNull();
    expect(UserProfile.notificationEmail(profile, {}, ctx(self))).toBe('private@example.org');
  });
});

describe('searchUsers', () => {
  it('requires an admin, because it matches on email', async () => {
    const searchUsers = (userResolvers.Query as any).searchUsers;
    await expect(searchUsers(null, { query: 'a' }, ctx(null))).rejects.toThrow(/UNAUTHENTICATED/);
    await expect(searchUsers(null, { query: 'a' }, ctx(stranger))).rejects.toThrow(/FORBIDDEN/);
  });

  it('returns a connection and caps the page size', async () => {
    const findMany = jest.fn().mockResolvedValue([target]);
    const prisma = { user: { findMany, count: jest.fn().mockResolvedValue(1) } };
    const result = await (userResolvers.Query as any).searchUsers(null, { query: 'a', limit: 100000 }, ctx(admin, prisma));
    expect(result.nodes).toHaveLength(1);
    expect(result.pageInfo.totalCount).toBe(1);
    expect(findMany.mock.calls[0][0].take).toBe(50);
  });
});

describe('Booking.student', () => {
  const student = (bookingResolvers as any).Booking.student;
  const prisma = () => ({
    user: { findUnique: jest.fn().mockResolvedValue({ ...target }) },
    teacherProfile: { findUnique: jest.fn().mockResolvedValue({ userId: 'teacher-1' }) },
  });
  const booking = { userId: 'user-1', teacherProfileId: 'tp-1' };

  it("vouches for the booking's own teacher", async () => {
    const result = await student(booking, {}, ctx({ id: 'teacher-1', role: 'TEACHER' }, prisma()));
    expect(result[CONTACT_VISIBLE_TO]).toBe('teacher-1');
  });

  it('does not vouch for anyone else', async () => {
    const result = await student(booking, {}, ctx(stranger, prisma()));
    expect(result[CONTACT_VISIBLE_TO]).toBeUndefined();
  });
});
