// src/utils/initializers.ts
import { Student } from '@/types/personal';


export const createEmptyStudentForm = (): Omit<
  Student, 
  'id' | 'weeklyPlan' | 'progressHistory' | 'lastTraining' | 'progress'
> => ({
  name: '',
  cpf: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
  emergencyContact: '',
  objective: '',
  restrictions: '',
  injuries: '',
  medications: '',
  experience: '',
  availableDays: '',
  height: '',
  weight: '',
  bodyFat: '',
  observations: '',
  plan: 'Basic'
});