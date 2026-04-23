import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import { TRANSLATIONS } from '../data/constants';
import { guestTheme } from '../styles/guestTheme';
import { FeedbackPayload, Language } from '../types';

interface RatingModalProps {
  isOpen: boolean;
  onRate: (payload: FeedbackPayload) => void;
  onSkip?: () => void;
  lang: Language;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onRate, onSkip, lang }) => {
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

  const t = TRANSLATIONS[lang];
  const accentColor = 'var(--hcs-primary)';
  const mutedStarColor = 'var(--hcs-line)';
  const subduedStarColor = 'var(--hcs-line-strong)';

  const handleSubmit = () => {
    onRate({
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
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`fixed inset-0 z-50 flex items-center justify-center ${guestTheme.bg.canvas}/95 p-4 sm:p-8`}>
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className={`relative flex min-h-[90vh] w-full max-w-lg flex-col overflow-hidden ${guestTheme.bg.canvas} shadow-[0_28px_80px_rgba(0,0,0,0.12)]`}
          >
            <header className={`sticky top-0 z-10 flex h-16 items-center justify-between ${guestTheme.bg.canvas} px-6`}>
              <button aria-label="Close rating" onClick={() => onSkip && onSkip()} className={`flex h-10 w-10 items-center justify-center rounded-full ${guestTheme.text.primary}`}>
                <X className="h-5 w-5" />
              </button>
              <h1 className={`font-headline absolute left-1/2 -translate-x-1/2 text-xl italic tracking-tight ${guestTheme.text.primary}`}>Atelier Meridian</h1>
              <div className="w-10" />
            </header>

            <div className="flex-1 overflow-y-auto px-6 pb-10 pt-28">
              <div className="flex flex-col items-center text-center">
                <span className={`text-xs font-semibold uppercase tracking-[0.1em] ${guestTheme.text.label}`}>{t.guestExperience}</span>
                <h2 className={`font-headline mt-4 text-[4rem] leading-[1.02] tracking-tight ${guestTheme.text.base}`}>{t.enjoyedMeal}</h2>
              </div>

              <div className="flex justify-center gap-4 py-10">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setOverallRating(n)} className="rounded-full p-2 transition-transform duration-200 hover:scale-110">
                    <Star className="h-11 w-11" style={{ color: n <= overallRating ? accentColor : subduedStarColor, fill: n <= overallRating ? accentColor : 'transparent' }} />
                  </button>
                ))}
              </div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t.tellUsMore}
                  rows={4}
                  className={`w-full resize-none border-0 border-b ${guestTheme.border.base} bg-transparent px-0 py-4 text-lg ${guestTheme.text.base} placeholder:text-[var(--hcs-outline)]/60 focus:border-[var(--hcs-primary)] focus:ring-0`}
                />

                {overallRating > 0 && overallRating <= 3 ? (
                  <div className={`space-y-4 rounded-[1.25rem] border ${guestTheme.border.strong} ${guestTheme.bg.surface} p-5`}>
                    <select
                      className={`w-full rounded-lg border ${guestTheme.border.base} ${guestTheme.bg.surface} p-3 text-sm ${guestTheme.text.base} outline-none focus-visible:ring-2 focus-visible:ring-[var(--hcs-primary)]/30`}
                      value={issueCategory || ''}
                      onChange={(e) => setIssueCategory(e.target.value as FeedbackPayload['issueCategory'])}
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
                      className={`w-full rounded-lg border ${guestTheme.border.base} ${guestTheme.bg.surface} p-3 text-sm ${guestTheme.text.base} outline-none focus-visible:ring-2 focus-visible:ring-[var(--hcs-primary)]/30`}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setWouldOrderAgain('yes')}
                        className={`flex-1 rounded-lg border py-3 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                          wouldOrderAgain === 'yes' ? `${guestTheme.border.strong} ${guestTheme.bg.primary} ${guestTheme.text.onPrimary}` : `${guestTheme.border.base} ${guestTheme.text.base}`
                        }`}
                      >
                        {lang === 'ID' ? 'YA' : 'YES'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setWouldOrderAgain('no')}
                        className={`flex-1 rounded-lg border py-3 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                          wouldOrderAgain === 'no' ? `${guestTheme.border.strong} ${guestTheme.bg.primary} ${guestTheme.text.onPrimary}` : `${guestTheme.border.base} ${guestTheme.text.base}`
                        }`}
                      >
                        {lang === 'ID' ? 'TIDAK' : 'NO'}
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={`w-full ${guestTheme.bg.primary} px-12 py-4 text-sm font-semibold uppercase tracking-[0.14em] ${guestTheme.text.onPrimary} transition-all duration-300 hover:opacity-90`}
                  >
                    {t.submitFeedback}
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
