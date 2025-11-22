import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TRANSLATIONS } from '../data/constants';
import { Language } from '../types';

interface RatingModalProps {
  isOpen: boolean;
  onRate: (rating: number) => void;
  lang: Language;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onRate, lang }) => {
  const [rating, setRating] = useState(0);
  const t = TRANSLATIONS[lang];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 text-center shadow-2xl relative overflow-hidden z-50 pointer-events-auto"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-orange-600"></div>
            
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Star className="w-10 h-10 text-orange-500 fill-orange-500" />
            </div>
            
            <h3 className="font-serif font-bold text-2xl text-slate-900 mb-2">{t.rateTitle}</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">{t.rateDesc}</p>
            
            <div className="flex justify-center gap-2 mb-10">
                {[1,2,3,4,5].map(s => (
                    <button 
                      key={s} 
                      onClick={() => setRating(s)} 
                      className="focus:outline-none transition-all hover:scale-110 active:scale-90 p-1"
                    >
                        <Star className={`w-8 h-8 transition-all duration-300 ${s <= rating ? 'text-orange-400 fill-orange-400 drop-shadow-md scale-110' : 'text-slate-200 hover:text-slate-300'}`} />
                    </button>
                ))}
            </div>
            
            <button 
              onClick={() => onRate(rating)} 
              disabled={rating === 0}
              className="w-full bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white py-4 rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all"
            >
              {t.submit}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
