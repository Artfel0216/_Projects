const VALID_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

const CREF_REGEX = /^(\d{6})-([A-Z])\/([A-Z]{2})$/;

export interface CrefValidationResult {
  valid: boolean;
  errors: string[];
  cref?: string;
  normalizedCref?: string;
}

export function validateCref(input: string): CrefValidationResult {
  const errors: string[] = [];
  const normalized = input.trim().toUpperCase();

  if (!normalized) {
    return { valid: false, errors: ["CREF é obrigatório."] };
  }

  if (normalized.length > 11) {
    return { valid: false, errors: ["CREF deve ter no máximo 11 caracteres (formato: 000000-G/UF)."] };
  }

  const match = normalized.match(CREF_REGEX);
  if (!match) {
    return { valid: false, errors: ["Formato inválido. Use o padrão: 000000-G/UF (Ex: 123456-G/SP)."] };
  }

  const digits = match[1];
  const checkLetter = match[2];
  const state = match[3];

  if (!VALID_STATES.includes(state)) {
    errors.push(`UF inválida: "${state}". Use uma sigla de estado brasileiro válida.`);
  }

  const remainder = calculateCheckDigit(digits);
  const expectedLetter = getExpectedLetter(remainder);

  if (checkLetter !== expectedLetter) {
    errors.push(`Dígito verificador inválido: esperado "${expectedLetter}", recebido "${checkLetter}".`);
  }

  if (errors.length > 0) {
    return { valid: false, errors, cref: normalized };
  }

  return { valid: true, errors: [], cref: normalized, normalizedCref: normalized };
}

function calculateCheckDigit(digits: string): number {
  const weights = [9, 8, 7, 6, 5, 4];
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    sum += parseInt(digits[i], 10) * weights[i];
  }
  return sum % 11;
}

function getExpectedLetter(remainder: number): string {
  const map = '0123456789X';
  return map[remainder] || 'X';
}
