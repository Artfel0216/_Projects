import { describe, it, expect } from 'vitest';
import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, ValidationError } from '@/lib/errors';
import { handleError } from '@/lib/api-utils';

describe('AppError', () => {
  it('should create error with status code and message', () => {
    const err = new AppError(400, 'BAD_REQUEST', 'Requisição inválida');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('BAD_REQUEST');
    expect(err.message).toBe('Requisição inválida');
  });

  it('should create NotFoundError with default message', () => {
    const err = new NotFoundError('Usuário');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Usuário não encontrado(a)');
  });

  it('should create UnauthorizedError with default message', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Não autenticado');
  });

  it('should create ForbiddenError with custom message', () => {
    const err = new ForbiddenError('Acesso negado');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Acesso negado');
  });

  it('should create ConflictError', () => {
    const err = new ConflictError('Email já existe');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Email já existe');
  });

  it('should create ValidationError with details', () => {
    const details = [{ field: 'email', message: 'inválido' }];
    const err = new ValidationError('Dados inválidos', details);
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual(details);
  });
});

describe('handleError', () => {
  it('should return AppError as JSON response', async () => {
    const err = new NotFoundError('Usuário');
    const response = handleError(err);
    const data = await response.json();
    expect(response.status).toBe(404);
    expect(data.error).toBe('Usuário não encontrado(a)');
  });

  it('should return 500 for unknown errors', async () => {
    const response = handleError(new Error('Unexpected'));
    const data = await response.json();
    expect(response.status).toBe(500);
    expect(data.code).toBe('INTERNAL_ERROR');
  });
});
