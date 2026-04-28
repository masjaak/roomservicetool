import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LoginView } from '../LoginView';

describe('LoginView', () => {
  it('renders the room service login card and guest access input fields', () => {
    render(<LoginView lang="EN" setLang={() => {}} onLogin={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Room Service' })).toBeTruthy();
    expect(screen.getByLabelText('Room Number')).toBeTruthy();
    expect(screen.getByLabelText('Guest Last Name')).toBeTruthy();
    expect(screen.getByLabelText('Phone Number')).toBeTruthy();
    expect(screen.getByLabelText('Room Access Code')).toBeTruthy();
  });

  it('moves focus from Room Number to Guest Last Name on Enter', () => {
    render(<LoginView lang="EN" setLang={() => {}} onLogin={() => {}} />);

    const roomInput = screen.getByLabelText('Room Number');
    const lastNameInput = screen.getByLabelText('Guest Last Name');

    (roomInput as HTMLInputElement).focus();
    fireEvent.keyDown(roomInput, { key: 'Enter', code: 'Enter' });
    expect(document.activeElement).toBe(lastNameInput);
  });

  it('submits when room, last name and a valid phone number are all filled', async () => {
    const onLogin = vi.fn();

    render(<LoginView lang="EN" setLang={() => {}} onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Room Number'), { target: { value: '1204' } });
    fireEvent.change(screen.getByLabelText('Guest Last Name'), { target: { value: 'Tan' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '081234567890' } });

    // Enter on the phone field triggers submit
    fireEvent.keyDown(screen.getByLabelText('Phone Number'), { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('1204', '081234567890', 'Tan');
    });
  });

  it('passes the optional access code when filled', async () => {
    const onLogin = vi.fn();

    render(<LoginView lang="EN" setLang={() => {}} onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Room Number'), { target: { value: '1204' } });
    fireEvent.change(screen.getByLabelText('Guest Last Name'), { target: { value: 'Tan' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '081234567890' } });
    fireEvent.change(screen.getByLabelText('Room Access Code'), { target: { value: 'qr-token-1204' } });
    fireEvent.click(screen.getByRole('button', { name: /access in-room dining/i }));

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith('1204', '081234567890', 'Tan', 'qr-token-1204');
    });
  });

  it('does not submit when phone number is missing', () => {
    const onLogin = vi.fn();

    render(<LoginView lang="EN" setLang={() => {}} onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Room Number'), { target: { value: '1204' } });
    fireEvent.change(screen.getByLabelText('Guest Last Name'), { target: { value: 'Tan' } });
    // No phone filled in
    fireEvent.keyDown(screen.getByLabelText('Guest Last Name'), { key: 'Enter', code: 'Enter' });

    expect(onLogin).not.toHaveBeenCalled();
  });

  it('shows a server-side verification error when login is rejected after submit', async () => {
    const onLogin = vi.fn().mockResolvedValue('We could not verify your guest details. Please review your information and try again.');

    render(<LoginView lang="EN" setLang={() => {}} onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Room Number'), { target: { value: '1204' } });
    fireEvent.change(screen.getByLabelText('Guest Last Name'), { target: { value: 'Tan' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '081234567890' } });
    fireEvent.click(screen.getByRole('button', { name: /access in-room dining/i }));

    expect(await screen.findByText('We could not verify your guest details. Please review your information and try again.')).toBeTruthy();
  });

  it('renders a manual room access code field for QR fallback login', () => {
    render(<LoginView lang="EN" setLang={() => {}} onLogin={() => {}} />);

    expect(screen.getByLabelText('Room Access Code')).toBeTruthy();
  });
});
