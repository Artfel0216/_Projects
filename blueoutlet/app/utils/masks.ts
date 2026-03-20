export const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, "") 
    .replace(/^(\d{5})(\d)/, "$1-$2") 
    .substring(0, 9); 
};

export const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/g, "($1) $2") 
    .replace(/(\d{5})(\d)/, "$1-$2") 
    .substring(0, 15);
};