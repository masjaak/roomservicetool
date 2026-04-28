import React, { useEffect, useState } from 'react';
import { Clock3, ConciergeBell, Phone, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { TRANSLATIONS } from '../data/constants';
import { RatingModal } from '../components/RatingModal';
import { db } from '../lib/firebase';
import { submitOrderFeedback } from '../lib/orderFeedback';
import { fetchOrderStatus } from '../lib/orderStatus';
import { mapOrderStatusToStep } from '../utils/statusMapping';
import { buildTrackingPresentation } from '../utils/trackingPresentation';
import { buildLegacyFeedback } from '../utils/feedbackMapping';
import { FeedbackPayload, Language } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface TrackingViewProps {
  roomNumber: string;
  onFinish: () => void;
  lang: Language;
  orderId: string | null;
  blockedWaUrl?: string | null;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ roomNumber, onFinish, lang, orderId, blockedWaUrl }) => {
  const { theme } = useTheme();
  const [orderStatus, setOrderStatus] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!orderId) return;
    let ratingTimer: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;

    const applyOrderStatus = (status: unknown) => {
      if (typeof status !== 'string' || !status) return;
      const statusLower = status.toLowerCase();
      setOrderStatus(mapOrderStatusToStep(status));
      if (statusLower === 'completed' || statusLower === 'delivered') {
        if (ratingTimer) clearTimeout(ratingTimer);
        ratingTimer = setTimeout(() => {
          if (!isDisposed) setShowRating(true);
        }, 2000);
      }
    };

    const refreshFromRest = async () => {
      try {
        const status = await fetchOrderStatus(orderId);
        if (!isDisposed) applyOrderStatus(status);
      } catch (error) {
        console.warn('Order status REST fallback failed', error);
      }
    };

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      applyOrderStatus(data.status);
    }, (error) => {
      console.warn('Order status realtime listener failed', error);
    });
    void refreshFromRest();
    const pollInterval = window.setInterval(refreshFromRest, 4000);

    return () => {
      isDisposed = true;
      if (ratingTimer) clearTimeout(ratingTimer);
      window.clearInterval(pollInterval);
      unsubscribe();
    };
  }, [orderId]);

  const handleSubmitFeedback = async (payload: FeedbackPayload) => {
    if (orderId) {
      const feedbackPayload = buildLegacyFeedback(payload);
      await submitOrderFeedback({
        orderId,
        payload: feedbackPayload,
        updateWithSdk: () => updateDoc(doc(db, 'orders', orderId), feedbackPayload),
      });
    }
    onFinish();
  };

  const pres = buildTrackingPresentation({ statusStep: orderStatus, roomNumber, lang });
  const currentStep = pres.currentStep;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100dvh', background: theme.bgBase, fontFamily: "'Manrope', sans-serif", WebkitFontSmoothing: 'antialiased', transition: 'background 0.3s' }}
    >
      <div className="hcs-checkout-inner" style={{ maxWidth: '28rem', marginInline: 'auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.bgHeader, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${theme.borderFaint}`, paddingInline: '1.5rem', paddingTop: 'calc(env(safe-area-inset-top) + 1rem)', paddingBottom: '1rem', transition: 'background 0.3s, border-color 0.3s' }}>
          <div style={{ width: '2.25rem' }} />
          <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.15rem', fontWeight: 400, fontStyle: 'italic', color: theme.textBase, lineHeight: 1, transition: 'color 0.3s' }}>
            Atelier Dining
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem' }}>
            <ConciergeBell size={18} color={theme.textMuted} />
          </div>
        </header>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem 1.5rem', paddingBottom: 'calc(env(safe-area-inset-bottom) + 6rem)', scrollbarWidth: 'none' }}>

          {/* Status heading */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: theme.gold, fontFamily: "'Manrope',sans-serif", marginBottom: '0.5rem' }}>
              {lang === 'ID' ? 'Status Pesanan' : 'Order Status'}
            </p>
            <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: '2rem', fontWeight: 400, lineHeight: 1.1, color: theme.textBase, marginBottom: '0.5rem', transition: 'color 0.3s' }}>
              {currentStep.label}
            </h2>
            <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: theme.textMuted, fontFamily: "'Manrope',sans-serif" }}>
              ORDER #{orderId?.slice(-6).toUpperCase() || 'AM-8921'}
            </p>
          </motion.div>

          {/* ETA card */}
          <div style={{ position: 'relative', background: theme.bgSurface, border: `1px solid ${theme.borderFaint}`, borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '2rem', overflow: 'hidden', transition: 'background 0.3s' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(119,90,25,0.12),transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '3.5rem', height: '3.5rem', borderRadius: '9999px', background: 'linear-gradient(135deg,#7a5c10,#9a7416)', boxShadow: '0 8px 20px rgba(119,90,25,0.3)' }}>
                <Clock3 size={20} color="#fff" />
              </div>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', color: theme.textMuted, fontFamily: "'Manrope',sans-serif", fontWeight: 700, marginBottom: '0.35rem' }}>
                {t.estimatedDelivery}
              </p>
              <p style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.75rem', fontWeight: 400, color: theme.textBase, lineHeight: 1 }}>
                {pres.estimatedDeliveryLabel}
              </p>
            </div>
          </div>

          {/* Steps timeline */}
          <div style={{ padding: '0 0.25rem', marginBottom: '2rem' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: '0.75rem', bottom: '0.75rem', left: '0.6875rem', width: '2px', background: theme.borderFaint }} />
              {pres.steps.map((step, index) => {
                const active = index === pres.activeStepIndex;
                const completed = index < pres.activeStepIndex;

                return (
                  <div key={step.label} style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', gap: '1.25rem', marginBottom: index < pres.steps.length - 1 ? '1.75rem' : 0 }}>
                    <div style={{ flexShrink: 0, marginTop: '0.125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '1.5rem', height: '1.5rem', borderRadius: '9999px', background: active ? 'linear-gradient(135deg,#7a5c10,#9a7416)' : completed ? 'rgba(154,116,22,0.25)' : theme.bgInput, border: active ? 'none' : completed ? '1px solid rgba(154,116,22,0.4)' : `1px solid ${theme.borderFaint}`, boxShadow: active ? '0 4px 12px rgba(119,90,25,0.4)' : 'none', transition: 'all 0.3s' }}>
                      {active ? <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', background: '#fff' }} /> :
                       completed ? <CheckCircle2 size={12} color={theme.goldBright} /> : null}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: '1rem', fontWeight: 400, lineHeight: 1.2, color: active ? theme.textBase : completed ? theme.textSecondary : theme.textMuted, transition: 'color 0.3s', marginBottom: '0.2rem' }}>
                        {step.label}
                      </h3>
                      <p style={{ fontSize: '12px', color: theme.textMuted, lineHeight: 1.5, opacity: active ? 1 : completed ? 0.7 : 0.45 }}>
                        {step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual WhatsApp link */}
          {blockedWaUrl && (
            <a
              href={blockedWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.875rem', borderRadius: '0.875rem', background: theme.bgInput, border: `1px solid ${theme.borderFaint}`, fontSize: '13px', fontWeight: 600, color: theme.goldBright, textDecoration: 'none', marginBottom: '1rem', fontFamily: "'Manrope',sans-serif" }}
            >
              Open Manual Chat
            </a>
          )}
        </main>

        {/* Fixed bottom bar */}
        <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '28rem', background: theme.bgBase, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid ${theme.borderFaint}`, padding: '1rem 1.5rem', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)', transition: 'background 0.3s, border-color 0.3s', zIndex: 10 }}>
          <button
            type="button"
            onClick={() => blockedWaUrl && window.open(blockedWaUrl, '_blank')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', height: '3.5rem', borderRadius: '9999px', background: theme.bgInput, border: `1px solid ${theme.borderFaint}`, color: theme.textSecondary, fontFamily: "'Manrope',sans-serif", fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            <Phone size={15} />
            {t.callRoomService}
          </button>
        </div>
      </div>

      <RatingModal
        isOpen={showRating}
        onSkip={() => { setShowRating(false); onFinish(); }}
        onRate={handleSubmitFeedback}
        lang={lang}
      />
    </motion.div>
  );
};
