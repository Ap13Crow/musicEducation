process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { mapKeycloakRole, provisionKeycloakUser, type KeycloakClaims } from '../middleware/keycloak';

describe('mapKeycloakRole', () => {
  it('maps the admin realm role to ADMIN', () => {
    expect(mapKeycloakRole({ sub: 'x', realm_access: { roles: ['offline_access', 'admin'] } })).toBe('ADMIN');
  });

  it('maps the teacher realm role to TEACHER', () => {
    expect(mapKeycloakRole({ sub: 'x', realm_access: { roles: ['teacher'] } })).toBe('TEACHER');
  });

  it('prefers ADMIN when both admin and teacher are present', () => {
    expect(mapKeycloakRole({ sub: 'x', realm_access: { roles: ['teacher', 'admin'] } })).toBe('ADMIN');
  });

  it('defaults to STUDENT when no privileged role is present', () => {
    expect(mapKeycloakRole({ sub: 'x', realm_access: { roles: ['uma_authorization'] } })).toBe('STUDENT');
    expect(mapKeycloakRole({ sub: 'x' })).toBe('STUDENT');
  });

  it('is case-insensitive', () => {
    expect(mapKeycloakRole({ sub: 'x', realm_access: { roles: ['ADMIN'] } })).toBe('ADMIN');
  });
});

/** Minimal in-memory Prisma test double for the calls provisionKeycloakUser makes. */
function makePrismaStub(initial: { identities?: any[]; users?: any[] } = {}) {
  const identities: any[] = initial.identities ?? [];
  const users: any[] = initial.users ?? [];
  return {
    _identities: identities,
    _users: users,
    userExternalIdentity: {
      findUnique: jest.fn(async ({ where }: any) => {
        const { provider, externalId } = where.provider_externalId;
        const found = identities.find((i) => i.provider === provider && i.externalId === externalId);
        if (!found) return null;
        return { ...found, user: users.find((u) => u.id === found.userId) };
      }),
      create: jest.fn(async ({ data }: any) => {
        identities.push(data);
        return data;
      }),
    },
    user: {
      findUnique: jest.fn(async ({ where }: any) => users.find((u) => u.email === where.email || u.id === where.id) ?? null),
      update: jest.fn(async ({ where, data }: any) => {
        const u = users.find((x) => x.id === where.id);
        Object.assign(u, data);
        return u;
      }),
      create: jest.fn(async ({ data }: any) => {
        const u = { id: `user-${users.length + 1}`, email: data.email, role: data.role };
        users.push(u);
        if (data.externalIdentities?.create) {
          identities.push({ userId: u.id, ...data.externalIdentities.create });
        }
        return u;
      }),
    },
  } as any;
}

const claims: KeycloakClaims = {
  sub: 'kc-123',
  email: 'student@example.com',
  email_verified: true,
  name: 'Test Student',
  realm_access: { roles: ['teacher'] },
};

describe('provisionKeycloakUser', () => {
  it('creates and links a new local user on first SSO login', async () => {
    const prisma = makePrismaStub();
    const result = await provisionKeycloakUser(prisma, claims);

    expect(result.email).toBe('student@example.com');
    expect(result.role).toBe('TEACHER');
    expect(prisma.user.create).toHaveBeenCalledTimes(1);
    // identity link created with the Keycloak sub
    expect(prisma._identities).toContainEqual(
      expect.objectContaining({ provider: 'keycloak', externalId: 'kc-123', userId: result.id }),
    );
  });

  it('returns the already-linked user without creating a new one', async () => {
    const prisma = makePrismaStub({
      users: [{ id: 'user-1', email: 'student@example.com', role: 'TEACHER' }],
      identities: [{ userId: 'user-1', provider: 'keycloak', externalId: 'kc-123' }],
    });
    const result = await provisionKeycloakUser(prisma, claims);

    expect(result.id).toBe('user-1');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('links an existing local account that shares the verified email', async () => {
    const prisma = makePrismaStub({
      users: [{ id: 'user-9', email: 'student@example.com', role: 'STUDENT' }],
    });
    const result = await provisionKeycloakUser(prisma, claims);

    expect(result.id).toBe('user-9');
    expect(prisma.userExternalIdentity.create).toHaveBeenCalledTimes(1);
    expect(prisma.user.create).not.toHaveBeenCalled();
    // role synced up to match the Keycloak role
    expect(result.role).toBe('TEACHER');
  });

  it('keeps a linked user role in sync with Keycloak', async () => {
    const prisma = makePrismaStub({
      users: [{ id: 'user-1', email: 'student@example.com', role: 'STUDENT' }],
      identities: [{ userId: 'user-1', provider: 'keycloak', externalId: 'kc-123' }],
    });
    const result = await provisionKeycloakUser(prisma, claims);

    expect(result.role).toBe('TEACHER');
    expect(prisma.user.update).toHaveBeenCalledTimes(1);
  });
});
