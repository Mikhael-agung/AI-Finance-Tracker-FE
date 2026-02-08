export function formatCurrency(value: number) {
  return `$${value.toFixed(2)}`;
}

export function formatDate(value: Date) {
  return value.toISOString();
}
