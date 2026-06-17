
import { Student, WeeklyClass } from '@/types/personal';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Carlos Silva',
    cpf: '123.456.789-00',
    email: 'carlos@email.com',
    phone: '(11) 98888-0001',
    birthDate: '1991-03-12',
    gender: 'Masculino',
    emergencyContact: 'Marina Silva - (11) 97777-3333',
    objective: 'Hipertrofia',
    restrictions: 'Nenhuma',
    injuries: 'Lesão antiga no ombro esquerdo',
    medications: 'Não utiliza',
    experience: 'Intermediário',
    availableDays: 'Seg, Qua, Sex',
    height: '1.78',
    weight: '84',
    bodyFat: '18',
    observations: 'Boa aderência ao treino. Precisa melhorar mobilidade.',
    lastTraining: 'Hoje',
    plan: 'Premium',
    progress: 85,
    weeklyPlan: {
      Seg: [{ name: 'Supino Reto', sets: '4', reps: '8-10', load: '70kg' }],
      Ter: [{ name: 'Agachamento Livre', sets: '4', reps: '8', load: '90kg' }],
      Qua: [{ name: 'Remada Curvada', sets: '4', reps: '10', load: '60kg' }],
      Qui: [{ name: 'Levantamento Terra', sets: '3', reps: '6', load: '110kg' }],
      Sex: [{ name: 'Desenvolvimento Militar', sets: '4', reps: '10', load: '35kg' }],
      Sab: [],
      Dom: []
    },
    progressHistory: [
      { date: '05/03/2026', weight: '82kg', muscleMass: '+0.6kg', bodyFat: '-0.5%', note: 'Evolução consistente de força.' },
      { date: '05/04/2026', weight: '84kg', muscleMass: '+1.0kg', bodyFat: '-0.8%', note: 'Aumento de massa magra e boa recuperação.' }
    ]
  },
  {
    id: 's2',
    name: 'Ana Souza',
    cpf: '234.567.890-11',
    email: 'ana@email.com',
    phone: '(11) 97777-0002',
    birthDate: '1997-07-21',
    gender: 'Feminino',
    emergencyContact: 'Paulo Souza - (11) 96666-2222',
    objective: 'Condicionamento',
    restrictions: 'Intolerância leve ao impacto',
    injuries: 'Sem histórico',
    medications: 'Não utiliza',
    experience: 'Iniciante',
    availableDays: 'Seg, Ter, Qui',
    height: '1.65',
    weight: '62',
    bodyFat: '29',
    observations: 'Boa disciplina, precisa evoluir técnica.',
    lastTraining: 'Ontem',
    plan: 'Basic',
    progress: 40,
    weeklyPlan: { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] },
    progressHistory: [
      { date: '10/03/2026', weight: '64kg', muscleMass: '+0.2kg', bodyFat: '-0.4%', note: 'Início de adaptação.' }
    ]
  },
  {
    id: 's3',
    name: 'Beatriz Luz',
    cpf: '345.678.901-22',
    email: 'bia@email.com',
    phone: '(11) 95555-0003',
    birthDate: '1994-11-03',
    gender: 'Feminino',
    emergencyContact: 'Luciana Luz - (11) 98888-1212',
    objective: 'Emagrecimento',
    restrictions: 'Hipertensão controlada',
    injuries: 'Dor lombar ocasional',
    medications: 'Losartana',
    experience: 'Intermediário',
    availableDays: 'Qua, Qui, Sex',
    height: '1.70',
    weight: '78',
    bodyFat: '34',
    observations: 'Treino + cardiorrespiratório com progressão gradual.',
    lastTraining: 'Há 2 dias',
    plan: 'Premium',
    progress: 65,
    weeklyPlan: { Seg: [], Ter: [], Qua: [], Qui: [], Sex: [], Sab: [], Dom: [] },
    progressHistory: [
      { date: '01/03/2026', weight: '80kg', muscleMass: '+0.1kg', bodyFat: '-0.7%', note: 'Boa resposta ao treino metabólico.' }
    ]
  }
];

export const INITIAL_WEEKLY_CLASSES: WeeklyClass[] = [
  { id: '1', day: 'Seg', date: '21/04', time: '07:00', studentId: 's1', type: 'Hipertrofia', status: 'confirmed' },
  { id: '2', day: 'Seg', date: '21/04', time: '08:30', studentId: 's2', type: 'Funcional', status: 'confirmed' },
  { id: '3', day: 'Ter', date: '22/04', time: '18:00', studentId: 's1', type: 'Powerlifting', status: 'pending' },
  { id: '4', day: 'Qua', date: '23/04', time: '06:00', studentId: 's3', type: 'Emagrecimento', status: 'confirmed' },
  { id: '5', day: 'Qui', date: '24/04', time: '10:00', studentId: 's3', type: 'Mobilidade', status: 'canceled' }
];