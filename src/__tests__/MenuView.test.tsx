import React from 'react';
import { render, screen } from '@testing-library/react';
import { MenuView } from '../views/MenuView';

describe('MenuView', () => {
  it('renders without crashing', () => {
    render(
      <MenuView
        roomNumber="123"
        cart={[]}
        addToCart={() => {}}
        removeFromCart={() => {}}
        onCheckout={() => {}}
        onOpenCart={() => {}}
        onCloseCart={() => {}}
        onLogout={() => {}}
        isCartOpen={false}
        lang="EN"
      />
    );
  });

  it('renders the premium hospitality hero and curated section copy', () => {
    render(
      <MenuView
        roomNumber="123"
        cart={[]}
        addToCart={() => {}}
        removeFromCart={() => {}}
        onCheckout={() => {}}
        onOpenCart={() => {}}
        onCloseCart={() => {}}
        onLogout={() => {}}
        isCartOpen={false}
        lang="EN"
      />
    );

    expect(screen.getByText('Room 123')).toBeTruthy();
    expect(screen.getByText('The Dinner Menu')).toBeTruthy();
    expect(
      screen.getByText('A curated selection of signatures, comfort plates, and drinks prepared for your room.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Breakfast' })).toBeTruthy();
  });
});
