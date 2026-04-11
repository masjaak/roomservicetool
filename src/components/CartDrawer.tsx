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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-md pointer-events-auto flex flex-col overflow-hidden sm:rounded-3xl rounded-t-3xl shadow-2xl"
              style={{ backgroundColor: '#faf8f5', maxHeight: '85vh' }}
            >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-3" style={{ borderBottom: '1px solid rgba(45,45,45,0.06)' }}>
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5" style={{ color: '#2d2d2d' }} />
                <h3 className="font-bold text-lg" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                  {t.cart}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-all"
                style={{ backgroundColor: 'rgba(45,45,45,0.05)' }}
              >
                <X className="w-5 h-5" style={{ color: '#2d2d2d' }} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="w-12 h-12 mb-4" style={{ color: '#d4ccbf' }} />
                  <p className="text-sm" style={{ color: '#b8a898' }}>{t.emptyCart}</p>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${item.note}-${index}`} className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ backgroundColor: '#fff', border: '1px solid rgba(45,45,45,0.06)' }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-0.5" style={{ color: '#2d2d2d' }}>{item.qty}× {item.name}</h4>
                      {item.note && (
                        <p className="text-[10px] italic truncate" style={{ color: '#b8a898' }}>📝 {item.note}</p>
                      )}
                      <p className="text-sm font-bold mt-0.5" style={{ color: '#a08850' }}>
                        {formatCurrency(item.price * item.qty)}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(index)}
                      className="p-2 rounded-full transition-all"
                      style={{ backgroundColor: 'rgba(180,60,60,0.06)', color: '#c45050' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6" style={{ borderTop: '1px solid rgba(45,45,45,0.06)' }}>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between" style={{ color: '#b8a898' }}>
                    <span>{t.subtotal}</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: '#b8a898' }}>
                    <span>{t.serviceTax}</span><span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2" style={{ color: '#2d2d2d', borderTop: '1px solid rgba(45,45,45,0.06)' }}>
                    <span>{t.total}</span><span>{formatCurrency(total)}</span>
                  </div>
                </div>
                <button
                  onClick={onCheckout}
                  className="w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-widest transition-all active:scale-[0.98]"
                  style={{ backgroundColor: '#2d2d2d', color: '#faf8f5', boxShadow: '0 4px 16px rgba(45,45,45,0.15)' }}
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