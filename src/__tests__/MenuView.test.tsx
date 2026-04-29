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
    expect(
      screen.getByText((content) => /^The (Morning|Afternoon|Evening|Late-Night) Menu$/.test(content))
    ).toBeTruthy();
    expect(
      screen.getByText((content) => [
        'A thoughtful selection of morning favourites and light bites, served fresh to your room.',
        'Midday comforts and afternoon favourites, ready to be delivered to your door.',
        'Signature dishes and evening comforts, curated and prepared for your room.',
        'Late-night bites and beverages, available whenever you need them.',
      ].includes(content))
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /Breakfast|Signatures/i })
    ).toBeTruthy();
  });
});
