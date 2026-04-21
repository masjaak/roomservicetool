import { describe, expect, it } from 'vitest';
import { buildTrackingPresentation } from '../trackingPresentation';

describe('buildTrackingPresentation', () => {
  it('keeps incoming orders on the first compact timeline state', () => {
    const presentation = buildTrackingPresentation({
      statusStep: 0,
      roomNumber: '101',
      lang: 'EN',
    });

    expect(presentation.activeStepIndex).toBe(0);
    expect(presentation.estimatedDeliveryLabel).toBe('30-45 Minutes');
    expect(presentation.currentStep.label).toBe('Order Confirmed');
  });

  it('collapses kitchen and quality states into the preparing stage', () => {
    const presentation = buildTrackingPresentation({
      statusStep: 3,
      roomNumber: '101',
      lang: 'EN',
    });

    expect(presentation.activeStepIndex).toBe(1);
    expect(presentation.currentStep.label).toBe('Preparing in Kitchen');
  });

  it('maps delivery progress to the on-the-way stage with room-specific copy', () => {
    const presentation = buildTrackingPresentation({
      statusStep: 4,
      roomNumber: '808',
      lang: 'EN',
    });

    expect(presentation.activeStepIndex).toBe(2);
    expect(presentation.currentStep.sub).toBe('Staff is en route to Room 808.');
  });

  it('switches the ETA label to delivered for completed orders in Indonesian', () => {
    const presentation = buildTrackingPresentation({
      statusStep: 5,
      roomNumber: '202',
      lang: 'ID',
    });

    expect(presentation.activeStepIndex).toBe(3);
    expect(presentation.estimatedDeliveryLabel).toBe('Sudah Tiba');
    expect(presentation.currentStep.label).toBe('Delivered');
  });
});
