process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { courseResolvers } from '../resolvers/courses';

const owningTeacher = { id: 'teacher-1', role: 'TEACHER' } as const;
const otherTeacher = { id: 'teacher-2', role: 'TEACHER' } as const;
const admin = { id: 'admin-1', role: 'ADMIN' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

describe('archiveCourse', () => {
  it('rejects a teacher who does not own the course (IDOR)', async () => {
    const update = jest.fn();
    const prisma = fakePrisma({
      course: {
        findUnique: jest.fn().mockResolvedValue({ id: 'c1', status: 'PUBLISHED', teacherProfile: { userId: 'teacher-1' } }),
        update,
      },
    });
    await expect(
      (courseResolvers as any).Mutation.archiveCourse(null, { id: 'c1' }, { prisma, user: otherTeacher } as any),
    ).rejects.toThrow('Access denied');
    expect(update).not.toHaveBeenCalled();
  });

  it('allows the owning teacher to archive their own course', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'c1', status: 'ARCHIVED' });
    const prisma = fakePrisma({
      course: {
        findUnique: jest.fn().mockResolvedValue({ id: 'c1', status: 'PUBLISHED', teacherProfile: { userId: 'teacher-1' } }),
        update,
      },
    });
    await (courseResolvers as any).Mutation.archiveCourse(null, { id: 'c1' }, { prisma, user: owningTeacher } as any);
    expect(update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { status: 'ARCHIVED' } });
  });

  it('allows an admin to archive any course', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'c1', status: 'ARCHIVED' });
    const prisma = fakePrisma({
      course: {
        findUnique: jest.fn().mockResolvedValue({ id: 'c1', status: 'PUBLISHED', teacherProfile: { userId: 'teacher-1' } }),
        update,
      },
    });
    await (courseResolvers as any).Mutation.archiveCourse(null, { id: 'c1' }, { prisma, user: admin } as any);
    expect(update).toHaveBeenCalled();
  });
});

// Regression coverage for a Copilot review finding on PR #47: myCourses
// deliberately does NOT filter out ARCHIVED (see the comment on
// archiveCourse in courses.ts) so a teacher's own management view is the
// only place they can restore one - unarchiveCourse is that restore path,
// previously missing entirely (an archived course was a permanent dead end).
describe('unarchiveCourse', () => {
  it('rejects a teacher who does not own the course (IDOR)', async () => {
    const update = jest.fn();
    const prisma = fakePrisma({
      course: {
        findUnique: jest.fn().mockResolvedValue({ id: 'c1', status: 'ARCHIVED', teacherProfile: { userId: 'teacher-1' } }),
        update,
      },
    });
    await expect(
      (courseResolvers as any).Mutation.unarchiveCourse(null, { id: 'c1' }, { prisma, user: otherTeacher } as any),
    ).rejects.toThrow('Access denied');
    expect(update).not.toHaveBeenCalled();
  });

  it('restores an archived course to DRAFT, not straight back to PUBLISHED', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'c1', status: 'DRAFT' });
    const prisma = fakePrisma({
      course: {
        findUnique: jest.fn().mockResolvedValue({ id: 'c1', status: 'ARCHIVED', teacherProfile: { userId: 'teacher-1' } }),
        update,
      },
    });
    await (courseResolvers as any).Mutation.unarchiveCourse(null, { id: 'c1' }, { prisma, user: owningTeacher } as any);
    expect(update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { status: 'DRAFT' } });
  });

  it('rejects unarchiving a course that is not currently ARCHIVED', async () => {
    const update = jest.fn();
    const prisma = fakePrisma({
      course: {
        findUnique: jest.fn().mockResolvedValue({ id: 'c1', status: 'PUBLISHED', teacherProfile: { userId: 'teacher-1' } }),
        update,
      },
    });
    await expect(
      (courseResolvers as any).Mutation.unarchiveCourse(null, { id: 'c1' }, { prisma, user: owningTeacher } as any),
    ).rejects.toThrow('Only an archived course can be unarchived.');
    expect(update).not.toHaveBeenCalled();
  });
});
