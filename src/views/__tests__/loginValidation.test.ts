import { describe, expect, it } from 'vitest';
import { validateGuestAccess } from '../loginValidation';

describe('validateGuestAccess', () => {
  it('rejects when phone number is missing (form cannot submit)', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '',
      lang: 'ID',
    });

    expect(result).toEqual({
      isValid: false,
      error: 'Nomor HP harus diisi minimal 12 digit',
    });
  });

  it('accepts a complete guest access payload with a phone number', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '081234567890',
      lang: 'ID',
    });

    expect(result).toEqual({
      isValid: true,
      error: '',
    });
  });

  it('accepts phone numbers regardless of prefix', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '071234567890',
      lang: 'EN',
    });

    expect(result).toEqual({
      isValid: true,
      error: '',
    });
  });

  it('rejects phone numbers with fewer than 12 digits', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '08123',
      lang: 'ID',
    });

    expect(result).toEqual({
      isValid: false,
      error: 'Nomor HP harus diisi minimal 12 digit',
    });
  });

  it('rejects when no phone number is entered', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '',
      lang: 'EN',
    });

    expect(result).toEqual({
      isValid: false,
      error: 'Phone number must be at least 12 digits',
    });
  });
});
