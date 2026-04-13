import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrackingView } from '../TrackingView';
import { ErrorBoundary, TrackingFallback } from '../../components/ErrorBoundary';
import { onSnapshot } from 'firebase/firestore';

// Mock dependencies safely
vi.mock('../../lib/firebase', () => ({
  db: {}
}));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()),
  updateDoc: vi.fn()
}));

describe('TrackingView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders successfully without crashing when valid orderId is passed', () => {
    // If an icon import was missing (e.g. Clock), this would crash React.
    render(
      <ErrorBoundary fallback={(error, reset) => <TrackingFallback onReset={reset} lang="EN" />}>
        <TrackingView 
          lang="EN" 
          orderId="test-order-123" 
          roomNumber="101" 
          onFinish={() => {}} 
        />
      </ErrorBoundary>
    );

    // Should see Tracking Title
    expect(screen.getByText('Order Status')).toBeTruthy();
    // Should see confirmed step
    expect(screen.getAllByText('Order Confirmed').length).toBeGreaterThan(0);
  });

  it('renders WhatsApp fallback correctly if blocked URL is present', () => {
    render(
      <ErrorBoundary fallback={(error, reset) => <TrackingFallback onReset={reset} lang="EN" />}>
        <TrackingView 
          lang="EN" 
          orderId="test-order-123" 
          roomNumber="101" 
          onFinish={() => {}} 
          blockedWaUrl="https://wa.me/something"
        />
      </ErrorBoundary>
    );

    expect(screen.getByText('Open Manual Chat')).toBeTruthy();
  });

  it('surfaces the live progress state when the backend status reaches delivery', () => {
    vi.mocked(onSnapshot).mockImplementation((_ref, callback: (snapshot: any) => void) => {
      callback({
        exists: () => true,
        data: () => ({ status: 'on_the_way' }),
      });

      return vi.fn();
    });

    render(
      <ErrorBoundary fallback={(error, reset) => <TrackingFallback onReset={reset} lang="EN" />}>
        <TrackingView 
          lang="EN" 
          orderId="test-order-123" 
          roomNumber="101" 
          onFinish={() => {}} 
        />
      </ErrorBoundary>
    );

    expect(screen.getByText('Current Status')).toBeTruthy();
    expect(screen.getAllByText('On The Way').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Staff is en route to Room 101.').length).toBeGreaterThan(0);
  });
});
