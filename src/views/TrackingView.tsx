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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-32" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-2xl mx-auto px-6 sm:px-12 pt-16">
        
        {/* Header */}
        <div className="mb-12 pb-10 border-b border-[#e7e5e4]">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#a08850]">
              Guest Room {roomNumber}
            </p>
            <div className="inline-flex items-center px-3 py-1 bg-[#f5f5f4] rounded-sm text-[9px] uppercase font-bold tracking-[0.2em] text-[#78716c]">
              No. {orderId?.slice(-6).toUpperCase() || 'PND'}
            </div>
          </div>
          <h2 className="text-[2.75rem] leading-none mb-6" style={{ fontFamily: "'DM Serif Display', serif", color: '#1c1917' }}>
            {t.trackTitle}
          </h2>
          <p className="max-w-xl text-[1rem] leading-relaxed text-[#57534e] font-light">
            {lang === 'ID'
              ? 'Pantau progres pesanan secara real-time dari konfirmasi dapur hingga pengantaran ke kamar Anda.'
              : 'Follow your order in real time from kitchen confirmation through delivery to your room.'}
          </p>
        </div>

        {blockedWaUrl && (
          <div className="mb-12 p-6 border border-[#e7e5e4] bg-[#ffffff] flex flex-col items-start gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1c1917] mb-1">
                Notice
              </p>
              <p className="text-[0.9rem] text-[#78716c]">WhatsApp message blocked by browser.</p>
            </div>
            <a 
              href={blockedWaUrl} target="_blank" rel="noopener noreferrer" 
              className="inline-flex h-10 px-5 items-center justify-center bg-[#1c1917] text-white hover:bg-[#2d2d2d] transition-colors text-[10px] uppercase font-bold tracking-[0.2em]"
            >
              Open Manual Chat
            </a>
          </div>
        )}

        {/* Current Status Highlight */}
        <div className="mb-14">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a8a29e] mb-4">
            Current Status
          </p>
          <div className="flex flex-col gap-2">
            <h3 className="text-[2rem] leading-none text-[#1c1917]" style={{ fontFamily: "'DM Serif Display', serif" }}>
              {currentStep.label}
            </h3>
            <p className="text-[1rem] text-[#78716c] font-light">
              {currentStep.sub}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative pl-4">
          {/* Progress hairline track */}
          <div className="absolute left-[27px] top-4 bottom-8 w-[1px] bg-[#e7e5e4]" />
          
          <div className="space-y-10 relative">
            {steps.map((step, index) => {
              const isActive = index === orderStatus;
              const isPast = index < orderStatus;
              
              return (
                <div key={index} className="flex gap-8 group relative" aria-current={isActive ? 'step' : undefined}>
                  <div className="flex flex-col items-center z-10 pt-1">
                    <div className={`w-3 h-3 flex items-center justify-center rounded-full transition-all duration-700 bg-[#f7f1e8] ${
                      isActive 
                        ? 'border-[2px] border-[#a08850] scale-[1.3] shadow-[0_0_15px_rgba(160,136,80,0.3)]'
                        : isPast
                          ? 'border-[2px] border-[#1c1917] bg-[#1c1917]'
                          : 'border-[2px] border-[#d6d3d1]'
                    }`} />
                  </div>
                  
                  <div className={`flex-1 transition-all duration-500 pb-2 ${isActive ? 'opacity-100' : isPast ? 'opacity-70' : 'opacity-30'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-1.5 rounded-sm ${isActive ? 'bg-[#f5f5f4] text-[#a08850]' : isPast ? 'text-[#1c1917]' : 'text-[#a8a29e]'}`}>
                         {React.cloneElement(step.icon as React.ReactElement, { className: 'w-4 h-4' })}
                      </div>
                      <h3 className="text-[1.1rem] font-medium tracking-wide" style={{ color: '#1c1917' }}>
                        {step.label}
                      </h3>
                    </div>
                    <p className="text-[0.95rem] leading-relaxed text-[#78716c] font-light pl-11">
                      {step.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <RatingModal
        isOpen={showRating}
        onSkip={() => setShowRating(false)}
        onRate={handleSubmitFeedback}
        lang={lang}
      />
    </motion.div>
  );
};
