import type { GuestInfo, CartEntry, PaymentMethod } from './types';

/**
 * Validates a room number string.
 * Must be 1-4 digits, numeric only.
 */
export function isValidRoomNumber(room: string): boolean {
  if (room.length === 0) return false;
  if (room.length > 4) return false;
  return /^\d+$/.test(room);
}

/**
 * Validates complete guest information.
 * Room must be valid, name non-empty, phone must match Indonesian format.
 */
export function isGuestInfoValid(info: GuestInfo): boolean {
  if (!isValidRoomNumber(info.roomNumber)) return false;
  if (info.lastName.trim().length === 0) return false;

  const digits = info.phoneNumber.replace(/\D/g, '');
  if (digits.length === 0) return false;
  if (digits.length < 10 || digits.length > 14) return false;
  if (!digits.startsWith('08') && !digits.startsWith('628')) return false;

  return true;
}

/**
 * Returns true when the cart has at least one item.
 */
export function isCartNotEmpty(cart: CartEntry[]): boolean {
  return cart.length > 0;
}

/**
 * Checks whether payment is complete enough to place an order.
 * Room charge needs no proof. Bank requires bank to be selected and proof uploaded.
 * QRIS requires proof uploaded.
 */
export function isPaymentComplete(method: PaymentMethod, selectedBank: string | null, hasProof: boolean): boolean {
  if (method === 'room') return true;
  if (method === 'bank') return selectedBank !== null && hasProof;
  return hasProof;
}
