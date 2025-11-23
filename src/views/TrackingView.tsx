import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Bell, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { TRANSLATIONS } from '../data/constants';
import { Language } from '../types';
import { RatingModal } from '../components/RatingModal';

interface TrackingViewProps {
  roomNumber: string;
  onFinish: () => void;
  lang: Language;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ roomNumber, onFinish, lang }) => {
  const [orderStatus, setOrderStatus] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    setOrderStatus(0);
    const timers = [
      setTimeout(() => setOrderStatus(1), 3000),
      setTimeout(() => setOrderStatus(2), 7000),
      setTimeout(() => {
        setOrderStatus(3);
        setTimeout(() => setShowRating(true), 1500);
      }, 12000)
    ];
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  const steps = [
      { icon: <CheckCircle2 className="w-5 h-5" />, label: "Order Confirmed", sub: "We have received your request." },
      { icon: <Clock className="w-5 h-5" />, label: "Kitchen Preparing", sub: "Chef is cooking your meal." },
      { icon: <Bell className="w-5 h-5" />, label: "On the Way", sub: "Staff is heading to Room " + roomNumber },
      { icon: <Star className="w-5 h-5" />, label: "Delivered", sub: "Service completed. Bon Appetit!" }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 font-sans overflow-hidden"
    >
      <div className="w-full max-w-3xl mx-auto bg-white min-h-screen shadow-none relative flex flex-col">
          
          {/* Hero Section */}
          <div className="h-[40vh] bg-slate-900 relative overflow-hidden flex items-center justify-center w-full">
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1763887850374-f20aac7e7c05?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/10"></div>
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 text-center px-6"
              >
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_40px_rgba(34,197,94,0.4)] ring-4 ring-white/10">
                      <Clock className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-white font-serif text-3xl font-bold tracking-wide mb-2">{t.trackTitle}</h2>
                  <p className="text-white/60 text-xs tracking-widest uppercase bg-black/30 backdrop-blur-sm px-4 py-1.5 rounded-full inline-block border border-white/10">
                    Est. Time: 20-30 Mins
                  </p>
              </motion.div>
          </div>

          {/* Timeline */}
          <div className="flex-1 p-8 sm:p-12 -mt-10 bg-white rounded-t-[3rem] relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="space-y-10 mt-4 max-w-md mx-auto">
                  {steps.map((step, idx) => (
                      <div key={idx} className={`flex gap-6 relative transition-all duration-1000 ${idx <= orderStatus ? 'opacity-100' : 'opacity-30 grayscale'}`}>
                          {idx !== steps.length - 1 && (
                              <div className="absolute left-[19px] top-10 bottom-[-40px] w-0.5 bg-slate-100 overflow-hidden">
                                <motion.div 
                                  initial={{ height: "0%" }}
                                  animate={{ height: idx < orderStatus ? "100%" : "0%" }}
                                  className="w-full bg-green-500"
                                  transition={{ duration: 1, ease: "linear" }}
                                />
                              </div>
                          )}
                          
                          <div className={`
                            w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border-2 z-10 bg-white transition-all duration-500
                            ${idx <= orderStatus ? 'border-green-500 text-green-600 shadow-lg shadow-green-100 scale-110' : 'border-slate-100 text-slate-300'}
                          `}>
                              {step.icon}
                          </div>
                          
                          <div className={`pt-1 transition-all duration-500 ${idx === orderStatus ? 'translate-x-2' : ''}`}>
                              <h4 className={`font-bold text-base ${idx <= orderStatus ? 'text-slate-900' : 'text-slate-400'}`}>
                                {step.label}
                              </h4>
                              <p className="text-sm text-slate-500 leading-tight mt-1">{step.sub}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          <RatingModal 
            isOpen={showRating} 
            onRate={onFinish}
            lang={lang}
          />
      </div>
    </motion.div>
  );
};
