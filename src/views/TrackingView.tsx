import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, ChefHat, Search, Bell, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { TRANSLATIONS } from '../data/constants';
import { Language, FeedbackPayload } from '../types';
import { RatingModal } from '../components/RatingModal';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mapOrderStatusToStep } from '../utils/statusMapping';
import { buildLegacyFeedback } from '../utils/feedbackMapping';

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
        if (ratingTimer) {
          clearTimeout(ratingTimer);
        }

        ratingTimer = setTimeout(() => setShowRating(true), 2000);
      }
    });

    return () => {
      if (ratingTimer) {
        clearTimeout(ratingTimer);
      }

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

  const steps = [
    { icon: <FileText className="w-5 h-5" />, label: 'Order Confirmed', sub: 'Logged and sent to the kitchen.' },
    { icon: <CheckCircle2 className="w-5 h-5" />, label: 'Kitchen Acknowledged', sub: 'Your order is queued for preparation.' },
    { icon: <ChefHat className="w-5 h-5" />, label: 'Preparing', sub: 'Your dishes are being freshly prepared.' },
    { icon: <Search className="w-5 h-5" />, label: 'Quality Check', sub: 'Final inspection holding standard.' },
    { icon: <Bell className="w-5 h-5" />, label: 'On The Way', sub: `Staff is en route to Room ${roomNumber}.` },
    { icon: <Star className="w-5 h-5" />, label: 'Delivered', sub: 'Enjoy your experience.' },
  ];
  const currentStep = steps[orderStatus] ?? steps[0];
  const progressValue = ((orderStatus + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4 sm:px-6 overflow-y-auto relative z-10">
      {/* Background image with dark wash — matching LoginView */}
      <div className="fixed inset-0 z-0 bg-[#2d2d2d]" style={{ backgroundColor: '#2d2d2d' }}>
        <img
          src="/assets/hero.jpg"
          className="w-full h-full object-cover opacity-30"
          alt=""
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg mx-auto flex flex-col my-auto"
      >
        {/* Header Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="px-6 py-6 rounded-2xl w-full mb-4"
          style={{ backgroundColor: 'rgba(45,45,45,0.85)', border: '1px solid rgba(250,248,245,0.1)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: '#a08850' }}>
              Guest Room {roomNumber}
            </p>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-[9px] uppercase font-bold tracking-[0.2em]" style={{ backgroundColor: 'rgba(250,248,245,0.08)', color: 'rgba(250,248,245,0.6)' }}>
              No. {orderId?.slice(-6).toUpperCase() || 'PND'}
            </div>
          </div>
          <h2 className="text-[2rem] sm:text-[2.5rem] leading-none mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: '#faf8f5' }}>
            {t.trackTitle}
          </h2>
          <p className="text-[0.9rem] leading-relaxed font-light" style={{ color: 'rgba(250,248,245,0.55)' }}>
            {lang === 'ID'
              ? 'Pantau progres pesanan secara real-time dari konfirmasi dapur hingga pengantaran ke kamar Anda.'
              : 'Follow your order in real time from kitchen confirmation through delivery to your room.'}
          </p>
        </motion.div>

        {blockedWaUrl && (
          <div className="mb-4 px-6 py-5 rounded-2xl flex flex-col items-start gap-3" style={{ backgroundColor: 'rgba(45,45,45,0.85)', border: '1px solid rgba(250,248,245,0.1)' }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#faf8f5' }}>
                Notice
              </p>
              <p className="text-[0.85rem]" style={{ color: 'rgba(250,248,245,0.5)' }}>WhatsApp message blocked by browser.</p>
            </div>
            <a 
              href={blockedWaUrl} target="_blank" rel="noopener noreferrer" 
              className="inline-flex h-10 px-5 items-center justify-center rounded-xl text-[10px] uppercase font-bold tracking-[0.2em] transition-colors"
              style={{ backgroundColor: '#faf8f5', color: '#2d2d2d' }}
            >
              Open Manual Chat
            </a>
          </div>
        )}

        {/* Current Status Highlight */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="px-6 py-6 rounded-2xl w-full mb-4"
          style={{ backgroundColor: 'rgba(160,136,80,0.15)', border: '1px solid rgba(160,136,80,0.25)' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: 'rgba(250,248,245,0.4)' }}>
            Current Status
          </p>
          <h3 className="text-[1.6rem] sm:text-[2rem] leading-none mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: '#faf8f5' }}>
            {currentStep.label}
          </h3>
          <p className="text-[0.9rem] font-light" style={{ color: 'rgba(250,248,245,0.5)' }}>
            {currentStep.sub}
          </p>
          {/* Progress bar */}
          <div className="mt-5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(250,248,245,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: '#a08850' }}
              initial={{ width: 0 }}
              animate={{ width: `${progressValue}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Timeline Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-6 py-6 rounded-2xl w-full"
          style={{ backgroundColor: 'rgba(45,45,45,0.85)', border: '1px solid rgba(250,248,245,0.1)' }}
        >
          <div className="relative pl-2">
            {/* Timeline track */}
            <div className="absolute left-[17px] top-3 bottom-3 w-[1px]" style={{ backgroundColor: 'rgba(250,248,245,0.1)' }} />
            
            <div className="space-y-6 relative">
              {steps.map((step, index) => {
                const isActive = index === orderStatus;
                const isPast = index < orderStatus;
                
                return (
                  <div key={index} className="flex gap-5 group relative" aria-current={isActive ? 'step' : undefined}>
                    <div className="flex flex-col items-center z-10 pt-0.5">
                      <div
                        className="w-3 h-3 rounded-full transition-all duration-700"
                        style={{
                          backgroundColor: isActive ? '#a08850' : isPast ? '#faf8f5' : 'transparent',
                          border: isActive ? '2px solid #a08850' : isPast ? '2px solid rgba(250,248,245,0.6)' : '2px solid rgba(250,248,245,0.15)',
                          boxShadow: isActive ? '0 0 12px rgba(160,136,80,0.5)' : 'none',
                          transform: isActive ? 'scale(1.4)' : 'scale(1)',
                        }}
                      />
                    </div>
                    
                    <div className={`flex-1 transition-all duration-500 pb-1 ${isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-25'}`}>
                      <div className="flex items-center gap-3 mb-1">
                        <div style={{ color: isActive ? '#a08850' : isPast ? 'rgba(250,248,245,0.7)' : 'rgba(250,248,245,0.3)' }}>
                           {React.cloneElement(step.icon as React.ReactElement, { className: 'w-4 h-4' })}
                        </div>
                        <h3 className="text-[0.95rem] font-medium tracking-wide" style={{ color: '#faf8f5' }}>
                          {step.label}
                        </h3>
                      </div>
                      <p className="text-[0.85rem] leading-relaxed font-light pl-7" style={{ color: 'rgba(250,248,245,0.45)' }}>
                        {step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

      </motion.div>

      <RatingModal
        isOpen={showRating}
        onSkip={() => setShowRating(false)}
        onRate={handleSubmitFeedback}
        lang={lang}
      />
    </div>
  );
};
