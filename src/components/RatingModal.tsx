import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { TRANSLATIONS } from '../data/constants';
import { FeedbackPayload, Language } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface RatingModalProps {
  isOpen: boolean;
  onRate: (payload: FeedbackPayload) => Promise<void> | void;
  onSkip?: () => void;
  lang: Language;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onRate, onSkip, lang }) => {
  const { theme } = useTheme();
  const [overallRating, setOverallRating] = useState(0);
  const [foodQuality, setFoodQuality] = useState(0);
  const [presentation, setPresentation] = useState(0);
  const [deliverySpeed, setDeliverySpeed] = useState(0);
  const [orderAccuracy, setOrderAccuracy] = useState(0);
  const [staffCourtesy, setStaffCourtesy] = useState(0);
  const [valueForMoney, setValueForMoney] = useState(0);
  const [wouldOrderAgain, setWouldOrderAgain] = useState<'yes' | 'no' | undefined>();
  const [comment, setComment] = useState('');
  const [requestManagerFollowUp, setRequestManagerFollowUp] = useState<'yes' | 'no'>('no');
  const [issueCategory, setIssueCategory] = useState<FeedbackPayload['issueCategory']>();
  const [issueNote, setIssueNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!isOpen) return;
    setIsSubmitting(false);
    setSubmitError(null);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (overallRating === 0 || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onRate({
        overallRating,
        foodQuality,
        presentation,
        deliverySpeed,
        orderAccuracy,
        staffCourtesy,
        valueForMoney,
        wouldOrderAgain,
        comment,
        ...(overallRating <= 3 && {
          requestManagerFollowUp,
          issueCategory,
          issueNote,
        }),
      });
    } catch {
      setSubmitError(
        lang === 'ID'
          ? 'Feedback belum berhasil dikirim. Coba lagi.'
          : 'Feedback could not be submitted yet. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => onSkip && onSkip()}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          />
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ pointerEvents: 'auto', width: 'calc(100% - 2rem)', maxWidth: '26rem', background: theme.bgSurface, borderRadius: '1.75rem', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', transition: 'background 0.3s' }}
            >
              {/* Header */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: `1px solid ${theme.borderFaint}`, flexShrink: 0 }}>
                <button
                  aria-label="Close rating"
                  onClick={() => onSkip && onSkip()}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: theme.bgInput, border: 'none', cursor: 'pointer', color: theme.textMuted }}
                >
                  <X size={18} />
                </button>
                <h1 style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: "'Noto Serif',serif", fontSize: '1.15rem', fontWeight: 400, fontStyle: 'italic', color: theme.textBase, lineHeight: 1, whiteSpace: 'nowrap' }}>
                  Atelier Meridian
                </h1>
                <div style={{ width: '2.25rem' }} />
              </div>

              {/* Scroll body */}
              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
                <div style={{ padding: '2rem 1.5rem 1.5rem' }}>

                  {/* Heading */}
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: theme.gold, fontFamily: "'Manrope',sans-serif", marginBottom: '0.75rem' }}>
                      {t.guestExperience}
                    </p>
                    <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: '2rem', fontWeight: 400, lineHeight: 1.1, color: theme.textBase }}>
                      {t.enjoyedMeal}
                    </h2>
                  </div>

                  {/* Stars */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setOverallRating(n)}
                        style={{ padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}
                      >
                        <Star
                          size={40}
                          style={{
                            color: n <= overallRating ? theme.goldBright : theme.borderFaint,
                            fill: n <= overallRating ? theme.goldBright : 'transparent',
                            transition: 'color 0.2s, fill 0.2s',
                          }}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Comment */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={t.tellUsMore}
                      rows={3}
                      style={{ width: '100%', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '0.875rem', padding: '0.875rem 1rem', fontSize: '14px', color: theme.textBase, resize: 'none', outline: 'none', fontFamily: "'Manrope',sans-serif", boxSizing: 'border-box', transition: 'background 0.3s, border-color 0.3s' }}
                    />
                  </div>

                  {/* Low-rating extra section */}
                  {overallRating > 0 && overallRating <= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '0.875rem', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                    >
                      <select
                        value={issueCategory || ''}
                        onChange={(e) => setIssueCategory(e.target.value as FeedbackPayload['issueCategory'])}
                        style={{ width: '100%', background: theme.bgSurface, border: `1px solid ${theme.border}`, borderRadius: '0.625rem', padding: '0.75rem 1rem', fontSize: '13px', color: theme.textBase, outline: 'none', fontFamily: "'Manrope',sans-serif", appearance: 'none' }}
                      >
                        <option value="" disabled>{lang === 'ID' ? 'Pilih kategori...' : 'Select a category...'}</option>
                        <option value="Food quality">Food quality</option>
                        <option value="Temperature">Temperature</option>
                        <option value="Late delivery">Late delivery</option>
                        <option value="Wrong item">Wrong item</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Staff service">Staff service</option>
                        <option value="Other">Other</option>
                      </select>

                      <input
                        type="text"
                        placeholder={t.issueDetail}
                        value={issueNote}
                        onChange={(e) => setIssueNote(e.target.value)}
                        style={{ width: '100%', background: theme.bgSurface, border: `1px solid ${theme.border}`, borderRadius: '0.625rem', padding: '0.75rem 1rem', fontSize: '13px', color: theme.textBase, outline: 'none', fontFamily: "'Manrope',sans-serif", boxSizing: 'border-box' }}
                      />

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {(['yes', 'no'] as const).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setWouldOrderAgain(v)}
                            style={{
                              flex: 1, padding: '0.75rem', borderRadius: '0.625rem', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'Manrope',sans-serif", cursor: 'pointer', transition: 'all 0.2s',
                              border: wouldOrderAgain === v ? '1px solid rgba(154,116,22,0.45)' : `1px solid ${theme.border}`,
                              background: wouldOrderAgain === v ? 'rgba(154,116,22,0.14)' : 'transparent',
                              color: wouldOrderAgain === v ? theme.goldBright : theme.textMuted,
                            }}
                          >
                            {v === 'yes' ? (lang === 'ID' ? 'YA' : 'YES') : (lang === 'ID' ? 'TIDAK' : 'NO')}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Footer CTA */}
              <div style={{ padding: '1rem 1.5rem', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)', background: theme.bgSurface, borderTop: `1px solid ${theme.borderFaint}`, transition: 'background 0.3s' }}>
                {submitError && (
                  <p style={{ marginBottom: '0.75rem', fontSize: '12px', lineHeight: 1.5, color: '#c24d2c', fontFamily: "'Manrope',sans-serif" }}>
                    {submitError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={overallRating === 0 || isSubmitting}
                  style={{ width: '100%', height: '3.5rem', borderRadius: '9999px', background: overallRating === 0 || isSubmitting ? theme.bgInput : 'linear-gradient(135deg,#7a5c10,#9a7416)', border: overallRating === 0 || isSubmitting ? `1px solid ${theme.border}` : '1px solid rgba(255,255,255,0.1)', boxShadow: overallRating === 0 || isSubmitting ? 'none' : '0 10px 24px rgba(119,90,25,0.28)', color: overallRating === 0 || isSubmitting ? theme.textMuted : '#fff', fontFamily: "'Manrope',sans-serif", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: overallRating === 0 || isSubmitting ? 'not-allowed' : 'pointer', transition: 'all 0.3s' }}
                >
                  {isSubmitting
                    ? lang === 'ID' ? 'Mengirim...' : 'Submitting...'
                    : t.submitFeedback}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
