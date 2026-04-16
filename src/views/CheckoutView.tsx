import React, { useState } from 'react';
import { ArrowLeft, Receipt, Building2, QrCode, CheckCircle2, Upload, Loader2 } from 'lucide-react';
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
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const selectedBankDetails = BANKS.find((bank) => bank.id === selectedBank) ?? null;

  const subtotal = calculateSubtotal(cart);
  const taxService = calculateTax(subtotal);
  const grandTotal = calculateTotal(subtotal);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTransferProof(e.target.files[0]);
    }
  };

  const canSubmit = cart.length > 0 && (
    paymentMethod === 'room'
      ? true
      : paymentMethod === 'bank'
        ? !!selectedBankDetails && !!transferProof
        : !!transferProof
  );

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);

    if (method !== 'bank') {
      setSelectedBank(null);
    }

    setTransferProof(null);
  };

  /* Shared card style */
  const cardStyle: React.CSSProperties = { backgroundColor: 'rgba(45,45,45,0.85)', border: '1px solid rgba(250,248,245,0.1)' };
  const labelColor = 'rgba(250,248,245,0.5)';
  const headingColor = '#faf8f5';
  const mutedColor = 'rgba(250,248,245,0.4)';
  const brassColor = '#a08850';

  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4 sm:px-6 overflow-y-auto relative z-10">
      {/* Background image with dark wash — matching LoginView */}
      <div className="fixed inset-0 z-0 bg-[#2d2d2d]" style={{ backgroundColor: '#2d2d2d' }}>
        <img
          src="/assets/hero.jpg"
          className="w-full h-full object-cover opacity-30"
          alt=""
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-xl mx-auto flex flex-col my-auto"
      >
        {/* Back Button */}
        <button
          onClick={onBack}
          aria-label="Back to Menu"
          className="group flex items-center gap-3 mb-6 py-1 -ml-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a08850]/50 rounded-md"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" style={{ color: 'rgba(250,248,245,0.6)' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(250,248,245,0.6)' }}>{t.backToMenu}</span>
        </button>

        {/* Page Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-4 px-6 py-6 rounded-2xl"
          style={cardStyle}
        >
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: brassColor }}>
            {lang === 'ID' ? 'Tinjau & Bayar' : 'Review & Payment'}
          </p>
          <h2 className="text-[2rem] sm:text-[2.5rem] leading-none mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: headingColor }}>
            Checkout
          </h2>
          <p className="text-[0.9rem] leading-relaxed font-light" style={{ color: labelColor }}>
            {lang === 'ID'
              ? 'Pastikan metode pembayaran dan pesanan Anda sudah sesuai.'
              : 'Select your preferred billing method and review the order folio below.'}
          </p>
        </motion.div>

        {/* Billing Method Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 px-6 py-6 rounded-2xl"
          style={cardStyle}
        >
          <div className="flex items-center gap-3 mb-5 pb-3" style={{ borderBottom: '1px solid rgba(250,248,245,0.08)' }}>
            <Receipt className="w-4 h-4" style={{ color: brassColor }} />
            <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold" style={{ color: headingColor }}>
              Billing Method
            </h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {[
              { id: 'room', label: lang === 'ID' ? 'Tagih ke Kamar' : 'Charge to Room', desc: lang === 'ID' ? 'Ditambahkan ke tagihan akhir' : 'Added to your final folio', icon: Receipt },
              { id: 'qris', label: 'QRIS', desc: lang === 'ID' ? 'Pembayaran instan e-wallet' : 'Instant digital wallet', icon: QrCode },
              { id: 'bank', label: lang === 'ID' ? 'Transfer Bank' : 'Bank Transfer', desc: lang === 'ID' ? 'Nomor rekening manual' : 'Manual account transfer', icon: Building2 }
            ].map(method => {
              const active = paymentMethod === method.id;
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodChange(method.id as PaymentMethod)}
                  aria-pressed={active}
                  className="relative flex items-center text-left p-5 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a08850]/50"
                  style={{
                    backgroundColor: active ? 'rgba(160,136,80,0.15)' : 'rgba(250,248,245,0.04)',
                    border: active ? '1px solid rgba(160,136,80,0.4)' : '1px solid rgba(250,248,245,0.08)',
                  }}
                >
                  <div className="flex-1 flex items-center gap-4">
                    <Icon className="w-5 h-5" style={{ color: active ? brassColor : 'rgba(250,248,245,0.3)' }} />
                    <div>
                      <h4 className="text-[0.95rem] font-medium tracking-wide" style={{ color: headingColor }}>{method.label}</h4>
                      <p className="text-[0.8rem] mt-0.5 font-light" style={{ color: mutedColor }}>{method.desc}</p>
                    </div>
                  </div>
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                    style={{
                      border: active ? `2px solid ${brassColor}` : '2px solid rgba(250,248,245,0.15)',
                      backgroundColor: active ? brassColor : 'transparent',
                    }}
                  >
                    {active && <CheckCircle2 className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sub-panels for payment selection */}
          <AnimatePresence>
            {paymentMethod === 'bank' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                <div className="p-5 rounded-xl" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }}>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-4" style={{ color: labelColor }}>Select Destination Bank</label>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        aria-pressed={selectedBank === bank.id}
                        className="p-4 text-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a08850]/50"
                        style={{
                          backgroundColor: selectedBank === bank.id ? 'rgba(160,136,80,0.15)' : 'rgba(250,248,245,0.04)',
                          border: selectedBank === bank.id ? `1px solid ${brassColor}` : '1px solid rgba(250,248,245,0.08)',
                          color: selectedBank === bank.id ? brassColor : 'rgba(250,248,245,0.6)',
                          fontWeight: selectedBank === bank.id ? 700 : 400,
                        }}
                      >
                        <div className="text-[0.9rem] tracking-wide">{bank.name}</div>
                      </button>
                    ))}
                  </div>
                  {selectedBankDetails && (
                    <div className="mb-6 rounded-lg p-4" style={{ backgroundColor: 'rgba(160,136,80,0.1)', border: '1px solid rgba(160,136,80,0.2)' }}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.75rem] uppercase tracking-[0.15em] mb-1.5 font-bold" style={{ color: mutedColor }}>Transfer to</p>
                          <p className="text-[1.2rem] font-medium tracking-wider mb-1" style={{ color: headingColor }}>{selectedBankDetails.code}</p>
                          <p className="text-[0.85rem] font-light" style={{ color: mutedColor }}>Atelier Meridian · {selectedBankDetails.name}</p>
                        </div>
                        <span className="px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-[0.2em]" style={{ backgroundColor: 'rgba(250,248,245,0.08)', color: headingColor }}>
                          {lang === 'ID' ? 'Kode VA' : 'VA Code'}
                        </span>
                      </div>
                    </div>
                  )}
                  {!selectedBankDetails && (
                    <p className="mb-6 text-[0.85rem] leading-relaxed font-light" style={{ color: mutedColor }}>
                      {lang === 'ID'
                        ? 'Pilih bank tujuan terlebih dahulu agar nomor virtual account muncul.'
                        : 'Select a destination bank first so the virtual account code appears.'}
                    </p>
                  )}
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: labelColor }}>Upload Proof</label>
                  <div className="relative">
                    <input type="file" aria-label="Upload transfer proof" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div
                      className="flex items-center justify-center gap-3 p-5 rounded-lg transition-colors"
                      style={{
                        border: transferProof ? `1px dashed ${brassColor}` : '1px dashed rgba(250,248,245,0.15)',
                        backgroundColor: transferProof ? 'rgba(160,136,80,0.1)' : 'transparent',
                        color: transferProof ? brassColor : 'rgba(250,248,245,0.4)',
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      <span className="font-medium text-[0.85rem] tracking-wide truncate max-w-[200px] sm:max-w-xs">{transferProof ? transferProof.name : 'Tap to upload receipt'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {paymentMethod === 'qris' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                <div className="p-5 rounded-xl" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)' }}>
                  <div className="flex justify-center mb-6">
                    <div className="w-44 h-44 rounded-lg flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: 'rgba(250,248,245,0.06)', border: '1px solid rgba(250,248,245,0.1)' }}>
                      <QrCode className="w-8 h-8 mb-3" style={{ color: 'rgba(250,248,245,0.3)' }} />
                      <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: brassColor }}>QRIS</span>
                      <span className="text-[0.8rem] leading-relaxed font-light" style={{ color: mutedColor }}>
                        {lang === 'ID' ? 'Pindai kode di meja layanan.' : 'Scan the code at the service desk.'}
                      </span>
                    </div>
                  </div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-3" style={{ color: labelColor }}>Upload Proof</label>
                  <div className="relative">
                    <input type="file" aria-label="Upload QRIS proof" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div
                      className="flex items-center justify-center gap-3 p-5 rounded-lg transition-colors"
                      style={{
                        border: transferProof ? `1px dashed ${brassColor}` : '1px dashed rgba(250,248,245,0.15)',
                        backgroundColor: transferProof ? 'rgba(160,136,80,0.1)' : 'transparent',
                        color: transferProof ? brassColor : 'rgba(250,248,245,0.4)',
                      }}
                    >
                      <Upload className="w-4 h-4" />
                      <span className="font-medium text-[0.85rem] tracking-wide truncate max-w-[200px] sm:max-w-xs">{transferProof ? transferProof.name : 'Tap to upload receipt'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mb-4 px-6 py-6 rounded-2xl"
          style={cardStyle}
        >
          <div className="mb-6 flex flex-col gap-1">
            <h3 className="text-[1.3rem] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: headingColor }}>Folio Summary</h3>
            <p className="text-[0.85rem] font-light" style={{ color: mutedColor }}>
              {lang === 'ID' ? 'Periksa rincian sebelum pesanan dikirim.' : 'Review your items before dispatch.'}
            </p>
          </div>
          
          <div className="space-y-0 mb-6">
            {cart.map((item, i) => (
              <div key={`${item.id}-${item.note}-${i}`} className="flex justify-between items-start text-[0.9rem] gap-4 py-3" style={{ borderBottom: i !== cart.length - 1 ? '1px solid rgba(250,248,245,0.06)' : 'none' }}>
                <div className="flex-1 pr-2 leading-relaxed">
                  <span className="mr-3 font-bold" style={{ color: brassColor }}>{item.qty}x</span> 
                  <span className="font-medium tracking-wide" style={{ color: headingColor }}>{item.name}</span>
                  {item.note && (
                     <p className="text-[0.8rem] mt-1 ml-7 italic" style={{ color: mutedColor }}>{item.note}</p>
                  )}
                </div>
                <span className="font-medium whitespace-nowrap pt-0.5" style={{ color: headingColor }}>{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          
          <div className="h-[1px] my-4" style={{ backgroundColor: 'rgba(250,248,245,0.08)' }} />
          
          <div className="space-y-3 mb-6 font-medium">
            <div className="flex justify-between text-[0.9rem]">
              <span style={{ color: mutedColor }}>{t.subtotal}</span>
              <span style={{ color: headingColor }}>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[0.9rem]">
              <span style={{ color: mutedColor }}>{t.serviceTax || (lang === 'ID' ? 'Service & Pajak' : 'Service & Tax')}</span>
              <span style={{ color: headingColor }}>{formatCurrency(taxService)}</span>
            </div>
            <div className="flex justify-between text-[1.3rem] font-bold mt-4 pt-4" style={{ fontFamily: "'DM Serif Display', serif", borderTop: '1px solid rgba(250,248,245,0.1)', color: headingColor }}>
              <span>{t.total}</span>
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-lg text-[0.85rem] font-medium" style={{ backgroundColor: 'rgba(180,60,60,0.2)', border: '1px solid rgba(180,60,60,0.3)', color: '#e8a0a0' }}>
              {error}
            </div>
          )}

          {!canSubmit && (
            <div className="mb-6 px-4 py-3 rounded-lg text-[0.85rem] leading-relaxed" style={{ backgroundColor: 'rgba(250,248,245,0.04)', border: '1px solid rgba(250,248,245,0.08)', color: mutedColor }}>
              {paymentMethod === 'bank'
                ? (lang === 'ID'
                  ? 'Pilih bank tujuan dan unggah bukti transfer agar pesanan dapat diproses.'
                  : 'Select a destination bank and upload transfer proof before the order can be submitted.')
                : paymentMethod === 'qris'
                  ? (lang === 'ID'
                    ? 'Unggah bukti pembayaran QRIS sebelum mengirim pesanan.'
                    : 'Upload your QRIS payment proof before submitting the order.')
                  : null}
            </div>
          )}

          <button
            onClick={() => onPlaceOrder(paymentMethod, selectedBank, transferProof)}
            disabled={!canSubmit || loading}
            className="w-full py-4 rounded-xl font-semibold text-sm tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#a08850]/50"
            style={{ backgroundColor: '#faf8f5', color: '#2d2d2d' }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <span>{t.placeOrder}</span>}
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
};
