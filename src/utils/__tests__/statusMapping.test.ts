import { describe, it, expect } from 'vitest';
import { mapOrderStatusToStep } from '../statusMapping';

describe('mapOrderStatusToStep', () => {
  it('maps incoming correctly (0)', () => {
    expect(mapOrderStatusToStep('incoming')).toBe(0);
  });

  it('maps confirmed correctly (1)', () => {
    expect(mapOrderStatusToStep('confirmed')).toBe(1);
  });

  it('maps kitchen/preparing correctly (2)', () => {
    expect(mapOrderStatusToStep('kitchen')).toBe(2);
    expect(mapOrderStatusToStep('preparing')).toBe(2);
  });

  it('maps quality_check correctly (3)', () => {
    expect(mapOrderStatusToStep('quality_check')).toBe(3);
  });

  it('maps delivery and on_the_way to step 4', () => {
    expect(mapOrderStatusToStep('delivery')).toBe(4);
    expect(mapOrderStatusToStep('on_the_way')).toBe(4);
    expect(mapOrderStatusToStep('on the way')).toBe(4);
  });

  it('maps delivered and completed to step 5', () => {
    expect(mapOrderStatusToStep('delivered')).toBe(5);
    expect(mapOrderStatusToStep('completed')).toBe(5);
  });

  it('defaults gracefully for unknown or missing status', () => {
    expect(mapOrderStatusToStep(null)).toBe(0);
    expect(mapOrderStatusToStep(undefined)).toBe(0);
    expect(mapOrderStatusToStep('')).toBe(0);
    expect(mapOrderStatusToStep('invalid')).toBe(0);
  });
});

