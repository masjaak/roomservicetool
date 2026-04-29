import { describe, expect, it } from 'vitest';
import { mergeGuestMenuCatalog, normalizeGuestMenuProduct, toGuestMenuSourceItemId } from '../menuCatalog';
import type { MenuItem } from '../../types';

const baseMenu: MenuItem[] = [
  {
    id: 101,
    name: 'Sunrise Omelette',
    description: 'Three-egg omelette with herbs.',
    price: 98000,
    category: 'Signatures',
    image: '/assets/omelette.jpg',
    tag: 'Chef Recommendation',
    allergens: 'Egg, Dairy',
    timeSlots: ['morning'],
  },
  {
    id: 202,
    name: 'Garden Iced Tea',
    description: 'Freshly brewed tea with citrus.',
    price: 52000,
    category: 'Beverages',
    image: '/assets/tea.jpg',
    tag: 'Light Option',
    allergens: '',
    timeSlots: ['afternoon'],
  },
];

describe('mergeGuestMenuCatalog', () => {
  it('applies product overrides onto the guest base menu via sourceItemId', () => {
    const merged = mergeGuestMenuCatalog(baseMenu, [
      {
        id: 'product-1',
        sourceItemId: toGuestMenuSourceItemId(101),
        name: 'Sunrise Omelette Deluxe',
        description: 'With smoked salmon and chives.',
        category: 'Signatures',
        image: '/assets/omelette-deluxe.jpg',
        price: 124000,
        isAvailable: true,
      },
    ]);

    expect(merged[0]).toMatchObject({
      id: 101,
      name: 'Sunrise Omelette Deluxe',
      description: 'With smoked salmon and chives.',
      image: '/assets/omelette-deluxe.jpg',
      price: 124000,
      allergens: 'Egg, Dairy',
    });
  });

  it('supports legacy dashboard products that match by name when sourceItemId is missing', () => {
    const merged = mergeGuestMenuCatalog(baseMenu, [
      {
        id: 'legacy-product',
        name: 'Garden Iced Tea',
        description: 'Updated tea service.',
        category: 'Beverages',
        image: '/assets/tea.jpg',
        price: 56000,
        isAvailable: true,
      },
    ]);

    expect(merged[1]).toMatchObject({
      id: 202,
      name: 'Garden Iced Tea',
      description: 'Updated tea service.',
      price: 56000,
    });
  });

  it('adds custom dashboard products that do not exist in the base guest menu', () => {
    const merged = mergeGuestMenuCatalog(baseMenu, [
      {
        id: 'custom-product',
        name: 'Midnight Fruit Plate',
        description: 'Seasonal fruit, chilled and ready.',
        category: 'Desserts',
        image: '/assets/fruit.jpg',
        price: 88000,
        isAvailable: true,
        allergens: 'Prepared in a kitchen handling nuts.',
      },
    ]);

    expect(merged).toHaveLength(3);
    expect(merged[2]).toMatchObject({
      name: 'Midnight Fruit Plate',
      category: 'Desserts',
      allergens: 'Prepared in a kitchen handling nuts.',
      isAvailable: true,
    });
  });

  it('hides items marked unavailable from the guest-facing menu', () => {
    const merged = mergeGuestMenuCatalog(baseMenu, [
      {
        id: 'product-2',
        sourceItemId: toGuestMenuSourceItemId(101),
        name: 'Sunrise Omelette',
        description: 'Three-egg omelette with herbs.',
        category: 'Signatures',
        image: '/assets/omelette.jpg',
        price: 98000,
        isAvailable: false,
      },
      {
        id: 'custom-hidden',
        name: 'Night Cap',
        description: 'Warm cocoa.',
        category: 'Beverages',
        image: '/assets/cocoa.jpg',
        price: 48000,
        isAvailable: false,
      },
    ]);

    expect(merged.map((item) => item.name)).toEqual(['Garden Iced Tea']);
  });
});

describe('normalizeGuestMenuProduct', () => {
  it('maps Firestore product records into a guest menu sync shape', () => {
    expect(normalizeGuestMenuProduct('product-99', {
      sourceItemId: 'guest-menu-101',
      name: 'Sunrise Omelette Deluxe',
      price: 124000,
      allergens: 'Egg, Fish',
      dietaryTags: ['High Protein'],
      isAvailable: true,
    })).toMatchObject({
      id: 'product-99',
      sourceItemId: 'guest-menu-101',
      name: 'Sunrise Omelette Deluxe',
      price: 124000,
      allergens: 'Egg, Fish',
      dietaryTags: ['High Protein'],
      isAvailable: true,
    });
  });
});
