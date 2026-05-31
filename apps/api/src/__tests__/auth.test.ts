// Set JWT_SECRET before importing the auth module since it throws at module load time
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests';

import { signAccessToken, signRefreshToken, verifyToken } from '../middleware/auth';

describe('Auth Middleware', () => {
  describe('signAccessToken', () => {
    it('should create a valid JWT access token', () => {
      const token = signAccessToken({ sub: 'user-123', role: 'STUDENT' });
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include correct payload', () => {
      const token = signAccessToken({ sub: 'user-456', role: 'TEACHER' });
      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.sub).toBe('user-456');
      expect(payload!.role).toBe('TEACHER');
    });
  });

  describe('signRefreshToken', () => {
    it('should create a valid JWT refresh token', () => {
      const token = signRefreshToken('user-789');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include userId as sub claim', () => {
      const token = signRefreshToken('user-789');
      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.sub).toBe('user-789');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = signAccessToken({ sub: 'user-1', role: 'ADMIN' });
      const payload = verifyToken(token);
      expect(payload).not.toBeNull();
      expect(payload!.sub).toBe('user-1');
      expect(payload!.role).toBe('ADMIN');
    });

    it('should return null for invalid token', () => {
      const payload = verifyToken('invalid.token.here');
      expect(payload).toBeNull();
    });

    it('should return null for empty string', () => {
      const payload = verifyToken('');
      expect(payload).toBeNull();
    });

    it('should return null for tampered token', () => {
      const token = signAccessToken({ sub: 'user-1', role: 'STUDENT' });
      const tamperedToken = token.slice(0, -5) + 'xxxxx';
      const payload = verifyToken(tamperedToken);
      expect(payload).toBeNull();
    });
  });

  describe('requireAuth', () => {
    it('should throw for null user', async () => {
      const { requireAuth } = await import('../middleware/auth');
      expect(() => requireAuth(null)).toThrow('UNAUTHENTICATED');
    });

    it('should not throw for valid user', async () => {
      const { requireAuth } = await import('../middleware/auth');
      expect(() => requireAuth({ id: 'user-1', role: 'STUDENT' })).not.toThrow();
    });
  });

  describe('requireRole', () => {
    it('should throw for wrong role', async () => {
      const { requireRole } = await import('../middleware/auth');
      expect(() => requireRole({ id: 'user-1', role: 'STUDENT' }, 'ADMIN')).toThrow('FORBIDDEN');
    });

    it('should not throw when role matches', async () => {
      const { requireRole } = await import('../middleware/auth');
      expect(() => requireRole({ id: 'user-1', role: 'ADMIN' }, 'ADMIN')).not.toThrow();
    });

    it('should accept multiple allowed roles', async () => {
      const { requireRole } = await import('../middleware/auth');
      expect(() => requireRole({ id: 'user-1', role: 'TEACHER' }, 'TEACHER', 'ADMIN')).not.toThrow();
    });

    it('should throw for null user', async () => {
      const { requireRole } = await import('../middleware/auth');
      expect(() => requireRole(null, 'ADMIN')).toThrow('UNAUTHENTICATED');
    });
  });
});
