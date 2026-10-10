// Same DATABASE_URL construction as apps/api/src/index.ts configureDatabaseUrl().
if (!process.env.DATABASE_URL) {
  const e = process.env;
  const query = new URLSearchParams({ schema: 'public', sslmode: e.PGSSLMODE ?? 'verify-full', sslrootcert: e.PGSSLROOTCERT ?? '/etc/postgres-ca/ca.crt' });
  process.env.DATABASE_URL = `postgresql://${encodeURIComponent(e.PGUSER)}:${encodeURIComponent(e.PGPASSWORD)}@${e.PGHOST}:${e.PGPORT}/${encodeURIComponent(e.PGDATABASE)}?${query}`;
}
// Creates (or rebuilds) the composer courses from rendered manifests.
// Usage: node seedCourses.mjs <dir-with-course-folders> <teacherProfileId>
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
const { createRequire } = await import('module');
const { PrismaClient } = createRequire('/app/apps/api/package.json')('@prisma/client');
const { uploadServerFetchedAsset } = await import('/app/dist/lib/storage.js');

const [root, teacherProfileId] = process.argv.slice(2);
const prisma = new PrismaClient();
const teacher = await prisma.teacherProfile.findUnique({ where: { id: teacherProfileId }, select: { id: true, userId: true } });
if (!teacher) throw new Error('Teacher profile not found');

const category = await prisma.category.upsert({
  where: { slug: 'music-history' },
  create: { name: 'Music History', slug: 'music-history' },
  update: {},
});

async function upload(dir, file) {
  return uploadServerFetchedAsset('COURSE_SLIDE', teacher.userId, readFileSync(join(dir, file)), 'image/png', file);
}

for (const folder of readdirSync(root)) {
  const dir = join(root, folder);
  const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
  const info = manifest.course;
  const existing = await prisma.course.findUnique({ where: { slug: info.slug }, include: { _count: { select: { enrollments: true } } } });
  if (existing && existing._count.enrollments > 0 && process.env.FORCE !== '1') {
    console.log(`${info.slug}: has enrollments - left unchanged`);
    continue;
  }
  if (existing) {
    await prisma.lesson.deleteMany({ where: { section: { courseId: existing.id } } });
    await prisma.courseSection.deleteMany({ where: { courseId: existing.id } });
  }
  const thumbnailUrl = await upload(dir, manifest.cover);
  const data = {
    title: info.title,
    description: info.description,
    shortSummary: info.shortSummary,
    level: info.level,
    instruments: info.instruments,
    musicStyles: info.musicStyles,
    price: 10,
    currency: 'CHF',
    status: 'PUBLISHED',
    isFreeTier: false,
    // English originals key their editions by their own slug; a German or
    // French module names its original in COURSE.translationOf.
    language: info.language ?? 'en',
    translationKey: info.translationOf ?? info.slug,
    thumbnailUrl,
    categoryId: category.id,
    teacherProfileId: teacher.id,
  };
  const course = existing
    ? await prisma.course.update({ where: { id: existing.id }, data })
    : await prisma.course.create({ data: { slug: info.slug, ...data } });

  let lessons = 0, slides = 0, questions = 0, refs = 0;
  for (const [w, week] of manifest.weeks.entries()) {
    const section = await prisma.courseSection.create({ data: { courseId: course.id, title: week.title, order: w } });
    for (const [l, lesson] of week.lessons.entries()) {
      // An audio lesson can play a Library recording: our own copy once the
      // mirror has it, the openly licensed source file until then.
      let videoUrl = lesson.video ?? null;
      if (lesson.libraryAudio) {
        const [itemId, index] = lesson.libraryAudio;
        const item = await prisma.libraryItem.findUnique({ where: { id: itemId }, select: { files: true, mirroredAt: true } });
        const file = Array.isArray(item?.files) ? item.files[index] : null;
        if (!file) throw new Error(`Library audio ${itemId}#${index} not found (${lesson.title})`);
        videoUrl = item.mirroredAt ? `https://mymusic.coach/api/library/items/${itemId}/files/${index}.audio` : file.sourceUrl;
      }
      const created = await prisma.lesson.create({
        data: {
          sectionId: section.id,
          title: lesson.title,
          description: lesson.description,
          contentType: lesson.type,
          videoUrl,
          duration: lesson.minutes ?? null,
          order: l,
          xpReward: lesson.xp ?? 10,
          isPreview: Boolean(lesson.preview),
        },
      });
      lessons += 1;
      for (const [s, slide] of (lesson.slides ?? []).entries()) {
        await prisma.lessonSlide.create({ data: { lessonId: created.id, fileUrl: await upload(dir, slide.file), title: slide.title || null, order: s } });
        slides += 1;
      }
      for (const [q, [text, options, correct]] of (lesson.quiz ?? []).entries()) {
        await prisma.quizQuestion.create({
          data: {
            lessonId: created.id, text, type: 'SINGLE_CHOICE', points: 1, order: q,
            options: { create: options.map((option, index) => ({ text: option, isCorrect: index === correct, order: index })) },
          },
        });
        questions += 1;
      }
      for (const [r, [itemId, note]] of (lesson.library ?? []).entries()) {
        const item = await prisma.libraryItem.findUnique({ where: { id: itemId }, select: { id: true, hiddenAt: true } });
        if (!item || item.hiddenAt) { console.log(`  missing library item ${itemId} (${lesson.title})`); continue; }
        await prisma.lessonLibraryReference.create({ data: { lessonId: created.id, itemId, note, order: r } });
        refs += 1;
      }
    }
  }
  console.log(`${info.slug}: ${existing ? 'rebuilt' : 'created'} - ${lessons} lessons, ${slides} slides, ${questions} quiz questions, ${refs} library references (id ${course.id})`);
}
await prisma.$disconnect();
process.exit(0);
