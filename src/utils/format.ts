/**
 * Format a number as IDR currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Safely parse a value to a number. Strips non-numeric characters.
 */
export function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  const clean = String(value).replace(/[^0-9]/g, '');
  return parseInt(clean, 10) || 0;
}

/**
 * Calculate cart subtotal from items with price and qty.
 */
export function calculateSubtotal(items: { price: number; qty: number }[]): number {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

/**
 * Calculate 21% service & tax.
 */
export function calculateTax(subtotal: number): number {
  return subtotal * 0.21;
}

/**
 * Calculate grand total (subtotal + tax).
 */
export function calculateTotal(subtotal: number): number {
  return subtotal + calculateTax(subtotal);
}
