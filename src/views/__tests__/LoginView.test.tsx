import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LoginView } from '../LoginView';

describe('LoginView', () => {
  it('renders the stitch-style guest access hierarchy', () => {
    render(<LoginView lang="EN" setLang={() => {}} onLogin={() => {}} />);

    const heroGlass = screen.getByTestId('login-hero-glass');
    const heroGlassSheen = screen.getByTestId('login-hero-glass-sheen');
    const heroGlassFrame = screen.getByTestId('login-hero-glass-frame');

    expect(heroGlass).toBeTruthy();
    expect(heroGlass.className).toContain('max-w-[24rem]');
    expect(heroGlass.className).toContain('bg-white/[0.34]');
    expect(heroGlass.className).toContain('backdrop-blur-[40px]');
    expect(heroGlassFrame.className).toContain('border-white/32');
    expect(heroGlassSheen.className).toContain('bg-[linear-gradient(135deg,rgba(255,255,255,0.34),rgba(255,255,255,0.08))]');
    expect(screen.getByText('Welcome to')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Atelier Meridian' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Room Service' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /access in-room dining/i })).toBeTruthy();
    expect(screen.getByText('24/7 Assistance')).toBeTruthy();
    expect(screen.getByText('Contact Front Desk')).toBeTruthy();
  });

  it('moves focus forward on Enter across the mobile login fields', () => {
    render(<LoginView lang="EN" setLang={() => {}} onLogin={() => {}} />);

    const roomInput = screen.getByLabelText('Room Number');
    const lastNameInput = screen.getByLabelText('Guest Last Name');

    (roomInput as HTMLInputElement).focus();
    fireEvent.keyDown(roomInput, { key: 'Enter', code: 'Enter' });
    expect(document.activeElement).toBe(lastNameInput);
  });

  it('submits from the last name field on Enter once the guest payload is valid', () => {
    const onLogin = vi.fn();

    render(<LoginView lang="EN" setLang={() => {}} onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Room Number'), { target: { value: '1204' } });
    fireEvent.change(screen.getByLabelText('Guest Last Name'), { target: { value: 'Tan' } });

    fireEvent.keyDown(screen.getByLabelText('Guest Last Name'), { key: 'Enter', code: 'Enter' });

    expect(onLogin).toHaveBeenCalledWith('1204', '', 'Tan');
  });
});
