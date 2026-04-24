import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LoginView } from '../LoginView';

describe('LoginView', () => {
  it('renders the hotel name, welcome copy, and all three input fields', () => {
    render(<LoginView lang="EN" setLang={() => {}} onLogin={() => {}} />);

    expect(screen.getByText('Welcome to')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Atelier Meridian' })).toBeTruthy();
    // loginTitle = 'Room Service' renders as an h2 inside the card
    expect(screen.getByRole('heading', { name: 'Room Service' })).toBeTruthy();
    // All three fields must be present and labelled
    expect(screen.getByLabelText('Room Number')).toBeTruthy();
    expect(screen.getByLabelText('Guest Last Name')).toBeTruthy();
    expect(screen.getByLabelText('Phone Number')).toBeTruthy();
  });

  it('moves focus from Room Number to Guest Last Name on Enter', () => {
    render(<LoginView lang="EN" setLang={() => {}} onLogin={() => {}} />);

    const roomInput = screen.getByLabelText('Room Number');
    const lastNameInput = screen.getByLabelText('Guest Last Name');

    (roomInput as HTMLInputElement).focus();
    fireEvent.keyDown(roomInput, { key: 'Enter', code: 'Enter' });
    expect(document.activeElement).toBe(lastNameInput);
  });

  it('submits when room, last name and a valid phone number are all filled', () => {
    const onLogin = vi.fn();

    render(<LoginView lang="EN" setLang={() => {}} onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Room Number'), { target: { value: '1204' } });
    fireEvent.change(screen.getByLabelText('Guest Last Name'), { target: { value: 'Tan' } });
    fireEvent.change(screen.getByLabelText('Phone Number'), { target: { value: '081234567890' } });

    // Enter on the phone field triggers submit
    fireEvent.keyDown(screen.getByLabelText('Phone Number'), { key: 'Enter', code: 'Enter' });

    expect(onLogin).toHaveBeenCalledWith('1204', '081234567890', 'Tan');
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
});
