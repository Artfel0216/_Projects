import { describe, it, expect } from 'vitest';
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validation';

describe('forgotPasswordSchema', () => {
  it('should validate correct email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'test@example.com' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'invalid' });
    expect(result.success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  it('should validate token and password', () => {
    const result = resetPasswordSchema.safeParse({
      token: '550e8400-e29b-41d4-a716-446655440000',
      password: 'newPassword123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject short password', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'valid-token',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty token', () => {
    const result = resetPasswordSchema.safeParse({
      token: '',
      password: '123456',
    });
    expect(result.success).toBe(false);
  });
});
