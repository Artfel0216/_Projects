import { DietaryRestriction } from '@prisma/client';


type Exercise = { name: string; sets: string; reps: string; load: string };
type WeeklyPlan = Record<string, Exercise[]>;
type ProgressEntry = { date: string; weight: string; muscleMass: string; bodyFat: string; note: string };
type Student = {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  emergencyContact: string;
  objective: string;
  restrictions: string;
  injuries: string;
  medications: string;
  experience: string;
  availableDays: string;
  height: string;
  weight: string;
  bodyFat: string;
  observations: string;
  lastTraining: string;
  plan: string;
  progress: number;
  weeklyPlan: WeeklyPlan;
  progressHistory: ProgressEntry[];
};

type WeeklyClass = {
  id: string;
  studentId: string;
  day: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'pending' | 'canceled';
};

export interface AthleteRegisterRequest {
  email: string;
  name: string;
  cpf: string;
  phone: string;
  birthDate?: string; 

  sex: 'masculino' | 'feminino' | 'outro';
  heightCm: number; 
  weightKg: number; 
  experienceLevel: 'iniciante' | 'intermediario' | 'avancado';
  
  dietaryRestriction?: DietaryRestriction; 

  cep: string;
  city: string;
  state: string;
}

export type { Exercise, WeeklyPlan, ProgressEntry, Student, WeeklyClass };
