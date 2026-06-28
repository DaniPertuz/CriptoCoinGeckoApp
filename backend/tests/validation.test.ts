process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

const test = require('node:test');
const assert = require('node:assert/strict');
const validate = require('../src/middlewares/validate.middleware').default as typeof import('../src/middlewares/validate.middleware').default;
const authValidator = require('../src/validators/auth.validator') as typeof import('../src/validators/auth.validator');
const cryptoValidator = require('../src/validators/crypto.validator') as typeof import('../src/validators/crypto.validator');

interface TestRequestInput {
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
}

const createRequest = ({ body = {}, params = {}, query = {} }: TestRequestInput = {}) => ({
  body,
  params,
  query,
});

const runValidation = async (
  middleware: ReturnType<typeof validate>,
  req: ReturnType<typeof createRequest>,
): Promise<Error | undefined> => {
  let nextError: Error | undefined;

  await middleware(req as never, {} as never, (error?: unknown) => {
    if (error instanceof Error) {
      nextError = error;
    }
  });

  return nextError;
};

test('request validation rejects invalid register payloads before reaching the service layer', async () => {
  const middleware = validate(authValidator.register);
  const req = createRequest({ body: {} });
  const nextError = await runValidation(middleware, req);

  assert.equal(nextError?.name, 'ZodError');
});

test('request validation rejects invalid cryptocurrency query params', async () => {
  const middleware = validate(cryptoValidator.topCryptocurrencies);
  const req = createRequest({ query: { limit: '1000' } });
  const nextError = await runValidation(middleware, req);

  assert.equal(nextError?.name, 'ZodError');
});

test('request validation accepts dashboard query defaults and boolean-like values', async () => {
  const middleware = validate(cryptoValidator.dashboardSummary);
  const req = createRequest({ query: { includeSparkline: 'false' } });
  const nextError = await runValidation(middleware, req);

  assert.equal(nextError, undefined);
  assert.equal(req.query.vsCurrency, 'usd');
  assert.equal(req.query.limit, 10);
  assert.equal(req.query.includeSparkline, false);
});

test('request validation rejects market chart ranges above supported limit', async () => {
  const middleware = validate(cryptoValidator.marketChart);
  const req = createRequest({ params: { id: 'bitcoin' }, query: { days: '1000' } });
  const nextError = await runValidation(middleware, req);

  assert.equal(nextError?.name, 'ZodError');
});

export {};
