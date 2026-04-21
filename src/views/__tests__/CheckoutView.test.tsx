import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

    expect(screen.getByText('Checkout')).toBeTruthy();
    expect(screen.getByText('Folio Summary')).toBeTruthy();
    expect(screen.getByText('Billing Method')).toBeTruthy();
  });

  it('shows the selected bank account code instead of an undefined transfer target', () => {
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

    fireEvent.click(screen.getByRole('button', { name: /bank transfer/i }));
    fireEvent.click(screen.getByRole('button', { name: 'BCA' }));

    expect(screen.getByText('88010')).toBeTruthy();
    expect(screen.queryByText('undefined')).toBeNull();
  });

  it('disables checkout submission if the cart is empty', () => {
    render(
      <CheckoutView
        cart={[]} // empty cart
        onBack={() => {}}
        onPlaceOrder={() => {}}
        loading={false}
        error={null}
        phoneNumber="81234567890"
        lang="EN"
      />
    );

    const submitBtn = screen.getByRole('button', { name: /place order/i });
    if (submitBtn) {
      expect((submitBtn as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('shows a mobile network notice while the order is being submitted', () => {
    render(
      <CheckoutView
        cart={cart}
        onBack={() => {}}
        onPlaceOrder={() => {}}
        loading
        error={null}
        phoneNumber="81234567890"
        lang="EN"
      />
    );

    expect(screen.getByRole('status').textContent).toContain('Processing...');
    expect(screen.getByText('Please keep this screen open while we connect your order.')).toBeTruthy();
  });

  it('shows recovery guidance when the network request fails', () => {
    render(
      <CheckoutView
        cart={cart}
        onBack={() => {}}
        onPlaceOrder={() => {}}
        loading={false}
        error="Connection timeout. Please try again."
        phoneNumber="81234567890"
        lang="EN"
      />
    );

    expect(screen.getByRole('alert').textContent).toContain('Connection timeout. Please try again.');
    expect(screen.getByText('Hotel Wi-Fi can be unstable. Review your signal, then retry.')).toBeTruthy();
  });
});
