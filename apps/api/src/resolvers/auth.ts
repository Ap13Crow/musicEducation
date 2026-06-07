import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { signAccessToken, signRefreshToken } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const authResolvers = {
  Mutation: {
    async register(_: unknown, { input }: any, { prisma }: GraphQLContext) {
      const { email, displayName, password } = input;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new GraphQLError('Email already in use.', { extensions: { code: 'BAD_USER_INPUT' } });

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          credential: { create: { passwordHash } },
          profile: { create: { displayName, onboardingDone: false } },
          gamification: { create: {} },
        },
        include: { profile: true, gamification: true },
      });

      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken(user.id);
      return { accessToken, refreshToken, user };
    },

    async login(_: unknown, { email, password }: any, { prisma }: GraphQLContext) {
      const user = await prisma.user.findUnique({ where: { email }, include: { credential: true } });
      const invalidErr = new GraphQLError('Invalid credentials.', { extensions: { code: 'UNAUTHENTICATED' } });
      if (!user) throw invalidErr;

      if (!user.credential?.passwordHash) {
        throw new GraphQLError('Please sign in with your identity provider.', { extensions: { code: 'UNAUTHENTICATED' } });
      }
      const valid = await bcrypt.compare(password, user.credential.passwordHash);
      if (!valid) throw invalidErr;

      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken(user.id);
      return { accessToken, refreshToken, user };
    },

    async logout() {
      return true;
    },

    async refreshToken(_: unknown, { token }: any, { prisma }: GraphQLContext) {
      const { verifyToken } = await import('../middleware/auth.js');
      const payload = verifyToken(token);
      if (!payload) throw new GraphQLError('Invalid or expired token.', { extensions: { code: 'UNAUTHENTICATED' } });
      const user = await prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new GraphQLError('User not found.', { extensions: { code: 'UNAUTHENTICATED' } });
      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken(user.id);
      return { accessToken, refreshToken, user };
    },

    async requestPasswordReset(_: unknown, { email }: any, { prisma }: GraphQLContext) {
      await prisma.user.findUnique({ where: { email } }); // check exists but don't reveal
      return true;
    },

    async resetPassword(_: unknown, { token: _token, newPassword: _pw }: any) {
      // TODO: validate token from Redis, update password hash
      return true;
    },

    async verifyEmail(_: unknown, { token: _token }: any) {
      // TODO: validate token, set emailVerified = true
      return true;
    },
  },
};
