import type { UserRole } from '@prisma/client';

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface AthleteListItem {
  id: string;
  name: string;
  cpf: string;
  experienceLevel: string;
  trainingPlans?: unknown[];
  progressEntries?: unknown[];
  weeklyClasses?: unknown[];
}
