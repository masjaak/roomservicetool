import { describe, it, expect } from 'vitest';
import { MENU_ITEMS, CATEGORIES } from '../data/constants';

const EXPECTED_CATEGORIES = ['Signatures', 'Starters', 'Mains', 'Desserts', 'Beverages'];

describe('menu integrity', () => {
  it('has at least 25 menu items', () => {
    expect(MENU_ITEMS.length).toBeGreaterThanOrEqual(25);
  });

  it('categories match expected set', () => {
    expect(CATEGORIES).toEqual(EXPECTED_CATEGORIES);
  });

  it('every item has a non-empty name', () => {
    for (const item of MENU_ITEMS) {
      expect(item.name.trim().length, `item id=${item.id} has empty name`).toBeGreaterThan(0);
    }
  });

  it('every item has a non-empty description', () => {
    for (const item of MENU_ITEMS) {
      expect(item.description.trim().length, `item id=${item.id} has empty description`).toBeGreaterThan(0);
    }
  });

  it('every item has a price > 0', () => {
    for (const item of MENU_ITEMS) {
      expect(item.price, `item "${item.name}" has invalid price`).toBeGreaterThan(0);
    }
  });

  it('every item has a non-empty category', () => {
    for (const item of MENU_ITEMS) {
      expect(item.category.trim().length, `item "${item.name}" has empty category`).toBeGreaterThan(0);
    }
  });

  it('every item category is one of the expected categories', () => {
    for (const item of MENU_ITEMS) {
      expect(
        EXPECTED_CATEGORIES.includes(item.category),
        `item "${item.name}" has unexpected category "${item.category}"`,
      ).toBe(true);
    }
  });

  it('all prices are realistic IDR (25k - 1M)', () => {
    for (const item of MENU_ITEMS) {
      expect(item.price, `"${item.name}" price ${item.price} too low`).toBeGreaterThanOrEqual(25000);
      expect(item.price, `"${item.name}" price ${item.price} too high`).toBeLessThanOrEqual(1000000);
    }
  });

  it('no item name contains "Ciputra"', () => {
    for (const item of MENU_ITEMS) {
      expect(item.name.toLowerCase()).not.toContain('ciputra');
    }
  });

  it('no item description contains "Ciputra"', () => {
    for (const item of MENU_ITEMS) {
      expect(item.description.toLowerCase()).not.toContain('ciputra');
    }
  });

  it('every item has a unique id', () => {
    const ids = MENU_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
