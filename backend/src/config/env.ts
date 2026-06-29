import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must contain at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10),
  FIRESTORE_USERS_COLLECTION: z.string().min(1).default('users'),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .optional()
    .transform((value) => (value ? value.replace(/\\n/g, '\n') : value)),
  FIREBASE_SERVICE_ACCOUNT_BASE64: z.string().optional(),
  FIRESTORE_CRYPTO_CACHE_COLLECTION: z.string().min(1).default('crypto_cache'),
  COINGECKO_API_URL: z.string().url().default('https://api.coingecko.com/api/v3'),
  COINGECKO_API_KEY: z.string().optional(),
  COINGECKO_API_KEY_HEADER: z.string().default('x-cg-demo-api-key'),
  COINGECKO_TIMEOUT_MS: z.coerce.number().int().positive().default(8000),
  COINGECKO_CACHE_TTL_MS: z.coerce.number().int().min(0).default(300000),
  COINGECKO_STALE_TTL_MS: z.coerce.number().int().min(0).default(21600000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
  throw new Error(`Invalid environment variables:\n${details.join('\n')}`);
}

const env = parsed.data;

const parseOrigins = (value: string): string[] =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  cors: {
    origins: parseOrigins(env.CORS_ORIGIN),
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  bcrypt: {
    saltRounds: env.BCRYPT_SALT_ROUNDS,
  },
  firestore: {
    usersCollection: env.FIRESTORE_USERS_COLLECTION,
    cryptoCacheCollection: env.FIRESTORE_CRYPTO_CACHE_COLLECTION,
  },
  firebase: {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY,
    serviceAccountBase64: env.FIREBASE_SERVICE_ACCOUNT_BASE64,
  },
  coingecko: {
    apiUrl: env.COINGECKO_API_URL.replace(/\/$/, ''),
    apiKey: env.COINGECKO_API_KEY,
    apiKeyHeader: env.COINGECKO_API_KEY_HEADER,
    timeoutMs: env.COINGECKO_TIMEOUT_MS,
    cacheTtlMs: env.COINGECKO_CACHE_TTL_MS,
    staleTtlMs: env.COINGECKO_STALE_TTL_MS,
  },
};

export type AppConfig = typeof config;

export default config;
