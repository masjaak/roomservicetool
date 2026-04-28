import { describe, expect, it, vi } from 'vitest';
import { buildOrderStatusRestUrl, fetchOrderStatus, readOrderStatusFromRestDocument } from '../orderStatus';

describe('order status REST fallback', () => {
  it('reads the string status from a Firestore REST document', () => {
    expect(readOrderStatusFromRestDocument({
      fields: {
        status: { stringValue: 'on_the_way' },
      },
    })).toBe('on_the_way');
  });

  it('returns null when a Firestore REST document has no usable status', () => {
    expect(readOrderStatusFromRestDocument({ fields: {} })).toBeNull();
    expect(readOrderStatusFromRestDocument(null)).toBeNull();
  });

  it('builds an encoded document URL for order ids with unsafe characters', () => {
    expect(buildOrderStatusRestUrl('order/with space')).toContain('/orders/order%2Fwith%20space?key=');
  });

  it('fetches the current order status through REST as a realtime-listener fallback', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        fields: {
          status: { stringValue: 'preparing' },
        },
      }),
    });

    await expect(fetchOrderStatus('order-123', fetchImpl)).resolves.toBe('preparing');
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining('/orders/order-123?key='));
  });
});
