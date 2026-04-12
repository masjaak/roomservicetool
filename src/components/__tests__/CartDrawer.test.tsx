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
        onCheckout={() => {}}
        lang="EN"
      />
    );

    fireEvent.click(screen.getAllByLabelText('Remove item')[1]);
    fireEvent.click(screen.getAllByLabelText('Decrease quantity')[1]);

    expect(onRemove).toHaveBeenNthCalledWith(1, 1);
    expect(onRemove).toHaveBeenNthCalledWith(2, 1);
  });
});
