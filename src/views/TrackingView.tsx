import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChefHat, Clock3, Phone, Star, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { TRANSLATIONS } from '../data/constants';
import { RatingModal } from '../components/RatingModal';
import { db } from '../lib/firebase';
import { guestTheme } from '../styles/guestTheme';
import { mapOrderStatusToStep } from '../utils/statusMapping';
import { buildTrackingPresentation } from '../utils/trackingPresentation';
import { buildLegacyFeedback } from '../utils/feedbackMapping';
import { FeedbackPayload, Language } from '../types';

interface TrackingViewProps {
  roomNumber: string;
  onFinish: () => void;
  lang: Language;
  orderId: string | null;
  blockedWaUrl?: string | null;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ roomNumber, onFinish, lang, orderId, blockedWaUrl }) => {
  const [orderStatus, setOrderStatus] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!orderId) return;

    let ratingTimer: ReturnType<typeof setTimeout> | null = null;

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const status = data.status;
      const statusLower = status?.toLowerCase() || '';

      const newStep = mapOrderStatusToStep(status);
      setOrderStatus(newStep);

      if (statusLower === 'completed' || statusLower === 'delivered') {
        if (ratingTimer) clearTimeout(ratingTimer);
        ratingTimer = setTimeout(() => setShowRating(true), 2000);
      }
    });

    return () => {
      if (ratingTimer) clearTimeout(ratingTimer);
      unsubscribe();
    };
  }, [orderId]);

  const handleSubmitFeedback = async (payload: FeedbackPayload) => {
    if (orderId) {
      await updateDoc(doc(db, 'orders', orderId), {
        ...buildLegacyFeedback(payload),
        feedbackSubmittedAt: new Date().toISOString(),
      }).catch(console.error);
    }
    onFinish();
  };

  const presentation = buildTrackingPresentation({
    statusStep: orderStatus,
    roomNumber,
    lang,
  });
  const currentStep = presentation.currentStep;

  return (
    <div className={`min-h-screen ${guestTheme.bg.canvas}`}>
      <div className={`mx-auto flex min-h-screen w-full max-w-md flex-col overflow-hidden ${guestTheme.bg.canvas}`}>
        <header className={`hcs-safe-top sticky top-0 z-10 flex items-center justify-between ${guestTheme.bg.surface} px-6 py-4 shadow-[0_1px_0_rgba(227,226,224,0.8)]`}>
          <div className="flex-1" />
          <h1 className={`font-headline text-xl tracking-tight ${guestTheme.text.base}`}>Atelier Dining</h1>
          <div className="flex flex-1 justify-end">
            <Clock3 className={`h-5 w-5 ${guestTheme.text.base}/60`} />
          </div>
        </header>

        <main className="flex flex-1 flex-col overflow-y-auto px-8 py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
            <h2 className={`font-headline text-[3.4rem] leading-[1.02] ${guestTheme.text.base}`}>{currentStep.label}</h2>
            <span className="sr-only">Order Status</span>
            <p className={`mt-2 text-sm font-medium uppercase tracking-[0.1em] ${guestTheme.text.primary}`}>
              {t.trackTitle} #{orderId?.slice(-6).toUpperCase() || 'PND'}
            </p>
          </motion.div>

          <div className={`relative mb-12 overflow-hidden rounded-[1.5rem] ${guestTheme.bg.surface} p-8 shadow-[0_0_0_1px_rgba(227,226,224,0.8)]`}>
            <div className="relative z-10 flex flex-col items-center">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${guestTheme.bg.primary}`}>
                <Clock3 className="h-6 w-6 text-white" />
              </div>
              <p className={`mb-1 text-sm uppercase tracking-wider ${guestTheme.text.muted}`}>{t.estimatedDelivery}</p>
              <p className={`font-headline text-[3rem] ${guestTheme.text.base}`}>{presentation.estimatedDeliveryLabel}</p>
            </div>
          </div>

          {blockedWaUrl && (
            <a
              href={blockedWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mb-6 inline-flex items-center justify-center rounded-lg border ${guestTheme.border.base} px-4 py-3 text-sm font-semibold ${guestTheme.text.primary}`}
            >
              Open Manual Chat
            </a>
          )}

          <div className="mb-12 px-4">
            <p className={`mb-4 text-[10px] font-bold uppercase tracking-[0.2em] ${guestTheme.text.muted}`}>Current Status</p>
            <div className="relative">
              <div className={`absolute bottom-4 left-[11px] top-4 w-[2px] ${guestTheme.bg.surfaceMuted}`} />
              {presentation.steps.map((step, index) => {
                const active = index === presentation.activeStepIndex;
                const completed = index < presentation.activeStepIndex;

                return (
                  <div key={step.label} className="relative z-10 mb-8 flex items-start last:mb-0" aria-current={active ? 'step' : undefined}>
                    <div className={`mr-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full ${active ? `${guestTheme.bg.primary} shadow-[0_4px_10px_rgba(119,90,25,0.3)]` : completed ? `${guestTheme.bg.primarySoft}` : `border-2 border-[var(--hcs-background)] ${guestTheme.bg.surfaceMuted}`}`}>
                      {active ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
                    </div>
                    <div>
                      <div className={`flex items-center gap-2 ${active ? guestTheme.text.primary : completed ? `${guestTheme.text.primary}/75` : `${guestTheme.text.muted}/55`}`}>
                        {step.icon}
                        <h3 className="font-headline text-[1.9rem] font-bold leading-none">{step.label}</h3>
                      </div>
                      <p className={`mt-1 text-sm ${active ? guestTheme.text.muted : `${guestTheme.text.muted}/55`}`}>{step.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-6">
            <button
              type="button"
              onClick={() => {
                if (blockedWaUrl) {
                  window.open(blockedWaUrl, '_blank');
                }
              }}
              className={`flex w-full items-center justify-center gap-2 rounded-md border ${guestTheme.border.base} bg-transparent px-6 py-4 font-medium ${guestTheme.text.primary} transition-colors hover:bg-[var(--hcs-surface-soft)]`}
            >
              <Phone className="h-4 w-4" />
              {t.callRoomService}
            </button>
          </div>
        </main>
      </div>

      <RatingModal
        isOpen={showRating}
        onSkip={() => {
          setShowRating(false);
          onFinish();
        }}
        onRate={handleSubmitFeedback}
        lang={lang}
      />
    </div>
  );
};
