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
      className="min-h-screen overflow-hidden"
      style={{ backgroundColor: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-5xl mx-auto min-h-screen relative flex flex-col">
        {/* Hero */}
        <div className="pt-16 sm:pt-20 pb-12 px-5 sm:px-6 bg-white border-b" style={{ borderColor: 'rgba(45,45,45,0.06)' }}>
          <div className="rounded-[30px] px-6 py-7 sm:px-8 sm:py-8 text-center" style={{ backgroundColor: '#2d2d2d' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <Clock className="w-6 h-6" style={{ color: '#2d2d2d' }} />
          </div>
            <p className="text-[10px] font-bold tracking-[0.28em] uppercase mb-3" style={{ color: '#c4b5a4' }}>
              {lang === 'ID' ? 'Layanan sedang berjalan' : 'Service in progress'}
            </p>
            <h2 className="text-3xl mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: '#faf8f5' }}>
              {t.trackTitle}
            </h2>
            <p className="text-sm max-w-xl mx-auto leading-7" style={{ color: 'rgba(250,248,245,0.72)' }}>
              {lang === 'ID'
                ? 'Kami menjaga setiap langkah tetap jelas, dari konfirmasi dapur hingga pengantaran ke kamar Anda.'
                : 'Each handoff is surfaced clearly, from kitchen confirmation through final delivery to your room.'}
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-6 py-6 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="rounded-[28px] border p-5" style={{ backgroundColor: '#fff', borderColor: 'rgba(45,45,45,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-4" style={{ color: '#8a7648' }}>
                Service details
              </p>
              <div className="space-y-3">
                {[
                  {
                    label: lang === 'ID' ? 'Estimated arrival' : 'Estimated arrival',
                    value: '20-30 min',
                  },
                  {
                    label: lang === 'ID' ? 'Room' : 'Room',
                    value: roomNumber,
                  },
                  {
                    label: lang === 'ID' ? 'Last updated' : 'Last updated',
                    value: lastUpdated,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-[20px] px-4 py-4" style={{ backgroundColor: '#faf8f5' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: '#8a7648' }}>{label}</p>
                    <p className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border p-5" style={{ backgroundColor: '#f7f2ea', borderColor: 'rgba(45,45,45,0.06)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-3" style={{ color: '#8a7648' }}>
                {lang === 'ID' ? 'Status aktif' : 'Live status'}
              </p>
              <p className="text-sm leading-7" style={{ color: '#574b3f' }}>
                {steps[orderStatus]?.sub}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-[30px] border p-6 sm:p-8 relative z-20" style={{ backgroundColor: '#fff', borderColor: 'rgba(45,45,45,0.06)' }}>
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: '#8a7648' }}>
                  {lang === 'ID' ? 'Journey pesanan' : 'Order journey'}
                </p>
                <h3 className="text-3xl" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                  {steps[orderStatus]?.label}
                </h3>
              </div>
              <p className="text-[10px] font-bold tracking-widest uppercase inline-block border py-2 px-4 rounded-full" style={{ color: '#888', borderColor: 'rgba(45,45,45,0.1)' }}>
                Est. 20–30 min
              </p>
            </div>

            {/* WhatsApp Blocked Fallback */}
            {blockedWaUrl && (
              <div className="max-w-md mb-8 p-5 text-center border rounded-[24px]" style={{ backgroundColor: '#fffaf2', borderColor: 'rgba(215,160,80,0.3)' }}>
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

            <div className="space-y-7 mt-4">
              {steps.map((step, idx) => {
                const isPast = idx < orderStatus;
                const isCurrent = idx === orderStatus;
                const isFuture = idx > orderStatus;
                
                return (
                  <div
                    key={idx}
                    className="flex gap-5 relative transition-all duration-700 rounded-[24px] px-4 py-4"
                    style={{
                      opacity: isFuture ? 0.48 : 1,
                      backgroundColor: isCurrent ? '#faf8f5' : 'transparent',
                    }}
                  >
                    {/* Vertical Line Connector */}
                    {idx !== steps.length - 1 && (
                      <div className="absolute left-[27px] top-[52px] bottom-[-32px] w-[1px] overflow-hidden" style={{ backgroundColor: 'rgba(45,45,45,0.1)' }}>
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
                      className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center z-10 transition-all duration-500 mt-0.5"
                      style={{
                        border: `1px solid ${isPast || isCurrent ? '#2d2d2d' : 'rgba(45,45,45,0.2)'}`,
                        backgroundColor: isPast ? '#2d2d2d' : '#faf8f5',
                      }}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4 text-white" /> : step.icon}
                    </div>

                    <div className={`transition-all duration-500 pb-1 ${isCurrent ? 'translate-x-1' : ''}`}>
                      <h4 className="font-bold text-sm tracking-wide uppercase" style={{ color: isCurrent || isPast ? '#2d2d2d' : '#888' }}>
                        {step.label}
                      </h4>
                      <p className="text-sm mt-1.5 leading-7 font-medium max-w-xl" style={{ color: isCurrent ? '#555' : '#888' }}>
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
          onRate={handleSubmitFeedback}
          onSkip={handleSkipFeedback}
          lang={lang}
        />
      </div>
    </motion.div>
  );
};
