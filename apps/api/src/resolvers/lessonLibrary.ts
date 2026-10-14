import { GraphQLError } from 'graphql';
import { requireRole } from '../middleware/auth.js';
import { requireOwnedCourse, resolveLessonAccess } from './courses.js';
import { canUseInTeaching } from '../lib/libraryRecordings.js';
import type { GraphQLContext } from '../types.js';

// Library items and folders as lesson references. A teacher attaches pieces
// from the Library - one item, or a whole folder of their own - to a lesson
// of a course they own; enrolled students see them in the lesson (same
// access rule as the lesson's video and slides) and open them in the
// Library, where reading and listening earn library XP as usual.
// Recordings uploaded by teachers are the exception: under copyright only
// their uploader (and admins) may use them, released into the public domain
// every teacher (lib/libraryRecordings.ts canUseInTeaching).

const MAX_REFERENCES_PER_LESSON = 50;
const MAX_FOLDER_ITEMS = 200;
const MAX_NOTE_LENGTH = 500;

function badInput(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

async function loadOwnedLesson(prisma: any, user: any, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
  if (!lesson) throw new GraphQLError('Lesson not found.', { extensions: { code: 'NOT_FOUND' } });
  await requireOwnedCourse(prisma, user, lesson.section.courseId);
  return lesson;
}

// Who teaches the lesson's course: an upload in a folder shows in the lesson
// only if that teacher may use it.
async function lessonTeacher(prisma: any, lessonId: string): Promise<{ id: string; role: string } | null> {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { section: { select: { course: { select: { teacherProfile: { select: { user: { select: { id: true, role: true } } } } } } } } },
  });
  return lesson?.section?.course?.teacherProfile?.user ?? null;
}

async function loadOwnedReference(prisma: any, user: any, id: string) {
  const reference = await prisma.lessonLibraryReference.findUnique({ where: { id } });
  if (!reference) throw new GraphQLError('Reference not found.', { extensions: { code: 'NOT_FOUND' } });
  await loadOwnedLesson(prisma, user, reference.lessonId);
  return reference;
}

function cleanNote(note: unknown): string | null {
  if (typeof note !== 'string') return null;
  const trimmed = note.trim();
  if (trimmed.length > MAX_NOTE_LENGTH) badInput(`Keep the note under ${MAX_NOTE_LENGTH} characters.`);
  return trimmed || null;
}

// A folder and every folder below it (folders nest up to 8 deep).
async function folderTreeIds(prisma: any, rootId: string): Promise<string[]> {
  const ids = [rootId];
  let level = [rootId];
  for (let depth = 0; depth < 8 && level.length; depth++) {
    const children = await prisma.libraryFolder.findMany({ where: { parentId: { in: level } }, select: { id: true } });
    level = children.map((child: { id: string }) => child.id);
    ids.push(...level);
  }
  return ids;
}

export const lessonLibraryResolvers = {
  Lesson: {
    async libraryReferences(lesson: any, _: unknown, { prisma, user }: GraphQLContext) {
      const { allowed } = await resolveLessonAccess(prisma, user, lesson);
      if (!allowed) return [];
      return prisma.lessonLibraryReference.findMany({ where: { lessonId: lesson.id }, orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] });
    },
  },

  LessonLibraryReference: {
    // A hidden item reads as null - the lesson shows "no longer available".
    async item(reference: any, _: unknown, { prisma }: GraphQLContext) {
      if (!reference.itemId) return null;
      const item = await prisma.libraryItem.findUnique({ where: { id: reference.itemId } });
      return item && !item.hiddenAt ? item : null;
    },
    async folder(reference: any, _: unknown, { prisma }: GraphQLContext) {
      if (!reference.folderId) return null;
      const folder = await prisma.libraryFolder.findUnique({ where: { id: reference.folderId }, select: { id: true, name: true } });
      if (!folder) return null;
      const ids = await folderTreeIds(prisma, folder.id);
      const entries = await prisma.libraryFolderItem.findMany({
        where: { folderId: { in: ids }, item: { hiddenAt: null } },
        include: { item: true },
        orderBy: { addedAt: 'asc' },
        take: MAX_FOLDER_ITEMS,
      });
      const seen = new Set<string>();
      const hasUploads = entries.some((entry: any) => entry.item.source === 'UPLOAD');
      const teacher = hasUploads ? await lessonTeacher(prisma, reference.lessonId) : null;
      const items = entries
        .map((entry: any) => entry.item)
        .filter((item: any) => !seen.has(item.id) && seen.add(item.id))
        .filter((item: any) => item.source !== 'UPLOAD' || canUseInTeaching(teacher, item));
      return { id: folder.id, name: folder.name, items };
    },
  },

  Mutation: {
    async addLessonLibraryReference(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const { lessonId, itemId, folderId } = input ?? {};
      if (Boolean(itemId) === Boolean(folderId)) badInput('Choose either a Library item or a folder.');
      await loadOwnedLesson(prisma, user, lessonId);
      const note = cleanNote(input.note);

      if (itemId) {
        const item = await prisma.libraryItem.findUnique({ where: { id: itemId }, select: { hiddenAt: true, source: true, uploadedById: true, isPublicDomainWork: true } });
        if (!item || item.hiddenAt) throw new GraphQLError('Library item not found.', { extensions: { code: 'NOT_FOUND' } });
        if (!canUseInTeaching(user, item)) {
          throw new GraphQLError('This recording is under another teacher’s copyright - you can recommend its link to students, but not build it into your course.', {
            extensions: { code: 'FORBIDDEN' },
          });
        }
      } else {
        const folder = await prisma.libraryFolder.findUnique({ where: { id: folderId }, select: { ownerId: true } });
        // Your own folders only - another user's folder isn't yours to share.
        if (!folder || (folder.ownerId !== user!.id && user!.role !== 'ADMIN')) {
          throw new GraphQLError('Folder not found.', { extensions: { code: 'NOT_FOUND' } });
        }
      }

      // Already attached: keep it, just update the note if one was given.
      const existing = await prisma.lessonLibraryReference.findFirst({ where: { lessonId, ...(itemId ? { itemId } : { folderId }) } });
      if (existing) {
        return note === null ? existing : prisma.lessonLibraryReference.update({ where: { id: existing.id }, data: { note } });
      }
      const count = await prisma.lessonLibraryReference.count({ where: { lessonId } });
      if (count >= MAX_REFERENCES_PER_LESSON) badInput(`A lesson can have at most ${MAX_REFERENCES_PER_LESSON} Library references.`);
      return prisma.lessonLibraryReference.create({
        data: { lessonId, itemId: itemId ?? null, folderId: folderId ?? null, note, order: count },
      });
    },

    async updateLessonLibraryReference(_: unknown, { id, note }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      await loadOwnedReference(prisma, user, id);
      return prisma.lessonLibraryReference.update({ where: { id }, data: { note: cleanNote(note) } });
    },

    async removeLessonLibraryReference(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      await loadOwnedReference(prisma, user, id);
      await prisma.lessonLibraryReference.delete({ where: { id } });
      return true;
    },

    async reorderLessonLibraryReferences(_: unknown, { lessonId, ids }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      await loadOwnedLesson(prisma, user, lessonId);
      const current = await prisma.lessonLibraryReference.findMany({ where: { lessonId }, select: { id: true } });
      const known = new Set(current.map((row: { id: string }) => row.id));
      if (ids.length !== known.size || !ids.every((id: string) => known.has(id))) badInput('List every reference of the lesson exactly once.');
      await prisma.$transaction(ids.map((id: string, order: number) => prisma.lessonLibraryReference.update({ where: { id }, data: { order } })));
      return prisma.lessonLibraryReference.findMany({ where: { lessonId }, orderBy: { order: 'asc' } });
    },
  },
};
