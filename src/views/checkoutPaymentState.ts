import type { PaymentMethod } from '../machine/types';

export enum CheckoutPaymentEvent {
  SelectMethod = 'selectMethod',
  SelectBank = 'selectBank',
  AttachProof = 'attachProof',
}

export interface CheckoutPaymentState {
  method: PaymentMethod;
  selectedBank: string | null;
  transferProof: File | null;
  lastRejectedEvent: CheckoutPaymentEvent | null;
}

type CheckoutPaymentAction =
  | { type: CheckoutPaymentEvent.SelectMethod; method: PaymentMethod }
  | { type: CheckoutPaymentEvent.SelectBank; bankId: string }
  | { type: CheckoutPaymentEvent.AttachProof; file: File | null };

export function createInitialCheckoutPaymentState(): CheckoutPaymentState {
  return {
    method: 'room',
    selectedBank: null,
    transferProof: null,
    lastRejectedEvent: null,
  };
}

export function transitionCheckoutPaymentState(
  state: CheckoutPaymentState,
  action: CheckoutPaymentAction,
): CheckoutPaymentState {
  switch (action.type) {
    case CheckoutPaymentEvent.SelectMethod:
      return {
        method: action.method,
        selectedBank: action.method === 'bank' ? state.selectedBank : null,
        transferProof: null,
        lastRejectedEvent: null,
      };

    case CheckoutPaymentEvent.SelectBank:
      if (state.method !== 'bank') {
        return {
          ...state,
          lastRejectedEvent: CheckoutPaymentEvent.SelectBank,
        };
      }

      return {
        ...state,
        selectedBank: action.bankId,
        lastRejectedEvent: null,
      };

    case CheckoutPaymentEvent.AttachProof:
      if (state.method === 'room') {
        return {
          ...state,
          lastRejectedEvent: CheckoutPaymentEvent.AttachProof,
        };
      }

      return {
        ...state,
        transferProof: action.file,
        lastRejectedEvent: null,
      };
  }
}

export function getCheckoutPaymentSubmitState(
  state: CheckoutPaymentState,
  cartSize: number,
): boolean {
  if (cartSize <= 0) return false;

  if (state.method === 'room') return true;
  if (state.method === 'qris') return !!state.transferProof;

  return !!state.selectedBank && !!state.transferProof;
}
