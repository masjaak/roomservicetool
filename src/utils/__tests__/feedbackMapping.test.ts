import { describe, expect, it } from 'vitest';
import { buildLegacyFeedback } from '../feedbackMapping';
import { FeedbackPayload } from '../../types';

describe('feedbackMapping', () => {
  it('generates a full review summary correctly without comments', () => {
    const payload: FeedbackPayload = {
      overallRating: 5,
      foodQuality: 5,
      speedOfService: 4,
      wouldOrderAgain: true,
      comment: '',
    };
    
    const result = buildLegacyFeedback(payload);
    
    expect(result.rating).toBe(5);
    expect(result.feedback).toBe('');
    expect(result.review).toBe('');
    expect(result.reviewSummary).toBe('5★ · Food 5 · Speed 4 · Would order again: yes');
    expect(result.isFeedbackSubmitted).toBe(true);
    expect(result.feedbackDetails).toEqual(payload);
  });

  it('generates a highly escalated review correctly', () => {
    const payload: FeedbackPayload = {
      overallRating: 2,
      foodQuality: 2,
      presentation: 1,
      issueCategory: 'Late Delivery',
      issueNote: 'Food arrived cold and 40 mins late',
      requestManagerFollowUp: true,
      wouldOrderAgain: false,
      comment: 'Very disappointing.',
    };
    
    const result = buildLegacyFeedback(payload);
    
    expect(result.rating).toBe(2);
    expect(result.feedback).toBe('Very disappointing.');
    expect(result.review).toBe('Very disappointing.');
    expect(result.reviewSummary).toBe('2★ · Food 2 · Pres 1 · Would order again: no · Manager follow-up requested · Issue: Late Delivery');
  });

  it('generates a minimal correct payload', () => {
    const payload: FeedbackPayload = { overallRating: 4 };
    const result = buildLegacyFeedback(payload);
    expect(result.reviewSummary).toBe('4★');
  });
});
