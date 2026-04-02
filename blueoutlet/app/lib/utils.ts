export const formatPrice = (price: number | string | undefined | null): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (numericPrice === null || numericPrice === undefined || isNaN(numericPrice as number)) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(0);
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice as number);
};

export const formatCompactPrice = (price: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(price);
};