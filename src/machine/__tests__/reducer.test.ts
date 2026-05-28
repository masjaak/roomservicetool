import { describe, it, expect } from 'vitest';
import { reducer } from '../reducer';
import { Screen, AppEvent, createInitialState } from '../types';
import type { AppState, CartEntry, GuestInfo } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const validGuest: GuestInfo = { roomNumber: '1024', lastName: 'Smith', phoneNumber: '081234567890' };

const sampleItem: Omit<CartEntry, 'qty' | 'note'> = {
  id: 1, name: 'Flat White', price: 55000,
  image: '', description: '', category: 'Beverages', tag: '', allergens: '',
};

const sampleEntry: CartEntry = { ...sampleItem, qty: 1, note: '' };

function stateAt(screen: Screen, overrides: Partial<AppState> = {}): AppState {
  return { ...createInitialState(), screen, ...overrides };
}

// ---------------------------------------------------------------------------
// Screen transitions — happy paths
// ---------------------------------------------------------------------------
describe('reducer — screen transitions', () => {
  it('transitions Welcome → Menu on valid SubmitGuestInfo', () => {
    const state = stateAt(Screen.Welcome);
    const next = reducer(state, { type: AppEvent.SubmitGuestInfo, payload: validGuest });
    expect(next.screen).toBe(Screen.Menu);
    expect(next.guest).toEqual(validGuest);
    expect(next.lastRejectedEvent).toBeNull();
  });

  it('stays on Welcome with invalid guest info (missing room) — rejected', () => {
    const state = stateAt(Screen.Welcome);
    const next = reducer(state, {
      type: AppEvent.SubmitGuestInfo,
      payload: { ...validGuest, roomNumber: '' },
    });
    expect(next.screen).toBe(Screen.Welcome);
    expect(next.lastRejectedEvent).toBe(AppEvent.SubmitGuestInfo);
  });

  it('stays on Welcome with invalid guest info (bad phone) — rejected', () => {
    const state = stateAt(Screen.Welcome);
    const next = reducer(state, {
      type: AppEvent.SubmitGuestInfo,
      payload: { ...validGuest, phoneNumber: '123' },
    });
    expect(next.screen).toBe(Screen.Welcome);
    expect(next.lastRejectedEvent).toBe(AppEvent.SubmitGuestInfo);
  });

  it('stays on Welcome with invalid guest info (missing phone) — rejected', () => {
    const state = stateAt(Screen.Welcome);
    const next = reducer(state, {
      type: AppEvent.SubmitGuestInfo,
      payload: { ...validGuest, phoneNumber: '' },
    });
    expect(next.screen).toBe(Screen.Welcome);
    expect(next.lastRejectedEvent).toBe(AppEvent.SubmitGuestInfo);
  });

  // Cart open/close (modal overlay, not a screen)
  it('opens cart modal on Menu when cart is not empty', () => {
    const state = stateAt(Screen.Menu, { cart: [sampleEntry] });
    const next = reducer(state, { type: AppEvent.OpenCart });
    expect(next.screen).toBe(Screen.Menu); // stays on Menu
    expect(next.isCartOpen).toBe(true);
    expect(next.lastRejectedEvent).toBeNull();
  });

  it('rejects OpenCart when cart is empty', () => {
    const state = stateAt(Screen.Menu, { cart: [] });
    const next = reducer(state, { type: AppEvent.OpenCart });
    expect(next.isCartOpen).toBe(false);
    expect(next.lastRejectedEvent).toBe(AppEvent.OpenCart);
  });

  it('closes cart modal', () => {
    const state = stateAt(Screen.Menu, { isCartOpen: true });
    const next = reducer(state, { type: AppEvent.CloseCart });
    expect(next.isCartOpen).toBe(false);
  });

  // Menu → Checkout
  it('transitions Menu → Checkout on StartCheckout when cart not empty', () => {
    const state = stateAt(Screen.Menu, { cart: [sampleEntry], isCartOpen: true });
    const next = reducer(state, { type: AppEvent.StartCheckout });
    expect(next.screen).toBe(Screen.Checkout);
    expect(next.isCartOpen).toBe(false); // cart drawer closes on checkout
  });

  it('rejects StartCheckout when cart is empty', () => {
    const state = stateAt(Screen.Menu, { cart: [] });
    const next = reducer(state, { type: AppEvent.StartCheckout });
    expect(next.screen).toBe(Screen.Menu);
    expect(next.lastRejectedEvent).toBe(AppEvent.StartCheckout);
  });

  // Checkout → Confirmed / Order Flow
  it('transitions Checkout → processing on SubmitOrder with room payment', () => {
    const state = stateAt(Screen.Checkout, {
      cart: [sampleEntry],
      paymentMethod: 'room',
      hasPaymentProof: false,
    });
    const next = reducer(state, { type: AppEvent.SubmitOrder });
    expect(next.screen).toBe(Screen.Checkout); // stays on checkout while processing
    expect(next.isProcessing).toBe(true);
    expect(next.lastRejectedEvent).toBeNull();
  });

  it('rejects SubmitOrder with qris but no proof', () => {
    const state = stateAt(Screen.Checkout, {
      cart: [sampleEntry],
      paymentMethod: 'qris',
      hasPaymentProof: false,
    });
    const next = reducer(state, { type: AppEvent.SubmitOrder });
    expect(next.screen).toBe(Screen.Checkout);
    expect(next.isProcessing).toBe(false);
    expect(next.lastRejectedEvent).toBe(AppEvent.SubmitOrder);
  });

  it('rejects SubmitOrder with bank but no selected bank', () => {
    const state = stateAt(Screen.Checkout, {
      cart: [sampleEntry],
      paymentMethod: 'bank',
      selectedBank: null,
      hasPaymentProof: true,
    });
    const next = reducer(state, { type: AppEvent.SubmitOrder });
    expect(next.isProcessing).toBe(false);
    expect(next.lastRejectedEvent).toBe(AppEvent.SubmitOrder);
  });

  it('transitions Checkout → processing on SubmitOrder with bank + selectedBank + proof', () => {
    const state = stateAt(Screen.Checkout, {
      cart: [sampleEntry],
      paymentMethod: 'bank',
      selectedBank: 'bca',
      hasPaymentProof: true,
    });
    const next = reducer(state, { type: AppEvent.SubmitOrder });
    expect(next.isProcessing).toBe(true);
    expect(next.lastRejectedEvent).toBeNull();
  });

  it('transitions Checkout → Confirmed on OrderSubmitSucceeded with payload object', () => {
    const state = stateAt(Screen.Checkout, { isProcessing: true });
    const next = reducer(state, { type: AppEvent.OrderSubmitSucceeded, payload: { id: 'ord-123', blockedWaUrl: 'https://wa.me/test' } });
    expect(next.screen).toBe(Screen.Confirmed);
    expect(next.isProcessing).toBe(false);
    expect(next.orderId).toBe('ord-123');
    expect(next.blockedWaUrl).toBe('https://wa.me/test');
  });

  it('stays on Checkout and shows error on OrderSubmitFailed', () => {
    const state = stateAt(Screen.Checkout, { isProcessing: true });
    const next = reducer(state, { type: AppEvent.OrderSubmitFailed, payload: 'Error network' });
    expect(next.screen).toBe(Screen.Checkout);
    expect(next.isProcessing).toBe(false);
    expect(next.checkoutError).toBe('Error network');
  });

  // Checkout → Menu (Back)
  it('transitions Checkout → Menu on BackFromCheckout, keeping cart intact', () => {
    const state = stateAt(Screen.Checkout, { cart: [sampleEntry], checkoutError: 'Some error' });
    const next = reducer(state, { type: AppEvent.BackFromCheckout });
    expect(next.screen).toBe(Screen.Menu);
    expect(next.cart).toHaveLength(1);
    expect(next.checkoutError).toBeNull();
  });

  // Confirmed → Welcome
  it('transitions Confirmed → Welcome on FinishOrder', () => {
    const state = stateAt(Screen.Confirmed);
    const next = reducer(state, { type: AppEvent.FinishOrder });
    expect(next.screen).toBe(Screen.Welcome);
    expect(next.cart).toEqual([]);
    expect(next.guest.roomNumber).toBe('');
  });

  // ResetFlow from any screen
  it('resets to Welcome from Menu', () => {
    const state = stateAt(Screen.Menu, { cart: [sampleEntry], guest: validGuest });
    const next = reducer(state, { type: AppEvent.ResetFlow });
    expect(next.screen).toBe(Screen.Welcome);
    expect(next.cart).toEqual([]);
  });

  it('resets to Welcome from Checkout', () => {
    const state = stateAt(Screen.Checkout, { cart: [sampleEntry] });
    const next = reducer(state, { type: AppEvent.ResetFlow });
    expect(next.screen).toBe(Screen.Welcome);
  });
});

// ---------------------------------------------------------------------------
// Invalid transitions — explicit rejection
// ---------------------------------------------------------------------------
describe('reducer — invalid transitions are explicitly rejected', () => {
  it('rejects SubmitOrder from Menu screen', () => {
    const state = stateAt(Screen.Menu);
    const next = reducer(state, { type: AppEvent.SubmitOrder });
    expect(next.screen).toBe(Screen.Menu);
    expect(next.lastRejectedEvent).toBe(AppEvent.SubmitOrder);
  });

  it('rejects StartCheckout from Welcome screen', () => {
    const state = stateAt(Screen.Welcome);
    const next = reducer(state, { type: AppEvent.StartCheckout });
    expect(next.screen).toBe(Screen.Welcome);
    expect(next.lastRejectedEvent).toBe(AppEvent.StartCheckout);
  });

  it('rejects SubmitOrder from Welcome screen', () => {
    const state = stateAt(Screen.Welcome);
    const next = reducer(state, { type: AppEvent.SubmitOrder });
    expect(next.screen).toBe(Screen.Welcome);
    expect(next.lastRejectedEvent).toBe(AppEvent.SubmitOrder);
  });

  it('rejects OpenCart from Confirmed screen', () => {
    const state = stateAt(Screen.Confirmed);
    const next = reducer(state, { type: AppEvent.OpenCart });
    expect(next.screen).toBe(Screen.Confirmed);
    expect(next.lastRejectedEvent).toBe(AppEvent.OpenCart);
  });

  it('rejects SubmitGuestInfo from Menu (already past welcome)', () => {
    const state = stateAt(Screen.Menu, { guest: validGuest });
    const next = reducer(state, { type: AppEvent.SubmitGuestInfo, payload: validGuest });
    expect(next.screen).toBe(Screen.Menu);
    expect(next.lastRejectedEvent).toBe(AppEvent.SubmitGuestInfo);
  });

  it('rejects FinishOrder from Menu screen', () => {
    const state = stateAt(Screen.Menu);
    const next = reducer(state, { type: AppEvent.FinishOrder });
    expect(next.screen).toBe(Screen.Menu);
    expect(next.lastRejectedEvent).toBe(AppEvent.FinishOrder);
  });

  it('rejects AddItem from Checkout screen', () => {
    const state = stateAt(Screen.Checkout, { cart: [sampleEntry] });
    const next = reducer(state, {
      type: AppEvent.AddItem,
      payload: { item: sampleItem, qty: 1, note: '' },
    });
    expect(next.cart).toHaveLength(1); // unchanged
    expect(next.lastRejectedEvent).toBe(AppEvent.AddItem);
  });

  it('rejects SelectPaymentMethod from Menu screen', () => {
    const state = stateAt(Screen.Menu);
    const next = reducer(state, {
      type: AppEvent.SelectPaymentMethod,
      payload: { method: 'bank', selectedBank: 'bca', hasProof: true },
    });
    expect(next.paymentMethod).toBe('room'); // unchanged
    expect(next.lastRejectedEvent).toBe(AppEvent.SelectPaymentMethod);
  });

  it('clears rejection flag on next valid dispatch', () => {
    const state = stateAt(Screen.Welcome);
    const rejected = reducer(state, { type: AppEvent.SubmitOrder });
    expect(rejected.lastRejectedEvent).toBe(AppEvent.SubmitOrder);

    const next = reducer(rejected, {
      type: AppEvent.SubmitGuestInfo,
      payload: validGuest,
    });
    expect(next.lastRejectedEvent).toBeNull();
    expect(next.screen).toBe(Screen.Menu);
  });
});

// ---------------------------------------------------------------------------
// Cart mutations
// ---------------------------------------------------------------------------
describe('reducer — cart operations', () => {
  it('adds an item to cart on Menu screen', () => {
    const state = stateAt(Screen.Menu);
    const next = reducer(state, {
      type: AppEvent.AddItem,
      payload: { item: sampleItem, qty: 2, note: 'extra hot' },
    });
    expect(next.cart).toHaveLength(1);
    expect(next.cart[0].qty).toBe(2);
    expect(next.cart[0].note).toBe('extra hot');
  });

  it('merges quantity when adding same item with same note', () => {
    const state = stateAt(Screen.Menu, { cart: [{ ...sampleEntry, qty: 1, note: '' }] });
    const next = reducer(state, {
      type: AppEvent.AddItem,
      payload: { item: sampleItem, qty: 3, note: '' },
    });
    expect(next.cart).toHaveLength(1);
    expect(next.cart[0].qty).toBe(4);
  });

  it('does not merge when note differs', () => {
    const state = stateAt(Screen.Menu, { cart: [{ ...sampleEntry, qty: 1, note: '' }] });
    const next = reducer(state, {
      type: AppEvent.AddItem,
      payload: { item: sampleItem, qty: 1, note: 'no sugar' },
    });
    expect(next.cart).toHaveLength(2);
  });

  it('removes an item from cart by index', () => {
    const state = stateAt(Screen.Menu, {
      cart: [
        { ...sampleEntry, id: 1, name: 'A' },
        { ...sampleEntry, id: 2, name: 'B' },
      ],
    });
    const next = reducer(state, { type: AppEvent.RemoveItem, payload: 0 });
    expect(next.cart).toHaveLength(1);
    expect(next.cart[0].name).toBe('B');
  });

  it('edits a note on an existing cart item', () => {
    const state = stateAt(Screen.Menu, { cart: [sampleEntry] });
    const next = reducer(state, {
      type: AppEvent.EditNote,
      payload: { index: 0, note: 'no ice' },
    });
    expect(next.cart[0].note).toBe('no ice');
  });
});

// ---------------------------------------------------------------------------
// Category & search
// ---------------------------------------------------------------------------
describe('reducer — browsing', () => {
  it('updates selectedCategory on BrowseCategory', () => {
    const state = stateAt(Screen.Menu);
    const next = reducer(state, { type: AppEvent.BrowseCategory, payload: 'Desserts' });
    expect(next.selectedCategory).toBe('Desserts');
  });

  it('updates searchQuery on Search', () => {
    const state = stateAt(Screen.Menu);
    const next = reducer(state, { type: AppEvent.Search, payload: 'salmon' });
    expect(next.searchQuery).toBe('salmon');
  });
});

// ---------------------------------------------------------------------------
// Payment method selection
// ---------------------------------------------------------------------------
describe('reducer — payment selection', () => {
  it('updates payment method on Checkout screen', () => {
    const state = stateAt(Screen.Checkout);
    const next = reducer(state, {
      type: AppEvent.SelectPaymentMethod,
      payload: { method: 'bank', selectedBank: 'bca', hasProof: true },
    });
    expect(next.paymentMethod).toBe('bank');
    expect(next.selectedBank).toBe('bca');
    expect(next.hasPaymentProof).toBe(true);
  });
});
