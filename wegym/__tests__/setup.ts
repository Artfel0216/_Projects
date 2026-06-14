import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://postgres:A12345fe@localhost:5432/wegym_test?schema=public';
  process.env.NEXTAUTH_SECRET = 'test-secret';
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
  process.env.NODE_ENV = 'test';
});
