import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { isOwnedUploadUrl } from '../lib/storage.js';
import type { GraphQLContext } from '../types.js';

export async function requireOwnedCourse(prisma: any, user: any, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { teacherProfile: true } });
  if (!course) throw new GraphQLError('Course not found.', { extensions: { code: 'NOT_FOUND' } });
  if (user.role !== 'ADMIN' && course.teacherProfile?.userId !== user.id) throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
  return course;
}

// Shared by Lesson.videoUrl, Lesson.quizQuestions, and QuizQuestion.correctOptionIds:
// a lesson is viewable if it's a free preview, the caller owns (or admins) the
// course, or the caller is enrolled. `isOwner` additionally gates content only
// the course's teacher/an admin should see, such as a quiz's answer key.
export async function resolveLessonAccess(
  prisma: any,
  user: any,
  lesson: any,
): Promise<{ allowed: boolean; isOwner: boolean }> {
  if (user?.role === 'ADMIN') return { allowed: true, isOwner: true };

  let section: any = null;
  if (user) {
    section = await prisma.courseSection.findUnique({
      where: { id: lesson.sectionId },
      include: { course: { include: { teacherProfile: true } } },
    });
    if (section?.course.teacherProfile?.userId === user.id) return { allowed: true, isOwner: true };
  }

  if (lesson.isPreview) return { allowed: true, isOwner: false };
  if (!user || !section) return { allowed: false, isOwner: false };

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: section.courseId } },
  });
  return { allowed: Boolean(enrollment), isOwner: false };
}

// Shared by markLessonComplete and completeQuizAttempt: recomputes course
// progress and awards XP. XP is only granted the first time a lesson is
// completed, so retaking a quiz (or re-marking a video watched) can't
// inflate a student's XP on every attempt.
export async function completeLessonForUser(prisma: any, userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { section: { include: { course: true } } } });
  if (!lesson) throw new GraphQLError('Lesson not found.', { extensions: { code: 'NOT_FOUND' } });

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId: lesson.section.courseId } },
  });
  if (!enrollment) throw new GraphQLError('Not enrolled in this course.', { extensions: { code: 'FORBIDDEN' } });

  const existing = await prisma.lessonProgress.findUnique({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
  });
  const alreadyCompleted = Boolean(existing?.completedAt);

  const progress = await prisma.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    update: { completedAt: new Date() },
    create: { enrollmentId: enrollment.id, lessonId, completedAt: new Date() },
  });

  const totalLessons = await prisma.lesson.count({ where: { section: { courseId: lesson.section.courseId } } });
  const completedLessons = await prisma.lessonProgress.count({
    where: { enrollmentId: enrollment.id, completedAt: { not: null } },
  });
  const progressPct = totalLessons > 0 ? completedLessons / totalLessons : 0;
  await prisma.enrollment.update({ where: { id: enrollment.id }, data: { progress: progressPct, completedAt: progressPct >= 1 ? new Date() : null } });

  if (!alreadyCompleted) {
    await prisma.gamificationProfile.update({
      where: { userId },
      data: { xp: { increment: lesson.xpReward }, totalPoints: { increment: lesson.xpReward } },
    });
  }

  return progress;
}

export const courseResolvers = {
  Query: {
    async courses(_: unknown, { filter, page = 1, limit = 20 }: any, { prisma, user }: GraphQLContext) {
      const where: any = {};

      // Guests can only see published, free-tier courses
      if (!user) {
        where.status = 'PUBLISHED';
        where.isFreeTier = true;
      } else {
        where.status = 'PUBLISHED';
      }

      if (filter) {
        if (filter.level) where.level = filter.level;
        if (filter.instrument) where.instruments = { has: filter.instrument };
        if (filter.musicStyle) where.musicStyles = { has: filter.musicStyle };
        if (filter.categoryId) where.categoryId = filter.categoryId;
        if (filter.teacherProfileId) where.teacherProfileId = filter.teacherProfileId;
        if (filter.isFreeTier !== undefined) where.isFreeTier = filter.isFreeTier;
        if (filter.language) where.language = filter.language;
        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
          where.price = {};
          if (filter.minPrice !== undefined) where.price.gte = filter.minPrice;
          if (filter.maxPrice !== undefined) where.price.lte = filter.maxPrice;
        }
        if (filter.search) {
          where.OR = [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { description: { contains: filter.search, mode: 'insensitive' } },
          ];
        }
      }

      const skip = (page - 1) * limit;
      const [nodes, totalCount] = await Promise.all([
        prisma.course.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.course.count({ where }),
      ]);

      return {
        nodes,
        pageInfo: {
          hasNextPage: skip + nodes.length < totalCount,
          hasPreviousPage: page > 1,
          totalCount,
        },
      };
    },

    async course(_: unknown, { id, slug }: any, { prisma, user }: GraphQLContext) {
      const where = id ? { id } : { slug };
      const course = await prisma.course.findUnique({ where, include: { sections: { include: { lessons: true } } } });
      if (!course) throw new GraphQLError('Course not found.', { extensions: { code: 'NOT_FOUND' } });
      if (course.status !== 'PUBLISHED' && !user) {
        throw new GraphQLError('Course not available.', { extensions: { code: 'FORBIDDEN' } });
      }
      return course;
    },

    async myCourses(_: unknown, { page = 1, limit = 20 }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const skip = (page - 1) * limit;
      const where = { teacherProfile: { userId: user!.id } };
      const [nodes, totalCount] = await Promise.all([
        prisma.course.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.course.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },

    async myEnrollments(_: unknown, { page = 1, limit = 20 }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const skip = (page - 1) * limit;
      const where = { userId: user.id };
      const [nodes, totalCount] = await Promise.all([
        prisma.enrollment.findMany({ where, skip, take: limit, include: { course: true } }),
        prisma.enrollment.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },

    async myEnrollment(_: unknown, { courseId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId } } });
    },

    async courseEnrollments(_: unknown, { courseId, page = 1, limit = 50 }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      await requireOwnedCourse(prisma, user!, courseId);
      // Same clamping as externalEvents in discovery.ts: an unbounded limit
      // (or a negative/zero page) turned directly into skip/take is an easy
      // way to force an expensive query.
      const safeLimit = Math.max(1, Math.min(limit, 100));
      const safePage = Math.max(1, page);
      const skip = (safePage - 1) * safeLimit;
      const where = { courseId };
      const [nodes, totalCount] = await Promise.all([
        prisma.enrollment.findMany({
          where, skip, take: safeLimit,
          orderBy: { createdAt: 'asc' },
          include: { user: { include: { profile: true } } },
        }),
        prisma.enrollment.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: safePage > 1, totalCount } };
    },

    async categories(_: unknown, __: unknown, { prisma }: GraphQLContext) {
      return prisma.category.findMany({ where: { parentId: null }, include: { children: true } });
    },
  },

  Mutation: {
    async createCourse(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
      if (!teacherProfile) throw new GraphQLError('Teacher profile required.', { extensions: { code: 'BAD_USER_INPUT' } });

      const baseSlug = input.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/^-|-$/g, '') || 'course';
      let slug = baseSlug;
      let suffix = 2;
      while (await prisma.course.findUnique({ where: { slug }, select: { id: true } })) slug = `${baseSlug}-${suffix++}`;
      return prisma.course.create({
        data: {
          ...input,
          slug,
          teacherProfileId: teacherProfile.id,
        },
      });
    },

    async updateCourse(_: unknown, { id, input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const course = await prisma.course.findUnique({ where: { id }, include: { teacherProfile: true } });
      if (!course) throw new GraphQLError('Course not found.', { extensions: { code: 'NOT_FOUND' } });
      if (user!.role !== 'ADMIN' && course.teacherProfile?.userId !== user!.id) {
        throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      }
      return prisma.course.update({ where: { id }, data: input });
    },

    async publishCourse(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const course = await prisma.course.findUnique({ where: { id }, include: { teacherProfile: true } });
      if (!course) throw new GraphQLError('Course not found.', { extensions: { code: 'NOT_FOUND' } });
      if (user!.role !== 'ADMIN' && course.teacherProfile?.userId !== user!.id) {
        throw new GraphQLError('Access denied.', { extensions: { code: 'FORBIDDEN' } });
      }
      return prisma.course.update({ where: { id }, data: { status: 'PUBLISHED' } });
    },

    async archiveCourse(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return prisma.course.update({ where: { id }, data: { status: 'ARCHIVED' } });
    },

    async createSection(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      await requireOwnedCourse(prisma, user!, input.courseId);
      return prisma.courseSection.create({ data: input });
    },

    async updateSection(_: unknown, { id, input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const section = await prisma.courseSection.findUnique({ where: { id } });
      if (!section) throw new GraphQLError('Section not found.', { extensions: { code: 'NOT_FOUND' } });
      await requireOwnedCourse(prisma, user!, section.courseId);
      return prisma.courseSection.update({ where: { id }, data: input });
    },

    async deleteSection(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const section = await prisma.courseSection.findUnique({ where: { id } });
      if (!section) return true;
      await requireOwnedCourse(prisma, user!, section.courseId);
      await prisma.$transaction([prisma.lesson.deleteMany({ where: { sectionId: id } }), prisma.courseSection.delete({ where: { id } })]);
      return true;
    },

    async createLesson(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const section = await prisma.courseSection.findUnique({ where: { id: input.sectionId } });
      if (!section) throw new GraphQLError('Section not found.', { extensions: { code: 'NOT_FOUND' } });
      await requireOwnedCourse(prisma, user!, section.courseId);
      const { durationMin, isFreePreview, ...data } = input;
      return prisma.lesson.create({ data: { ...data, duration: durationMin, isPreview: isFreePreview } });
    },

    async updateLesson(_: unknown, { id, input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const lesson = await prisma.lesson.findUnique({ where: { id }, include: { section: true } });
      if (!lesson) throw new GraphQLError('Lesson not found.', { extensions: { code: 'NOT_FOUND' } });
      await requireOwnedCourse(prisma, user!, lesson.section.courseId);
      const { durationMin, isFreePreview, ...data } = input;
      return prisma.lesson.update({ where: { id }, data: { ...data, ...(durationMin !== undefined ? { duration: durationMin } : {}), ...(isFreePreview !== undefined ? { isPreview: isFreePreview } : {}) } });
    },

    async deleteLesson(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const lesson = await prisma.lesson.findUnique({ where: { id }, include: { section: true } });
      if (!lesson) return true;
      await requireOwnedCourse(prisma, user!, lesson.section.courseId);
      await prisma.lesson.delete({ where: { id } });
      return true;
    },

    async enrollInCourse(_: unknown, { courseId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (!course) throw new GraphQLError('Course not found.', { extensions: { code: 'NOT_FOUND' } });
      if (Number(course.price) > 0) {
        throw new GraphQLError('Please complete payment first.', { extensions: { code: 'PAYMENT_REQUIRED' } });
      }
      return prisma.enrollment.create({ data: { userId: user.id, courseId } });
    },

    async markLessonComplete(_: unknown, { lessonId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return completeLessonForUser(prisma, user.id, lessonId);
    },

    async addLessonSlide(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const lesson = await prisma.lesson.findUnique({ where: { id: input.lessonId }, include: { section: true } });
      if (!lesson) throw new GraphQLError('Lesson not found.', { extensions: { code: 'NOT_FOUND' } });
      await requireOwnedCourse(prisma, user!, lesson.section.courseId);
      if (!isOwnedUploadUrl(input.fileUrl, 'COURSE_SLIDE', user!.id)) {
        throw new GraphQLError('fileUrl must come from requestUploadUrl(purpose: COURSE_SLIDE).', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      // max(order)+1 rather than count(): count() reproduces an existing
      // order once a slide has been deleted from the middle (orders 0,2,3 ->
      // count()=3, but 3 is used again by a later insert), so two slides can
      // end up with the same order and the deck's sequence becomes unstable.
      const order =
        input.order ??
        ((await prisma.lessonSlide.aggregate({ where: { lessonId: input.lessonId }, _max: { order: true } }))._max.order ?? -1) + 1;
      return prisma.lessonSlide.create({
        data: { lessonId: input.lessonId, fileUrl: input.fileUrl, title: input.title ?? null, order },
      });
    },

    async reorderLessonSlides(_: unknown, { lessonId, slideIds }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { section: true } });
      if (!lesson) throw new GraphQLError('Lesson not found.', { extensions: { code: 'NOT_FOUND' } });
      await requireOwnedCourse(prisma, user!, lesson.section.courseId);
      const existing = await prisma.lessonSlide.findMany({ where: { lessonId } });
      const existingIds = new Set(existing.map((s: any) => s.id));
      if (slideIds.length !== existing.length || !slideIds.every((id: string) => existingIds.has(id))) {
        throw new GraphQLError("slideIds must be exactly this lesson's current slide set.", { extensions: { code: 'BAD_USER_INPUT' } });
      }
      await prisma.$transaction(
        slideIds.map((id: string, index: number) => prisma.lessonSlide.update({ where: { id }, data: { order: index } })),
      );
      return prisma.lessonSlide.findMany({ where: { lessonId }, orderBy: { order: 'asc' } });
    },

    async deleteLessonSlide(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const slide = await prisma.lessonSlide.findUnique({ where: { id }, include: { lesson: { include: { section: true } } } });
      if (!slide) return true;
      await requireOwnedCourse(prisma, user!, slide.lesson.section.courseId);
      await prisma.lessonSlide.delete({ where: { id } });
      return true;
    },

    // Idempotent: re-viewing an already-viewed slide upserts to the same
    // row rather than creating a duplicate or erroring.
    async viewLessonSlide(_: unknown, { slideId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const slide = await prisma.lessonSlide.findUnique({ where: { id: slideId }, include: { lesson: { include: { section: true } } } });
      if (!slide) throw new GraphQLError('Slide not found.', { extensions: { code: 'NOT_FOUND' } });
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: slide.lesson.section.courseId } },
      });
      if (!enrollment) throw new GraphQLError('Not enrolled in this course.', { extensions: { code: 'FORBIDDEN' } });
      await prisma.lessonSlideView.upsert({
        where: { enrollmentId_slideId: { enrollmentId: enrollment.id, slideId } },
        create: { enrollmentId: enrollment.id, slideId },
        update: {},
      });
      return true;
    },
  },

  Course: {
    async teacher(course: any, _: unknown, { prisma }: GraphQLContext) {
      if (!course.teacherProfileId) return null;
      return prisma.teacherProfile.findUnique({ where: { id: course.teacherProfileId } });
    },
    async category(course: any, _: unknown, { prisma }: GraphQLContext) {
      if (!course.categoryId) return null;
      return prisma.category.findUnique({ where: { id: course.categoryId } });
    },
    async sections(course: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.courseSection.findMany({ where: { courseId: course.id }, orderBy: { order: 'asc' } });
    },
    async reviews(course: any, { page = 1, limit = 10 }: any, { prisma }: GraphQLContext) {
      const skip = (page - 1) * limit;
      const where = { courseId: course.id, isPublic: true };
      const [nodes, totalCount] = await Promise.all([
        prisma.review.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.review.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },
    async totalEnrollments(course: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.enrollment.count({ where: { courseId: course.id } });
    },
    async totalDurationMin(course: any, _: unknown, { prisma }: GraphQLContext) {
      const lessons = await prisma.lesson.findMany({
        where: { section: { courseId: course.id } },
        select: { duration: true },
      });
      return lessons.reduce((sum: number, l: any) => sum + (l.duration ?? 0), 0);
    },
  },

  TeacherProfile: {
    async user(tp: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.user.findUnique({ where: { id: tp.userId } });
    },
  },

  Lesson: {
    durationMin: (lesson: any) => lesson.duration ?? 0,
    isFreePreview: (lesson: any) => lesson.isPreview ?? false,
    // The `course(slug)` query returns every lesson in the curriculum
    // regardless of enrollment (needed for the syllabus list), so without
    // this check the video URL for locked lessons leaked to anyone who
    // could see the course page at all — enrollment was only enforced by
    // the UI showing a lock icon, not by the API. Preview lessons stay
    // open; everything else requires enrollment, course ownership, or admin.
    async videoUrl(lesson: any, _: unknown, { prisma, user }: GraphQLContext) {
      const { allowed } = await resolveLessonAccess(prisma, user, lesson);
      return allowed ? lesson.videoUrl : null;
    },
    // Same gating as videoUrl - a locked lesson's quiz questions (and,
    // separately, their correct answers via QuizQuestion.correctOptionIds)
    // shouldn't be visible before enrollment either.
    async quizQuestions(lesson: any, _: unknown, { prisma, user }: GraphQLContext) {
      const { allowed } = await resolveLessonAccess(prisma, user, lesson);
      if (!allowed) return [];
      return prisma.quizQuestion.findMany({ where: { lessonId: lesson.id }, orderBy: { order: 'asc' } });
    },
    // Same gating as videoUrl/quizQuestions - a locked lesson's slide deck
    // shouldn't be visible before enrollment either. Every lesson in a
    // course's curriculum is queried through this field regardless of
    // contentType, so bail before any DB round trip for the video/audio/
    // youtube majority - only a SLIDES lesson can have slide rows at all.
    async slides(lesson: any, _: unknown, { prisma, user }: GraphQLContext) {
      if (lesson.contentType !== 'SLIDES') return [];
      const { allowed } = await resolveLessonAccess(prisma, user, lesson);
      if (!allowed) return [];
      return prisma.lessonSlide.findMany({ where: { lessonId: lesson.id }, orderBy: { order: 'asc' } });
    },
    async myViewedSlideIds(lesson: any, _: unknown, { prisma, user }: GraphQLContext) {
      if (lesson.contentType !== 'SLIDES' || !user) return [];
      const section = await prisma.courseSection.findUnique({ where: { id: lesson.sectionId } });
      if (!section) return [];
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: section.courseId } },
      });
      if (!enrollment) return [];
      const views = await prisma.lessonSlideView.findMany({
        where: { enrollmentId: enrollment.id, slide: { lessonId: lesson.id } },
        select: { slideId: true },
      });
      return views.map((v: any) => v.slideId);
    },
  },

  CourseSection: {
    async lessons(section: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.lesson.findMany({ where: { sectionId: section.id }, orderBy: { order: 'asc' } });
    },
  },

  Enrollment: {
    async lessonProgress(enrollment: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.lessonProgress.findMany({ where: { enrollmentId: enrollment.id } });
    },
    async user(enrollment: any, _: unknown, { prisma }: GraphQLContext) {
      if (enrollment.user) return enrollment.user;
      return prisma.user.findUnique({ where: { id: enrollment.userId }, include: { profile: true } });
    },
  },
};
