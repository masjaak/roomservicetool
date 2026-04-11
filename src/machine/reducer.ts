import type { AppState, Action } from './types';
import { Screen, AppEvent, createInitialState } from './types';
import { isGuestInfoValid, isCartNotEmpty, isPaymentComplete } from './guards';

/**
 * Mark an event as rejected — does not change screen, records rejection.
 */
function reject(state: AppState, event: AppEvent): AppState {
  return { ...state, lastRejectedEvent: event };
}

/**
 * Pure reducer for the Atelier Meridian Room Service state machine.
 * No side effects — only state → state transformations.
 *
 * Invalid transitions are explicitly rejected: `lastRejectedEvent` is set
 * to the event type that was attempted, so UI can react accordingly.
 */
export function reducer(state: AppState, action: Action): AppState {
  // Clear any previous rejection on every new dispatch
  const s = { ...state, lastRejectedEvent: null };

  switch (action.type) {
    // -------------------------------------------------------------------
    // Screen transitions
    // -------------------------------------------------------------------
    case AppEvent.SubmitGuestInfo: {
      if (s.screen !== Screen.Welcome) return reject(s, action.type);
      if (!isGuestInfoValid(action.payload)) return reject(s, action.type);
      return { ...s, screen: Screen.Menu, guest: action.payload };
    }

    case AppEvent.OpenCart: {
      if (s.screen !== Screen.Menu) return reject(s, action.type);
      if (!isCartNotEmpty(s.cart)) return reject(s, action.type);
      return { ...s, isCartOpen: true };
    }

    case AppEvent.CloseCart: {
      return { ...s, isCartOpen: false };
    }

    case AppEvent.StartCheckout: {
      if (s.screen !== Screen.Menu) return reject(s, action.type);
      if (!isCartNotEmpty(s.cart)) return reject(s, action.type);
      return { ...s, screen: Screen.Checkout, isCartOpen: false, checkoutError: null };
    }

    case AppEvent.BackFromCheckout: {
      if (s.screen !== Screen.Checkout) return reject(s, action.type);
      return { ...s, screen: Screen.Menu, checkoutError: null };
    }

    case AppEvent.SubmitOrder: {
      if (s.screen !== Screen.Checkout) return reject(s, action.type);
      if (!isPaymentComplete(s.paymentMethod, s.selectedBank, s.hasPaymentProof)) return reject(s, action.type);
      return { ...s, isProcessing: true, checkoutError: null };
    }

    case AppEvent.OrderSubmitSucceeded: {
      if (s.screen !== Screen.Checkout) return reject(s, action.type);
      return { 
        ...s, 
        screen: Screen.Confirmed, 
        isProcessing: false, 
        orderId: action.payload.id,
        blockedWaUrl: action.payload.blockedWaUrl
      };
    }

    case AppEvent.OrderSubmitFailed: {
      if (s.screen !== Screen.Checkout) return reject(s, action.type);
      return { ...s, isProcessing: false, checkoutError: action.payload };
    }

    case AppEvent.FinishOrder: {
      if (s.screen !== Screen.Confirmed) return reject(s, action.type);
      return createInitialState();
    }

    case AppEvent.ResetFlow: {
      return createInitialState();
    }

    // -------------------------------------------------------------------
    // Cart operations (allowed on Menu screen only)
    // -------------------------------------------------------------------
    case AppEvent.AddItem: {
      if (s.screen !== Screen.Menu) return reject(s, action.type);
      const { item, qty, note } = action.payload;
      const existingIdx = s.cart.findIndex(
        (e) => e.id === item.id && e.note === note
      );
      if (existingIdx >= 0) {
        const newCart = [...s.cart];
        newCart[existingIdx] = {
          ...newCart[existingIdx],
          qty: newCart[existingIdx].qty + qty,
        };
        return { ...s, cart: newCart };
      }
      return { ...s, cart: [...s.cart, { ...item, qty, note }] };
    }

    case AppEvent.RemoveItem: {
      const idx = action.payload;
      const newCart = [...s.cart];
      newCart.splice(idx, 1);
      return { ...s, cart: newCart };
    }

    case AppEvent.EditNote: {
      const { index, note } = action.payload;
      if (index < 0 || index >= s.cart.length) return s;
      const newCart = [...s.cart];
      newCart[index] = { ...newCart[index], note };
      return { ...s, cart: newCart };
    }

    // -------------------------------------------------------------------
    // Browsing (only on Menu)
    // -------------------------------------------------------------------
    case AppEvent.BrowseCategory: {
      return { ...s, selectedCategory: action.payload };
    }

    case AppEvent.Search: {
      return { ...s, searchQuery: action.payload };
    }

    // -------------------------------------------------------------------
    // Payment selection (only on Checkout)
    // -------------------------------------------------------------------
    case AppEvent.SelectPaymentMethod: {
      if (s.screen !== Screen.Checkout) return reject(s, action.type);
      return {
        ...s,
        paymentMethod: action.payload.method,
        selectedBank: action.payload.selectedBank,
        hasPaymentProof: action.payload.hasProof,
      };
    }

    default:
      return s;
  }
}
