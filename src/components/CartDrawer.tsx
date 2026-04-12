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
              className="w-full max-w-2xl pointer-events-auto flex flex-col overflow-hidden sm:rounded-[32px] rounded-t-[32px] shadow-2xl"
              style={{ backgroundColor: '#faf8f5', maxHeight: '88vh' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 pb-5" style={{ borderBottom: '1px solid rgba(45,45,45,0.06)', backgroundColor: '#fff' }}>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: '#8a7648' }}>
                      {lang === 'ID' ? 'Tray kamar' : 'Room-service tray'}
                    </p>
                    <h3 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                    {lang === 'ID' ? 'Rincian Pesanan' : 'Order Summary'}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full transition-all"
                  style={{ backgroundColor: 'rgba(45,45,45,0.04)', color: '#2d2d2d' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-white space-y-0">
                {cart.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <ShoppingBag className="w-8 h-8 mb-4 opacity-20" style={{ color: '#2d2d2d' }} />
                    <p className="text-sm font-semibold tracking-wide uppercase" style={{ color: '#b8a898' }}>{t.emptyCart}</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="py-4 px-4 mb-3 rounded-[22px] flex gap-4" style={{ backgroundColor: '#faf8f5', border: '1px solid rgba(45,45,45,0.06)' }}>
                      <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-xs font-bold shrink-0" style={{ borderColor: 'rgba(45,45,45,0.1)', color: '#2d2d2d' }}>
                        {item.qty}x
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm" style={{ color: '#2d2d2d' }}>{item.name}</h4>
                          <span className="font-semibold text-sm ml-4" style={{ color: '#2d2d2d' }}>{formatCurrency(item.price * item.qty)}</span>
                        </div>
                        {item.note && (
                          <p className="text-xs italic leading-relaxed mb-2" style={{ color: '#888' }}>"{item.note}"</p>
                        )}
                        <button
                          onClick={() => onRemove(index)}
                          className="text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-red-500 mt-2"
                          style={{ color: '#b8a898' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Receipt Footer */}
              {cart.length > 0 && (
                <div className="p-6 bg-white shrink-0" style={{ borderTop: '1px solid rgba(45,45,45,0.06)' }}>
                  <div className="rounded-[24px] p-4 mb-5" style={{ backgroundColor: '#f7f2ea' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-2" style={{ color: '#8a7648' }}>
                      {lang === 'ID' ? 'Sebelum checkout' : 'Before checkout'}
                    </p>
                    <p className="text-sm leading-7" style={{ color: '#574b3f' }}>
                      {lang === 'ID'
                        ? 'Periksa jumlah item, catatan dapur, dan metode pembayaran sebelum pesanan dikirim.'
                        : 'Review dish quantities, kitchen notes, and payment method before the order is submitted.'}
                    </p>
                  </div>
                  <div className="space-y-3 mb-6 font-medium text-sm">
                    <div className="flex justify-between" style={{ color: '#888' }}>
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between" style={{ color: '#888' }}>
                      <span>{lang === 'ID' ? 'Pajak & Layanan (21%)' : 'Tax & Service (21%)'}</span>
                      <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-4 mt-2" style={{ borderTop: '1px dashed rgba(45,45,45,0.15)', color: '#2d2d2d' }}>
                      <span>{t.total}</span>
                      <span style={{ color: '#a08850' }}>{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onCheckout();
                    }}
                    className="w-full py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-transform active:scale-[0.98]"
                    style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}
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
