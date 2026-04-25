import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { CartDrawer } from '../CartDrawer';

const cart = [
  {
    id: 10,
    name: 'Tomato Bruschetta',
    description: 'Toasted sourdough with heirloom tomatoes.',
    price: 65000,
    category: 'Starters',
    image: '/assets/menu/starters.jpg',
    tag: '',
    allergens: 'Wheat',
    qty: 1,
    note: '',
  },
  {
    id: 14,
    name: 'Pan-Seared Salmon',
    description: 'Norwegian salmon fillet with lemon beurre blanc.',
    price: 265000,
    category: 'Mains',
    image: '/assets/menu/mains.jpg',
    tag: '',
    allergens: 'Fish, Dairy',
    qty: 2,
    note: 'No capers',
  },
];

describe('CartDrawer', () => {
  it('uses cart indexes for remove actions so the correct line item is edited', () => {
    const onRemove = vi.fn();

    render(
      <CartDrawer
        cart={cart}
        isOpen
        onClose={() => {}}
        onRemove={onRemove}
        onAddSuggestion={() => {}}
        onCheckout={() => {}}
        lang="EN"
      />
    );
    // CartDrawer reads theme from context; default context (dark) is used in tests

    fireEvent.click(screen.getAllByLabelText('Remove item')[1]);

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('shows contextual meal pairings and lets guests add one directly from the drawer', () => {
    const onAddSuggestion = vi.fn();

    render(
      <CartDrawer
        cart={cart}
        isOpen
        onClose={() => {}}
        onRemove={() => {}}
        onAddSuggestion={onAddSuggestion}
        onCheckout={() => {}}
        lang="EN"
      />
    );

    expect(screen.getByText('Perfect with your meal')).toBeTruthy();
    expect(screen.getByText('Chocolate Lava Cake')).toBeTruthy();

    fireEvent.click(screen.getAllByText('Add')[0]);

    expect(onAddSuggestion).toHaveBeenCalledTimes(1);
    expect(onAddSuggestion).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Chocolate Lava Cake', category: 'Desserts' })
    );
  });
});
