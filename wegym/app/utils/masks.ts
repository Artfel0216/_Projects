export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    .substring(0, 14);
};

export const maskCEP = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d{3})/, "$1-$2")
    .substring(0, 9);
};