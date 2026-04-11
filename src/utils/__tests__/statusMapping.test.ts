import { describe, it, expect } from 'vitest';
import { mapOrderStatusToStep } from '../statusMapping';

describe('mapOrderStatusToStep', () => {
  it('maps incoming correctly', () => {
    expect(mapOrderStatusToStep('incoming')).toBe(0);
  });

  it('maps kitchen correctly', () => {
    expect(mapOrderStatusToStep('kitchen')).toBe(1);
  });

  it('maps delivery and on_the_way to step 2', () => {
    expect(mapOrderStatusToStep('delivery')).toBe(2);
    expect(mapOrderStatusToStep('on_the_way')).toBe(2);
    expect(mapOrderStatusToStep('on the way')).toBe(2);
  });

  it('maps delivered and completed to step 3', () => {
    expect(mapOrderStatusToStep('delivered')).toBe(3);
    expect(mapOrderStatusToStep('completed')).toBe(3);
  });

  it('defaults gracefully for unknown or missing status', () => {
    expect(mapOrderStatusToStep(null)).toBe(0);
    expect(mapOrderStatusToStep(undefined)).toBe(0);
    expect(mapOrderStatusToStep('')).toBe(0);
    expect(mapOrderStatusToStep('invalid')).toBe(0);
  });
});
