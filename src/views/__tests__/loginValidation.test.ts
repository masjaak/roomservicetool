import { describe, expect, it } from 'vitest';
import { validateGuestAccess } from '../loginValidation';

describe('validateGuestAccess', () => {
  it('accepts room and last name without requiring a phone number', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '',
      lang: 'ID',
    });

    expect(result).toEqual({
      isValid: true,
      error: '',
    });
  });

  it('accepts a complete guest access payload with a valid Indonesian phone number', () => {
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

  it('rejects phone numbers with an invalid prefix', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '0712345678',
      lang: 'EN',
    });

    expect(result).toEqual({
      isValid: false,
      error: 'Number must start with 08 or 628',
    });
  });

  it('rejects phone numbers that are too short', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '08123',
      lang: 'ID',
    });

    expect(result).toEqual({
      isValid: false,
      error: 'Nomor HP tidak valid (Min. 10 digit)',
    });
  });

  it('stays valid and quiet when no phone number is entered', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '',
      lang: 'EN',
    });

    expect(result).toEqual({
      isValid: true,
      error: '',
    });
  });
});
