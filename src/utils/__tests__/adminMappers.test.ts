import { describe, it, expect } from 'vitest';
import { normalizeOrderForAdmin } from '../adminMappers';

describe('normalizeOrderForAdmin', () => {
    const mockSnap = (data: any) => ({
        id: 'test-123',
        data: () => data,
    } as any);

    it('handles legacy-only records safely', () => {
        const snap = mockSnap({
            roomNumber: '101',
            status: 'incoming',
            rating: 4,
            feedback: 'Good food'
        });
        
        const result = normalizeOrderForAdmin(snap);
        expect(result.displayRating).toBe(4);
        expect(result.displayReviewText).toBe('Good food');
        expect(result.displayReviewSummary).toBe('Good food');
        expect(result.hasStructuredFeedback).toBe(false);
        expect(result.managerFollowUpRequested).toBe(false);
    });

    it('handles records with requestManagerFollowUp scalar', () => {
        const snap = mockSnap({
            roomNumber: '101',
            requestManagerFollowUp: 'yes'
        });
        
        const result = normalizeOrderForAdmin(snap);
        expect(result.managerFollowUpRequested).toBe(true);
    });

    it('prioritizes structured details over legacy fields', () => {
        const snap = mockSnap({
            roomNumber: '202',
            rating: 3, // Legacy
            reviewSummary: '3★ · Food 5', // Midway logic
            feedbackDetails: {
                overallRating: 2,
                comment: 'Actually it was cold',
                requestManagerFollowUp: true
            }
        });

        const result = normalizeOrderForAdmin(snap);
        expect(result.displayRating).toBe(2);
        expect(result.displayReviewText).toBe('Actually it was cold');
        expect(result.displayReviewSummary).toBe('3★ · Food 5'); // Kept summary intact
        expect(result.managerFollowUpRequested).toBe(true);
        expect(result.hasStructuredFeedback).toBe(true);
    });

    it('gracefully cascades string summaries', () => {
        const snap = mockSnap({ roomNumber: '303', review: 'Just a review' });
        const result = normalizeOrderForAdmin(snap);
        expect(result.displayReviewSummary).toBe('Just a review');
        expect(result.displayReviewText).toBe('Just a review');
        expect(result.displayRating).toBe(null);
    });
});
