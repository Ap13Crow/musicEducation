import { GraphQLError } from 'graphql';
import { requireAuth, requireRole } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';
import { MoodleAdapter } from '../integrations/adapters/moodle.js';

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

    async categories(_: unknown, __: unknown, { prisma }: GraphQLContext) {
      return prisma.category.findMany({ where: { parentId: null }, include: { children: true } });
    },
  },

  Mutation: {
    async createCourse(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      const teacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user!.id } });
      if (!teacherProfile) throw new GraphQLError('Teacher profile required.', { extensions: { code: 'BAD_USER_INPUT' } });

      const slug = input.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
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
      const course = await prisma.course.findUnique({ where: { id } });
      if (!course) throw new GraphQLError('Course not found.', { extensions: { code: 'NOT_FOUND' } });
      return prisma.course.update({ where: { id }, data: input });
    },

    async publishCourse(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return prisma.course.update({ where: { id }, data: { status: 'PUBLISHED' } });
    },

    async archiveCourse(_: unknown, { id }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return prisma.course.update({ where: { id }, data: { status: 'ARCHIVED' } });
    },

    async createSection(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return prisma.courseSection.create({ data: input });
    },

    async createLesson(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'TEACHER', 'ADMIN');
      return prisma.lesson.create({ data: input });
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

    async syncCoursesFromMoodle(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const moodleUrl = process.env.MOODLE_URL;
      const moodleToken = process.env.MOODLE_WS_TOKEN;
      if (!moodleUrl || !moodleToken) {
        throw new GraphQLError('Moodle integration not configured.', { extensions: { code: 'BAD_CONFIGURATION' } });
      }
      const moodle = new MoodleAdapter(moodleUrl, moodleToken);
      const moodleCourses = await moodle.listCourses();

      let created = 0;
      let skipped = 0;
      const coursesToImport = moodleCourses.filter((c: any) => c.id !== 1); // skip site-level course

      for (const mc of coursesToImport) {
        const existing = await prisma.course.findFirst({ where: { moodleCourseId: mc.id } });
        if (existing) { skipped++; continue; }

        const slug = mc.shortname.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + mc.id;
        const slugConflict = await prisma.course.findUnique({ where: { slug } });

        await prisma.course.create({
          data: {
            title: mc.fullname,
            slug: slugConflict ? slug + '-moodle' : slug,
            moodleCourseId: mc.id,
            status: 'DRAFT',
            instruments: [],
            musicStyles: [],
          },
        });
        created++;
      }

      return { created, skipped, total: coursesToImport.length };
    },

    async markLessonComplete(_: unknown, { lessonId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      // Find enrollment for this lesson
      const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { section: { include: { course: true } } } });
      if (!lesson) throw new GraphQLError('Lesson not found.', { extensions: { code: 'NOT_FOUND' } });

      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: lesson.section.courseId } },
      });
      if (!enrollment) throw new GraphQLError('Not enrolled in this course.', { extensions: { code: 'FORBIDDEN' } });

      const progress = await prisma.lessonProgress.upsert({
        where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
        update: { completedAt: new Date() },
        create: { enrollmentId: enrollment.id, lessonId, completedAt: new Date() },
      });

      // Recalculate course progress
      const totalLessons = await prisma.lesson.count({ where: { section: { courseId: lesson.section.courseId } } });
      const completedLessons = await prisma.lessonProgress.count({
        where: { enrollmentId: enrollment.id, completedAt: { not: null } },
      });
      const progressPct = totalLessons > 0 ? completedLessons / totalLessons : 0;
      await prisma.enrollment.update({ where: { id: enrollment.id }, data: { progress: progressPct, completedAt: progressPct >= 1 ? new Date() : null } });

      // Award XP
      await prisma.gamificationProfile.update({
        where: { userId: user.id },
        data: { xp: { increment: lesson.xpReward }, totalPoints: { increment: lesson.xpReward } },
      });

      return progress;
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
  },

  CourseSection: {
    async lessons(section: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.lesson.findMany({ where: { sectionId: section.id }, orderBy: { order: 'asc' } });
    },
  },
};
