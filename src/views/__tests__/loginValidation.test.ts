import { describe, expect, it } from 'vitest';
import { validateGuestAccess } from '../loginValidation';

describe('validateGuestAccess', () => {
  it('is silently invalid when phone number is missing (no error shown, form cannot submit)', () => {
    // Phone is required. When absent the form stays quiet but isValid is false.
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '',
      lang: 'ID',
    });

    expect(result).toEqual({
      isValid: false,
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
      error: 'Number must start with 08 or +62',
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
      error: 'Nomor terlalu pendek (5 digit, butuh 10–14)',
    });
  });

  it('stays silent (no error) when no phone number is entered, but marks the form as invalid', () => {
    const result = validateGuestAccess({
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '',
      lang: 'EN',
    });

    expect(result).toEqual({
      isValid: false,
      error: '',
    });
  });
});
