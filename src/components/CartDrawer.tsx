import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { formatCurrency, calculateSubtotal, calculateTax, calculateTotal } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartDrawerProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: string, note?: string, decrease?: boolean) => void;
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-[#000000]/60 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full md:w-[500px] h-full z-50 flex flex-col bg-[#fdfbf9] pointer-events-auto border-l-2 border-[#1c1917]/10"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-8 sm:py-10 border-b-2 border-[#e7e5e4] bg-[#ffffff]">
                <div>
                  <h2 className="text-[2.2rem] leading-[1]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917' }}>
                    {t.cart}
                  </h2>
                </div>
                <button onClick={onClose} className="p-3 -mr-3 transition-transform hover:scale-90 text-[#1c1917] bg-[#f5f5f4] rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
                {cart.length === 0 ? (
                  <div className="py-32 flex flex-col items-center justify-center text-center">
                    <ShoppingBag className="w-12 h-12 mb-6 text-[#d6d3d1]" />
                    <p className="text-[1.2rem] font-bold tracking-wide text-[#78716c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t.emptyCart}</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={`${item.id}-${item.note}`} className="flex flex-col sm:flex-row gap-6 pb-8 border-b-2 border-[#e7e5e4]">
                      <div className="w-full sm:w-28 h-40 sm:h-28 flex-shrink-0 bg-[#e7e5e4]">
                        <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover grayscale-[10%]" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-[1.2rem] font-bold leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917' }}>{item.name}</h4>
                            <button onClick={() => onRemove(item.id, item.note, false)} className="p-3 -m-3 text-[#1c1917]/40 hover:text-[#b91c1c] transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          {item.note && (
                            <div className="mt-3 bg-[#f5f5f4] p-3 text-[0.85rem] font-normal leading-snug text-[#574b3f] flex gap-3">
                              <MessageSquare className="w-4 h-4 shrink-0 text-[#a8a29e]" />
                              <p>{item.note}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-6 sm:mt-4">
                          <span className="text-[1.1rem] font-semibold tracking-wider text-[#1c1917]">{formatCurrency(item.price)}</span>
                          <div className="flex items-center border-2 border-[#e7e5e4] bg-[#ffffff] h-12">
                            <button onClick={() => onRemove(item.id, item.note, true)} className="w-12 h-full flex items-center justify-center text-[#1c1917] active:bg-[#f5f5f4]">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-[1.1rem] font-bold w-6 text-center text-[#1c1917]">{item.qty}</span>
                            <button onClick={() => onRemove(item.id, item.note, false)} className="w-12 h-full flex items-center justify-center text-[#1c1917] active:bg-[#f5f5f4]" disabled>
                              {/* Assuming adding from cart isn't directly supported by signature, so removing Plus logic or passing proper dispatch */}
                              <span className="text-gray-300 w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Receipt Footer */}
              {cart.length > 0 && (
                <div className="p-8 bg-[#ffffff] shrink-0 border-t-4 border-[#1c1917]">
                  <div className="space-y-4 mb-8 font-medium text-[1rem]">
                    <div className="flex justify-between text-[#78716c]">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#78716c]">
                      <span>{lang === 'ID' ? 'Pajak & Layanan (21%)' : 'Tax & Service (21%)'}</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[1.4rem] pt-6 mt-4 border-t-2 border-[#e7e5e4] text-[#1c1917]">
                      <span>{t.total}</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { onClose(); onCheckout(); }}
                    className="w-full h-16 flex items-center justify-center font-bold text-[13px] tracking-[0.25em] uppercase transition-all bg-[#1c1917] hover:bg-black text-[#ffffff] shadow-xl"
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
