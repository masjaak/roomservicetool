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

    expect(screen.getByText('Private dining for Room 123')).toBeTruthy();
    expect(screen.getByText('Curated around the clock')).toBeTruthy();
    expect(screen.getAllByText('Curated selection').length).toBeGreaterThan(0);
  });
});
