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
      className="min-h-screen pb-32 bg-[#fdfbf9]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-5xl mx-auto min-h-screen relative">
        <div className="sticky top-0 z-30 px-6 sm:px-8 py-6 bg-[#fdfbf9]/90 backdrop-blur-md border-b border-[#e7e5e4]">
          <button
            onClick={onBack}
            aria-label="Back to Menu"
            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#1c1917] hover:text-[#a08850] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]/50 rounded-md px-2 py-1 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToMenu}</span>
          </button>
        </div>

        <div className="px-6 sm:px-8 pt-10 pb-16">
          <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[#a08850]">
                {lang === 'ID' ? 'Tinjau Sebelum Bayar' : 'Review Before Payment'}
              </p>
              <h2 className="text-[2.5rem] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: '#1c1917' }}>
                Checkout
              </h2>
              <p className="mt-3 max-w-2xl text-[0.98rem] leading-relaxed text-[#57534e]">
                {lang === 'ID'
                  ? 'Pastikan metode pembayaran, detail transfer, dan item pesanan sudah benar sebelum mengirim pesanan.'
                  : 'Confirm your payment method, transfer details, and line items before sending the order to the kitchen.'}
              </p>
            </div>
            <div className="inline-flex items-center gap-3 self-start rounded-full border border-[#e7e5e4] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1c1917]">
              <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
              <span className="h-1 w-1 rounded-full bg-[#a08850]" />
              <span>{formatCurrency(grandTotal)}</span>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            <div className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#e7e5e4]">
                  <Receipt className="w-4 h-4 text-[#a08850]" />
                  <h3 className="text-[12px] tracking-widest uppercase font-bold text-[#1c1917]">
                    Billing Method
                  </h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  {[
                    { id: 'room', label: lang === 'ID' ? 'Tagih ke Kamar' : 'Charge to Room', desc: lang === 'ID' ? 'Akan ditambahkan ke tagihan akhir' : 'Will be added to your final folio', icon: Receipt },
                    { id: 'qris', label: 'QRIS', desc: lang === 'ID' ? 'Pembayaran instan dompet digital' : 'Instant digital wallet payment', icon: QrCode },
                    { id: 'bank', label: lang === 'ID' ? 'Transfer Bank' : 'Bank Transfer', desc: lang === 'ID' ? 'Nomor rekening akan ditampilkan' : 'Account details will be provided', icon: Building2 }
                  ].map(method => {
                    const active = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => handlePaymentMethodChange(method.id as PaymentMethod)}
                        aria-pressed={active}
                        className={`relative flex items-center text-left p-5 transition-colors focus-visible:outline-none rounded-sm border ${
                          active 
                            ? 'bg-[#1c1917] border-[#1c1917] text-[#ffffff] shadow-lg' 
                            : 'bg-[#ffffff] text-[#1c1917] hover:bg-[#f5f5f4] border-[#e7e5e4]'
                        }`}
                      >
                        <div className="flex-1 flex items-center gap-4">
                          <Icon className={`w-5 h-5 ${active ? 'text-[#a08850]' : 'text-stone-500'}`} />
                          <div>
                            <h4 className={`text-[1rem] font-bold ${active ? 'text-[#ffffff]' : 'text-[#1c1917]'}`}>{method.label}</h4>
                            <p className={`text-[0.85rem] mt-0.5 ${active ? 'text-[rgba(255,255,255,0.7)]' : 'text-[#78716c]'}`}>{method.desc}</p>
                          </div>
                        </div>
                        {active && <CheckCircle2 className="w-5 h-5 text-[#a08850]" />}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-panels for payment selection */}
                <AnimatePresence>
                  {paymentMethod === 'bank' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                      <div className="p-6 bg-[#f5f5f4] rounded-sm">
                        <label className="block text-[11px] uppercase tracking-widest font-bold mb-4 text-[#1c1917]">Select Destination Bank</label>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {BANKS.map((bank) => (
                            <button
                              key={bank.id}
                              onClick={() => setSelectedBank(bank.id)}
                              aria-pressed={selectedBank === bank.id}
                              className={`p-4 text-center border transition-colors focus-visible:outline-none rounded-sm bg-[#ffffff] ${selectedBank === bank.id ? 'border-[#1c1917] text-[#1c1917] font-bold shadow-md' : 'border-[#e7e5e4] text-[#78716c] hover:border-[#1c1917]/30'}`}
                            >
                              <div className="text-[1rem]">{bank.name}</div>
                            </button>
                          ))}
                        </div>
                        {selectedBankDetails && (
                          <div className="mb-6 rounded-sm border border-[#e7e5e4] bg-[#ffffff] p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[0.8rem] text-[#78716c] uppercase tracking-widest mb-1 font-bold">Transfer to</p>
                                <p className="text-[1.2rem] font-medium text-[#1c1917] tracking-wider mb-1">{selectedBankDetails.code}</p>
                                <p className="text-[0.95rem] text-[#1c1917]">Atelier Meridian · {selectedBankDetails.name}</p>
                              </div>
                              <span className="rounded-full bg-[#f5f5f4] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#78716c]">
                                {lang === 'ID' ? 'Kode VA' : 'VA Code'}
                              </span>
                            </div>
                          </div>
                        )}
                        {!selectedBankDetails && (
                          <p className="mb-6 text-[0.9rem] leading-relaxed text-[#78716c]">
                            {lang === 'ID'
                              ? 'Pilih bank tujuan terlebih dahulu agar nomor virtual account muncul.'
                              : 'Select a destination bank first so the virtual account code appears.'}
                          </p>
                        )}
                        <label className="block text-[11px] uppercase tracking-widest font-bold mb-4 text-[#1c1917]">Upload Proof</label>
                        <div className="relative">
                          <input type="file" aria-label="Upload transfer proof" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`flex items-center justify-center gap-3 p-4 border border-dashed rounded-sm ${transferProof ? 'bg-white border-[#1c1917] text-[#1c1917]' : 'border-[#a8a29e] text-[#78716c] bg-[#ffffff] hover:bg-[#fdfbf9]'}`}>
                            <Upload className="w-5 h-5" />
                            <span className="font-medium text-[0.95rem] truncate max-w-[200px] sm:max-w-xs">{transferProof ? transferProof.name : 'Tap to upload receipt'}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'qris' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                      <div className="p-6 bg-[#f5f5f4] rounded-sm">
                        <div className="flex justify-center mb-6">
                            <div className="w-48 h-48 bg-[#ffffff] border border-[#e7e5e4] flex flex-col items-center justify-center rounded-sm px-5 text-center text-[#a8a29e] shadow-sm">
                                <span className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#78716c]">QRIS</span>
                                <span className="text-[0.92rem] leading-relaxed">
                                  {lang === 'ID' ? 'Scan kode di meja layanan lalu unggah bukti pembayaran.' : 'Scan the code at the service desk, then upload your payment proof.'}
                                </span>
                            </div>
                        </div>
                        <label className="block text-[11px] uppercase tracking-widest font-bold mb-4 text-[#1c1917]">Upload Proof</label>
                        <div className="relative">
                          <input type="file" aria-label="Upload QRIS proof" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`flex items-center justify-center gap-3 p-4 border border-dashed rounded-sm ${transferProof ? 'bg-[#ffffff] border-[#1c1917] text-[#1c1917]' : 'border-[#a8a29e] text-[#78716c] bg-[#ffffff] hover:bg-[#fdfbf9]'}`}>
                            <Upload className="w-5 h-5" />
                            <span className="font-medium text-[0.95rem] truncate max-w-[200px] sm:max-w-xs">{transferProof ? transferProof.name : 'Tap to upload receipt'}</span>
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
              <div className="bg-[#ffffff] border border-[#e7e5e4] p-6 lg:p-8 rounded-sm shadow-xl sticky top-32">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[1.2rem] font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: '#1c1917' }}>Order Summary</h3>
                    <p className="mt-2 text-[0.9rem] leading-relaxed text-[#78716c]">
                      {lang === 'ID' ? 'Periksa item, catatan, dan total akhir sebelum mengirim pesanan.' : 'Review line items, notes, and the final total before placing the order.'}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f5f5f4] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#78716c]">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <div className="space-y-0 mb-6">
                  {cart.map((item, i) => (
                    <div key={`${item.id}-${item.note}`} className={`flex justify-between items-start text-[0.95rem] gap-4 py-3 ${i !== cart.length - 1 ? 'border-b border-[#f5f5f4]' : ''}`}>
                      <div className="text-[#44403c] flex-1 pr-2 leading-relaxed">
                        <span className="text-[#a08850] mr-3 font-bold">{item.qty}x</span> 
                        <span className="font-medium text-[#1c1917]">{item.name}</span>
                        {item.note && (
                           <p className="text-[0.8rem] text-[#a8a29e] mt-1 ml-7">{item.note}</p>
                        )}
                      </div>
                      <span className="text-[#1c1917] font-medium whitespace-nowrap pt-0.5">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="h-px bg-[#e7e5e4] mb-6" />
                
                <div className="space-y-3 mb-6 font-medium">
                  <div className="flex justify-between text-[#78716c] text-[0.95rem]">
                    <span>{t.subtotal}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#78716c] text-[0.95rem]">
                    <span>{t.serviceTax || (lang === 'ID' ? 'Service & Pajak' : 'Service & Tax')}</span>
                    <span>{formatCurrency(taxService)}</span>
                  </div>
                  <div className="flex justify-between text-[#1c1917] text-[1.2rem] font-bold mt-4" style={{ fontFamily: "'DM Serif Display', serif" }}>
                    <span>{t.total}</span>
                    <span>{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-[#fef2f2] text-[#b91c1c] text-[0.85rem] rounded-md font-medium">
                    {error}
                  </div>
                )}

                {!canSubmit && (
                  <div className="mb-6 rounded-sm border border-[#e7e5e4] bg-[#f5f5f4] px-4 py-3 text-[0.9rem] leading-relaxed text-[#57534e]">
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
                  className="w-full h-14 flex items-center justify-center gap-2 bg-[#1c1917] text-[#ffffff] disabled:bg-[#e7e5e4] disabled:text-[#a8a29e] hover:bg-[#2d2d2d] transition-colors focus-visible:outline-none rounded-sm shadow-md"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="text-[12px] uppercase tracking-widest font-bold">{t.placeOrder}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
