import { describe, it, expect } from 'vitest';

describe('calculations', () => {
  // Pure calculation functions — these are shared utilities
  const calculateSubtotal = (items: { price: number; qty: number }[]) =>
    items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const TAX_RATE = 0.21;
  const calculateTax = (subtotal: number) => subtotal * TAX_RATE;
  const calculateTotal = (subtotal: number) => subtotal + calculateTax(subtotal);

  it('subtotal of empty cart is 0', () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it('subtotal of single item', () => {
    expect(calculateSubtotal([{ price: 55000, qty: 2 }])).toBe(110000);
  });

  it('subtotal of multiple items', () => {
    expect(
      calculateSubtotal([
        { price: 55000, qty: 2 },
        { price: 325000, qty: 1 },
      ]),
    ).toBe(435000);
  });

  it('tax is 21% of subtotal', () => {
    expect(calculateTax(100000)).toBe(21000);
  });

  it('total = subtotal + tax', () => {
    const sub = 200000;
    expect(calculateTotal(sub)).toBe(sub + sub * TAX_RATE);
  });

  it('tax/service calculation is consistent', () => {
    const sub = 435000;
    const tax = calculateTax(sub);
    const total = calculateTotal(sub);
    expect(tax).toBe(91350);
    expect(total).toBe(526350);
  });
});
