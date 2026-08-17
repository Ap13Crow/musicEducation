export const APP_ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;

export type AppRole = (typeof APP_ROLES)[number];

const APP_ROLE_SET = new Set<string>(APP_ROLES);
const ROLE_PRIORITY: AppRole[] = ['ADMIN', 'TEACHER', 'STUDENT'];

export function normalizeRoles(roles: unknown): AppRole[] {
  if (!Array.isArray(roles)) return [];

  return Array.from(
    new Set(
      roles
        .filter((role): role is string => typeof role === 'string')
        .map((role) => role.toUpperCase())
        .filter((role): role is AppRole => APP_ROLE_SET.has(role)),
    ),
  );
}

export function hasRole(roles: readonly AppRole[] | undefined, ...allowed: AppRole[]): boolean {
  return Boolean(roles?.some((role) => allowed.includes(role)));
}

export function primaryRole(roles: readonly AppRole[] | undefined): AppRole {
  return ROLE_PRIORITY.find((role) => roles?.includes(role)) ?? 'STUDENT';
}

export function roleLabel(role: AppRole): string {
  if (role === 'ADMIN') return 'Administrator';
  if (role === 'TEACHER') return 'Teacher';
  return 'Student';
}
