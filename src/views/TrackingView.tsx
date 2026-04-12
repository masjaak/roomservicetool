import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, ChefHat, Search, Bell, Star, Clock } from 'lucide-react';
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
    { icon: <FileText className="w-6 h-6" />, label: 'Order received', sub: 'Your order has been logged and sent to the kitchen.' },
    { icon: <CheckCircle2 className="w-6 h-6" />, label: 'Confirmed by kitchen', sub: 'The kitchen has confirmed your order and queued preparation.' },
    { icon: <ChefHat className="w-6 h-6" />, label: 'Being prepared', sub: 'Your dishes are being freshly prepared.' },
    { icon: <Search className="w-6 h-6" />, label: 'Quality check', sub: 'Your order is being checked before dispatch.' },
    { icon: <Bell className="w-6 h-6" />, label: 'On the way', sub: `Our staff is on the way to Room ${roomNumber}.` },
    { icon: <Star className="w-6 h-6" />, label: 'Delivered', sub: 'Your order has arrived. Enjoy your meal.' },
  ];

  const lastUpdated = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-32" style={{ backgroundColor: '#fdfbf9', fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-full max-w-4xl mx-auto px-6 sm:px-12 pt-16">
        
        <div className="mb-20 pb-16 border-b-2 border-[#e7e5e4]">
          <p className="text-[12px] uppercase tracking-[0.3em] font-bold mb-6 text-[#78716c]">
            Room {roomNumber}
          </p>
          <h2 className="text-[3rem] sm:text-[4.5rem] leading-[1] mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 500 }}>
            Service Itinerary
          </h2>
          <div className="inline-flex items-center px-6 py-3 border-2 border-[#1c1917] bg-[#ffffff] text-[12px] uppercase font-bold tracking-[0.25em] text-[#1c1917]">
            Order #{orderId?.slice(-6).toUpperCase() || 'UNKNOWN'}
          </div>
        </div>

        {blockedWaUrl && (
          <div className="mb-16 p-8 border-2 border-[#1c1917] bg-[#f5f5f4]">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#1c1917]">
              WhatsApp message blocked by browser. Please click below:
            </p>
            <a 
              href={blockedWaUrl} target="_blank" rel="noopener noreferrer" 
              className="inline-flex h-14 px-8 items-center justify-center text-[11px] uppercase font-bold tracking-[0.25em] bg-[#1c1917] text-[#ffffff] hover:bg-black"
            >
              Open WhatsApp Manually
            </a>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_350px] gap-16">
          <div className="relative pl-8 sm:pl-12 pb-16">
            <div className="absolute top-0 bottom-0 left-8 sm:left-12 w-[2px] bg-[#e7e5e4]" />
            
            <div className="space-y-16 relative z-10">
              {steps.map((step, index) => {
                const isCompleted = index < orderStatus;
                const isCurrent = index === orderStatus;
                let displayTitle = step.label;
                if (index === 0 && displayTitle === 'Order received') displayTitle = 'Preparation initiated';
                
                return (
                  <div key={index} className="relative flex gap-8 pb-4">
                    <div className="absolute -left-8 sm:-left-12 w-20 flex justify-center">
                      <div className={`w-14 h-14 flex items-center justify-center border-2 transition-colors ${
                        isCurrent ? 'border-[#1c1917] bg-[#1c1917] text-white' : 
                        isCompleted ? 'border-[#1c1917] bg-[#ffffff] text-[#1c1917]' : 'border-[#e7e5e4] bg-[#ffffff] text-[#d6d3d1]'
                      }`}>
                        {step.icon}
                      </div>
                    </div>
                    
                    <div className={`flex-1 pt-2 ml-[3.5rem] transition-opacity ${isCompleted || isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                      <h3 className="text-[1.5rem] leading-none mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 600 }}>
                        {displayTitle}
                      </h3>
                      {isCurrent && (
                         <span className="inline-block mb-3 text-[10px] uppercase tracking-[0.25em] font-bold text-[#b91c1c]">Current</span>
                      )}
                      
                      <p className="text-[1.05rem] leading-relaxed font-normal text-[#574b3f]">
                        {step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <div className="border-2 border-[#e7e5e4] bg-[#ffffff] p-8 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8 text-[#1c1917] border-b-2 border-[#1c1917] pb-4 inline-block">
                Service details
              </p>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#78716c]">Room</p>
                  <p className="text-[1.1rem] font-bold text-[#1c1917]">{roomNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#78716c]">Expected arrival</p>
                  <p className="text-[1.1rem] font-bold text-[#1c1917]">20-30 min</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#78716c]">Last updated</p>
                  <p className="text-[1.1rem] font-bold text-[#1c1917]">{lastUpdated}</p>
                </div>
              </div>
            </div>
            
            <div className="border-2 border-[#1c1917] bg-[#1c1917] p-8 sm:p-10">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] mb-4 text-[#ffffff]">
                Exceptional Support
              </p>
              <p className="text-[1rem] font-normal mb-8 leading-relaxed text-[#f5f5f4]/80">
                Require an adjustment? Our dining concierge is available via WhatsApp.
              </p>
              <button
                onClick={onFinish}
                className="w-full h-14 text-[11px] uppercase tracking-[0.25em] font-bold border-2 border-white/30 text-white hover:bg-white hover:text-black transition-colors"
              >
                Contact Concierge
              </button>
            </div>
          </div>
        </div>

      </div>
      <RatingModal isOpen={showRating} onRate={handleSubmitFeedback} onSkip={onFinish} lang={lang} />
    </motion.div>
  );
};
