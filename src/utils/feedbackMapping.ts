import { FeedbackPayload } from '../types';

export interface LegacyFeedbackFormat {
  rating: number;
  feedback: string;
  review: string;
  reviewSummary: string;
  feedbackDetails: Partial<FeedbackPayload>;
  isFeedbackSubmitted: boolean;
  feedbackSubmittedAt: Date;
}

function stripUndefinedFields<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

/**
 * Transforms a structured FeedbackPayload into a dashboard-compatible format
 * while retaining the structured nested object for future use.
 */
export function buildLegacyFeedback(payload: FeedbackPayload): LegacyFeedbackFormat {
  const feedbackDetails = stripUndefinedFields({
    overallRating: payload.overallRating,
    foodQuality: payload.foodQuality,
    presentation: payload.presentation,
    deliverySpeed: payload.deliverySpeed,
    orderAccuracy: payload.orderAccuracy,
    staffCourtesy: payload.staffCourtesy,
    valueForMoney: payload.valueForMoney,
    wouldOrderAgain: payload.wouldOrderAgain,
    comment: payload.comment || '',
    requestManagerFollowUp: payload.requestManagerFollowUp,
    issueCategory: payload.issueCategory,
    issueNote: payload.issueNote,
  });

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
    feedbackDetails,
    isFeedbackSubmitted: true,
    feedbackSubmittedAt: new Date(),
  };
}
