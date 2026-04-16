import React from 'react';
import { X, Trash2, ShoppingBag, Minus, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { formatCurrency, calculateSubtotal, calculateTax, calculateTotal } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartDrawerProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (index: number) => void;
  onCheckout: () => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart, isOpen, onClose, onRemove, onCheckout, lang,
}) => {
  const t = TRANSLATIONS[lang];
  const subtotal = calculateSubtotal(cart);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#000000]/70" onClick={onClose} />
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full md:w-[480px] h-full flex flex-col bg-[#f7f1e8] pointer-events-auto border-l border-[#e7e5e4] shadow-2xl overscroll-contain"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-8 border-b border-[#e7e5e4] bg-[#f7f1e8]">
                <div>
                  <h2 className="text-[2.2rem] leading-none text-[#1c1917]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    Folio
                  </h2>
                </div>
                <button aria-label="Close cart" onClick={onClose} className="p-2 text-[#78716c] hover:bg-[#e7e5e4] hover:text-[#1c1917] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]/50 rounded-none">
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
                {cart.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border border-[#e7e5e4] flex items-center justify-center mb-8">
                      <ShoppingBag className="w-6 h-6 text-[#d6d3d1]" strokeWidth={1} />
                    </div>
                    <p className="text-[1.8rem] text-[#1c1917] mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>{t.emptyCart}</p>
                    <p className="text-[0.95rem] font-light text-[#78716c]">{lang === 'ID' ? 'Item belanja Anda akan muncul di sini.' : 'Your selected items will appear here.'}</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-${item.note}-${index}`} className="flex flex-row gap-6 pb-8 border-b border-[#e7e5e4] last:border-b-0 last:pb-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-[#f5f5f4] overflow-hidden border border-[#e7e5e4]">
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-[1.2rem] leading-tight flex-1 pr-1 text-[#1c1917] tracking-wide" style={{ fontFamily: "'DM Serif Display', serif" }}>{item.name}</h4>
                            <button aria-label="Remove item" onClick={() => onRemove(index)} className="p-2 -mr-2 -mt-2 text-[#a8a29e] hover:text-[#b91c1c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]/50">
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                          {item.note && (
                            <div className="mt-3 p-3 bg-white border border-[#e7e5e4] text-[0.8rem] font-light text-[#78716c] flex gap-2">
                              <MessageSquare className="w-3 h-3 shrink-0 text-[#a08850]" strokeWidth={1.5} />
                              <p className="line-clamp-2 italic">{item.note}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-[1rem] font-semibold text-[#1c1917] tracking-wide">{formatCurrency(item.price * item.qty)}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#a08850] bg-white border border-[#a08850]">
                              Qty {item.qty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Receipt Footer */}
              {cart.length > 0 && (
                <div className="p-8 bg-[#f7f1e8] shrink-0 border-t border-[#e7e5e4]">
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-[0.95rem] font-light text-[#78716c]">
                      <span>{t.subtotal}</span>
                      <span className="text-[#1c1917] font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[0.95rem] font-light text-[#78716c]">
                      <span>{t.serviceTax || (lang === 'ID' ? 'Service & Pajak' : 'Service & Tax')}</span>
                      <span className="text-[#1c1917] font-medium">{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-[1.5rem] pt-6 border-t border-[#e7e5e4] text-[#1c1917]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                      <span>{t.total}</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(onCheckout, 300);
                    }}
                    className="w-full h-16 flex items-center justify-center bg-[#1c1917] text-white hover:bg-[#2d2d2d] active:scale-[0.99] transition-all duration-200 rounded-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1c1917]/50"
                  >
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold">
                      {t.checkout}
                    </span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
