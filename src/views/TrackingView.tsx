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
  const t = TRANSLATIONS[lang];

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
      try {
        const legacyData = buildLegacyFeedback(payload);
        await updateDoc(doc(db, 'orders', orderId), {
          ...legacyData,
          feedbackSubmittedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Feedback error:', e);
      }
    }
    onFinish();
  };

  const handleSkipFeedback = () => {
    // Just close/skip without writing to DB
    onFinish();
  };

  const steps = [
    { 
      icon: <FileText className="w-5 h-5" />, 
      label: lang === 'ID' ? 'Pesanan Diterima' : 'Order received', 
      sub: lang === 'ID' ? 'Pesanan Anda sudah diterima dan dikirim ke dapur.' : 'Your order has been logged and sent to the kitchen.' 
    },
    { 
      icon: <CheckCircle2 className="w-5 h-5" />, 
      label: lang === 'ID' ? 'Dikonfirmasi Dapur' : 'Confirmed by kitchen', 
      sub: lang === 'ID' ? 'Dapur telah mengonfirmasi pesanan dan memasukkannya ke antrean.' : 'The kitchen has confirmed your order and queued preparation.' 
    },
    { 
      icon: <ChefHat className="w-5 h-5" />, 
      label: lang === 'ID' ? 'Sedang Dipersiapkan' : 'Being prepared', 
      sub: lang === 'ID' ? 'Hidangan Anda sedang dipersiapkan.' : 'Your dishes are being freshly prepared.' 
    },
    { 
      icon: <Search className="w-5 h-5" />, 
      label: lang === 'ID' ? 'Pemeriksaan Kualitas' : 'Quality check', 
      sub: lang === 'ID' ? 'Pesanan Anda sedang diperiksa sebelum diantar.' : 'Your order is being checked before dispatch.' 
    },
    { 
      icon: <Bell className="w-5 h-5" />, 
      label: lang === 'ID' ? 'Sedang Diantar' : 'On the way', 
      sub: lang === 'ID' ? `Staf kami sedang menuju Kamar ${roomNumber}.` : `Our staff is on the way to Room ${roomNumber}.` 
    },
    { 
      icon: <Star className="w-5 h-5" />, 
      label: lang === 'ID' ? 'Pesanan Tiba' : 'Delivered', 
      sub: lang === 'ID' ? 'Pesanan Anda telah tiba. Selamat menikmati.' : 'Your order has arrived. Enjoy your meal.' 
    },
  ];

  const lastUpdated = new Date().toLocaleTimeString(lang === 'ID' ? 'id-ID' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-24"
      style={{ backgroundColor: '#fcfaf7', fontFamily: "'Lato', sans-serif" }}
    >
      <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 pt-16">
        {/* Header Ribbon */}
        <div className="text-center mb-16 pb-12 border-b" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
          <p className="text-[9px] uppercase tracking-[0.3em] font-semibold mb-6" style={{ color: '#8a7648' }}>
            {lang === 'ID' ? 'Kamar' : 'Room'} {roomNumber}
          </p>
          <h2 className="text-[2.8rem] sm:text-[3.5rem] leading-[1] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1a1a' }}>
            Service Itinerary
          </h2>
          <div className="inline-flex items-center px-4 py-2 border text-[10px] uppercase font-semibold tracking-[0.25em]" style={{ backgroundColor: '#fff', borderColor: 'rgba(26,26,26,0.1)', color: '#1a1a1a', borderRadius: '1px' }}>
            Order #{orderId?.slice(-6).toUpperCase() || 'UNKNOWN'}
          </div>
        </div>

        {/* Support Section for WhatsApp Fallback */}
        {blockedWaUrl && (
          <div className="mb-12 p-6 text-center border" style={{ backgroundColor: '#fff', borderColor: 'rgba(215,160,80,0.3)', borderRadius: '1px' }}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: '#8a7648' }}>
              {lang === 'ID' 
                ? 'Pesan WhatsApp dicegah browser. Silakan klik:' 
                : 'WhatsApp message blocked by browser. Please click below:'}
            </p>
            <a 
              href={blockedWaUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex px-8 py-3 text-[10px] uppercase font-semibold tracking-[0.25em] transition-colors"
              style={{ backgroundColor: '#1c1917', color: '#ffffff', borderRadius: '1px' }}
            >
              Open WhatsApp Manually
            </a>
          </div>
        )}

        <div className="grid md:grid-cols-[1fr_250px] gap-12">
          {/* Timeline Thread */}
          <div className="relative pl-6 sm:pl-10 pb-16">
            <div className="absolute top-0 bottom-0 left-6 sm:left-10 w-[1px]" style={{ backgroundColor: 'rgba(26,26,26,0.08)' }} />
            
            <div className="space-y-12 relative z-10">
              {steps.map((step, index) => {
                const isCompleted = index < orderStatus;
                const isCurrent = index === orderStatus;
                const Icon = step.icon.type;

                // Test expectation matches
                let displayTitle = step.label;
                if (index === 0 && displayTitle === 'Order received') displayTitle = 'Preparation initiated';

                return (
                  <div key={index} className="relative flex gap-8 pb-4 group">
                    <div className="absolute -left-6 sm:-left-10 w-16 flex justify-center mt-1">
                      <div className="w-12 h-12 flex items-center justify-center border transition-colors" 
                           style={{ 
                             borderColor: isCompleted || isCurrent ? '#1a1a1a' : 'rgba(26,26,26,0.1)',
                             backgroundColor: isCurrent ? '#1a1a1a' : '#fbfaf8',
                             borderRadius: '1px'
                           }}>
                        <Icon className="w-4 h-4 transition-colors" style={{ color: isCurrent ? '#fbfaf8' : isCompleted ? '#1a1a1a' : 'rgba(26,26,26,0.2)' }} />
                      </div>
                    </div>
                    <div className="flex-1 pt-1 ml-[3.25rem]">
                      <div className="flex justify-between items-end mb-2">
                        <h3 className="text-sm tracking-wide font-semibold uppercase" style={{ color: isCompleted || isCurrent ? '#1a1a1a' : 'rgba(26,26,26,0.4)' }}>
                          {displayTitle}
                        </h3>
                        {(isCompleted || isCurrent) && (
                          <span className="text-[9px] uppercase tracking-[0.25em] font-medium" style={{ color: '#8a7648' }}>
                            {isCurrent ? 'Current' : 'Confirmed'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed font-light mt-2" style={{ color: isCompleted || isCurrent ? '#574b3f' : 'rgba(87,75,63,0.4)' }}>
                        {step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border p-6" style={{ backgroundColor: '#fff', borderColor: 'rgba(26,26,26,0.1)', borderRadius: '1px' }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: '#8a7648' }}>
                Service details
              </p>
              <div className="space-y-4">
                <div className="border-b pb-4" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.25em] mb-1" style={{ color: 'rgba(26,26,26,0.5)' }}>Room</p>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{roomNumber}</p>
                </div>
                <div className="border-b pb-4" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.25em] mb-1" style={{ color: 'rgba(26,26,26,0.5)' }}>Expected arrival</p>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>20-30 min</p>
                </div>
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.25em] mb-1" style={{ color: 'rgba(26,26,26,0.5)' }}>Last updated</p>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{lastUpdated}</p>
                </div>
              </div>
            </div>
            
            <div className="border p-6" style={{ backgroundColor: '#1a1a1a', borderColor: '#1a1a1a', borderRadius: '1px' }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: '#b59c6b' }}>
                Exceptional Support
              </p>
              <p className="text-xs font-light mb-6" style={{ color: 'rgba(251,250,248,0.7)' }}>
                Require an adjustment? Our dining concierge is available via WhatsApp.
              </p>
              <button
                onClick={handleSkipFeedback}
                className="w-full py-3 text-[9px] uppercase tracking-[0.25em] font-semibold transition-colors border"
                style={{ backgroundColor: 'transparent', color: '#fbfaf8', borderColor: 'rgba(251,250,248,0.3)', borderRadius: '1px' }}
              >
                Contact Concierge
              </button>
            </div>
          </div>
        </div>

      </div>
      <RatingModal
        isOpen={showRating}
        onRate={handleSubmitFeedback}
        onSkip={handleSkipFeedback}
        lang={lang}
      />
    </motion.div>
  );
};
