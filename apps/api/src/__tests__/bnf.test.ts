// Unit tests for the BnF/Gallica import resolver - the commercial-reuse
// license gate and course-ownership checks matter more here than exercising
// the real BnF/Gallica network calls (covered in
// packages/bnf-gallica/src/__tests__ against live-captured fixtures).

jest.mock('@my-music-coach/bnf-gallica', () => ({
  bnfCommercialReuseConfigured: jest.fn(() => false),
  searchCatalogue: jest.fn(),
  getManifest: jest.fn(),
  fetchPageImage: jest.fn(),
  fetchPageAudio: jest.fn(),
  bnfAttribution: (title?: string | null) => `${title} — source: gallica.bnf.fr / Bibliothèque nationale de France`,
}));

jest.mock('../lib/storage', () => ({
  uploadServerFetchedAsset: jest.fn(),
}));

import { bnfCommercialReuseConfigured, getManifest, fetchPageImage, fetchPageAudio, searchCatalogue } from '@my-music-coach/bnf-gallica';
import { uploadServerFetchedAsset } from '../lib/storage';
import { bnfResolvers } from '../resolvers/bnf';

const teacherUser = { id: 'teacher-1', role: 'TEACHER' } as const;
const adminUser = { id: 'admin-1', role: 'ADMIN' } as const;

function fakePrisma(overrides: Record<string, any> = {}) {
  return overrides as any;
}

describe('searchBnfCatalogue - ADMIN only', () => {
  afterEach(() => jest.resetAllMocks());

  it('rejects a TEACHER caller (this is now the admin ingest-preview tool, not teacher-facing)', async () => {
    await expect(
      bnfResolvers.Query.searchBnfCatalogue(null, { query: 'Mozart' }, { user: teacherUser } as any),
    ).rejects.toThrow('FORBIDDEN');
    expect(searchCatalogue).not.toHaveBeenCalled();
  });

  it('allows an ADMIN caller', async () => {
    (searchCatalogue as jest.Mock).mockResolvedValue([]);
    await expect(
      bnfResolvers.Query.searchBnfCatalogue(null, { query: 'Mozart' }, { user: adminUser } as any),
    ).resolves.toEqual([]);
  });
});

describe('importBnfSlide / importBnfAudio - commercial-reuse gate', () => {
  afterEach(() => jest.resetAllMocks());

  const libraryItemFixture = {
    id: 'library-item-1',
    ark: 'bpt6k11767775',
    title: 'Messe de Requiem / par Mozart',
  };

  it('rejects importBnfSlide with NOT_CONFIGURED when no license is accepted, without ever touching Gallica or storage', async () => {
    (bnfCommercialReuseConfigured as jest.Mock).mockReturnValue(false);
    const prisma = fakePrisma();

    await expect(
      bnfResolvers.Mutation.importBnfSlide(null, { lessonId: 'lesson-1', libraryItemId: 'library-item-1', page: 1 }, {
        prisma,
        user: teacherUser,
      } as any),
    ).rejects.toMatchObject({ extensions: { code: 'NOT_CONFIGURED' } });

    expect(getManifest).not.toHaveBeenCalled();
    expect(uploadServerFetchedAsset).not.toHaveBeenCalled();
  });

  it('rejects importBnfAudio with NOT_CONFIGURED when no license is accepted', async () => {
    (bnfCommercialReuseConfigured as jest.Mock).mockReturnValue(false);
    const prisma = fakePrisma();

    await expect(
      bnfResolvers.Mutation.importBnfAudio(null, { lessonId: 'lesson-1', libraryItemId: 'library-item-1', page: 1 }, {
        prisma,
        user: teacherUser,
      } as any),
    ).rejects.toMatchObject({ extensions: { code: 'NOT_CONFIGURED' } });

    expect(getManifest).not.toHaveBeenCalled();
    expect(fetchPageAudio).not.toHaveBeenCalled();
  });

  it('imports a page as a new slide once the license is configured, and stores Gallica attribution', async () => {
    (bnfCommercialReuseConfigured as jest.Mock).mockReturnValue(true);
    (getManifest as jest.Mock).mockResolvedValue({
      ark: 'bpt6k11767775',
      title: 'Messe de Requiem / par Mozart',
      permalink: 'https://gallica.bnf.fr/ark:/12148/bpt6k11767775',
      pages: [{ pageNumber: 1, label: 'plat sup.', imageUrl: 'https://gallica.bnf.fr/.../f1/full/full/0/native.jpg', thumbnailUrl: 'x', audioUrl: 'y' }],
    });
    (fetchPageImage as jest.Mock).mockResolvedValue({ bytes: Buffer.from([1]), contentType: 'image/jpeg' });
    (uploadServerFetchedAsset as jest.Mock).mockResolvedValue('https://spaces.example/course-slides/teacher-1/x.jpg');

    const lessonFindUnique = jest.fn().mockResolvedValue({ id: 'lesson-1', contentType: 'SLIDES', section: { courseId: 'course-1' } });
    const courseFindUnique = jest.fn().mockResolvedValue({ id: 'course-1', teacherProfile: { userId: 'teacher-1' } });
    const slideCreate = jest.fn().mockResolvedValue({ id: 'slide-1' });
    const prisma = fakePrisma({
      lesson: { findUnique: lessonFindUnique },
      course: { findUnique: courseFindUnique },
      libraryItem: { findUnique: jest.fn().mockResolvedValue(libraryItemFixture) },
      lessonSlide: { aggregate: jest.fn().mockResolvedValue({ _max: { order: null } }), create: slideCreate },
    });

    await bnfResolvers.Mutation.importBnfSlide(null, { lessonId: 'lesson-1', libraryItemId: 'library-item-1', page: 1 }, {
      prisma,
      user: teacherUser,
    } as any);

    expect(slideCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        lessonId: 'lesson-1',
        fileUrl: 'https://spaces.example/course-slides/teacher-1/x.jpg',
        sourceUrl: 'https://gallica.bnf.fr/ark:/12148/bpt6k11767775',
        attribution: expect.stringContaining('Bibliothèque nationale de France'),
      }),
    });
  });

  it('rejects importBnfSlide for a non-SLIDES lesson even with the license configured', async () => {
    (bnfCommercialReuseConfigured as jest.Mock).mockReturnValue(true);
    const prisma = fakePrisma({
      lesson: { findUnique: jest.fn().mockResolvedValue({ id: 'lesson-1', contentType: 'VIDEO', section: { courseId: 'course-1' } }) },
      course: { findUnique: jest.fn().mockResolvedValue({ id: 'course-1', teacherProfile: { userId: 'teacher-1' } }) },
    });

    await expect(
      bnfResolvers.Mutation.importBnfSlide(null, { lessonId: 'lesson-1', libraryItemId: 'library-item-1', page: 1 }, {
        prisma,
        user: teacherUser,
      } as any),
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });

  it("rejects importBnfSlide when the caller doesn't own the lesson's course", async () => {
    (bnfCommercialReuseConfigured as jest.Mock).mockReturnValue(true);
    const prisma = fakePrisma({
      lesson: { findUnique: jest.fn().mockResolvedValue({ id: 'lesson-1', contentType: 'SLIDES', section: { courseId: 'course-1' } }) },
      course: { findUnique: jest.fn().mockResolvedValue({ id: 'course-1', teacherProfile: { userId: 'someone-else' } }) },
    });

    await expect(
      bnfResolvers.Mutation.importBnfSlide(null, { lessonId: 'lesson-1', libraryItemId: 'library-item-1', page: 1 }, {
        prisma,
        user: teacherUser,
      } as any),
    ).rejects.toMatchObject({ extensions: { code: 'FORBIDDEN' } });
  });

  it('rejects importBnfSlide when the library item does not exist', async () => {
    (bnfCommercialReuseConfigured as jest.Mock).mockReturnValue(true);
    const prisma = fakePrisma({
      lesson: { findUnique: jest.fn().mockResolvedValue({ id: 'lesson-1', contentType: 'SLIDES', section: { courseId: 'course-1' } }) },
      course: { findUnique: jest.fn().mockResolvedValue({ id: 'course-1', teacherProfile: { userId: 'teacher-1' } }) },
      libraryItem: { findUnique: jest.fn().mockResolvedValue(null) },
    });

    await expect(
      bnfResolvers.Mutation.importBnfSlide(null, { lessonId: 'lesson-1', libraryItemId: 'missing', page: 1 }, {
        prisma,
        user: teacherUser,
      } as any),
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });
});
