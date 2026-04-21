import { describe, expect, it } from 'vitest';
import {
  CheckoutPaymentEvent,
  createInitialCheckoutPaymentState,
  getCheckoutPaymentSubmitState,
  transitionCheckoutPaymentState,
} from '../checkoutPaymentState';

describe('checkoutPaymentState', () => {
  it('starts with room charge selected and no rejected event', () => {
    expect(createInitialCheckoutPaymentState()).toEqual({
      method: 'room',
      selectedBank: null,
      transferProof: null,
      lastRejectedEvent: null,
    });
  });

  it('resets bank and proof when switching to a different payment method', () => {
    const withBank = transitionCheckoutPaymentState(createInitialCheckoutPaymentState(), {
      type: CheckoutPaymentEvent.SelectMethod,
      method: 'bank',
    });
    const withSelectedBank = transitionCheckoutPaymentState(withBank, {
      type: CheckoutPaymentEvent.SelectBank,
      bankId: 'bca',
    });
    const withProof = transitionCheckoutPaymentState(withSelectedBank, {
      type: CheckoutPaymentEvent.AttachProof,
      file: { name: 'receipt.png' } as File,
    });

    const switched = transitionCheckoutPaymentState(withProof, {
      type: CheckoutPaymentEvent.SelectMethod,
      method: 'qris',
    });

    expect(switched).toEqual({
      method: 'qris',
      selectedBank: null,
      transferProof: null,
      lastRejectedEvent: null,
    });
  });

  it('rejects selecting a bank when the current method is not bank transfer', () => {
    const state = transitionCheckoutPaymentState(createInitialCheckoutPaymentState(), {
      type: CheckoutPaymentEvent.SelectBank,
      bankId: 'bca',
    });

    expect(state).toEqual({
      method: 'room',
      selectedBank: null,
      transferProof: null,
      lastRejectedEvent: CheckoutPaymentEvent.SelectBank,
    });
  });

  it('rejects proof upload for room charge because the guard does not allow it', () => {
    const state = transitionCheckoutPaymentState(createInitialCheckoutPaymentState(), {
      type: CheckoutPaymentEvent.AttachProof,
      file: { name: 'receipt.png' } as File,
    });

    expect(state).toEqual({
      method: 'room',
      selectedBank: null,
      transferProof: null,
      lastRejectedEvent: CheckoutPaymentEvent.AttachProof,
    });
  });

  it('requires both bank selection and proof for bank transfer submission', () => {
    const bankState = transitionCheckoutPaymentState(createInitialCheckoutPaymentState(), {
      type: CheckoutPaymentEvent.SelectMethod,
      method: 'bank',
    });

    expect(getCheckoutPaymentSubmitState(bankState, 2)).toBe(false);

    const bankWithSelection = transitionCheckoutPaymentState(bankState, {
      type: CheckoutPaymentEvent.SelectBank,
      bankId: 'bca',
    });

    expect(getCheckoutPaymentSubmitState(bankWithSelection, 2)).toBe(false);

    const readyBankState = transitionCheckoutPaymentState(bankWithSelection, {
      type: CheckoutPaymentEvent.AttachProof,
      file: { name: 'receipt.png' } as File,
    });

    expect(getCheckoutPaymentSubmitState(readyBankState, 2)).toBe(true);
  });

  it('requires proof for qris submission and blocks empty carts for all methods', () => {
    const qrisState = transitionCheckoutPaymentState(createInitialCheckoutPaymentState(), {
      type: CheckoutPaymentEvent.SelectMethod,
      method: 'qris',
    });

    expect(getCheckoutPaymentSubmitState(qrisState, 1)).toBe(false);
    expect(getCheckoutPaymentSubmitState(qrisState, 0)).toBe(false);

    const readyQrisState = transitionCheckoutPaymentState(qrisState, {
      type: CheckoutPaymentEvent.AttachProof,
      file: { name: 'receipt.png' } as File,
    });

    expect(getCheckoutPaymentSubmitState(readyQrisState, 1)).toBe(true);
    expect(getCheckoutPaymentSubmitState(readyQrisState, 0)).toBe(false);
  });
});
