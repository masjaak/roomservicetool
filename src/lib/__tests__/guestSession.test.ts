import { describe, expect, it, vi, beforeEach } from 'vitest';
import { redeemGuestAccessSession, loadStoredGuestSession } from '../guestSession';

vi.mock('../firebase', () => ({
  isSparkDemoMode: true,
  firebaseConfig: { apiKey: 'test-key', projectId: 'test-proj' },
  auth: null,
  functions: null,
  assertFirebaseConfigured: vi.fn(),
}));

describe('redeemGuestAccessSession (Spark Demo Mode)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns a session immediately without calling Firebase', async () => {
    const session = await redeemGuestAccessSession({
      accessToken: '',
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '081234567890',
    });

    expect(session).toBeDefined();
    expect(session.stayId).toBe('demo');
    expect(session.roomNumber).toBe('1204');
    expect(session.lastName).toBe('Santoso');
    expect(session.phoneNumber).toBe('6281234567890');
    expect(session.expiresAt).toBeTruthy();
  });

  it('normalizes the phone number to 628 format', async () => {
    const session = await redeemGuestAccessSession({
      accessToken: '',
      roomNumber: '101',
      lastName: 'Tan',
      phoneNumber: '+62 812 3456 7890',
    });

    expect(session.phoneNumber).toBe('6281234567890');
  });

  it('trims whitespace from room number and last name', async () => {
    const session = await redeemGuestAccessSession({
      accessToken: '',
      roomNumber: '  1204  ',
      lastName: '  Santoso  ',
      phoneNumber: '081234567890',
    });

    expect(session.roomNumber).toBe('1204');
    expect(session.lastName).toBe('Santoso');
  });

  it('sets stayId to "demo"', async () => {
    const session = await redeemGuestAccessSession({
      accessToken: '',
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '081234567890',
    });

    expect(session.stayId).toBe('demo');
  });

  it('sets the accessTokenId to undefined', async () => {
    const session = await redeemGuestAccessSession({
      accessToken: '',
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '081234567890',
    });

    expect(session.accessTokenId).toBeUndefined();
  });

  it('persists the session to localStorage', async () => {
    await redeemGuestAccessSession({
      accessToken: '',
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '081234567890',
    });

    const stored = loadStoredGuestSession();
    expect(stored).not.toBeNull();
    expect(stored!.stayId).toBe('demo');
    expect(stored!.roomNumber).toBe('1204');
  });

  it('works with any phone number having 12+ digits (no prefix restriction)', async () => {
    const session = await redeemGuestAccessSession({
      accessToken: '',
      roomNumber: '1204',
      lastName: 'Santoso',
      phoneNumber: '123456789012',
    });

    expect(session).toBeDefined();
    expect(session.phoneNumber).toBe('123456789012');
  });
});
