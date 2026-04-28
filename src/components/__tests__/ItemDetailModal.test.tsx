import React from 'react';
import { render, screen } from '@testing-library/react';
import { ItemDetailModal } from '../ItemDetailModal';

const menuItem = {
  id: 99,
  name: 'Fresh Orange Juice',
  description: 'Hand-squeezed orange juice, served chilled.',
  price: 65000,
  category: 'Beverages',
  image: '/assets/menu/beverages.jpg',
  tag: '',
  allergens: '',
};

describe('ItemDetailModal', () => {
  it('shows dietary guidance even when the item has no listed allergens', () => {
    render(
      <ItemDetailModal
        item={menuItem}
        isOpen
        onClose={() => {}}
        onAdd={() => {}}
        lang="EN"
      />,
    );

    expect(screen.getByText('Dietary Notes')).toBeTruthy();
    expect(screen.getByText('No major allergens listed for this item.')).toBeTruthy();
    expect(screen.getAllByText('Hand-squeezed orange juice, served chilled.').length).toBeGreaterThan(0);
  });
});
