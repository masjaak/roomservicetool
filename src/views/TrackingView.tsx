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
                <div key={index} className="flex gap-6 sm:gap-8 group min-h-[100px]">
                  {/* Timeline Node Column */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 flex items-center justify-center shrink-0 border-[2px] rounded-full transition-all duration-500 bg-white z-10 ${
                      isActive 
                        ? 'border-[#a08850] text-[#a08850] scale-110 shadow-[0_4px_20px_rgba(160,136,80,0.15)] bg-[#fdfbf9]'
                        : isPast
                          ? 'border-[#1c1917] bg-[#1c1917] text-white'
                          : 'border-[#e7e5e4] text-[#a8a29e]'
                    }`}>
                      {isActive ? (
                        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                          {step.icon}
                        </motion.div>
                      ) : (
                        step.icon
                      )}
                    </div>
                    {/* Connecting Line (drawn dynamically via flex) */}
                    {!isLast && (
                      <div className={`w-px flex-1 my-2 transition-colors duration-500 ${isPast ? 'bg-[#1c1917]' : 'bg-[#e7e5e4]'}`} />
                    )}
                  </div>
                  
                  {/* Content Column */}
                  <div className={`pt-2 flex-1 pb-10 transition duration-300 ${isActive ? 'opacity-100 translate-x-1' : isPast ? 'opacity-90' : 'opacity-40'}`}>
                    <h3 className="text-[1.3rem] font-bold mb-1.5" style={{ color: '#1c1917', fontFamily: "'DM Serif Display', serif" }}>
                      {step.label}
                    </h3>
                    <p className={`text-[0.95rem] leading-relaxed ${isActive ? 'text-[#a08850] font-medium' : 'text-[#78716c]'}`}>
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
