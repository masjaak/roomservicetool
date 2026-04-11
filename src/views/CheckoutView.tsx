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

        <div className="p-6">
          <h3 className="text-xl mb-6" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>{t.paymentMethod}</h3>
          
          <div className="space-y-4">
            {([
              { method: 'room' as PaymentMethod, icon: Building2, label: t.chargeRoom },
              { method: 'qris' as PaymentMethod, icon: QrCode, label: 'QRIS / E-Wallet' },
              { method: 'bank' as PaymentMethod, icon: CreditCard, label: t.bankTransfer },
            ]).map(({ method, icon: Icon, label }) => (
              <label
                key={method}
                className="flex items-center gap-4 p-4 cursor-pointer transition-all w-full border"
                style={{
                  borderColor: paymentMethod === method ? '#2d2d2d' : 'rgba(45,45,45,0.1)',
                  backgroundColor: paymentMethod === method ? '#faf8f5' : 'transparent',
                }}
              >
                <input type="radio" name="pay" className="hidden" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                <div className="p-2 shrink-0 border" style={{ backgroundColor: paymentMethod === method ? '#2d2d2d' : '#fff', borderColor: 'rgba(45,45,45,0.1)', color: paymentMethod === method ? '#fff' : '#b8a898' }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm" style={{ color: '#2d2d2d' }}>{label}</span>
                </div>
                {paymentMethod === method && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2d2d2d' }} />}
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
                <div className="mt-8">
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#888' }}>{t.selectBank || 'Select Bank'}</p>
                  <div className="flex flex-col gap-2 mb-6">
                    {BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className="px-4 py-3 text-sm font-semibold transition-all text-left border"
                        style={
                          selectedBank === bank.id
                            ? { backgroundColor: 'transparent', color: '#2d2d2d', borderColor: '#2d2d2d' }
                            : { backgroundColor: 'transparent', color: '#888', borderColor: 'rgba(45,45,45,0.1)' }
                        }
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                  {selectedBank && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 text-center mb-4 border"
                      style={{ backgroundColor: '#fff', borderColor: 'rgba(45,45,45,0.1)' }}
                    >
                      <p className="text-[9px] uppercase tracking-widest font-bold mb-2" style={{ color: '#888' }}>{t.vaNumber || 'Virtual Account Number'}</p>
                      <p className="text-2xl font-mono tracking-widest select-all cursor-pointer" style={{ color: '#2d2d2d' }}>
                        {BANKS.find((b) => b.id === selectedBank)?.code}<span style={{ color: '#a08850' }}>{phoneNumber}</span>
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
                <div className="mt-8 p-8 flex flex-col items-center text-center border bg-white" style={{ borderColor: 'rgba(45,45,45,0.1)' }}>
                  <img src="/assets/qris.svg" className="w-32 h-32 opacity-90 mb-4" alt="QRIS" />
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#888' }}>{t.scanQris}</p>
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
                <div className="mt-8 pt-8 border-t" style={{ borderColor: 'rgba(45,45,45,0.06)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#888' }}>{t.uploadProof}</p>
                  <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer transition-all group relative overflow-hidden bg-white" style={{ border: '1px dashed rgba(45,45,45,0.3)' }}>
                    <div className="flex flex-col items-center justify-center relative z-10">
                      {transferProof ? (
                        <div className="flex flex-col items-center px-4 text-center" style={{ color: '#a08850' }}>
                          <CheckCircle2 className="w-6 h-6 mb-2" />
                          <p className="text-xs font-semibold break-all line-clamp-1">{transferProof.name}</p>
                          <p className="text-[9px] uppercase tracking-widest font-bold mt-1" style={{ color: '#a08850' }}>{t.fileSelected}</p>
                        </div>
                      ) : (
                        <>
                          <div className="w-10 h-10 flex items-center justify-center mb-2 border rounded" style={{ borderColor: 'rgba(45,45,45,0.1)' }}>
                            <Upload className="w-4 h-4" style={{ color: '#2d2d2d' }} />
                          </div>
                          <p className="text-[11px] font-semibold" style={{ color: '#2d2d2d' }}>{t.uploadPrompt}</p>
                          <p className="text-[9px] uppercase tracking-widest font-bold mt-1" style={{ color: '#888' }}>JPG, PNG</p>
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

        {/* Summary Footer */}
        <div className="mt-4 p-6 bg-white" style={{ borderTop: '1px solid rgba(45,45,45,0.06)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>{t.summary || 'Summary'}</h3>
          <div className="space-y-3 mb-6 font-medium text-sm">
            <div className="flex justify-between" style={{ color: '#888' }}>
              <span>{t.subtotal}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between" style={{ color: '#888' }}>
              <span>{t.serviceTax}</span>
              <span>{formatCurrency(taxService)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 mt-2" style={{ borderTop: '1px dashed rgba(45,45,45,0.15)', color: '#2d2d2d' }}>
              <span>{t.total}</span>
              <span style={{ color: '#a08850' }}>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 rounded text-[11px] font-bold tracking-wide uppercase text-center border" style={{ backgroundColor: 'transparent', color: '#c45050', borderColor: 'rgba(180,60,60,0.3)' }}>
              {error}
            </motion.div>
          )}

          <button
            onClick={() => onPlaceOrder(paymentMethod, selectedBank, transferProof)}
            disabled={loading || !canSubmit}
            className="w-full py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all active:scale-[0.98]"
            style={
              loading || !canSubmit
                ? { backgroundColor: 'transparent', border: '1px solid rgba(45,45,45,0.1)', color: '#888', cursor: 'not-allowed' }
                : { backgroundColor: '#2d2d2d', color: '#faf8f5', border: '1px solid transparent' }
            }
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.processing}
              </span>
            ) : !canSubmit ? (
              'Complete Details'
            ) : (
              t.placeOrder
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};