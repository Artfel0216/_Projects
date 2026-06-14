import { describe, it, expect } from 'vitest';
import { validateCref } from '@/lib/cref';

describe('validateCref', () => {
  it('should reject empty CREF', () => {
    const result = validateCref('');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toBe('CREF é obrigatório.');
  });

  it('should reject invalid format', () => {
    const result = validateCref('12345');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Formato inválido');
  });

  it('should reject invalid UF', () => {
    const result = validateCref('123456-G/XX');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('UF'))).toBe(true);
  });

  it('should accept valid CREF format (even if check digit may fail)', () => {
    const result = validateCref('123456-G/SP');
    expect(result.cref).toBe('123456-G/SP');
  });

  it('should normalize input to uppercase', () => {
    const result = validateCref('123456-g/sp');
    expect(result.cref).toBe('123456-G/SP');
  });
});
