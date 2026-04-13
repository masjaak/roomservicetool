import React, { useState } from 'react';
import { X, Minus, Plus, ChevronDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { formatCurrency } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItem, qty: number, note: string) => void;
  lang: Language;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, isOpen, onClose, onAdd, lang }) => {
  const t = TRANSLATIONS[lang];
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [showAllergens, setShowAllergens] = useState(false);

  const handleAdd = () => {
    if (item) {
      onAdd(item, qty, note);
      setQty(1);
      setNote('');
      onClose();
    }
  };

  const handleClose = () => {
    setQty(1);
    setNote('');
    onClose();
  };

  if (!item) return null;

  const totalPrice = item.price * qty;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-[#000000]/50 backdrop-blur-sm"
          />

          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none sm:p-6">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-lg bg-[#ffffff] pointer-events-auto flex flex-col sm:rounded-sm rounded-t-sm overflow-hidden shadow-2xl max-h-[90vh] overscroll-contain"
            >
              {/* Image Header */}
              <div className="relative w-full aspect-[3/2] max-h-[30vh] sm:max-h-[40vh] bg-[#f5f5f4]">
                <button
                  onClick={handleClose}
                  aria-label="Close modal"
                  className="absolute top-4 right-4 z-10 w-9 h-9 bg-[#ffffff] flex items-center justify-center text-[#1c1917] hover:bg-[#f5f5f4] transition-colors focus-visible:outline-none rounded-sm border border-[#e7e5e4]"
                >
                  <X className="w-4 h-4" />
                </button>
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-y-auto hide-scrollbar">
                <div className="px-6 py-8">
                  {/* Title & Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h2 className="text-[2rem] leading-tight font-bold" style={{ color: '#1c1917', fontFamily: "'DM Serif Display', serif" }}>
                      {item.name}
                    </h2>
                    {(item.tag || item.serviceTag) && (
                      <div className="flex flex-col gap-1 items-end pt-1">
                        {item.tag && <span className="text-[9px] px-2 py-1 font-bold uppercase tracking-[0.15em] bg-[#f5f5f4] text-[#78716c] rounded-sm">{item.tag}</span>}
                        {item.serviceTag && <span className="text-[9px] px-2 py-1 font-bold uppercase tracking-[0.15em] bg-[#1c1917] text-white rounded-sm">{item.serviceTag}</span>}
                      </div>
                    )}
                  </div>

                  <p className="text-[1rem] leading-relaxed text-[#78716c] mb-6">
                    {item.description}
                  </p>

                  <div className="flex gap-4 mb-8">
                    {item.prepTime && (
                      <div className="flex bg-[#f5f5f4] py-1.5 px-3 rounded-sm border border-[#e7e5e4]">
                        <span className="text-[9px] font-bold text-[#1c1917] uppercase tracking-[0.1em]">
                          Prep: {item.prepTime}
                        </span>
                      </div>
                    )}
                    {item.spiceLevel && item.spiceLevel !== 'None' && (
                      <div className="flex py-1.5 px-3 rounded-sm border border-[#e7e5e4]" style={{ backgroundColor: item.spiceLevel === 'Hot' ? '#fef2f2' : '#fffbeb', borderColor: item.spiceLevel === 'Hot' ? '#fca5a5' : '#fcd34d' }}>
                        <span className="text-[9px] font-bold uppercase tracking-[0.1em]" style={{ color: item.spiceLevel === 'Hot' ? '#b91c1c' : '#d97706' }}>
                          Spice: {item.spiceLevel}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Note Input */}
                  <div className="mb-6">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1c1917] mb-2">
                      {t.specialInstructions}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t.placeholderNote}
                      className="w-full bg-[#fdfbf9] border border-[#e7e5e4] rounded-sm p-4 text-[0.95rem] font-medium focus:outline-none focus:border-[#1c1917] resize-none h-24 placeholder-[#a8a29e] transition-colors"
                    />
                  </div>

                  {/* Allergens dropdown */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="bg-[#f5f5f4] rounded-sm overflow-hidden">
                      <button
                        onClick={() => setShowAllergens(!showAllergens)}
                        className="w-full flex items-center justify-between p-4 text-[10px] uppercase tracking-widest font-bold text-[#1c1917] focus-visible:outline-none"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#1c1917]" />
                          <span>Show Allergens</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showAllergens ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {showAllergens && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 flex flex-wrap gap-2">
                              {item.allergens.map((allergen) => (
                                <span key={allergen} className="px-2 py-1 bg-[#ffffff] border border-[#e7e5e4] text-[#1c1917] text-[9px] uppercase tracking-[0.1em] rounded-sm font-bold">
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Controls */}
              <div className="p-6 bg-[#ffffff] border-t border-[#e7e5e4] grid grid-cols-[100px_1fr] gap-4">
                {/* Quantity */}
                <div className="flex items-center justify-between bg-[#f5f5f4] rounded-sm px-1 h-14">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                    className="w-10 h-10 flex items-center justify-center text-[#1c1917] disabled:opacity-30 rounded-sm hover:bg-[#e7e5e4] transition-colors focus-visible:outline-none"
                    disabled={qty <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-[1rem] font-bold text-[#1c1917]">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    aria-label="Increase quantity"
                    className="w-10 h-10 flex items-center justify-center text-[#1c1917] rounded-sm hover:bg-[#e7e5e4] transition-colors focus-visible:outline-none"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAdd}
                  className="h-14 bg-[#1c1917] text-[#ffffff] rounded-sm flex items-center justify-between px-6 focus-visible:outline-none hover:bg-[#2d2d2d] transition-colors active:scale-[0.98]"
                >
                  <span className="text-[12px] font-bold uppercase tracking-widest">{t.addToCart}</span>
                  <span className="text-[14px] font-bold">{formatCurrency(totalPrice)}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
