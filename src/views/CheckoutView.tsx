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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen pb-32 bg-[#fcfbf9]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-5xl mx-auto min-h-screen relative">
        <div className="sticky top-0 z-30 px-6 sm:px-12 py-6 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-[#e7e5e4]">
          <button
            onClick={onBack}
            aria-label="Back to Menu"
            className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1c1917] hover:text-[#a08850] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]/50 rounded-md py-1 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{t.backToMenu}</span>
          </button>
        </div>

        <div className="px-6 sm:px-12 pt-12 pb-24">
          <div className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a08850]">
                {lang === 'ID' ? 'Tinjau & Bayar' : 'Review & Payment'}
              </p>
              <h2 className="text-[3rem] leading-none text-[#1c1917]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                Checkout
              </h2>
              <p className="mt-4 max-w-xl text-[1rem] leading-relaxed text-[#57534e] font-light">
                {lang === 'ID'
                  ? 'Pastikan metode pembayaran dan pesanan Anda sudah sesuai. Tagihan akhir dapat ditambahkan ke riwayat folio kamar.'
                  : 'Select your preferred billing method and review the order folio below before sending to the kitchen.'}
              </p>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-[1fr_400px] gap-16">
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[#e7e5e4]">
                  <Receipt className="w-4 h-4 text-[#a08850]" />
                  <h3 className="text-[11px] tracking-[0.2em] uppercase font-bold text-[#1c1917]">
                    Billing Method
                  </h3>
                </div>
                
                <div className="flex flex-col gap-4">
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
                        className={`relative flex items-center text-left p-6 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a08850]/50 border ${
                          active 
                            ? 'bg-[#fcfbf9] border-[#a08850] shadow-[inset_4px_0_0_0_#a08850]' 
                            : 'bg-white border-[#e7e5e4] hover:border-[#d6d3d1]'
                        }`}
                      >
                        <div className="flex-1 flex items-center gap-5">
                          <Icon className={`w-5 h-5 ${active ? 'text-[#a08850]' : 'text-[#a8a29e]'}`} />
                          <div>
                            <h4 className="text-[1.05rem] font-medium text-[#1c1917] tracking-wide">{method.label}</h4>
                            <p className="text-[0.9rem] mt-1 text-[#78716c] font-light">{method.desc}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${active ? 'border-[#a08850] bg-[#a08850]' : 'border-[#d6d3d1] bg-transparent'}`}>
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
                      <div className="p-8 bg-white border border-[#e7e5e4] border-t-0 mt-[-2px]">
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-5 text-[#1c1917]">Select Destination Bank</label>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                          {BANKS.map((bank) => (
                            <button
                              key={bank.id}
                              onClick={() => setSelectedBank(bank.id)}
                              aria-pressed={selectedBank === bank.id}
                              className={`p-5 text-center border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a08850]/50 bg-white ${selectedBank === bank.id ? 'border-[#a08850] text-[#a08850] font-bold shadow-[inset_2px_0_0_0_#a08850]' : 'border-[#e7e5e4] text-[#78716c] hover:border-[#d6d3d1]'}`}
                            >
                              <div className="text-[1rem] tracking-wide">{bank.name}</div>
                            </button>
                          ))}
                        </div>
                        {selectedBankDetails && (
                          <div className="mb-8 border border-[#e7e5e4] bg-[#fcfbf9] p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[0.8rem] text-[#78716c] uppercase tracking-[0.15em] mb-1.5 font-bold">Transfer to</p>
                                <p className="text-[1.3rem] font-medium text-[#1c1917] tracking-wider mb-1.5">{selectedBankDetails.code}</p>
                                <p className="text-[0.95rem] text-[#78716c] font-light">Atelier Meridian · {selectedBankDetails.name}</p>
                              </div>
                              <span className="bg-white border border-[#e7e5e4] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#1c1917]">
                                {lang === 'ID' ? 'Kode VA' : 'VA Code'}
                              </span>
                            </div>
                          </div>
                        )}
                        {!selectedBankDetails && (
                          <p className="mb-8 text-[0.95rem] leading-relaxed text-[#78716c] font-light">
                            {lang === 'ID'
                              ? 'Pilih bank tujuan terlebih dahulu agar nomor virtual account muncul.'
                              : 'Select a destination bank first so the virtual account code appears.'}
                          </p>
                        )}
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-4 text-[#1c1917]">Upload Proof</label>
                        <div className="relative">
                          <input type="file" aria-label="Upload transfer proof" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`flex items-center justify-center gap-3 p-5 border border-dashed ${transferProof ? 'bg-[#fcfbf9] border-[#a08850] text-[#a08850]' : 'border-[#d6d3d1] text-[#78716c] hover:bg-[#fcfbf9] transition-colors'}`}>
                            <Upload className="w-4 h-4" />
                            <span className="font-medium text-[0.95rem] tracking-wide truncate max-w-[200px] sm:max-w-xs">{transferProof ? transferProof.name : 'Tap to upload receipt'}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'qris' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                      <div className="p-8 bg-white border border-[#e7e5e4] border-t-0 mt-[-2px]">
                        <div className="flex justify-center mb-8">
                            <div className="w-48 h-48 bg-[#fcfbf9] border border-[#e7e5e4] flex flex-col items-center justify-center p-6 text-center shadow-sm">
                                <QrCode className="w-8 h-8 text-[#a8a29e] mb-4" />
                                <span className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a08850]">QRIS</span>
                                <span className="text-[0.85rem] leading-relaxed text-[#78716c] font-light">
                                  {lang === 'ID' ? 'Pindai kode di meja layanan.' : 'Scan the code at the service desk.'}
                                </span>
                            </div>
                        </div>
                        <label className="block text-[10px] uppercase tracking-[0.2em] font-bold mb-4 text-[#1c1917]">Upload Proof</label>
                        <div className="relative">
                          <input type="file" aria-label="Upload QRIS proof" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`flex items-center justify-center gap-3 p-5 border border-dashed ${transferProof ? 'bg-[#fcfbf9] border-[#a08850] text-[#a08850]' : 'border-[#d6d3d1] text-[#78716c] hover:bg-[#fcfbf9] transition-colors'}`}>
                            <Upload className="w-4 h-4" />
                            <span className="font-medium text-[0.95rem] tracking-wide truncate max-w-[200px] sm:max-w-xs">{transferProof ? transferProof.name : 'Tap to upload receipt'}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>

            {/* Order Summary Side */}
            <div>
              <div className="bg-[#ffffff] border border-[#e7e5e4] p-8 lg:p-10 sticky top-32">
                <div className="mb-8 flex flex-col gap-2">
                  <h3 className="text-[1.5rem] leading-none text-[#1c1917]" style={{ fontFamily: "'DM Serif Display', serif" }}>Folio Summary</h3>
                  <p className="text-[0.95rem] font-light text-[#78716c]">
                    {lang === 'ID' ? 'Periksa rincian sebelum pesanan dikirim.' : 'Review your items before dispatch.'}
                  </p>
                </div>
                
                <div className="space-y-0 mb-8">
                  {cart.map((item, i) => (
                    <div key={`${item.id}-${item.note}-${i}`} className={`flex justify-between items-start text-[0.95rem] gap-4 py-4 ${i !== cart.length - 1 ? 'border-b border-[#f5f5f4]' : ''}`}>
                      <div className="text-[#44403c] flex-1 pr-2 leading-relaxed">
                        <span className="text-[#a08850] mr-4 font-bold">{item.qty}x</span> 
                        <span className="font-medium text-[#1c1917] tracking-wide">{item.name}</span>
                        {item.note && (
                           <p className="text-[0.85rem] text-[#a8a29e] mt-1.5 ml-8 italic">{item.note}</p>
                        )}
                      </div>
                      <span className="text-[#1c1917] font-medium whitespace-nowrap pt-0.5">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="h-[1px] bg-[#e7e5e4] my-6" />
                
                <div className="space-y-4 mb-8 font-medium">
                  <div className="flex justify-between text-[#78716c] text-[0.95rem]">
                    <span>{t.subtotal}</span>
                    <span className="text-[#1c1917]">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#78716c] text-[0.95rem]">
                    <span>{t.serviceTax || (lang === 'ID' ? 'Service & Pajak' : 'Service & Tax')}</span>
                    <span className="text-[#1c1917]">{formatCurrency(taxService)}</span>
                  </div>
                  <div className="flex justify-between text-[#1c1917] text-[1.4rem] font-bold mt-6 pt-6 border-t border-[#e7e5e4]" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    <span>{t.total}</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-[0.85rem] font-medium">
                    {error}
                  </div>
                )}

                {!canSubmit && (
                  <div className="mb-8 border border-[#e7e5e4] bg-[#fcfbf9] px-5 py-4 text-[0.9rem] leading-relaxed text-[#57534e]">
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
                  className="w-full h-16 flex items-center justify-center gap-3 bg-[#1c1917] text-white disabled:bg-[#e7e5e4] disabled:text-[#a8a29e] hover:bg-[#2d2d2d] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1c1917]/50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-[11px] uppercase tracking-[0.2em] font-bold">{t.placeOrder}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
