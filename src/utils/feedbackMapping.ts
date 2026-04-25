import { FeedbackPayload } from '../types';

export interface LegacyFeedbackFormat {
  rating: number;
  feedback: string;
  review: string;
  reviewSummary: string;
  feedbackDetails: FeedbackPayload;
  isFeedbackSubmitted: boolean;
  feedbackSubmittedAt: Date;
}

/**
 * Transforms a structured FeedbackPayload into a dashboard-compatible format
 * while retaining the structured nested object for future use.
 */
export function buildLegacyFeedback(payload: FeedbackPayload): LegacyFeedbackFormat {
  const parts: string[] = [`${payload.overallRating}★`];

  // Only append specific feedback if exists and <= 3 stars 
  if (payload.foodQuality) parts.push(`Food ${payload.foodQuality}`);
  if (payload.deliverySpeed) parts.push(`Speed ${payload.deliverySpeed}`);
  if (payload.staffCourtesy) parts.push(`Staff ${payload.staffCourtesy}`);
  if (payload.presentation) parts.push(`Pres ${payload.presentation}`);
  
  if (payload.wouldOrderAgain !== undefined) {
    parts.push(`Would order again: ${payload.wouldOrderAgain === 'yes' ? 'yes' : 'no'}`);
  }

  if (payload.requestManagerFollowUp) {
    parts.push(`Manager follow-up requested`);
  }
  
  if (payload.issueCategory) {
    parts.push(`Issue: ${payload.issueCategory}`);
  }

  return {
    rating: payload.overallRating,
    feedback: payload.comment || '',
    review: payload.comment || '',
    reviewSummary: parts.join(' · '),
    feedbackDetails: payload,
    isFeedbackSubmitted: true,
    feedbackSubmittedAt: new Date()
  };
}
