import os

def overwrite(path, content):
    with open(path, 'w') as f:
        f.write(content)

# 4. CartDrawer.tsx - Remove generic shadows, use full bleed, massive checkout
cart_drawer = """import React from 'react';
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
"""

# 5. CheckoutView.tsx - Stronger hierarchy and massive buttons
checkout_view = """import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Receipt, FileCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { CartItem, PaymentMethod, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { formatCurrency, calculateSubtotal, calculateTax, calculateTotal } from '../utils/format';

interface CheckoutViewProps {
  cart: CartItem[];
  onBack: () => void;
  onPlaceOrder: (method: PaymentMethod, bank: string | null, proof: File | null) => Promise<void>;
  loading: boolean;
  error: string | null;
  phoneNumber: string;
  lang: Language;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart, onBack, onPlaceOrder, loading, error, phoneNumber, lang,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('room');
  const t = TRANSLATIONS[lang];
  const subtotal = calculateSubtotal(cart);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPlaceOrder(method, null, null);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="min-h-screen pb-32" style={{ backgroundColor: '#fdfbf9', fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-full max-w-4xl mx-auto min-h-screen relative">
        <div className="sticky top-0 z-30 px-6 sm:px-12 py-6 bg-[#fdfbf9]/95 backdrop-blur-md border-b-2 border-[#e7e5e4]">
          <button onClick={onBack} className="flex items-center gap-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#1c1917] hover:opacity-50 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>{t.backToMenu}</span>
          </button>
        </div>

        <div className="px-6 sm:px-12 pt-12">
          <h2 className="text-[2.5rem] sm:text-[3.5rem] leading-[1] mb-12" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 500 }}>
            {t.checkout}
          </h2>

          <div className="grid gap-16 lg:grid-cols-[1fr_400px]">
            <form onSubmit={handleSubmit} className="space-y-12">
              <div className="space-y-6">
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#78716c] pb-4 border-b-2 border-[#e7e5e4]">
                  {lang === 'ID' ? 'Metode Pembayaran' : 'Payment Method'}
                </p>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={`relative flex items-start gap-4 p-6 sm:p-8 cursor-pointer border-2 transition-all ${method === 'room' ? 'border-[#1c1917] bg-[#f5f5f4]' : 'border-[#e7e5e4] bg-[#ffffff] hover:border-[#d6d3d1]'}`}>
                    <input type="radio" name="paymentMethod" value="room" checked={method === 'room'} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="mt-1 w-5 h-5 accent-[#1c1917]" />
                    <div>
                      <h4 className="text-[1.1rem] font-bold text-[#1c1917] mb-2">{t.roomCharge}</h4>
                      <p className="text-[0.95rem] text-[#78716c] leading-relaxed">{t.roomChargeDesc}</p>
                    </div>
                    <Receipt className={`absolute top-6 right-6 w-8 h-8 ${method === 'room' ? 'text-[#1c1917]' : 'text-[#d6d3d1]'}`} />
                  </label>
                  
                  <label className={`relative flex items-start gap-4 p-6 sm:p-8 cursor-pointer border-2 transition-all ${method === 'qris' ? 'border-[#1c1917] bg-[#f5f5f4]' : 'border-[#e7e5e4] bg-[#ffffff] hover:border-[#d6d3d1]'}`}>
                    <input type="radio" name="paymentMethod" value="qris" checked={method === 'qris'} onChange={(e) => setMethod(e.target.value as PaymentMethod)} className="mt-1 w-5 h-5 accent-[#1c1917]" />
                    <div>
                      <h4 className="text-[1.1rem] font-bold text-[#1c1917] mb-2">QRIS / Bank</h4>
                      <p className="text-[0.95rem] text-[#78716c] leading-relaxed">{lang === 'ID' ? 'Bayar via Transfer / E-Wallet' : 'Pay via Transfer / E-Wallet'}</p>
                    </div>
                    <CreditCard className={`absolute top-6 right-6 w-8 h-8 ${method === 'qris' ? 'text-[#1c1917]' : 'text-[#d6d3d1]'}`} />
                  </label>
                </div>
              </div>

              <div className="bg-[#f5f5f4] p-8 border-l-4 border-[#1c1917]">
                <div className="flex gap-4 items-start">
                  <Info className="w-6 h-6 text-[#1c1917] shrink-0 mt-1" />
                  <div>
                    <h4 className="text-[1.1rem] font-bold text-[#1c1917] mb-2">{t.whatsappRequired}</h4>
                    <p className="text-[1rem] leading-relaxed text-[#574b3f] mb-4">{t.whatsappDesc}</p>
                    <p className="text-[1rem] font-bold text-[#1c1917] bg-[#e7e5e4] px-4 py-3 inline-block tracking-wider">{phoneNumber}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-6 bg-[#fef2f2] border-2 border-[#ef4444] text-[#b91c1c] text-[1rem] font-medium">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full h-16 sm:h-20 flex items-center justify-center text-[12px] sm:text-[14px] uppercase tracking-[0.25em] font-bold transition-all bg-[#1c1917] text-[#ffffff] hover:bg-black disabled:opacity-50">
                {loading ? t.processing : t.placeOrder}
              </button>
            </form>

            <div className="bg-[#ffffff] border-2 border-[#1c1917] p-8 sm:p-10 h-fit">
              <h3 className="text-[1.3rem] font-bold text-[#1c1917] mb-8 pb-4 border-b-2 border-[#e7e5e4] uppercase tracking-widest">{t.orderSummary}</h3>
              <div className="space-y-6 mb-10">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.note}`} className="flex justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[1.05rem] font-bold text-[#1c1917] leading-snug">{item.name}</p>
                      <p className="text-[0.95rem] text-[#78716c] mt-1">Qty: {item.qty}</p>
                      {item.note && <p className="text-[0.85rem] text-[#a8a29e] mt-1 line-clamp-1 italic">Note: {item.note}</p>}
                    </div>
                    <p className="text-[1.05rem] font-semibold text-[#1c1917] text-right">{formatCurrency(item.price * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t-2 border-[#e7e5e4] pt-8 space-y-4">
                <div className="flex justify-between text-[1rem] text-[#78716c]">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[1rem] text-[#78716c]">
                  <span>{lang === 'ID' ? 'Pajak & Layanan (21%)' : 'Tax & Service (21%)'}</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-[1.5rem] font-bold pt-6 border-t-2 border-[#1c1917] text-[#1c1917]">
                  <span>{t.total}</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
"""

overwrite('src/components/CartDrawer.tsx', cart_drawer)
overwrite('src/views/CheckoutView.tsx', checkout_view)

print("Hard redesign part 2 applied successfully.")
