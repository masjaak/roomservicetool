import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import type { CartEntry, PaymentMethod } from '../machine/types';

// Structured details matching the guest app's FeedbackPayload + Admin needs
export interface StructuredFeedbackDetails {
  overallRating?: number;
  foodQuality?: number;
  presentation?: number;
  deliverySpeed?: number;
  orderAccuracy?: number;
  staffCourtesy?: number;
  valueForMoney?: number;
  wouldOrderAgain?: boolean;
  requestManagerFollowUp?: boolean;
  issueCategory?: string;
  issueNote?: string;
  comment?: string;
}

export interface AdminOrderViewModel {
  id: string;
  guestUid?: string;
  accessTokenId?: string;
  roomNumber: string;
  phoneNumber: string;
  lastName?: string;
  items: CartEntry[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  isRead: boolean;
  
  // Feedback compatibility layer
  displayRating: number | null;
  displayReviewText: string | null;
  displayReviewSummary: string | null;
  managerFollowUpRequested: boolean;
  issueCategory: string | null;
  issueNote: string | null;
  hasStructuredFeedback: boolean;
  structuredDetails: StructuredFeedbackDetails | null;
}

export function normalizeOrderForAdmin(docSnap: QueryDocumentSnapshot<DocumentData>): AdminOrderViewModel {
  const data = docSnap.data();
  
  // Base fields
  const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;
  const updatedAt = data.updatedAt?.toDate ? data.updatedAt.toDate() : null;

  // Feedback fields bridging old and new
  const rawRating = data.rating ?? data.overallRating ?? null;
  const rawFeedback = data.feedback ?? data.review ?? data.comment ?? null;
  const reviewSummary = data.reviewSummary ?? null;
  const details: StructuredFeedbackDetails | undefined = data.feedbackDetails;

  // Fallbacks for display
  const displayRating = details?.overallRating ?? rawRating;
  const displayReviewSummary = reviewSummary ?? rawFeedback ?? null;
  const displayReviewText = details?.comment ?? rawFeedback ?? null;
  
  const managerFollowUpRequested = details?.requestManagerFollowUp ?? (data.requestManagerFollowUp === 'yes' || data.requestManagerFollowUp === true) ?? false;
  const issueCategory = details?.issueCategory ?? data.issueCategory ?? null;
  const issueNote = details?.issueNote ?? data.issueNote ?? null;
  const hasStructuredFeedback = !!details;

  return {
    id: docSnap.id,
    guestUid: data.guestUid || '',
    accessTokenId: data.accessTokenId || '',
    roomNumber: data.roomNumber || 'Unknown',
    phoneNumber: data.phoneNumber || '',
    lastName: data.lastName || '',
    items: data.items || [],
    subtotal: data.subtotal || 0,
    tax: data.tax || 0,
    total: data.total || 0,
    paymentMethod: data.paymentMethod || 'room',
    status: data.status || 'incoming',
    createdAt,
    updatedAt,
    isRead: data.isRead ?? false,

    displayRating,
    displayReviewText,
    displayReviewSummary,
    managerFollowUpRequested,
    issueCategory,
    issueNote,
    hasStructuredFeedback,
    structuredDetails: details || null
  };
}
