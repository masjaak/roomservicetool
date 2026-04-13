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
              className="w-full md:w-[480px] h-full flex flex-col bg-[#fdfbf9] pointer-events-auto shadow-2xl overscroll-contain"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-6 border-b border-[#e7e5e4] bg-[#ffffff]">
                <div>
                  <h2 className="text-[2rem] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: '#1c1917' }}>
                    {t.cart}
                  </h2>
                </div>
                <button aria-label="Close cart" onClick={onClose} className="p-2 text-[#1c1917] bg-[#ffffff] border border-[#e7e5e4] rounded-sm hover:bg-[#f5f5f4] transition-colors focus-visible:outline-none">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {cart.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#ffffff] border border-[#e7e5e4] flex items-center justify-center mb-6">
                      <ShoppingBag className="w-6 h-6 text-[#1c1917]" />
                    </div>
                    <p className="text-[1.2rem] font-bold text-[#1c1917] font-serif mb-2">{t.emptyCart}</p>
                    <p className="text-[0.95rem] text-[#78716c]">Your selected items will appear here.</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-${item.note}`} className="flex flex-row gap-5 pb-6 border-b border-[#e7e5e4] last:border-b-0">
                      <div className="w-24 h-24 flex-shrink-0 bg-[#f5f5f4] rounded-sm overflow-hidden border border-[#e7e5e4]">
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="text-[1.1rem] font-bold leading-snug flex-1 pr-1" style={{ fontFamily: "'DM Serif Display', serif", color: '#1c1917' }}>{item.name}</h4>
                            <button aria-label="Remove item" onClick={() => onRemove(index)} className="p-2 -mr-2 -mt-1 text-[#a8a29e] hover:text-[#b91c1c] transition-colors focus-visible:outline-none rounded-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {item.note && (
                            <div className="mt-2 bg-[#f5f5f4] p-2 rounded-md text-[0.8rem] font-medium text-[#78716c] flex gap-2">
                              <MessageSquare className="w-3 h-3 shrink-0 text-[#a08850]" />
                              <p className="line-clamp-2">{item.note}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[0.95rem] font-bold text-[#44403c]">{formatCurrency(item.price * item.qty)}</span>
                          <div className="flex items-center gap-2">
                            <span className="rounded-sm border border-[#e7e5e4] bg-[#fdfbf9] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1c1917]">
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
                <div className="p-6 bg-[#ffffff] shrink-0 border-t border-[#e7e5e4] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[0.95rem] font-medium text-[#78716c]">
                      <span>{t.subtotal}</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[0.95rem] font-medium text-[#78716c]">
                      <span>{t.serviceTax || (lang === 'ID' ? 'Service & Pajak' : 'Service & Tax')}</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="h-px bg-[#e7e5e4] my-2" />
                    <div className="flex justify-between text-[1.25rem] font-bold" style={{ color: '#1c1917', fontFamily: "'DM Serif Display', serif" }}>
                      <span>{t.total}</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(onCheckout, 300);
                    }}
                    className="w-full h-14 flex items-center justify-center bg-[#1c1917] text-white hover:bg-[#2d2d2d] active:scale-[0.98] transition-transform duration-200 rounded-sm focus-visible:outline-none"
                  >
                    <span className="text-[12px] uppercase tracking-widest font-bold">
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
