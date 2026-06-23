import axios from 'axios';
import { requireRole } from '../middleware/auth.js';
import { mapKeycloakRole } from '../middleware/keycloak.js';
import type { GraphQLContext } from '../types.js';
import { logger } from '../utils/logger.js';

export const adminResolvers = {
  Query: {
    async adminSettings(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      return prisma.adminSetting.findMany();
    },

    async adminStats(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const [totalUsers, totalTeachers, totalCourses, totalEvents, totalBookings, revenueAgg] =
        await Promise.all([
          prisma.user.count(),
          prisma.teacherProfile.count(),
          prisma.course.count(),
          prisma.event.count(),
          prisma.booking.count(),
          prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'SUCCEEDED' } }),
        ]);
      return {
        totalUsers,
        totalTeachers,
        totalCourses,
        totalEvents,
        totalBookings,
        totalRevenue: revenueAgg._sum.amount ?? 0,
      };
    },

    async adminUsers(_: unknown, { role, search, page = 1, limit = 50 }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const where: any = {};
      if (role) where.role = role;
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { displayName: { contains: search, mode: 'insensitive' } } },
        ];
      }
      return prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { profile: true },
      });
    },
  },

  Mutation: {
    async updateAdminSetting(_: unknown, { key, value }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      return prisma.adminSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    },

    // Schema name: adminSetRole
    async adminSetRole(_: unknown, { userId, role }: any, { prisma, user, libreBooking }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      const validRoles = ['STUDENT', 'TEACHER', 'ADMIN'];
      if (!validRoles.includes(role)) {
        throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
      }
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role },
        include: { profile: true },
      });

      // When a user becomes a teacher, provision them in LibreBooking so they
      // can manage their schedule immediately.
      if (role === 'TEACHER' && libreBooking) {
        const displayName = updated.profile?.displayName ?? updated.email.split('@')[0];
        const [firstName, ...rest] = displayName.split(' ');
        const lastName = rest.join(' ') || '-';
        const username = updated.email.split('@')[0].replace(/[^a-z0-9]/gi, '_').toLowerCase();
        libreBooking.createUser({
          email: updated.email,
          firstName,
          lastName,
          username,
          password: `KC_${userId.slice(0, 8)}!`, // token-based login in KC; password is a placeholder
        }).catch((err) => logger.warn(err, 'LibreBooking teacher provisioning failed (non-fatal)'));
      }

      return updated;
    },

    async syncKeycloakRoles(_: unknown, __: unknown, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');

      const adminUrl = process.env.KEYCLOAK_ADMIN_URL ?? 'http://keycloak:8080';
      const realm = process.env.KEYCLOAK_ADMIN_REALM ?? 'mymusic-coach';
      const adminUser = process.env.KEYCLOAK_ADMIN;
      const adminPass = process.env.KEYCLOAK_ADMIN_PASSWORD;

      if (!adminUser || !adminPass) {
        throw new Error('Keycloak admin credentials not configured (KEYCLOAK_ADMIN / KEYCLOAK_ADMIN_PASSWORD).');
      }

      // 1. Obtain short-lived admin token from master realm
      const tokenRes = await axios.post(
        `${adminUrl}/realms/master/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: adminUser,
          password: adminPass,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      const accessToken: string = tokenRes.data.access_token;
      const headers = { Authorization: `Bearer ${accessToken}` };

      // 2. Fetch all users in the realm (paginate up to 500)
      const usersRes = await axios.get(
        `${adminUrl}/admin/realms/${realm}/users?max=500`,
        { headers },
      );
      const kcUsers: Array<{ id: string; email?: string; realmRoles?: string[] }> = usersRes.data;

      let updated = 0;
      let skipped = 0;

      for (const kcu of kcUsers) {
        if (!kcu.email) { skipped++; continue; }

        // 3. Fetch effective realm roles for this user
        const rolesRes = await axios.get(
          `${adminUrl}/admin/realms/${realm}/users/${kcu.id}/role-mappings/realm`,
          { headers },
        );
        const roles: string[] = (rolesRes.data ?? []).map((r: { name: string }) => r.name);
        const fakeClaims = { sub: kcu.id, email: kcu.email, realm_access: { roles } };
        const platformRole = mapKeycloakRole(fakeClaims as any);

        // 4. Find local user by email; create if missing, update role if changed
        const localUser = await prisma.user.findUnique({ where: { email: kcu.email } });
        if (!localUser) { skipped++; continue; }

        if (localUser.role !== platformRole) {
          await prisma.user.update({ where: { id: localUser.id }, data: { role: platformRole } });
          updated++;
        } else {
          skipped++;
        }
      }

      return { created: updated, skipped, total: kcUsers.length };
    },

    // Schema name: adminBanUser — downgrades to STUDENT (minimum role; no hard-delete)
    async adminBanUser(_: unknown, { userId }: any, { prisma, user }: GraphQLContext) {
      requireRole(user, 'ADMIN');
      if (userId === user!.id) {
        throw new Error('Cannot ban your own account.');
      }
      return prisma.user.update({ where: { id: userId }, data: { role: 'STUDENT' }, include: { profile: true } });
    },
  },

  // Field resolvers on User that derive values not stored directly on the model.
  User: {
    // displayName lives on UserProfile; fall back to email prefix if no profile yet.
    displayName: (u: any) =>
      u.profile?.displayName ?? u.email?.split('@')[0] ?? 'Unknown',

    // username is not a separate DB field — use the email prefix as a stable handle.
    username: (u: any) => u.email?.split('@')[0] ?? u.id,

    // Prisma column is emailVerified; schema field is isEmailVerified.
    isEmailVerified: (u: any) => u.emailVerified ?? false,

    // avatarUrl comes from profile
    avatarUrl: (u: any) => u.profile?.avatarUrl ?? null,
  },
};
