import React, { useState } from 'react';
import { ArrowLeft, Clock, Receipt, ChevronLeft, Building2, QrCode, CreditCard, CheckCircle2, Upload, Loader2 } from 'lucide-react';
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
  const trayCountLabel = lang === 'ID'
    ? `${itemCount} item di tray Anda`
    : `${itemCount} item${itemCount === 1 ? '' : 's'} in your tray`;

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
      className="min-h-screen pb-24"
      style={{ backgroundColor: '#fcfaf7', fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="w-full max-w-6xl mx-auto min-h-screen relative">
        {/* Header / Sticky Header */}
        <div className="sticky top-0 z-30 px-6 sm:px-10 pt-6 pb-5 backdrop-blur-md border-b" style={{ backgroundColor: 'rgba(252,250,247,0.95)', borderColor: 'rgba(26,26,26,0.06)' }}>
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 transition-colors hover:bg-gray-100"
              style={{ color: '#1a1a1a', borderRadius: '1px' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-[2rem] leading-[1]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1a1a' }}>
              Reservation Folio
            </h2>
          </div>
        </div>

        <div className="px-6 sm:px-10 py-10 grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20">
          <div className="space-y-12">
            
            <section>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                <Clock className="w-4 h-4 text-[#8a7648]" />
                <h3 className="text-xs tracking-[0.25em] uppercase font-semibold" style={{ color: '#1a1a1a' }}>
                  Billing Method
                </h3>
              </div>
              <div className="grid gap-4">
                {[
                  { id: 'room', label: lang === 'ID' ? 'Tagih ke Kamar' : 'Charge to Room', desc: lang === 'ID' ? 'Akan ditambahkan ke tagihan akhir Anda' : 'Will be added to your final folio' },
                  { id: 'qris', label: 'QRIS', desc: lang === 'ID' ? 'Pembayaran instan via dompet digital' : 'Instant digital wallet payment' },
                  { id: 'bank', label: lang === 'ID' ? 'Transfer Bank' : 'Bank Transfer', desc: lang === 'ID' ? 'Nomor rekening akan ditampilkan' : 'Account details will be provided' }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className="flex flex-col text-left p-6 transition-all border"
                    style={{ 
                      backgroundColor: paymentMethod === method.id ? '#1a1a1a' : '#fff',
                      borderColor: paymentMethod === method.id ? '#1a1a1a' : 'rgba(26,26,26,0.1)',
                      color: paymentMethod === method.id ? '#fbfaf8' : '#1a1a1a',
                      borderRadius: '1px'
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-sm font-semibold tracking-wide">{method.label}</span>
                      {paymentMethod === method.id && <CheckCircle2 className="w-4 h-4 text-[#8a7648]" />}
                    </div>
                    <span className="text-xs font-light" style={{ color: paymentMethod === method.id ? 'rgba(251,250,248,0.7)' : '#574b3f' }}>{method.desc}</span>
                  </button>
                ))}
              </div>

              {paymentMethod !== 'room' && (
                <section className="mt-8 p-8 border" style={{ backgroundColor: '#fff', borderColor: 'rgba(26,26,26,0.1)', borderRadius: '1px' }}>
                  <h4 className="text-[9px] uppercase tracking-[0.3em] font-semibold mb-6" style={{ color: '#8a7648' }}>
                    {lang === 'ID' ? 'Unggah Bukti Transfer' : 'Upload Proof of Payment'}
                  </h4>
                  
                  <div className="space-y-6">
                    {paymentMethod === 'bank' && (
                      <div className="grid grid-cols-2 gap-2">
                        {BANKS.map(bank => (
                          <button 
                            key={bank.id}
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3 text-xs border ${selectedBank === bank.id ? 'bg-[#1a1a1a] text-white' : 'bg-[#fff] text-[#1a1a1a]'}`}
                            style={{ borderColor: selectedBank === bank.id ? '#1a1a1a' : 'rgba(26,26,26,0.1)', borderRadius: '1px' }}
                          >
                            {bank.name}
                          </button>
                        ))}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-light mb-4" style={{ color: '#574b3f' }}>
                        {lang === 'ID' ? 'Silakan unggah bukti tangkapan layar pembayaran Anda:' : 'Please upload your payment screenshot:'}
                      </p>
                      
                      <div 
                        className="relative border-2 border-dashed p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-[#fbfaf8]"
                        style={{ borderColor: transferProof ? '#8a7648' : 'rgba(26,26,26,0.15)', backgroundColor: '#fff', borderRadius: '1px' }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {transferProof ? (
                          <>
                            <CheckCircle2 className="w-8 h-8 text-[#8a7648] mb-4" />
                            <p className="text-sm font-semibold mb-1" style={{ color: '#1a1a1a' }}>{transferProof.name}</p>
                            <p className="text-xs text-[#8a7648]">Tap to change file</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-[#1a1a1a] opacity-30 mb-4" />
                            <p className="text-sm font-semibold mb-1" style={{ color: '#1a1a1a' }}>{lang === 'ID' ? 'Pilih berkas' : 'Select a file'}</p>
                            <p className="text-xs text-[#8a7648]">JPG, PNG max 5MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </section>
          </div>

          <div className="lg:pl-12 lg:border-l" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
            <div className="sticky top-28 bg-[#fcfaf7]">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                <Receipt className="w-4 h-4 text-[#8a7648]" />
                <h3 className="text-xs tracking-[0.25em] uppercase font-semibold" style={{ color: '#1a1a1a' }}>
                  {itemCount} {lang === 'ID' ? 'hidangan terpilih' : 'selected items'}
                </h3>
              </div>

              <div className="space-y-6 mb-10 overflow-y-auto max-h-[300px] pr-2">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.note}`} className="flex gap-5 pb-6 border-b" style={{ borderColor: 'rgba(26,26,26,0.06)' }}>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold tracking-wide" style={{ color: '#1a1a1a' }}>{item.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-semibold" style={{ color: '#8a7648' }}>{item.qty} ×</span>
                        <span className="text-xs font-semibold tracking-widest">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t mb-12" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                <div className="flex justify-between text-xs font-light" style={{ color: '#574b3f' }}>
                  <span>{t.subtotal}</span>
                  <span className="tracking-widest">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-light" style={{ color: '#574b3f' }}>
                  <span>{t.serviceTax}</span>
                  <span className="tracking-widest">{formatCurrency(taxService)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold pt-4 mt-2 border-t" style={{ borderColor: 'rgba(26,26,26,0.1)', color: '#1a1a1a' }}>
                  <span className="tracking-widest uppercase">{t.total}</span>
                  <span className="tracking-widest">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              {error && (
                <div className="p-4 mb-8 border border-red-200 bg-red-50 text-red-600 text-xs font-semibold uppercase tracking-widest rounded-sm">
                  {error}
                </div>
              )}

              <button
                onClick={() => onPlaceOrder(paymentMethod, selectedBank, transferProof)}
                disabled={loading || !canSubmit}
                className="w-full flex items-center justify-between py-5 px-6 pointer-events-auto transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:border-transparent border"
                style={{ backgroundColor: '#1c1917', color: '#ffffff', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1px' }}
              >
                <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">
                  {loading ? 'Processing...' : lang === 'ID' ? 'Konfirmasi Pesanan' : 'Finalize Reservation'}
                </span>
                {!loading ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tracking-widest">{formatCurrency(grandTotal)}</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
