jest.mock('../resolvers/courses', () => ({
  requireOwnedCourse: jest.fn(async (_prisma: unknown, user: any, courseId: string) => {
    if (user.id !== 'teacher-1' && user.role !== 'ADMIN') throw new Error('Access denied.');
    return { id: courseId };
  }),
  resolveLessonAccess: jest.fn(async (_prisma: unknown, user: any) => ({ allowed: user?.id === 'student-1', isOwner: false })),
}));

import { lessonLibraryResolvers as r } from '../resolvers/lessonLibrary';

const teacher = { id: 'teacher-1', role: 'TEACHER' };
const otherTeacher = { id: 'teacher-2', role: 'TEACHER' };

function fakePrisma(overrides: any = {}) {
  const refs: any[] = overrides.refs ?? [];
  return {
    refs,
    lesson: { findUnique: jest.fn(async () => ({ id: 'l1', section: { courseId: 'c1' } })) },
    libraryItem: { findUnique: jest.fn(async ({ where }: any) => (where.id === 'gone' ? null : { id: where.id, hiddenAt: where.id === 'hidden' ? new Date() : null })) },
    libraryFolder: {
      findUnique: jest.fn(async ({ where }: any) => ({ id: where.id, name: 'Etudes', ownerId: where.id === 'f-other' ? 'teacher-2' : 'teacher-1' })),
      findMany: jest.fn(async ({ where }: any) => (where.parentId.in.includes('f1') ? [{ id: 'f1-child' }] : [])),
    },
    libraryFolderItem: {
      findMany: jest.fn(async () => [
        { item: { id: 'a' } },
        { item: { id: 'b' } },
        { item: { id: 'a' } },
      ]),
    },
    lessonLibraryReference: {
      findFirst: jest.fn(async ({ where }: any) => refs.find((ref) => ref.lessonId === where.lessonId && (where.itemId ? ref.itemId === where.itemId : ref.folderId === where.folderId)) ?? null),
      findMany: jest.fn(async () => refs),
      count: jest.fn(async () => refs.length),
      create: jest.fn(async ({ data }: any) => {
        const ref = { id: `r${refs.length + 1}`, ...data };
        refs.push(ref);
        return ref;
      }),
      update: jest.fn(async ({ where, data }: any) => ({ ...refs.find((ref) => ref.id === where.id), ...data })),
    },
  } as any;
}

describe('lesson library references', () => {
  it('attaches an item to an owned lesson, once', async () => {
    const prisma = fakePrisma();
    const ctx = { prisma, user: teacher } as any;
    const first = await r.Mutation.addLessonLibraryReference(null, { input: { lessonId: 'l1', itemId: 'i1', note: '  Bars 1-16  ' } }, ctx);
    expect(first).toMatchObject({ lessonId: 'l1', itemId: 'i1', folderId: null, note: 'Bars 1-16', order: 0 });
    await r.Mutation.addLessonLibraryReference(null, { input: { lessonId: 'l1', itemId: 'i1' } }, ctx);
    expect(prisma.lessonLibraryReference.create).toHaveBeenCalledTimes(1);
  });

  it('needs exactly one of item or folder', async () => {
    const ctx = { prisma: fakePrisma(), user: teacher } as any;
    await expect(r.Mutation.addLessonLibraryReference(null, { input: { lessonId: 'l1' } }, ctx)).rejects.toThrow('either');
    await expect(r.Mutation.addLessonLibraryReference(null, { input: { lessonId: 'l1', itemId: 'i1', folderId: 'f1' } }, ctx)).rejects.toThrow('either');
  });

  it("refuses someone else's course, someone else's folder and hidden items", async () => {
    await expect(r.Mutation.addLessonLibraryReference(null, { input: { lessonId: 'l1', itemId: 'i1' } }, { prisma: fakePrisma(), user: otherTeacher } as any)).rejects.toThrow('Access denied');
    const ctx = { prisma: fakePrisma(), user: teacher } as any;
    await expect(r.Mutation.addLessonLibraryReference(null, { input: { lessonId: 'l1', folderId: 'f-other' } }, ctx)).rejects.toThrow('Folder not found');
    await expect(r.Mutation.addLessonLibraryReference(null, { input: { lessonId: 'l1', itemId: 'hidden' } }, ctx)).rejects.toThrow('not found');
    await expect(r.Mutation.addLessonLibraryReference(null, { input: { lessonId: 'l1', itemId: 'i1' } }, { prisma: fakePrisma(), user: { id: 's', role: 'STUDENT' } } as any)).rejects.toThrow();
  });

  it('shows references only to people who may open the lesson', async () => {
    const prisma = fakePrisma({ refs: [{ id: 'r1', lessonId: 'l1', itemId: 'i1' }] });
    expect(await r.Lesson.libraryReferences({ id: 'l1' }, null, { prisma, user: { id: 'student-1', role: 'STUDENT' } } as any)).toHaveLength(1);
    expect(await r.Lesson.libraryReferences({ id: 'l1' }, null, { prisma, user: null } as any)).toEqual([]);
  });

  it('lists a folder with the items of its subfolders, each once', async () => {
    const prisma = fakePrisma();
    const folder = await r.LessonLibraryReference.folder({ folderId: 'f1' }, null, { prisma } as any);
    expect(folder).toEqual({ id: 'f1', name: 'Etudes', items: [{ id: 'a' }, { id: 'b' }] });
    expect(prisma.libraryFolderItem.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ folderId: { in: ['f1', 'f1-child'] } }) }));
  });

  it('reads a removed item as null', async () => {
    expect(await r.LessonLibraryReference.item({ itemId: 'hidden' }, null, { prisma: fakePrisma() } as any)).toBeNull();
  });
});
