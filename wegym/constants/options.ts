
export interface Option {
  value: string;
  label: string;
  tKey?: string;
}

export interface ExperienceOption {
  value: 'iniciante' | 'intermediario' | 'avancado';
  label: string;
  sub: string;
  tKey?: string;
  sublabelTKey?: string;
}

export const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  { value: 'iniciante', label: '🥉 Iniciante', sub: 'Menos de 1 ano', tKey: 'experienceOption.labelBeginner', sublabelTKey: 'experienceOption.subBeginner' },
  { value: 'intermediario', label: '🥈 Intermediário', sub: '1 a 3 anos', tKey: 'experienceOption.labelIntermediate', sublabelTKey: 'experienceOption.subIntermediate' },
  { value: 'avancado', label: '🥇 Avançado', sub: 'Mais de 3 anos', tKey: 'experienceOption.labelAdvanced', sublabelTKey: 'experienceOption.subAdvanced' },
];


export const DAYS = [
  { value: 'Seg', label: 'Seg', tKey: 'days.mon' },
  { value: 'Ter', label: 'Ter', tKey: 'days.tue' },
  { value: 'Qua', label: 'Qua', tKey: 'days.wed' },
  { value: 'Qui', label: 'Qui', tKey: 'days.thu' },
  { value: 'Sex', label: 'Sex', tKey: 'days.fri' },
  { value: 'Sab', label: 'Sab', tKey: 'days.sat' },
  { value: 'Dom', label: 'Dom', tKey: 'days.sun' },
];

export const DAY_OPTIONS: Option[] = [
  { value: 'mon', label: 'Seg', tKey: 'days.mon' },
  { value: 'tue', label: 'Ter', tKey: 'days.tue' },
  { value: 'wed', label: 'Qua', tKey: 'days.qua' },
  { value: 'thu', label: 'Qui', tKey: 'days.thu' },
  { value: 'fri', label: 'Sex', tKey: 'days.fri' },
  { value: 'sat', label: 'Sab', tKey: 'days.sat' },
  { value: 'sun', label: 'Dom', tKey: 'days.sun' },
];

export const GENDER_OPTIONS: Option[] = [
  { value: 'M', label: 'Masculino', tKey: 'gender.male' },
  { value: 'F', label: 'Feminino', tKey: 'gender.female' },
  { value: 'O', label: 'Outro', tKey: 'gender.other' },
  { value: 'N', label: 'Prefiro não informar', tKey: 'gender.preferNot' },
];

export const AVAILABLE_DAYS_OPTIONS: Option[] = [
  { value: 'weekdays', label: 'Seg a Sex', tKey: 'availableDays.weekdays' },
  { value: 'monWedFri', label: 'Seg, Qua e Sex', tKey: 'availableDays.monWedFri' },
  { value: 'tueThu', label: 'Ter e Qui', tKey: 'availableDays.tueThu' },
  { value: 'weekends', label: 'Somente fim de semana', tKey: 'availableDays.weekends' },
  { value: 'everyday', label: 'Todos os dias', tKey: 'availableDays.everyday' },
  { value: 'other', label: 'Outros', tKey: 'availableDays.other' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'Iniciante', label: 'Iniciante', tKey: 'experienceLevel.beginner' },
  { value: 'Intermediário', label: 'Intermediário', tKey: 'experienceLevel.intermediate' },
  { value: 'Avançado', label: 'Avançado', tKey: 'experienceLevel.advanced' },
];

export const OTHER_DAYS_PREFIX = 'Outros: ';