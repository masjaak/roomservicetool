import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrackingView } from '../TrackingView';
import { ErrorBoundary, TrackingFallback } from '../../components/ErrorBoundary';

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
    expect(screen.getByText('Service Itinerary')).toBeTruthy();
    // Should see confirmed step
    expect(screen.getAllByText('Preparation initiated').length).toBeGreaterThan(0);
    expect(screen.getByText('Service details')).toBeTruthy();
    expect(screen.getByText('Expected arrival')).toBeTruthy();
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

    expect(screen.getByText('Open WhatsApp Manually')).toBeTruthy();
  });
});
