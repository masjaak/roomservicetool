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

  const accentColor = '#a08850';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen overflow-hidden"
      style={{ backgroundColor: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-3xl mx-auto min-h-screen relative flex flex-col">
        {/* Hero */}
        <div className="pt-20 pb-16 px-6 text-center bg-white border-b" style={{ borderColor: 'rgba(45,45,45,0.06)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#faf8f5', border: '1px solid rgba(45,45,45,0.1)' }}>
            <Clock className="w-6 h-6" style={{ color: '#2d2d2d' }} />
          </div>
          <h2 className="text-3xl mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
            {t.trackTitle}
          </h2>
          <p className="text-[10px] font-bold tracking-widest uppercase inline-block border py-2 px-4 rounded-full" style={{ color: '#888', borderColor: 'rgba(45,45,45,0.1)' }}>
            Est. 20–30 min
          </p>
        </div>

        {/* Timeline */}
        <div className="flex-1 p-8 sm:p-12 relative z-20" style={{ backgroundColor: '#faf8f5' }}>
          {/* WhatsApp Blocked Fallback */}
          {blockedWaUrl && (
            <div className="max-w-md mx-auto mb-10 p-5 text-center border" style={{ backgroundColor: '#fff', borderColor: 'rgba(215,160,80,0.3)' }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: '#a08850' }}>
                {lang === 'ID' 
                  ? 'Pesan otomatis ke WhatsApp dicegah oleh browser. Silakan klik di bawah ini:' 
                  : 'Automatic WhatsApp messaging was blocked by your browser. Please click below:'}
              </p>
              <a 
                href={blockedWaUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full py-4 rounded-full font-bold text-xs tracking-widest uppercase bg-[#2d2d2d] text-[#faf8f5] active:scale-[0.98] transition-transform"
              >
                {lang === 'ID' ? 'Buka WhatsApp Manual' : 'Open WhatsApp Manually'}
              </a>
            </div>
          )}

          <div className="space-y-12 mt-4 max-w-sm mx-auto pl-4">
            {steps.map((step, idx) => {
              const isPast = idx < orderStatus;
              const isCurrent = idx === orderStatus;
              const isFuture = idx > orderStatus;
              
              return (
                <div
                  key={idx}
                  className="flex gap-8 relative transition-all duration-700"
                  style={{ opacity: isFuture ? 0.4 : 1 }}
                >
                  {/* Vertical Line Connector */}
                  {idx !== steps.length - 1 && (
                    <div className="absolute left-[11px] top-[30px] bottom-[-40px] w-[1px] overflow-hidden" style={{ backgroundColor: 'rgba(45,45,45,0.1)' }}>
                      <motion.div
                        initial={{ height: '0%' }}
                        animate={{ height: isPast ? '100%' : '0%' }}
                        className="w-full"
                        style={{ backgroundColor: '#2d2d2d' }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div
                    className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center z-10 transition-all duration-500 mt-0.5"
                    style={{
                      border: `1px solid ${isPast || isCurrent ? '#2d2d2d' : 'rgba(45,45,45,0.2)'}`,
                      backgroundColor: isPast ? '#2d2d2d' : '#faf8f5',
                    }}
                  >
                    {isPast && <CheckCircle2 className="w-3 h-3 text-white" />}
                    {isCurrent && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2d2d2d' }} />}
                  </div>

                  <div className={`transition-all duration-500 pb-2 ${isCurrent ? 'translate-x-1' : ''}`}>
                    <h4 className="font-bold text-sm tracking-wide uppercase" style={{ color: isCurrent || isPast ? '#2d2d2d' : '#888' }}>
                      {step.label}
                    </h4>
                    <p className="text-xs mt-1.5 leading-relaxed font-medium" style={{ color: isCurrent ? '#555' : '#888' }}>
                      {step.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <RatingModal
          isOpen={showRating}
          onRate={handleSubmitFeedback}
          onSkip={handleSkipFeedback}
          lang={lang}
        />
      </div>
    </motion.div>
  );
};
