import crypto from 'crypto';
import { GraphQLError } from 'graphql';
import { requireAuth } from '../middleware/auth.js';
import { isProviderConfigured } from '../lib/externalCalendar.js';
import type { GraphQLContext } from '../types.js';

export const externalCalendarResolvers = {
  Query: {
    async myExternalCalendarConnections(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      return prisma.externalCalendarConnection.findMany({ where: { userId: user.id }, orderBy: { provider: 'asc' } });
    },

    // Null until rotateCalendarFeedToken has been called once - the web
    // page treats null as "not yet enabled" and shows a "Get my link"
    // button rather than a broken/empty URL.
    async myCalendarFeedToken(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const record = await prisma.user.findUnique({ where: { id: user.id }, select: { calendarFeedToken: true } });
      return record?.calendarFeedToken ?? null;
    },
  },

  Mutation: {
    // Always rejects today - see lib/externalCalendar.ts's file header for
    // why this is deliberate rather than a stub bug: there is no
    // GOOGLE_CALENDAR_CLIENT_ID/MICROSOFT_CALENDAR_CLIENT_ID configured
    // anywhere, so there is no OAuth flow to actually start.
    async connectExternalCalendar(_: unknown, { provider }: any, { user }: GraphQLContext) {
      requireAuth(user);
      if (!isProviderConfigured(provider)) {
        throw new GraphQLError(
          `${provider} calendar sync is not configured on this server yet. Use your personal calendar subscription link instead.`,
          { extensions: { code: 'NOT_CONFIGURED' } },
        );
      }
      // Unreachable while isProviderConfigured() can never return true (see
      // above) - left in place as the shape a real OAuth-callback handler
      // would fill in (exchange code, upsert ExternalCalendarConnection).
      throw new GraphQLError('Calendar sync connection is not implemented yet.', { extensions: { code: 'NOT_IMPLEMENTED' } });
    },

    async disconnectExternalCalendar(_: unknown, { provider }: any, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      await prisma.externalCalendarConnection.deleteMany({ where: { userId: user.id, provider } });
      return true;
    },

    // Get-or-rotate: creates the token on first call, replaces it on every
    // subsequent call so a previously shared feed URL can be invalidated.
    // Returns the bare token - the web page composes the full
    // https:// / webcal:// URL itself (it knows its own public origin;
    // the API doesn't need to).
    async rotateCalendarFeedToken(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireAuth(user);
      const token = crypto.randomBytes(24).toString('base64url');
      await prisma.user.update({ where: { id: user.id }, data: { calendarFeedToken: token } });
      return token;
    },
  },
};
