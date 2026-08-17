import { mapKeycloakRole } from '../middleware/keycloak';

describe('Keycloak role mapping', () => {
  const claims = (roles: string[]) => ({
    sub: 'keycloak-user',
    realm_access: { roles },
  });

  it('defaults new users to STUDENT', () => {
    expect(mapKeycloakRole(claims([]))).toBe('STUDENT');
  });

  it('maps realm roles case-insensitively', () => {
    expect(mapKeycloakRole(claims(['teacher']))).toBe('TEACHER');
    expect(mapKeycloakRole(claims(['ADMIN']))).toBe('ADMIN');
  });

  it('uses the most privileged application role', () => {
    expect(mapKeycloakRole(claims(['STUDENT', 'TEACHER', 'ADMIN']))).toBe('ADMIN');
    expect(mapKeycloakRole(claims(['STUDENT', 'TEACHER']))).toBe('TEACHER');
  });

  it('ignores unrelated Keycloak roles', () => {
    expect(mapKeycloakRole(claims(['offline_access', 'uma_authorization']))).toBe('STUDENT');
  });
});
