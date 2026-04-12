import React, { useState } from 'react';
import { ArrowLeft, Clock, Receipt, Building2, QrCode, CheckCircle2, Upload, Loader2 } from 'lucide-react';
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
            className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-[#1c1917] hover:text-[#a08850] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.backToMenu}</span>
          </button>
        </div>

        <div className="px-6 sm:px-8 pt-10 pb-16">
          <h2 className="text-[2.5rem] leading-none mb-10" style={{ fontFamily: "'DM Serif Display', serif", color: '#1c1917' }}>
            Checkout
          </h2>
          
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
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`relative flex items-center text-left p-5 transition-all outline-none rounded-lg ${
                          active 
                            ? 'bg-[#1c1917] text-white' 
                            : 'bg-transparent text-[#1c1917] hover:bg-[#f5f5f4] border border-[#e7e5e4]'
                        }`}
                      >
                        <div className="flex-1 flex items-center gap-4">
                          <Icon className={`w-5 h-5 ${active ? 'text-[#a08850]' : 'text-[#78716c]'}`} />
                          <div>
                            <h4 className={`text-[1rem] font-bold ${active ? 'text-white' : 'text-[#1c1917]'}`}>{method.label}</h4>
                            <p className={`text-[0.85rem] mt-0.5 ${active ? 'text-[#a8a29e]' : 'text-[#78716c]'}`}>{method.desc}</p>
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
                      <div className="p-6 bg-[#f5f5f4] rounded-lg">
                        <label className="block text-[11px] uppercase tracking-widest font-bold mb-4 text-[#1c1917]">Select Destination Bank</label>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {Object.entries(BANKS).map(([id, bank]) => (
                            <button
                              key={id}
                              onClick={() => setSelectedBank(id)}
                              className={`p-4 text-center border transition-all rounded-md bg-white ${selectedBank === id ? 'border-[#1c1917] text-[#1c1917] font-bold' : 'border-[#e7e5e4] text-[#78716c] hover:border-[#1c1917]/30'}`}
                            >
                              <div className="text-[1rem]">{bank.name}</div>
                            </button>
                          ))}
                        </div>
                        {selectedBank && (
                          <div className="mb-6 p-4 bg-white border border-[#e7e5e4] rounded-md">
                            <p className="text-[0.8rem] text-[#78716c] uppercase tracking-widest mb-1 font-bold">Transfer to</p>
                            <p className="text-[1.2rem] font-medium text-[#1c1917] tracking-wider mb-1">{BANKS[selectedBank as keyof typeof BANKS].account}</p>
                            <p className="text-[0.95rem] text-[#1c1917]">Atelier Meridian</p>
                          </div>
                        )}
                        <label className="block text-[11px] uppercase tracking-widest font-bold mb-4 text-[#1c1917]">Upload Proof</label>
                        <div className="relative">
                          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`flex items-center justify-center gap-3 p-4 border border-dashed rounded-md ${transferProof ? 'bg-white border-[#1c1917] text-[#1c1917]' : 'border-[#a8a29e] text-[#78716c] bg-white hover:bg-[#fdfbf9]'}`}>
                            <Upload className="w-5 h-5" />
                            <span className="font-medium text-[0.95rem]">{transferProof ? transferProof.name : 'Tap to upload receipt'}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'qris' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-4">
                      <div className="p-6 bg-[#f5f5f4] rounded-lg">
                        <div className="flex justify-center mb-6">
                            <div className="w-48 h-48 bg-white border border-[#e7e5e4] flex items-center justify-center text-[#a8a29e] rounded-md shadow-sm">
                                [QRIS Placeholder]
                            </div>
                        </div>
                        <label className="block text-[11px] uppercase tracking-widest font-bold mb-4 text-[#1c1917]">Upload Proof</label>
                        <div className="relative">
                          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className={`flex items-center justify-center gap-3 p-4 border border-dashed rounded-md ${transferProof ? 'bg-white border-[#1c1917] text-[#1c1917]' : 'border-[#a8a29e] text-[#78716c] bg-white hover:bg-[#fdfbf9]'}`}>
                            <Upload className="w-5 h-5" />
                            <span className="font-medium text-[0.95rem]">{transferProof ? transferProof.name : 'Tap to upload receipt'}</span>
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
              <div className="bg-[#ffffff] border border-[#e7e5e4] p-6 lg:p-8 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.02)] sticky top-32">
                <h3 className="text-[1.2rem] font-bold mb-6" style={{ fontFamily: "'DM Serif Display', serif", color: '#1c1917' }}>Order Summary</h3>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={`${item.id}-${item.note}`} className="flex justify-between text-[0.95rem]">
                      <span className="text-[#44403c]"><span className="text-[#a08850] mr-2">{item.qty}x</span> {item.name}</span>
                      <span className="text-[#1c1917] font-medium">{formatCurrency(item.price * item.qty)}</span>
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
                    <span>{t.tax}</span>
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

                <button
                  onClick={() => onPlaceOrder(paymentMethod, selectedBank, transferProof)}
                  disabled={!canSubmit || loading}
                  className="w-full h-14 flex items-center justify-center gap-2 bg-[#1c1917] text-white disabled:bg-[#e7e5e4] disabled:text-[#a8a29e] hover:bg-[#2d2d2d] transition-all rounded-full"
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
