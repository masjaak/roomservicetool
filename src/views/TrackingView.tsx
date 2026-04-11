import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, ChefHat, Search, Bell, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { TRANSLATIONS } from '../data/constants';
import { Language } from '../types';
import { RatingModal } from '../components/RatingModal';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mapOrderStatusToStep } from '../utils/statusMapping';

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
        await updateDoc(doc(db, 'orders', orderId), {
          ...payload,
          isFeedbackSubmitted: true,
          feedbackSubmittedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Feedback error:', e);
      }
    }
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
        {/* Hero — solid dark, no gradient, no pulse */}
        <div className="h-[35vh] relative overflow-hidden flex items-center justify-center w-full" style={{ backgroundColor: '#2d2d2d' }}>
          <div
            className="absolute inset-0 opacity-15 bg-cover bg-center"
            style={{ backgroundImage: "url('/assets/hero.jpg')" }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 text-center px-6"
          >
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: accentColor }}>
              <Clock className="w-8 h-8" style={{ color: '#faf8f5' }} />
            </div>
            <h2 className="text-2xl font-bold tracking-wide mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: '#faf8f5' }}>
              {t.trackTitle}
            </h2>
            <p className="text-xs tracking-widest uppercase px-4 py-1.5 rounded-full inline-block" style={{ color: 'rgba(250,248,245,0.6)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
              Est. 20–30 min
            </p>
          </motion.div>
        </div>

        {/* Timeline */}
        <div className="flex-1 p-8 sm:p-12 -mt-8 rounded-t-3xl relative z-20" style={{ backgroundColor: '#faf8f5' }}>
          {/* WhatsApp Blocked Fallback */}
          {blockedWaUrl && (
            <div className="max-w-md mx-auto mb-8 p-4 rounded-xl text-center shadow-sm" style={{ backgroundColor: '#fff', border: '1px solid rgba(215,160,80,0.5)' }}>
              <p className="text-sm font-medium mb-3" style={{ color: '#8b6933' }}>
                {lang === 'ID' 
                  ? 'Pesan otomatis ke WhatsApp dicegah oleh browser. Silakan klik di bawah ini:' 
                  : 'Automatic WhatsApp messaging was blocked by your browser. Please click below:'}
              </p>
              <a 
                href={blockedWaUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full py-3 rounded-lg font-bold text-sm tracking-wide bg-[#2d2d2d] text-[#faf8f5] active:scale-[0.98] transition-transform"
              >
                {lang === 'ID' ? 'Buka WhatsApp Manual' : 'Open WhatsApp Manually'}
              </a>
            </div>
          )}

          <div className="space-y-10 mt-4 max-w-md mx-auto">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex gap-6 relative transition-all duration-700"
                style={{ opacity: idx <= orderStatus ? 1 : 0.25 }}
              >
                {idx !== steps.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-[-40px] w-0.5 overflow-hidden" style={{ backgroundColor: 'rgba(45,45,45,0.08)' }}>
                    <motion.div
                      initial={{ height: '0%' }}
                      animate={{ height: idx < orderStatus ? '100%' : '0%' }}
                      className="w-full"
                      style={{ backgroundColor: accentColor }}
                      transition={{ duration: 1, ease: 'linear' }}
                    />
                  </div>
                )}

                <div
                  className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center z-10 transition-all duration-500"
                  style={{
                    border: `2px solid ${idx <= orderStatus ? accentColor : 'rgba(45,45,45,0.1)'}`,
                    color: idx <= orderStatus ? accentColor : '#b8a898',
                    backgroundColor: '#faf8f5',
                  }}
                >
                  {step.icon}
                </div>

                <div className={`pt-1 transition-all duration-500 ${idx === orderStatus ? 'translate-x-1' : ''}`}>
                  <h4 className="font-bold text-base" style={{ color: idx <= orderStatus ? '#2d2d2d' : '#b8a898' }}>
                    {step.label}
                  </h4>
                  <p className="text-sm leading-tight mt-1" style={{ color: '#b8a898' }}>{step.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <RatingModal
          isOpen={showRating}
          onRate={handleSubmitFeedback}
          lang={lang}
        />
      </div>
    </motion.div>
  );
};
