import { describe, it, expect, beforeEach } from 'vitest';
import { persistCart, loadCart, buildWhatsAppMessage } from '../effects';
import type { CartEntry, GuestInfo } from '../types';

// ---------------------------------------------------------------------------
// Mock localStorage
// ---------------------------------------------------------------------------
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
});

// ---------------------------------------------------------------------------
const sampleEntry: CartEntry = {
  id: 1, name: 'Flat White', price: 55000, qty: 2, note: 'extra hot',
  image: '', description: '', category: 'Beverages', tag: '', allergens: '',
};

const guest: GuestInfo = { roomNumber: '1024', lastName: 'Smith', phoneNumber: '08123456789' };

// ---------------------------------------------------------------------------
describe('persistCart', () => {
  it('saves cart under the key "room_service_cart"', () => {
    persistCart([sampleEntry]);
    const stored = localStorageMock.getItem('room_service_cart');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual([sampleEntry]);
  });

  it('does NOT use the old "ciputra_cart" key', () => {
    persistCart([sampleEntry]);
    expect(localStorageMock.getItem('ciputra_cart')).toBeNull();
  });

  it('does NOT use the "atelier_cart" key', () => {
    persistCart([sampleEntry]);
    expect(localStorageMock.getItem('atelier_cart')).toBeNull();
  });
});

describe('loadCart', () => {
  it('returns empty array when nothing stored', () => {
    expect(loadCart()).toEqual([]);
  });

  it('returns stored cart entries', () => {
    localStorageMock.setItem('room_service_cart', JSON.stringify([sampleEntry]));
    expect(loadCart()).toEqual([sampleEntry]);
  });

  it('returns empty array for corrupt data', () => {
    localStorageMock.setItem('room_service_cart', 'not json');
    expect(loadCart()).toEqual([]);
  });
});

describe('buildWhatsAppMessage', () => {
  it('contains the new brand name', () => {
    const msg = buildWhatsAppMessage([sampleEntry], guest, 'room');
    expect(msg).toContain('Atelier Meridian');
  });

  it('does NOT contain "Ciputra"', () => {
    const msg = buildWhatsAppMessage([sampleEntry], guest, 'room');
    expect(msg.toLowerCase()).not.toContain('ciputra');
  });

  it('does NOT contain "Gallery Restaurant"', () => {
    const msg = buildWhatsAppMessage([sampleEntry], guest, 'room');
    expect(msg.toLowerCase()).not.toContain('gallery restaurant');
  });

  it('contains room number', () => {
    const msg = buildWhatsAppMessage([sampleEntry], guest, 'room');
    expect(msg).toContain('1024');
  });

  it('contains item name and quantity', () => {
    const msg = buildWhatsAppMessage([sampleEntry], guest, 'room');
    expect(msg).toContain('Flat White');
    expect(msg).toContain('2');
  });

  it('contains formatted total', () => {
    // subtotal = 55000 * 2 = 110000, tax = 110000 * 0.21 = 23100, total = 133100
    const msg = buildWhatsAppMessage([sampleEntry], guest, 'room');
    expect(msg).toContain('133.100');
  });
});
