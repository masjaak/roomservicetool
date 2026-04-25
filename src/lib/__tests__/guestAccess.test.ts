import { describe, expect, it } from 'vitest';
import {
  isGuestStayRecordMatch,
  normalizeGuestLastName,
  normalizeGuestPhone,
} from '../guestAccess';

describe('guestAccess helpers', () => {
  it('normalizes Indonesian phone numbers to 628 format', () => {
    expect(normalizeGuestPhone('0812-3456-7890')).toBe('6281234567890');
    expect(normalizeGuestPhone('+62 812 3456 7890')).toBe('6281234567890');
  });

  it('normalizes last names for stable matching', () => {
    expect(normalizeGuestLastName('  Van   Buren ')).toBe('van buren');
  });

  it('matches only active guest stay records with the same room, last name, and phone', () => {
    const isMatch = isGuestStayRecordMatch(
      {
        roomNumber: '1204',
        lastName: 'Santoso',
        phoneNumber: '081234567890',
        checkedIn: true,
      },
      {
        roomNumber: '1204',
        lastName: 'santoso',
        phoneNumber: '+6281234567890',
      }
    );

    expect(isMatch).toBe(true);
  });

  it('rejects guest stay records that are not actively checked in', () => {
    const isMatch = isGuestStayRecordMatch(
      {
        roomNumber: '1204',
        lastName: 'Santoso',
        phoneNumber: '081234567890',
        checkedIn: false,
      },
      {
        roomNumber: '1204',
        lastName: 'Santoso',
        phoneNumber: '081234567890',
      }
    );

    expect(isMatch).toBe(false);
  });
});
