import { describe, it, expect } from 'vitest';
import { isGuestInfoValid, isCartNotEmpty, isPaymentComplete, isValidRoomNumber } from '../guards';
import type { GuestInfo, CartEntry } from '../types';

describe('guards', () => {
  // -----------------------------------------------------------------------
  // isValidRoomNumber
  // -----------------------------------------------------------------------
  describe('isValidRoomNumber', () => {
    it('accepts a 4-digit room number', () => {
      expect(isValidRoomNumber('1024')).toBe(true);
    });

    it('accepts a 3-digit room number', () => {
      expect(isValidRoomNumber('501')).toBe(true);
    });

    it('rejects an empty string', () => {
      expect(isValidRoomNumber('')).toBe(false);
    });

    it('rejects a string with letters', () => {
      expect(isValidRoomNumber('10A')).toBe(false);
    });

    it('rejects more than 4 digits', () => {
      expect(isValidRoomNumber('12345')).toBe(false);
    });
  });

  // -----------------------------------------------------------------------
  // isGuestInfoValid
  // -----------------------------------------------------------------------
  describe('isGuestInfoValid', () => {
    const valid: GuestInfo = { roomNumber: '1024', lastName: 'Smith', phoneNumber: '081234567890' };

    it('returns true for complete valid info', () => {
      expect(isGuestInfoValid(valid)).toBe(true);
    });

    it('returns false for empty room number', () => {
      expect(isGuestInfoValid({ ...valid, roomNumber: '' })).toBe(false);
    });

    it('returns false for empty last name', () => {
      expect(isGuestInfoValid({ ...valid, lastName: '' })).toBe(false);
    });

    it('returns false for whitespace-only last name', () => {
      expect(isGuestInfoValid({ ...valid, lastName: '   ' })).toBe(false);
    });

    it('returns false when phone is omitted', () => {
      expect(isGuestInfoValid({ ...valid, phoneNumber: '' })).toBe(false);
    });

    it('returns false for phone with fewer than 12 digits', () => {
      expect(isGuestInfoValid({ ...valid, phoneNumber: '08123456789' })).toBe(false);
    });

    it('accepts phone with exactly 12 digits', () => {
      expect(isGuestInfoValid({ ...valid, phoneNumber: '123456789012' })).toBe(true);
    });

    it('accepts phone with any prefix as long as it has 12+ digits', () => {
      expect(isGuestInfoValid({ ...valid, phoneNumber: '6212345678901' })).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // isCartNotEmpty
  // -----------------------------------------------------------------------
  describe('isCartNotEmpty', () => {
    it('returns false for empty array', () => {
      expect(isCartNotEmpty([])).toBe(false);
    });

    it('returns true for non-empty array', () => {
      const item: CartEntry = {
        id: 1, name: 'Test', price: 100000, qty: 1, note: '',
        image: '', description: '', category: '', tag: '', allergens: '',
      };
      expect(isCartNotEmpty([item])).toBe(true);
    });
  });

  // -----------------------------------------------------------------------
  // isPaymentComplete
  // -----------------------------------------------------------------------
  describe('isPaymentComplete', () => {
    it('returns true for room charge regardless of proof', () => {
      expect(isPaymentComplete('room', null, false)).toBe(true);
      expect(isPaymentComplete('room', null, true)).toBe(true);
    });

    it('returns false for bank with no proof or bank selection', () => {
      expect(isPaymentComplete('bank', null, false)).toBe(false);
      expect(isPaymentComplete('bank', 'bca', false)).toBe(false);
      expect(isPaymentComplete('bank', null, true)).toBe(false);
    });

    it('returns true for bank with selection and proof', () => {
      expect(isPaymentComplete('bank', 'bca', true)).toBe(true);
    });

    it('returns false for qris with no proof', () => {
      expect(isPaymentComplete('qris', null, false)).toBe(false);
    });

    it('returns true for qris with proof', () => {
      expect(isPaymentComplete('qris', null, true)).toBe(true);
    });
  });
});
