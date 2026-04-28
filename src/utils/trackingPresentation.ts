import type { Language } from '../types';

interface TrackingPresentationInput {
  statusStep: number;
  roomNumber: string;
  lang: Language;
}

interface TrackingStepViewModel {
  label: string;
  sub: string;
}

interface TrackingPresentation {
  activeStepIndex: number;
  currentStep: TrackingStepViewModel;
  estimatedDeliveryLabel: string;
  steps: TrackingStepViewModel[];
}

export function buildTrackingPresentation({
  statusStep,
  roomNumber,
  lang,
}: TrackingPresentationInput): TrackingPresentation {
  const steps: TrackingStepViewModel[] = [
    { label: 'Order Confirmed', sub: 'We have received your order.' },
    { label: 'Preparing in Kitchen', sub: 'Our chefs are preparing your meal.' },
    { label: 'On The Way', sub: `Staff is en route to Room ${roomNumber}.` },
    { label: 'Delivered', sub: 'Enjoy your experience.' },
  ];

  if (statusStep < 0) {
    const cancelledStep = {
      label: 'Order Cancelled',
      sub: lang === 'ID'
        ? 'Pesanan ini dibatalkan oleh tim hotel.'
        : 'This order was cancelled by hotel staff.',
    };

    return {
      activeStepIndex: 0,
      currentStep: cancelledStep,
      estimatedDeliveryLabel: lang === 'ID' ? 'Dibatalkan' : 'Cancelled',
      steps: [cancelledStep, ...steps.slice(1)],
    };
  }

  const activeStepIndex = statusStep <= 0 ? 0 : statusStep <= 3 ? 1 : statusStep <= 4 ? 2 : 3;

  return {
    activeStepIndex,
    currentStep: steps[activeStepIndex],
    estimatedDeliveryLabel: activeStepIndex === 3
      ? (lang === 'ID' ? 'Sudah Tiba' : 'Delivered')
      : '30-45 Minutes',
    steps,
  };
}
