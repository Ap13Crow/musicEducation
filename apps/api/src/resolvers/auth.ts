import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { signAccessToken, signRefreshToken, requireAuth, requireRole } from '../middleware/auth.js';
import type { GraphQLContext } from '../types.js';

export const authResolvers = {
  Mutation: {
    async register(_: unknown, { input }: any, { prisma }: GraphQLContext) {
      const { email, username, displayName, password } = input;

      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) throw new GraphQLError('Email already in use.', { extensions: { code: 'BAD_USER_INPUT' } });

      const existingUsername = await prisma.user.findUnique({ where: { username } });
      if (existingUsername) throw new GraphQLError('Username already taken.', { extensions: { code: 'BAD_USER_INPUT' } });

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await prisma.user.create({
        data: {
          email,
          username,
          displayName,
          // Store hash in a secure field — in production use a separate credentials table
          // For brevity, we store in a JSON profile annotation
          profile: {
            create: {
              onboardingDone: false,
              onboardingStep: 0,
            },
          },
          gamification: { create: {} },
        },
        include: { profile: true, gamification: true },
      });

      // TODO: store passwordHash securely (separate credentials model or provider)
      // For now, we rely on OIDC for production auth

      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken(user.id);

      return { accessToken, refreshToken, user };
    },

    async login(_: unknown, { email, password }: any, { prisma }: GraphQLContext) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new GraphQLError('Invalid credentials.', { extensions: { code: 'UNAUTHENTICATED' } });

      // TODO: compare stored hash (requires credentials model)
      // For scaffolding purposes: production uses OIDC/SAML
      const accessToken = signAccessToken({ sub: user.id, role: user.role });
      const refreshToken = signRefreshToken(user.id);
      return { accessToken, refreshToken, user };
    },

    async logout() {
      // Stateless JWT — client discards tokens.
      // Optionally invalidate refresh token in Redis here.
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
      // Send email with reset token — stub
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return true; // do not reveal existence
      // TODO: generate token, store in Redis, send email
      return true;
    },

    async resetPassword(_: unknown, { token: _token, newPassword: _pw }: any) {
      // TODO: validate token from Redis, update password hash
      return true;
    },

    async verifyEmail(_: unknown, { token: _token }: any) {
      // TODO: validate token, set isEmailVerified = true
      return true;
    },
  },
};
