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

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const status = data.status;

      const newStep = mapOrderStatusToStep(status);
      setOrderStatus(newStep);

      if (status === 'completed' || status === 'delivered') {
        setTimeout(() => setShowRating(true), 2000);
      }
    });

    return () => unsubscribe();
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-32 bg-[#fdfbf9]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-3xl mx-auto px-6 sm:px-12 pt-16">
        
        <div className="mb-10 pb-8 border-b border-[#e7e5e4]">
          <p className="text-[10px] uppercase tracking-widest font-bold mb-4 text-[#a08850]">
            Room {roomNumber}
          </p>
          <h2 className="text-[2.5rem] leading-tight mb-6" style={{ fontFamily: "'DM Serif Display', serif", color: '#1c1917' }}>
            Service Status
          </h2>
          <div className="inline-flex items-center px-3 py-1.5 border border-[#e7e5e4] bg-white rounded-md text-[10px] uppercase font-bold tracking-widest text-[#1c1917]">
            Order #{orderId?.slice(-6).toUpperCase() || 'UNKNOWN'}
          </div>
        </div>

        {blockedWaUrl && (
          <div className="mb-12 p-6 rounded-lg border border-[#e7e5e4] bg-white">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4 text-[#1c1917]">
              WhatsApp message blocked by browser
            </p>
            <a 
              href={blockedWaUrl} target="_blank" rel="noopener noreferrer" 
              className="inline-flex h-12 px-6 items-center justify-center rounded-full text-[11px] uppercase font-bold tracking-widest bg-[#1c1917] text-white hover:bg-[#2d2d2d]"
            >
              Open Manual Chat
            </a>
          </div>
        )}

        <div className="pb-16 mt-6">
          <div className="space-y-0">
            {steps.map((step, index) => {
              const isActive = index === orderStatus;
              const isPast = index < orderStatus;
              const isLast = index === steps.length - 1;
              
              return (
                <div key={index} className="flex gap-4 sm:gap-6 group">
                  {/* Tracking Item */}
                  <div className={`relative flex flex-row items-center gap-6 p-6 bg-[#ffffff] border-t-8 border-[#f5f5f4] first:border-t-0 transition-opacity duration-500 ${isPast || isActive ? 'opacity-100' : 'opacity-40'}`}>
                    
                    {/* Icon Column */}
                    <div className="shrink-0 flex items-center justify-center">
                      <div className={`w-14 h-14 flex items-center justify-center rounded-xl transition-all duration-500 ${
                        isActive 
                          ? 'border-2 border-[#1c1917] bg-[#1c1917] text-white shadow-xl scale-110'
                          : isPast
                            ? 'border-2 border-[#1c1917] bg-[#ffffff] text-[#1c1917]'
                            : 'border border-[#e7e5e4] bg-[#fdfbf9] text-[#a8a29e]'
                      }`}>
                        {isActive ? (
                          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                            {step.icon}
                          </motion.div>
                        ) : (
                          step.icon
                        )}
                      </div>
                    </div>
                    
                    {/* Content Column */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-[1.25rem] font-bold" style={{ color: '#1c1917', fontFamily: "'DM Serif Display', serif" }}>
                          {step.label}
                        </h3>
                        {isActive && (
                          <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-white bg-[#b91c1c] px-2 py-0.5 rounded-sm">Current</span>
                        )}
                      </div>
                      <p className={`text-[0.95rem] leading-relaxed ${isActive ? 'text-[#1c1917]' : 'text-[#78716c]'}`}>
                        {step.sub}
                      </p>
                    </div>
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
