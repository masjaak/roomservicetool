import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATIONS } from '../data/constants';
import { Language } from '../types';

interface RatingModalProps {
  isOpen: boolean;
  onRate: (stars: number, comment: string) => void;
  lang: Language;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onRate, lang }) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const t = TRANSLATIONS[lang];

  const accentColor = '#a08850';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ backgroundColor: 'rgba(45,45,45,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-sm rounded-2xl overflow-hidden relative"
            style={{ backgroundColor: '#faf8f5' }}
          >
            {/* Top line — solid charcoal, no gradient */}
            <div className="h-1" style={{ backgroundColor: '#2d2d2d' }} />

            <div className="p-6">
              <button
                onClick={() => onRate(0, '')}
                className="absolute top-4 right-4 p-2 rounded-full"
                style={{ backgroundColor: 'rgba(45,45,45,0.05)' }}
              >
                <X className="w-4 h-4" style={{ color: '#b8a898' }} />
              </button>

              <div className="text-center">
                <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                  {t.rateTitle}
                </h3>
                <p className="text-xs mb-5" style={{ color: '#b8a898' }}>{t.rateDesc}</p>

                <div className="flex justify-center gap-3 mb-6">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setStars(n)}
                      className="p-2 rounded-full transition-all"
                      style={
                        n <= stars
                          ? { backgroundColor: 'rgba(160,136,80,0.1)' }
                          : { backgroundColor: 'transparent' }
                      }
                    >
                      <Star
                        className={`w-7 h-7 transition-all ${n <= stars ? 'scale-110' : ''}`}
                        style={{
                          color: n <= stars ? accentColor : '#d4ccbf',
                          fill: n <= stars ? accentColor : 'transparent',
                        }}
                      />
                    </button>
                  ))}
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={lang === 'ID' ? 'Komentar Anda (opsional)...' : 'Your comments (optional)...'}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(45,45,45,0.04)',
                    border: '1px solid rgba(45,45,45,0.08)',
                    color: '#2d2d2d',
                  }}
                />

                <button
                  onClick={() => onRate(stars, comment)}
                  disabled={stars === 0}
                  className="w-full mt-4 py-3.5 rounded-xl font-semibold text-sm uppercase tracking-widest transition-all disabled:opacity-30"
                  style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}
                >
                  {t.submit}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
