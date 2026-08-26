describe('Keycloak user-admin service client', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env.KEYCLOAK_ISSUER = 'https://auth.example.test/realms/mymusic-coach';
    process.env.KEYCLOAK_ADMIN_CLIENT_ID = 'mymusic-coach-user-admin';
    process.env.KEYCLOAK_ADMIN_CLIENT_SECRET = 'test-client-secret';
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('uses client credentials in the application realm, never a master-realm password grant', async () => {
    const fetchMock = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: 'service-token', expires_in: 60 }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { deleteKeycloakUser } = await import('../lib/keycloakAdmin');

    await deleteKeycloakUser('kc-user-1');

    const [tokenUrl, tokenRequest] = fetchMock.mock.calls[0];
    expect(tokenUrl).toBe('https://auth.example.test/realms/mymusic-coach/protocol/openid-connect/token');
    expect((tokenRequest?.body as URLSearchParams).toString()).toContain('grant_type=client_credentials');
    expect((tokenRequest?.body as URLSearchParams).toString()).not.toContain('password=');
    expect(fetchMock).toHaveBeenLastCalledWith(
      'https://auth.example.test/admin/realms/mymusic-coach/users/kc-user-1',
      expect.objectContaining({ method: 'DELETE', signal: expect.any(AbortSignal) }),
    );
  });
});
