import os

def overwrite(path, content):
    with open(path, 'w') as f:
        f.write(content)

# 6. TrackingView.tsx - Stronger typography and spacing
tracking_view = """import React from 'react';
import { ArrowLeft, Clock, ChefHat, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppState, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';

interface TrackingViewProps {
  state: AppState;
  onBack: () => void;
  lang: Language;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ state, onBack, lang }) => {
  const t = TRANSLATIONS[lang];
  
  const steps = [
    {
      id: 'submitted',
      title: lang === 'ID' ? 'Pesanan Diterima' : 'Order Received',
      desc: lang === 'ID' ? 'Menunggu konfirmasi dapur' : 'Waiting for kitchen confirmation',
      icon: Clock,
      active: ['pending', 'preparing', 'delivered'].includes(state.status),
      current: state.status === 'pending'
    },
    {
      id: 'preparing',
      title: lang === 'ID' ? 'Sedang Disiapkan' : 'Preparing',
      desc: lang === 'ID' ? 'Koki sedang menyiapkan pesanan Anda' : 'Chef is preparing your order',
      icon: ChefHat,
      active: ['preparing', 'delivered'].includes(state.status),
      current: state.status === 'preparing'
    },
    {
      id: 'delivered',
      title: lang === 'ID' ? 'Terkirim' : 'Delivered',
      desc: lang === 'ID' ? 'Pesanan sudah diantar ke kamar' : 'Order has been delivered to room',
      icon: CheckCircle2,
      active: state.status === 'delivered',
      current: state.status === 'delivered'
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-[#fdfbf9]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-full max-w-3xl mx-auto min-h-screen relative">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 px-6 sm:px-12 py-6 bg-[#fdfbf9]/95 backdrop-blur-md border-b-2 border-[#e7e5e4]">
          <button onClick={onBack} className="flex items-center gap-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#1c1917] hover:opacity-50 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>{t.backToMenu}</span>
          </button>
        </div>

        <div className="px-6 sm:px-12 pt-16 pb-32">
          {state.error ? (
            <div className="text-center py-20">
              <h2 className="text-[2rem] font-bold text-[#b91c1c] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {lang === 'ID' ? 'Pesanan Ditolak' : 'Order Rejected'}
              </h2>
              <p className="text-[1.1rem] text-[#b91c1c]/80 mb-8 max-w-md mx-auto">{state.error}</p>
              <button onClick={onBack} className="h-14 px-8 text-[12px] uppercase tracking-[0.2em] font-bold bg-[#1c1917] text-[#ffffff] hover:bg-black transition-colors">
                {t.backToMenu}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-[3rem] sm:text-[4rem] leading-[1] mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 500 }}>
                {t.trackingTitle}
              </h2>
              <p className="text-[1.1rem] leading-relaxed text-[#574b3f] mb-16 max-w-lg">
                {t.trackingDesc}
              </p>

              <div className="bg-[#ffffff] border-2 border-[#e7e5e4] p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#1c1917]" />
                <div className="space-y-12">
                  {steps.map((step, index) => (
                    <div key={step.id} className="relative flex gap-6 sm:gap-8 min-h-[100px]">
                      {index !== steps.length - 1 && (
                        <div className={`absolute top-12 left-5 sm:left-6 w-0.5 h-[calc(100%-8px)] ${step.active ? 'bg-[#1c1917]' : 'bg-[#e7e5e4]'}`} />
                      )}
                      
                      <div className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        step.current ? 'border-[#1c1917] bg-[#1c1917] text-white' : 
                        step.active ? 'border-[#1c1917] bg-[#ffffff] text-[#1c1917]' : 'border-[#e7e5e4] bg-[#ffffff] text-[#d6d3d1]'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      
                      <div className={`pt-1 sm:pt-2 transition-opacity ${step.active ? 'opacity-100' : 'opacity-40'}`}>
                        <h4 className="text-[1.3rem] sm:text-[1.5rem] leading-tight mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 600 }}>
                          {step.title}
                        </h4>
                        <p className="text-[0.95rem] sm:text-[1rem] text-[#78716c] leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {state.status === 'delivered' && (
                <div className="mt-12 p-8 bg-[#1c1917] text-[#ffffff] border-l-4 border-l-[#d4af37]">
                  <h3 className="text-[1.8rem] leading-tight mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Bon Appétit!
                  </h3>
                  <p className="text-[1rem]">
                    {lang === 'ID' ? 'Pesanan Anda telah tiba. Selamat menikmati.' : 'Your order has arrived. Enjoy your meal.'}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};
"""

overwrite('src/views/TrackingView.tsx', tracking_view)
print("Hard redesign part 3 applied successfully.")
