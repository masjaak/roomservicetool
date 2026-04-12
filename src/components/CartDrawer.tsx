import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { formatCurrency } from '../utils/format';
import { calculateSubtotal, calculateTax, calculateTotal } from '../utils/format';

interface CartDrawerProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (index: number) => void;
  onCheckout: () => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  isOpen,
  onClose,
  onRemove,
  onCheckout,
  lang,
}) => {
  const t = TRANSLATIONS[lang];

  const subtotal = calculateSubtotal(cart);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(45,45,45,0.5)' }}
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full md:w-[480px] z-50 flex flex-col shadow-2xl border-l"
              style={{ backgroundColor: '#fbfaf8', borderColor: 'rgba(26,26,26,0.1)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-semibold mb-2" style={{ color: '#8a7648' }}>
                    {lang === 'ID' ? 'Kamar' : 'Room'} {roomNumber}
                  </p>
                  <h2 className="text-[1.8rem] leading-[1]" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a' }}>
                    {t.cart}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 transition-all hover:bg-gray-100"
                  style={{ color: '#1a1a1a', borderRadius: '1px' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <ShoppingBag className="w-8 h-8 mb-4 opacity-20" style={{ color: '#2d2d2d' }} />
                    <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#b8a898' }}>{t.emptyCart}</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={`${item.id}-${item.note}`} className="flex gap-5 pb-6 border-b" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
                      <div className="w-24 h-24 flex-shrink-0 bg-[#edeae3]">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover grayscale-[20%]"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <h4 className="text-sm font-semibold tracking-wide" style={{ color: '#1a1a1a' }}>{item.name}</h4>
                            <button
                              onClick={() => removeFromCart(item.id, item.note)}
                              className="p-1 transition-opacity hover:opacity-100 opacity-40 -mt-1 -mr-1"
                              style={{ color: '#1a1a1a' }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {item.note && (
                            <div className="mt-2 flex items-start gap-2 text-xs font-light" style={{ color: '#574b3f' }}>
                              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0 text-[#8a7648]" />
                              <p className="line-clamp-2">{item.note}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs font-medium tracking-widest block" style={{ color: '#1a1a1a' }}>{formatCurrency(item.price)}</span>
                          <div className="flex items-center gap-4 bg-white border px-2 py-1" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                            <button
                              onClick={() => removeFromCart(item.id, item.note, true)}
                              className="w-5 h-5 flex items-center justify-center transition-opacity disabled:opacity-30"
                              style={{ color: '#1a1a1a' }}
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-medium w-3 text-center" style={{ color: '#1a1a1a' }}>{item.qty}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-5 h-5 flex items-center justify-center transition-opacity"
                              style={{ color: '#1a1a1a' }}
                            >
                              <Plus className="w-3 h-3" />
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
                <div className="p-8 bg-[#fbfaf8] shrink-0 border-t" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
                  <div className="space-y-3 mb-8 font-medium text-sm">
                    <div className="flex justify-between" style={{ color: '#888' }}>
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: '#888' }}>
                      <span>{lang === 'ID' ? 'Pajak & Layanan (21%)' : 'Tax & Service (21%)'}</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-4 mt-2 border-t" style={{ borderColor: 'rgba(26,26,26,0.15)', color: '#1a1a1a' }}>
                      <span>{t.total}</span>
                      <span style={{ color: '#a08850' }}>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onCheckout();
                    }}
                    className="w-full py-4 font-bold text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#1a1a1a', color: '#fbfaf8' }}
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
