import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScreenLoadingState } from '../ScreenLoadingState';
import { Screen } from '../../machine/types';

describe('ScreenLoadingState', () => {
  it('renders a guest-ready loading message for the menu screen', () => {
    render(<ScreenLoadingState screen={Screen.Menu} lang="EN" />);

    expect(screen.getByRole('heading', { name: 'Preparing your dining menu' })).toBeTruthy();
    expect(screen.getByText('Optimizing the mobile experience for your stay.')).toBeTruthy();
  });

  it('renders a checkout-specific loading message in Indonesian', () => {
    render(<ScreenLoadingState screen={Screen.Checkout} lang="ID" />);

    expect(screen.getByRole('heading', { name: 'Menyiapkan pembayaran' })).toBeTruthy();
    expect(screen.getByText('Mohon tunggu, kami sedang memuat layar mobile dengan aman.')).toBeTruthy();
  });
});
