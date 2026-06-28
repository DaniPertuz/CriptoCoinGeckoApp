process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

const test = require('node:test');
const assert = require('node:assert/strict');
const healthController = require('../src/controllers/health.controller') as typeof import('../src/controllers/health.controller');

interface TestResponse {
  statusCode: number | null;
  body: {
    success: boolean;
    data: {
      status: string;
    };
  } | null;
  status(code: number): TestResponse;
  json(body: TestResponse['body']): TestResponse;
}

const createResponse = (): TestResponse => ({
  statusCode: null,
  body: null,
  status(code: number) {
    this.statusCode = code;
    return this;
  },
  json(body: TestResponse['body']) {
    this.body = body;
    return this;
  },
});

test('health endpoint returns api status', async () => {
  const res = createResponse();
  let nextCalled = false;

  await healthController.check({} as never, res as never, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 200);

  if (!res.body) {
    throw new Error('Expected response body to be defined');
  }

  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'ok');
});

export {};
