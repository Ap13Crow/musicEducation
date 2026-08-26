const mockVerifyKeycloakToken = jest.fn();
const mockProvisionKeycloakUser = jest.fn();

jest.mock('../middleware/keycloak', () => ({
  verifyKeycloakToken: (...args: any[]) => mockVerifyKeycloakToken(...args),
  provisionKeycloakUser: (...args: any[]) => mockProvisionKeycloakUser(...args),
}));

import { resolveRequestUser } from '../middleware/auth';

describe('deactivated account authentication', () => {
  beforeEach(() => {
    mockVerifyKeycloakToken.mockReset().mockResolvedValue({ sub: 'kc-user-1' });
    mockProvisionKeycloakUser.mockReset();
  });

  it('rejects a still-valid Keycloak token after local deactivation', async () => {
    mockProvisionKeycloakUser.mockResolvedValue({ id: 'user-1', role: 'STUDENT', status: 'DEACTIVATED' });

    await expect(resolveRequestUser(
      { headers: { authorization: 'Bearer valid-keycloak-token' } } as any,
      {} as any,
    )).resolves.toBeNull();
  });

  it('accepts an active Keycloak-backed user', async () => {
    mockProvisionKeycloakUser.mockResolvedValue({ id: 'user-1', role: 'STUDENT', status: 'ACTIVE' });

    await expect(resolveRequestUser(
      { headers: { authorization: 'Bearer valid-keycloak-token' } } as any,
      {} as any,
    )).resolves.toEqual({ id: 'user-1', role: 'STUDENT' });
  });
});
