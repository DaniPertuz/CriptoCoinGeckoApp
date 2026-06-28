process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

const test = require('node:test');
const assert = require('node:assert/strict');
const { requireAdmin } = require('../src/middlewares/auth.middleware') as typeof import('../src/middlewares/auth.middleware');
const { UserProvider, UserRole } = require('../src/types/user') as typeof import('../src/types/user');

const createRequest = (role?: typeof UserRole.USER | typeof UserRole.ADMIN) => ({
  auth: role
    ? {
        token: 'test-token',
        payload: {
          sub: 'user-1',
          email: 'user@example.com',
          role,
        },
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'user@example.com',
          provider: UserProvider.PASSWORD,
          googleId: null,
          avatarUrl: null,
          role,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }
    : undefined,
});

const runMiddleware = async (req: ReturnType<typeof createRequest>) => {
  const middleware = requireAdmin;
  let nextCalled = false;
  let nextError: Error | undefined;

  await middleware(req as never, {} as never, (error?: unknown) => {
    if (error instanceof Error) {
      nextError = error;
      return;
    }

    nextCalled = true;
  });

  return {
    nextCalled,
    nextError,
  };
};

test('admin RBAC middleware allows admin users', async () => {
  const result = await runMiddleware(createRequest(UserRole.ADMIN));

  assert.equal(result.nextError, undefined);
  assert.equal(result.nextCalled, true);
});

test('admin RBAC middleware rejects non-admin users', async () => {
  const result = await runMiddleware(createRequest(UserRole.USER));

  assert.equal(result.nextCalled, false);
  assert.equal(result.nextError?.name, 'AppError');
  assert.equal((result.nextError as { statusCode?: number }).statusCode, 403);
  assert.equal((result.nextError as { code?: string }).code, 'INSUFFICIENT_PERMISSIONS');
});

test('admin RBAC middleware rejects missing auth context', async () => {
  const result = await runMiddleware(createRequest());

  assert.equal(result.nextCalled, false);
  assert.equal(result.nextError?.name, 'AppError');
  assert.equal((result.nextError as { statusCode?: number }).statusCode, 401);
  assert.equal((result.nextError as { code?: string }).code, 'AUTH_REQUIRED');
});

export {};
