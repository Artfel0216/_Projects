

export interface ExperienceOption {
  value: 'iniciante' | 'intermediario' | 'avancado';
  label: string;
  sub: string;
}

export const EXPERIENCE_OPTIONS: ExperienceOption[] = [
  { value: 'iniciante', label: '🥉 Iniciante', sub: 'Menos de 1 ano' },
  { value: 'intermediario', label: '🥈 Intermediário', sub: '1 a 3 anos' },
  { value: 'avancado', label: '🥇 Avançado', sub: 'Mais de 3 anos' },
];


export const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

export const GENDER_OPTIONS = ['Masculino', 'Feminino', 'Outro', 'Prefiro não informar'];

export const AVAILABLE_DAYS_OPTIONS = [
  'Seg a Sex',
  'Seg, Qua e Sex',
  'Ter e Qui',
  'Somente fim de semana',
  'Todos os dias',
  'Outros'
];

export const EXPERIENCE_LEVELS = ['Iniciante', 'Intermediário', 'Avançado'];

export const OTHER_DAYS_PREFIX = 'Outros: ';