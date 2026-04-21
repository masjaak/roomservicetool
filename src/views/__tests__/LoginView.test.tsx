import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { LoginView } from '../LoginView';

describe('LoginView', () => {
  it('moves focus forward on Enter across the mobile login fields', () => {
    render(<LoginView lang="EN" setLang={() => {}} onLogin={() => {}} />);

    const roomInput = screen.getByLabelText('Room Number');
    const lastNameInput = screen.getByLabelText('Guest Last Name');
    const phoneInput = screen.getByLabelText('Phone Number');

    (roomInput as HTMLInputElement).focus();
    fireEvent.keyDown(roomInput, { key: 'Enter', code: 'Enter' });
    expect(document.activeElement).toBe(lastNameInput);

    fireEvent.keyDown(lastNameInput, { key: 'Enter', code: 'Enter' });
    expect(document.activeElement).toBe(phoneInput);
  });

  it('submits from the phone field on Enter once the guest payload is valid', () => {
    const onLogin = vi.fn();

    render(<LoginView lang="EN" setLang={() => {}} onLogin={onLogin} />);

    fireEvent.change(screen.getByLabelText('Room Number'), { target: { value: '1204' } });
    fireEvent.change(screen.getByLabelText('Guest Last Name'), { target: { value: 'Tan' } });
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: '081234567890' } });

    fireEvent.keyDown(phoneInput, { key: 'Enter', code: 'Enter' });

    expect(onLogin).toHaveBeenCalledWith('1204', '081234567890', 'Tan');
  });
});
