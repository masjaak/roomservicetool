import React from 'react';
import { render, screen } from '@testing-library/react';
import { CheckoutView } from '../CheckoutView';

const cart = [
  {
    id: 1,
    name: 'Beef Cheek Rendang',
    description: 'Slow-braised beef cheek in coconut and lemongrass.',
    price: 245000,
    category: 'Signatures',
    image: '/assets/menu/signatures.jpg',
    tag: 'Signature',
    allergens: 'Coconut, Nuts',
    qty: 2,
    note: 'Less spicy',
  },
];

describe('CheckoutView', () => {
  it('renders the order review and payment guidance hierarchy', () => {
    render(
      <CheckoutView
        cart={cart}
        onBack={() => {}}
        onPlaceOrder={() => {}}
        loading={false}
        error={null}
        phoneNumber="81234567890"
        lang="EN"
      />
    );

    expect(screen.getByText('Order review')).toBeTruthy();
    expect(screen.getAllByText('2 items in your tray').length).toBeGreaterThan(0);
    expect(screen.getByText('Payment guidance')).toBeTruthy();
  });
});
