import { GraphQLError } from 'graphql';
import {
  searchCatalogue,
  getManifest,
  fetchPageImage,
  fetchPageAudio,
  bnfAttribution,
  type BnfManifest,
} from '@my-music-coach/bnf-gallica';
import { requireRole } from '../middleware/auth.js';
import { bnfCommercialReuseConfigured, assertBnfCommercialReuseConfigured } from '../lib/bnf.js';
import { uploadServerFetchedAsset } from '../lib/storage.js';
import { requireOwnedCourse } from './courses.js';
import type { GraphQLContext } from '../types.js';

// BnF/Gallica integration - see docs/integration-architecture.md. Library
// browsing (apps/api/src/resolvers/library.ts) is the public, no-login
// surface over the persisted LibraryItem catalogue. searchBnfCatalogue/
// bnfManifest here call BnF's open APIs directly and are ADMIN-only: the
// preview step for Mutation.runLibraryIngest's on-demand pull, and the
// page/track picker used when integrating an already-catalogued item into a
// course. The two import mutations take a libraryItemId (not a raw ark) so
// only catalogue-vetted items are importable, additionally require
// BNF_COMMERCIAL_LICENSE_ACCEPTED=true (BnF charges a reuse fee and requires
// a signed declaration to put their digitized masters on a commercial
// platform - see bnfCommercialReuseConfigured's doc comment), and always
// persist Gallica's required attribution alongside the imported asset
// (LessonSlide/Lesson.sourceUrl + .attribution).

async function loadOwnedLesson(prisma: any, user: any, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
  if (!lesson) throw new GraphQLError('Lesson not found.', { extensions: { code: 'NOT_FOUND' } });
  await requireOwnedCourse(prisma, user, lesson.section.courseId);
  return lesson;
}

async function loadLibraryItem(prisma: any, libraryItemId: string) {
  const item = await prisma.libraryItem.findUnique({ where: { id: libraryItemId } });
  if (!item) throw new GraphQLError('Library item not found.', { extensions: { code: 'NOT_FOUND' } });
  return item;
}

function findManifestPage(manifest: BnfManifest, pageNumber: number) {
  const page = manifest.pages.find((p) => p.pageNumber === pageNumber);
  if (!page) throw new GraphQLError(`Page ${pageNumber} not found in this Gallica document.`, { extensions: { code: 'NOT_FOUND' } });
  return page;
}

export const bnfResolvers = {
  Query: {
    bnfCommercialReuseConfigured(_: unknown, __: unknown, { user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return bnfCommercialReuseConfigured();
    },

    async searchBnfCatalogue(_: unknown, { query, documentType }: any, { user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      if (!query?.trim()) throw new GraphQLError('query is required.', { extensions: { code: 'BAD_USER_INPUT' } });
      try {
        return await searchCatalogue(query.trim(), { documentType: documentType ?? undefined });
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'BnF catalogue search failed.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    async bnfManifest(_: unknown, { ark }: any, { user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      try {
        return await getManifest(ark);
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : 'Fetching the Gallica manifest failed.', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },

  Mutation: {
    async importBnfSlide(_: unknown, { lessonId, libraryItemId, page }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      assertBnfCommercialReuseConfigured();
      const lesson = await loadOwnedLesson(prisma, user!, lessonId);
      if (lesson.contentType !== 'SLIDES') {
        throw new GraphQLError('importBnfSlide requires a contentType SLIDES lesson.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const libraryItem = await loadLibraryItem(prisma, libraryItemId);

      const manifest = await getManifest(libraryItem.ark);
      const manifestPage = findManifestPage(manifest, page);
      const asset = await fetchPageImage(manifestPage);
      const fileUrl = await uploadServerFetchedAsset(
        'COURSE_SLIDE',
        user!.id,
        asset.bytes,
        asset.contentType,
        `${libraryItem.ark}-f${page}.jpg`,
      );

      const order = ((await prisma.lessonSlide.aggregate({ where: { lessonId }, _max: { order: true } }))._max.order ?? -1) + 1;
      return prisma.lessonSlide.create({
        data: {
          lessonId,
          fileUrl,
          title: manifestPage.label ?? libraryItem.title,
          order,
          sourceUrl: manifest.permalink,
          attribution: bnfAttribution(libraryItem.title),
        },
      });
    },

    async importBnfAudio(_: unknown, { lessonId, libraryItemId, page }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      assertBnfCommercialReuseConfigured();
      const lesson = await loadOwnedLesson(prisma, user!, lessonId);
      if (lesson.contentType !== 'AUDIO') {
        throw new GraphQLError('importBnfAudio requires a contentType AUDIO lesson.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      const libraryItem = await loadLibraryItem(prisma, libraryItemId);

      const manifest = await getManifest(libraryItem.ark);
      const manifestPage = findManifestPage(manifest, page ?? 1);
      const asset = await fetchPageAudio(manifestPage);
      const fileUrl = await uploadServerFetchedAsset(
        'COURSE_LESSON_AUDIO',
        user!.id,
        asset.bytes,
        asset.contentType,
        `${libraryItem.ark}-f${manifestPage.pageNumber}.mp3`,
      );

      return prisma.lesson.update({
        where: { id: lessonId },
        data: { videoUrl: fileUrl, sourceUrl: manifest.permalink, attribution: bnfAttribution(libraryItem.title) },
      });
    },
  },
};
