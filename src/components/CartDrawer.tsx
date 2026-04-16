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

  const brassColor = '#a08850';
  const headingColor = '#faf8f5';
  const mutedColor = 'rgba(250,248,245,0.45)';

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
              className="w-full md:w-[480px] h-full flex flex-col pointer-events-auto shadow-2xl overscroll-contain"
              style={{ backgroundColor: 'rgba(45,45,45,0.95)', borderLeft: '1px solid rgba(250,248,245,0.08)', fontFamily: "'Inter', sans-serif" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-8" style={{ borderBottom: '1px solid rgba(250,248,245,0.08)' }}>
                <div>
                  <h2 className="text-[2.2rem] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: headingColor }}>
                    Folio
                  </h2>
                </div>
                <button aria-label="Close cart" onClick={onClose} className="p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a08850]/50 rounded-lg" style={{ color: 'rgba(250,248,245,0.4)' }}>
                  <X className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
                {cart.length === 0 ? (
                  <div className="py-24 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-8 rounded-xl" style={{ border: '1px solid rgba(250,248,245,0.1)' }}>
                      <ShoppingBag className="w-6 h-6" style={{ color: 'rgba(250,248,245,0.2)' }} strokeWidth={1} />
                    </div>
                    <p className="text-[1.8rem] mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: headingColor }}>{t.emptyCart}</p>
                    <p className="text-[0.95rem] font-light" style={{ color: mutedColor }}>{lang === 'ID' ? 'Item belanja Anda akan muncul di sini.' : 'Your selected items will appear here.'}</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-${item.note}-${index}`} className="flex flex-row gap-6 pb-8" style={{ borderBottom: index !== cart.length - 1 ? '1px solid rgba(250,248,245,0.06)' : 'none' }}>
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-lg" style={{ border: '1px solid rgba(250,248,245,0.08)' }}>
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-[1.1rem] leading-tight flex-1 pr-1 tracking-wide" style={{ fontFamily: "'DM Serif Display', serif", color: headingColor }}>{item.name}</h4>
                            <button aria-label="Remove item" onClick={() => onRemove(index)} className="p-2 -mr-2 -mt-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a08850]/50" style={{ color: 'rgba(250,248,245,0.3)' }}>
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                          {item.note && (
                            <div className="mt-3 p-3 rounded-lg text-[0.8rem] font-light flex gap-2" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.06)', color: mutedColor }}>
                              <MessageSquare className="w-3 h-3 shrink-0" style={{ color: brassColor }} strokeWidth={1.5} />
                              <p className="line-clamp-2 italic">{item.note}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-[1rem] font-semibold tracking-wide" style={{ color: headingColor }}>{formatCurrency(item.price * item.qty)}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-md text-[0.7rem] font-bold uppercase tracking-[0.2em]" style={{ color: brassColor, backgroundColor: 'rgba(160,136,80,0.12)', border: `1px solid ${brassColor}` }}>
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
                <div className="p-8 shrink-0" style={{ borderTop: '1px solid rgba(250,248,245,0.08)' }}>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-[0.95rem] font-light">
                      <span style={{ color: mutedColor }}>{t.subtotal}</span>
                      <span className="font-medium" style={{ color: headingColor }}>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[0.95rem] font-light">
                      <span style={{ color: mutedColor }}>{t.serviceTax || (lang === 'ID' ? 'Service & Pajak' : 'Service & Tax')}</span>
                      <span className="font-medium" style={{ color: headingColor }}>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between text-[1.5rem] pt-6" style={{ fontFamily: "'DM Serif Display', serif", borderTop: '1px solid rgba(250,248,245,0.1)', color: headingColor }}>
                      <span>{t.total}</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(onCheckout, 300);
                    }}
                    className="w-full py-4 rounded-xl font-semibold text-sm tracking-widest uppercase transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#a08850]/50"
                    style={{ backgroundColor: '#faf8f5', color: '#2d2d2d' }}
                  >
                    {t.checkout}
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
