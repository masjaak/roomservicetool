import React, { useState } from 'react';
import { ChevronLeft, Building2, QrCode, CreditCard, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem, Language } from '../types';
import { BANKS, TRANSLATIONS } from '../data/constants';
import { formatCurrency, calculateSubtotal, calculateTax, calculateTotal } from '../utils/format';
import type { PaymentMethod } from '../machine/types';

interface CheckoutViewProps {
  cart: CartItem[];
  onBack: () => void;
  onPlaceOrder: (paymentMethod: PaymentMethod, selectedBank: string | null, proof: File | null) => void;
  loading: boolean;
  error?: string | null;
  phoneNumber: string;
  lang: Language;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  onBack,
  onPlaceOrder,
  loading,
  error,
  phoneNumber,
  lang,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('room');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const t = TRANSLATIONS[lang];

  const subtotal = calculateSubtotal(cart);
  const taxService = calculateTax(subtotal);
  const grandTotal = calculateTotal(subtotal);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTransferProof(e.target.files[0]);
    }
  };

  const canSubmit = paymentMethod === 'room' 
    ? true 
    : paymentMethod === 'bank' 
      ? selectedBank && transferProof 
      : transferProof;

  const accentColor = '#a08850';
  const accentBg = 'rgba(160,136,80,0.08)';
  const accentBorder = 'rgba(160,136,80,0.3)';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen pb-32"
      style={{ backgroundColor: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-3xl mx-auto min-h-screen relative">
        {/* Header */}
        <div className="sticky top-0 z-30 px-6 pt-6 pb-4 flex items-center gap-4" style={{ backgroundColor: '#faf8f5', boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
          <button
            onClick={onBack}
            className="group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full transition-all active:scale-95"
            style={{ backgroundColor: 'rgba(45,45,45,0.04)', border: '1px solid rgba(45,45,45,0.08)' }}
          >
            <div className="p-1.5 rounded-full" style={{ backgroundColor: '#fff', border: '1px solid rgba(45,45,45,0.08)' }}>
              <ChevronLeft className="w-4 h-4" style={{ color: '#2d2d2d' }} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#3a3a3a' }}>{t.backToMenu}</span>
          </button>
          <div className="flex-1 text-right">
            <h2 className="text-lg font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>{t.checkout}</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Payment Methods */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#fff', border: '1px solid rgba(45,45,45,0.06)' }}>
            <h3 className="font-bold mb-4" style={{ color: '#2d2d2d' }}>{t.paymentMethod}</h3>
            <div className="space-y-3">
              {([
                { method: 'room' as PaymentMethod, icon: Building2, label: t.chargeRoom },
                { method: 'qris' as PaymentMethod, icon: QrCode, label: 'QRIS / E-Wallet' },
                { method: 'bank' as PaymentMethod, icon: CreditCard, label: t.bankTransfer },
              ]).map(({ method, icon: Icon, label }) => (
                <label
                  key={method}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all w-full"
                  style={{
                    border: `2px solid ${paymentMethod === method ? accentBorder : 'rgba(45,45,45,0.06)'}`,
                    backgroundColor: paymentMethod === method ? accentBg : 'transparent',
                  }}
                >
                  <input type="radio" name="pay" className="hidden" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                  <div className="p-2 rounded-full" style={{ backgroundColor: paymentMethod === method ? accentBg : 'rgba(45,45,45,0.04)' }}>
                    <Icon className="w-5 h-5" style={{ color: paymentMethod === method ? accentColor : '#b8a898' }} />
                  </div>
                  <span className="font-semibold text-sm" style={{ color: '#2d2d2d' }}>{label}</span>
                  {paymentMethod === method && <CheckCircle2 className="w-5 h-5 ml-auto" style={{ color: accentColor }} />}
                </label>
              ))}
            </div>

            {/* Bank selection */}
            <AnimatePresence>
              {paymentMethod === 'bank' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pl-2">
                    <p className="text-xs font-semibold uppercase mb-3 tracking-wider" style={{ color: '#b8a898' }}>Select Bank</p>
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                      {BANKS.map((bank) => (
                        <button
                          key={bank.id}
                          onClick={() => setSelectedBank(bank.id)}
                          className="px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
                          style={
                            selectedBank === bank.id
                              ? { backgroundColor: '#2d2d2d', color: '#faf8f5', border: '1px solid #2d2d2d' }
                              : { backgroundColor: '#fff', color: '#3a3a3a', border: '1px solid rgba(45,45,45,0.12)' }
                          }
                        >
                          {bank.name}
                        </button>
                      ))}
                    </div>
                    {selectedBank && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl text-center mb-4 relative overflow-hidden"
                        style={{ backgroundColor: 'rgba(45,45,45,0.03)', border: '1px solid rgba(45,45,45,0.08)' }}
                      >
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: accentColor }} />
                        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#b8a898' }}>Virtual Account Number</p>
                        <p className="text-xl font-mono font-bold tracking-widest select-all cursor-pointer" style={{ color: '#2d2d2d' }}>
                          {BANKS.find((b) => b.id === selectedBank)?.code}
                          <span style={{ color: accentColor }}>{phoneNumber}</span>
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* QRIS */}
            <AnimatePresence>
              {paymentMethod === 'qris' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 rounded-xl p-6 flex flex-col items-center text-center" style={{ backgroundColor: '#fff', border: '1px solid rgba(45,45,45,0.08)' }}>
                    <img src="/assets/qris.svg" className="w-40 h-40 opacity-80 mb-2" alt="QRIS" />
                    <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#b8a898' }}>{t.scanQris}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload proof */}
            <AnimatePresence>
              {(paymentMethod === 'qris' || (paymentMethod === 'bank' && selectedBank)) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(45,45,45,0.06)' }}>
                    <p className="text-xs font-semibold mb-3" style={{ color: '#2d2d2d' }}>{t.uploadProof}</p>
                    <label className="flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all group relative overflow-hidden" style={{ border: '2px dashed rgba(45,45,45,0.2)', backgroundColor: 'rgba(45,45,45,0.02)' }}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                        {transferProof ? (
                          <div className="flex flex-col items-center px-4 text-center" style={{ color: '#6a8a5a' }}>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(106,138,90,0.1)' }}>
                              <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-semibold break-all line-clamp-1">{transferProof.name}</p>
                            <p className="text-[10px]" style={{ color: '#6a8a5a' }}>{t.fileSelected}</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: '#fff', border: '1px solid rgba(45,45,45,0.08)' }}>
                              <Upload className="w-5 h-5" style={{ color: '#b8a898' }} />
                            </div>
                            <p className="text-[11px] font-semibold" style={{ color: '#3a3a3a' }}>{t.uploadPrompt}</p>
                            <p className="text-[9px] uppercase tracking-wider mt-1" style={{ color: '#b8a898' }}>JPG, PNG</p>
                          </>
                        )}
                      </div>
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="p-6 rounded-2xl" style={{ backgroundColor: '#fff', border: '1px solid rgba(45,45,45,0.06)' }}>
            <h3 className="font-bold mb-4" style={{ color: '#2d2d2d' }}>Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between" style={{ color: '#b8a898' }}>
                <span>{t.subtotal}</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between" style={{ color: '#b8a898' }}>
                <span>{t.serviceTax}</span>
                <span>{formatCurrency(taxService)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold mt-4 pt-4" style={{ color: '#2d2d2d', borderTop: '1px solid rgba(45,45,45,0.06)' }}>
                <span>{t.total}</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar — no gradient */}
        <div className="sticky bottom-0 left-0 right-0 z-40 p-6" style={{ backgroundColor: '#faf8f5' }}>
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded-lg text-sm text-center font-medium" style={{ backgroundColor: 'rgba(180,60,60,0.1)', color: '#c45050', border: '1px solid rgba(180,60,60,0.2)' }}>
              {error}
            </motion.div>
          )}
          <button
            onClick={() => onPlaceOrder(paymentMethod, selectedBank, transferProof)}
            disabled={loading || !canSubmit}
            className="w-full py-4 rounded-xl font-semibold text-sm flex justify-center items-center gap-2 transition-all active:scale-[0.98]"
            style={
              loading || !canSubmit
                ? { backgroundColor: 'rgba(45,45,45,0.08)', color: '#b8a898', cursor: 'not-allowed' }
                : { backgroundColor: '#2d2d2d', color: '#faf8f5', boxShadow: '0 4px 16px rgba(45,45,45,0.15)' }
            }
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.processing}
              </>
            ) : !canSubmit ? (
              'Complete payment details'
            ) : (
              t.placeOrder
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};