import { describe, it, expect, vi } from 'vitest';
import { handleError, json, created } from '@/lib/api-utils';
import { NotFoundError, UnauthorizedError, ValidationError } from '@/lib/errors';

describe('handleError', () => {
  it('should return AppError as JSON response', async () => {
    const err = new NotFoundError('Usuário');
    const response = handleError(err);
    const data = await response.json();
    expect(response.status).toBe(404);
    expect(data.error).toBe('Usuário não encontrado(a)');
    expect(data.code).toBe('NOT_FOUND');
  });

  it('should return UnauthorizedError', async () => {
    const err = new UnauthorizedError();
    const response = handleError(err);
    expect(response.status).toBe(401);
  });

  it('should return ValidationError with details', async () => {
    const details = [{ field: 'email', message: 'inválido' }];
    const err = new ValidationError('Dados inválidos', details);
    const response = handleError(err);
    const data = await response.json();
    expect(response.status).toBe(422);
    expect(data.details).toEqual(details);
  });

  it('should return 500 for unknown errors', async () => {
    const response = handleError(new Error('Unexpected'));
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.code).toBe('INTERNAL_ERROR');
  });

  it('should handle Prisma P2002 duplicate error', async () => {
    const prismaError = { code: 'P2002', meta: { target: ['email'] } };
    const response = handleError(prismaError);
    const data = await response.json();
    expect(response.status).toBe(409);
    expect(data.error).toBe('Registro duplicado');
  });
});

describe('json helper', () => {
  it('should return JSON response with cache headers', () => {
    const response = json({ data: 'test' }, 200, 30);
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toContain('max-age=30');
  });

  it('should return no-cache by default', () => {
    const response = json({ data: 'test' });
    expect(response.headers.get('Cache-Control')).toContain('no-cache');
  });
});

describe('created helper', () => {
  it('should return 201 status', () => {
    const response = created({ id: '123' });
    expect(response.status).toBe(201);
  });
});
