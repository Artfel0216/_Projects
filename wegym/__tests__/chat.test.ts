import { describe, it, expect, vi, beforeEach } from 'vitest';
import { chatResponseSchema } from '@/lib/validation';

describe('chatResponseSchema', () => {
  it('should validate a correct workout response', () => {
    const result = chatResponseSchema.safeParse({
      text: 'Treino focado em peito e tríceps',
      goal: 'Hipertrofia - Membros Superiores',
      exercises: [
        { name: 'Supino Reto (Barra)', sets: 4, reps: '10-12', load: 'Pesado' },
        { name: 'Tríceps Corda', sets: 3, reps: '15', load: 'Leve' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should reject response without exercises', () => {
    const result = chatResponseSchema.safeParse({
      text: 'Treino vazio',
      goal: 'Teste',
      exercises: [],
    });
    expect(result.success).toBe(false);
  });

  it('should reject response without text', () => {
    const result = chatResponseSchema.safeParse({
      text: '',
      goal: 'Teste',
      exercises: [{ name: 'Supino', sets: 3, reps: '10', load: 'Médio' }],
    });
    expect(result.success).toBe(false);
  });
});
