import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { createUploadTarget, storageConfigured, type UploadPurpose } from '../lib/storage.js';
import type { GraphQLContext } from '../types.js';

const SELF_SERVICE_PURPOSES = new Set<UploadPurpose>([
  'TEACHER_APPLICATION_CV',
  'TEACHER_APPLICATION_AUDIO',
  'TEACHER_APPLICATION_DOCUMENT',
]);

export const uploadResolvers = {
  Query: {
    storageConfigured() {
      return storageConfigured();
    },
  },

  Mutation: {
    // Ownership of the *target* record (a course's lesson, say) is checked
    // where the resulting fileUrl is actually attached (addLessonSlide,
    // applyForTeacher) - this just authorizes getting a presigned URL to
    // upload somewhere under the caller's own key prefix.
    async requestUploadUrl(
      _: unknown,
      { purpose, filename, contentType }: { purpose: UploadPurpose; filename: string; contentType: string },
      { user }: GraphQLContext,
    ) {
      requireAuth(user);
      if (purpose === 'COURSE_SLIDE') {
        requireRole(user, 'TEACHER', 'ADMIN');
      } else if (!SELF_SERVICE_PURPOSES.has(purpose)) {
        throw new GraphQLError('Unknown upload purpose.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      return createUploadTarget(purpose, user.id, filename, contentType);
    },
  },
};
