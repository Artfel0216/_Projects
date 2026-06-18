import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL?.replace('/wegym?', '/wegym_test?') ?? 'postgresql://postgres:password@localhost:5432/wegym_test?schema=public';
  process.env.NEXTAUTH_SECRET = 'test-secret';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  process.env.NODE_ENV = 'test';
});
