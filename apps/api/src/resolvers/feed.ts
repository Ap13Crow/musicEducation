import { requireAuth } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const feedResolvers = {
  Query: {
    async feed(_: unknown, { page = 1, limit = 20 }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const skip = (page - 1) * limit;

      // Show posts from users that the current user follows + own posts
      const followedIds = await prisma.follow.findMany({
        where: { followerId: user.id },
        select: { followingId: true },
      }).then((f) => f.map((x) => x.followingId));

      const authorIds = [...followedIds, user.id];
      const where = { authorId: { in: authorIds } };

      const [nodes, totalCount] = await Promise.all([
        prisma.feedPost.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
        prisma.feedPost.count({ where }),
      ]);

      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },

    async feedPost(_: unknown, { id }: any, { prisma }: GraphQLContext) {
      return prisma.feedPost.findUnique({ where: { id } });
    },
  },

  Mutation: {
    async createFeedPost(_: unknown, { input }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.feedPost.create({ data: { ...input, authorId: user.id } });
    },

    async likeFeedPost(_: unknown, { postId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);

      // Check whether the like already existed before the upsert
      const existing = await prisma.feedLike.findUnique({
        where: { userId_postId: { userId: user.id, postId } },
      });

      await prisma.feedLike.upsert({
        where: { userId_postId: { userId: user.id, postId } },
        update: {},
        create: { userId: user.id, postId },
      });

      // Only increment the counter when a new like was created (not on a no-op update)
      if (!existing) {
        return prisma.feedPost.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        });
      }
      return prisma.feedPost.findUniqueOrThrow({ where: { id: postId } });
    },

    async unlikeFeedPost(_: unknown, { postId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);

      const deleted = await prisma.feedLike.deleteMany({ where: { userId: user.id, postId } });

      // Only decrement when a record was actually deleted to avoid negative counts
      if (deleted.count > 0) {
        return prisma.feedPost.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        });
      }
      return prisma.feedPost.findUniqueOrThrow({ where: { id: postId } });
    },

    async commentOnPost(_: unknown, { postId, body }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.feedComment.create({ data: { postId, authorId: user.id, body } });
    },

    async followUser(_: unknown, { userId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      if (userId === user.id) throw new Error('Cannot follow yourself.');
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: user.id, followingId: userId } },
        update: {},
        create: { followerId: user.id, followingId: userId },
      });
      return prisma.user.findUniqueOrThrow({ where: { id: userId } });
    },

    async unfollowUser(_: unknown, { userId }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      await prisma.follow.deleteMany({ where: { followerId: user.id, followingId: userId } });
      return prisma.user.findUniqueOrThrow({ where: { id: userId } });
    },
  },

  FeedPost: {
    async author(post: any, _: unknown, { prisma }: GraphQLContext) {
      return prisma.user.findUnique({ where: { id: post.authorId } });
    },
    async isLikedByMe(post: any, _: unknown, { prisma, user }: GraphQLContext) {
      if (!user) return false;
      const like = await prisma.feedLike.findUnique({
        where: { userId_postId: { userId: user.id, postId: post.id } },
      });
      return !!like;
    },
    async comments(post: any, { page = 1, limit = 10 }: any, { prisma }: GraphQLContext) {
      const skip = (page - 1) * limit;
      const where = { postId: post.id };
      const [nodes, totalCount] = await Promise.all([
        prisma.feedComment.findMany({ where, skip, take: limit, orderBy: { createdAt: 'asc' } }),
        prisma.feedComment.count({ where }),
      ]);
      return { nodes, pageInfo: { hasNextPage: skip + nodes.length < totalCount, hasPreviousPage: page > 1, totalCount } };
    },
    mediaUrls(post: any) {
      return post.mediaUrls ?? [];
    },
  },
};
