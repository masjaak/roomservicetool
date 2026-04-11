import type { CartEntry, GuestInfo, PaymentMethod } from './types';

const CART_STORAGE_KEY = 'room_service_cart';

/**
 * Save cart to localStorage.
 */
export function persistCart(cart: CartEntry[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Load cart from localStorage. Returns empty array on failure.
 */
export function loadCart(): CartEntry[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Remove cart from localStorage.
 */
export function clearCart(): void {
  localStorage.removeItem(CART_STORAGE_KEY);
}

/**
 * Format a number as IDR currency string.
 */
function formatIDR(n: number): string {
  return 'Rp ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Build the WhatsApp order message using the Atelier Meridian brand.
 */
export function buildWhatsAppMessage(
  cart: CartEntry[],
  guest: GuestInfo,
  paymentMethod: PaymentMethod,
): string {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxService = subtotal * 0.21;
  const total = subtotal + taxService;

  const now = new Date();
  const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  let msg = `*🔔 ATELIER MERIDIAN · ROOM SERVICE*\n`;
  msg += `*Room ${guest.roomNumber}*\n`;
  msg += `📅 ${date} | ⏰ ${time}\n`;
  msg += `📞 Guest: ${guest.phoneNumber}\n`;
  msg += `=============================\n`;

  for (const item of cart) {
    const lineTotal = item.price * item.qty;
    msg += `*${item.qty}x ${item.name}*\n`;
    if (item.note) msg += `   📝 _${item.note}_\n`;
    msg += `   @ ${formatIDR(item.price)} = ${formatIDR(lineTotal)}\n\n`;
  }

  msg += `=============================\n`;
  msg += `Subtotal: ${formatIDR(subtotal)}\n`;
  msg += `Service & Tax (21%): ${formatIDR(taxService)}\n`;
  msg += `*💰 TOTAL: ${formatIDR(total)}*\n`;
  msg += `=============================\n`;

  let paymentLabel = '';
  if (paymentMethod === 'room') paymentLabel = 'CHARGE TO ROOM 🏨';
  if (paymentMethod === 'qris') paymentLabel = 'QRIS / E-WALLET 📱';
  if (paymentMethod === 'bank') paymentLabel = 'BANK TRANSFER 💳';

  msg += `Payment: *${paymentLabel}*\n`;

  if (paymentMethod !== 'room') {
    msg += `\n_(Please attach payment proof)_\n`;
  }

  msg += `\n_Atelier Meridian Room Service · Thank you_ 🙏`;

  return msg;
}

/**
 * Build the full WhatsApp link URL.
 */
export function buildWhatsAppUrl(
  cart: CartEntry[],
  guest: GuestInfo,
  paymentMethod: PaymentMethod,
  staffPhone: string = '6281285864059',
): string {
  const message = buildWhatsAppMessage(cart, guest, paymentMethod);
  return `https://wa.me/${staffPhone}?text=${encodeURIComponent(message)}`;
}
