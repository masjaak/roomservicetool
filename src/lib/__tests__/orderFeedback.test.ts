import { describe, expect, it, vi } from 'vitest';
import { buildOrderFeedbackRestUrl, submitOrderFeedback } from '../orderFeedback';

describe('order feedback submission', () => {
  it('builds an encoded REST document URL for feedback updates', () => {
    expect(buildOrderFeedbackRestUrl('order/with space')).toContain('/orders/order%2Fwith%20space?key=');
  });

  it('falls back to the Firestore REST API when the SDK update fails', async () => {
    const updateWithSdk = vi.fn().mockRejectedValue(new Error('permission-denied'));
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    await expect(submitOrderFeedback({
      orderId: 'order-123',
      payload: { rating: 5, feedback: 'Excellent service.' },
      updateWithSdk,
      fetchImpl,
    })).resolves.toBeUndefined();

    expect(updateWithSdk).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining('/orders/order-123?key='),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('falls back to REST when the SDK update hangs past the timeout window', async () => {
    vi.useFakeTimers();

    const updateWithSdk = vi.fn(() => new Promise<void>(() => {}));
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const request = submitOrderFeedback({
      orderId: 'order-456',
      payload: { rating: 4, feedback: 'Thank you.' },
      updateWithSdk,
      fetchImpl,
      sdkTimeoutMs: 25,
    });

    await vi.advanceTimersByTimeAsync(30);
    await expect(request).resolves.toBeUndefined();

    expect(updateWithSdk).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
