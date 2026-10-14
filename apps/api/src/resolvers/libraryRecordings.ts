import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  RIGHTS_GRANT,
  canUseInTeaching,
  createLibraryRecording,
  deleteLibraryRecording,
  teachingRecordings,
  updateLibraryRecording,
} from '../lib/libraryRecordings.js';
import type { GraphQLContext } from '../types.js';

// Recordings uploaded by teachers and admins (lib/libraryRecordings.ts), and
// recordings presented on platform events. Same rule as for lessons
// (canUseInTeaching): an admin may use every recording; a teacher the open
// Library and, of the uploaded recordings, only their own.

const MAX_RECORDINGS_PER_EVENT = 12;

function notFound(message: string): never {
  throw new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });
}

async function loadEditableEvent(prisma: any, user: { id: string; role: string }, eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, publisherId: true } });
  if (!event) notFound('Event not found.');
  if (user.role !== 'ADMIN' && event.publisherId !== user.id) {
    throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
  }
  return event;
}

const isOwnerOrAdmin = (user: GraphQLContext['user'], item: { uploadedById?: string | null }) =>
  Boolean(user && (user.role === 'ADMIN' || (item.uploadedById && item.uploadedById === user.id)));

export const libraryRecordingResolvers = {
  LibraryItem: {
    async uploadedBy(item: { uploadedById?: string | null }, _: unknown, { prisma }: GraphQLContext) {
      if (!item.uploadedById) return null;
      const user = await prisma.user.findUnique({
        where: { id: item.uploadedById },
        select: { id: true, email: true, profile: { select: { displayName: true } } },
      });
      if (!user) return null;
      // Never the email address - it is a public page.
      return { id: user.id, name: user.profile?.displayName || 'A mymusic.coach teacher' };
    },
    canUseInTeaching: (item: { source: string; uploadedById?: string | null }, _: unknown, { user }: GraphQLContext) =>
      canUseInTeaching(user, item),
    canEditRecording: (item: { source: string; uploadedById?: string | null }, _: unknown, { user }: GraphQLContext) =>
      item.source === 'UPLOAD' && isOwnerOrAdmin(user, item),
    // Only admins remove Library items - never the uploader.
    canDeleteRecording: (item: { source: string }, _: unknown, { user }: GraphQLContext) => item.source === 'UPLOAD' && user?.role === 'ADMIN',
    rightsGrant: (item: { rightsGrant?: string | null; uploadedById?: string | null }, _: unknown, { user }: GraphQLContext) =>
      isOwnerOrAdmin(user, item) ? item.rightsGrant ?? null : null,
    rightsGrantedAt: (item: { rightsGrantedAt?: Date | null; uploadedById?: string | null }, _: unknown, { user }: GraphQLContext) =>
      isOwnerOrAdmin(user, item) ? item.rightsGrantedAt ?? null : null,
  },

  Event: {
    async recordings(event: { id: string }, _: unknown, { prisma }: GraphQLContext) {
      return prisma.eventRecording.findMany({
        where: { eventId: event.id, item: { hiddenAt: null } },
        include: { item: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      });
    },
  },

  Query: {
    async myLibraryRecordings(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return prisma.libraryItem.findMany({
        where: { source: 'UPLOAD', ...(user!.role === 'ADMIN' ? {} : { uploadedById: user!.id }) } as any,
        orderBy: { ingestedAt: 'desc' },
        take: 500,
      });
    },
    async teachingRecordings(_: unknown, { query, limit }: { query?: string | null; limit?: number | null }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return teachingRecordings(prisma, user!, query, limit ?? 20);
    },
    libraryRecordingRightsGrant: () => RIGHTS_GRANT,
  },

  Mutation: {
    async createLibraryRecording(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return createLibraryRecording(prisma, user!, input);
    },
    async updateLibraryRecording(_: unknown, { id, input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return updateLibraryRecording(prisma, user!, id, input);
    },
    async deleteLibraryRecording(_: unknown, { id }: { id: string }, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      return deleteLibraryRecording(prisma, user!, id);
    },

    async addEventRecording(_: unknown, { eventId, itemId }: { eventId: string; itemId: string }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      requireRole(user, 'TEACHER', 'ADMIN');
      await loadEditableEvent(prisma, user, eventId);
      const item = await prisma.libraryItem.findUnique({
        where: { id: itemId },
        select: { id: true, source: true, uploadedById: true, isPublicDomainWork: true, category: true, hiddenAt: true },
      });
      if (!item || item.hiddenAt || item.category !== 'AUDIO_RECORDING') notFound('Recording not found.');
      if (!canUseInTeaching(user, item)) {
        throw new GraphQLError('This recording is under another teacher’s copyright - you can listen to it and share its link, but not present it on your event.', { extensions: { code: 'FORBIDDEN' } });
      }
      const existing = await prisma.eventRecording.findUnique({ where: { eventId_itemId: { eventId, itemId } }, include: { item: true } });
      if (existing) return existing;
      const count = await prisma.eventRecording.count({ where: { eventId } });
      if (count >= MAX_RECORDINGS_PER_EVENT) {
        throw new GraphQLError(`An event can present at most ${MAX_RECORDINGS_PER_EVENT} recordings.`, { extensions: { code: 'BAD_USER_INPUT' } });
      }
      return prisma.eventRecording.create({ data: { eventId, itemId, order: count }, include: { item: true } });
    },

    async removeEventRecording(_: unknown, { id }: { id: string }, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      requireRole(user, 'TEACHER', 'ADMIN');
      const recording = await prisma.eventRecording.findUnique({ where: { id }, select: { eventId: true } });
      if (!recording) return true;
      await loadEditableEvent(prisma, user, recording.eventId);
      await prisma.eventRecording.delete({ where: { id } });
      return true;
    },
  },
};
