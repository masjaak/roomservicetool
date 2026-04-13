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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-32 bg-[#121212] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-2xl mx-auto px-6 sm:px-12 pt-12">
        
        <div className="mb-12">
          <div className="flex justify-between items-center mb-10">
            <button onClick={onFinish} aria-label="Go back" className="focus-visible:outline-none">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8a29e] hover:text-white transition-colors">← ORDER TRACKING</span>
            </button>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8a29e]">
              Room {roomNumber}
            </span>
          </div>

          <h2 className="text-[3rem] sm:text-[4rem] leading-[0.95] font-black uppercase text-white mb-6 tracking-tight">
            {currentStep.label}
          </h2>
          <div className="flex items-center gap-3 text-[#a8a29e]">
            <p className="text-[1rem] leading-relaxed font-medium">
              {currentStep.sub}
            </p>
            <span className="text-white font-bold opacity-30">•</span>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-[#1c1917] rounded-sm text-white border border-[#2d2d2d]">
              #{orderId?.slice(-6).toUpperCase() || 'UNKNOWN'}
            </span>
          </div>
        </div>

        {blockedWaUrl && (
          <div className="mb-12 p-5 rounded-sm border border-[#2d2d2d] bg-[#1c1917]">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-4 text-[#fca5a5]">
              System Notice: WhatsApp redirect blocked
            </p>
            <a 
              href={blockedWaUrl} target="_blank" rel="noopener noreferrer" 
              className="inline-flex h-12 px-6 items-center justify-center rounded-sm text-[11px] uppercase font-bold tracking-widest bg-white text-[#121212] hover:bg-[#f5f5f4]"
            >
              Open Manual Chat
            </a>
          </div>
        )}

        <div className="mt-16">
          <div className="space-y-0">
            {steps.map((step, index) => {
              const isActive = index === orderStatus;
              const isPast = index < orderStatus;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={index} className="flex gap-6 sm:gap-8 group min-h-[90px]" aria-current={isActive ? 'step' : undefined}>
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-6 h-6 flex items-center justify-center bg-[#121212] z-10">
                      <div className={`transition-all duration-500 ${
                        isActive 
                          ? 'w-4 h-4 bg-[#22c55e] rounded-full'
                          : isPast
                            ? 'w-3 h-3 bg-[#4ade80] rounded-full'
                            : 'w-3 h-3 bg-[#2d2d2d] rounded-full'
                      }`} />
                    </div>
                    {!isLast && (
                      <div className={`w-[2px] flex-1 my-1 transition-colors duration-500 rounded-full ${isPast ? 'bg-[#22c55e]' : 'bg-[#2d2d2d]'}`} />
                    )}
                  </div>
                  
                  <div className={`pb-8 flex-1 transition duration-300 ${isActive ? 'opacity-100' : isPast ? 'opacity-70' : 'opacity-30'}`}>
                    <h3 className="text-[1.2rem] font-bold mb-1 tracking-tight text-white">
                      {index + 1}. {step.label}
                    </h3>
                    <p className="text-[0.9rem] leading-relaxed text-[#a8a29e]">
                      {isActive ? 'Ongoing...' : step.sub}
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
