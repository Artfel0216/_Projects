export const maskCEP = (value: string): string => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{5})(\d)/, "$1-$2")
    .slice(0, 9);
};

export const maskPhone = (value: string): string => {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "");
  
  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 14);
  }

  return numbers
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
};

export const unmask = (value: string): string => {
  return value.replace(/\D/g, "");
};