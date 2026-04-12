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

    expect(screen.getByText('In-Room Dining : 123')).toBeTruthy();
    expect(screen.getByText('An elevated in-room dining experience')).toBeTruthy();
    expect(screen.getAllByText('Curated Selection').length).toBeGreaterThan(0);
  });
});
