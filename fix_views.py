import os

def overwrite(path, content):
    with open(path, 'w') as f:
        f.write(content)

# CheckoutView.tsx - Keep same text/test-IDs but massive luxury UI upgrade
checkout_view = """import React, { useState } from 'react';
import { ArrowLeft, Clock, Receipt, ChevronLeft, Building2, QrCode, CreditCard, CheckCircle2, Upload, Loader2, Info } from 'lucide-react';
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
    ? `${itemCount} hidangan terpilih`
    : `${itemCount} selected items`;

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
      className="min-h-screen pb-32"
      style={{ backgroundColor: '#fdfbf9', fontFamily: "'Manrope', sans-serif" }}
    >
      <div className="w-full max-w-6xl mx-auto min-h-screen relative">
        <div className="sticky top-0 z-30 px-6 sm:px-12 py-6 bg-[#fdfbf9]/95 backdrop-blur-md border-b-2 border-[#e7e5e4]">
          <button
            onClick={onBack}
            className="flex items-center gap-4 text-[12px] font-bold uppercase tracking-[0.2em] text-[#1c1917] hover:opacity-50 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t.backToMenu}</span>
          </button>
        </div>

        <div className="px-6 sm:px-12 pt-12 pb-16">
          <h2 className="text-[2.5rem] sm:text-[3.5rem] leading-[1] mb-12" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 500 }}>
            Reservation Folio
          </h2>
          
          <div className="grid lg:grid-cols-[1fr_450px] gap-16">
            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-[#e7e5e4]">
                  <Clock className="w-5 h-5 text-[#1c1917]" />
                  <h3 className="text-[14px] tracking-[0.2em] uppercase font-bold text-[#1c1917]">
                    Billing Method
                  </h3>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { id: 'room', label: lang === 'ID' ? 'Tagih ke Kamar' : 'Charge to Room', desc: lang === 'ID' ? 'Akan ditambahkan ke tagihan akhir Anda' : 'Will be added to your final folio', icon: Receipt },
                    { id: 'qris', label: 'QRIS', desc: lang === 'ID' ? 'Pembayaran instan via dompet digital' : 'Instant digital wallet payment', icon: QrCode },
                    { id: 'bank', label: lang === 'ID' ? 'Transfer Bank' : 'Bank Transfer', desc: lang === 'ID' ? 'Nomor rekening akan ditampilkan' : 'Account details will be provided', icon: Building2 }
                  ].map(method => {
                    const active = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`relative flex flex-col text-left p-6 sm:p-8 transition-all border-2 ${active ? 'border-[#1c1917] bg-[#1c1917] text-white' : 'border-[#e7e5e4] bg-[#ffffff] text-[#1c1917] hover:border-[#1c1917]'}`}
                      >
                        <div className="flex items-center justify-between w-full mb-4">
                          <span className="text-[1.1rem] font-bold tracking-wide">{method.label}</span>
                          <Icon className={`w-6 h-6 ${active ? 'text-white' : 'text-[#78716c]'}`} />
                        </div>
                        <span className={`text-[0.95rem] leading-relaxed ${active ? 'text-white/80' : 'text-[#574b3f]'}`}>{method.desc}</span>
                      </button>
                    )
                  })}
                </div>

                {paymentMethod !== 'room' && (
                  <section className="mt-8 p-8 border-2 border-[#e7e5e4] bg-[#ffffff]">
                    <h4 className="text-[12px] uppercase tracking-[0.2em] font-bold mb-6 text-[#1c1917]">
                      {lang === 'ID' ? 'Unggah Bukti Transfer' : 'Upload Proof of Payment'}
                    </h4>
                    
                    <div className="space-y-8">
                      {paymentMethod === 'bank' && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {BANKS.map(bank => (
                            <button 
                              key={bank.id}
                              onClick={() => setSelectedBank(bank.id)}
                              className={`p-4 text-[1rem] font-bold border-2 transition-colors ${selectedBank === bank.id ? 'bg-[#1c1917] text-white border-[#1c1917]' : 'bg-[#f5f5f4] text-[#1c1917] border-transparent hover:border-[#1c1917]'}`}
                            >
                              {bank.name}
                            </button>
                          ))}
                        </div>
                      )}
                      <div>
                        <p className="text-[1rem] font-normal mb-4 text-[#574b3f]">
                          {lang === 'ID' ? 'Silakan unggah bukti tangkapan layar pembayaran Anda:' : 'Please upload your payment screenshot:'}
                        </p>
                        
                        <div 
                          className={`relative border-2 border-dashed p-12 flex flex-col items-center justify-center text-center transition-colors hover:bg-[#f5f5f4] ${transferProof ? 'border-[#1c1917] bg-[#f5f5f4]' : 'border-[#d6d3d1] bg-[#ffffff]'}`}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          {transferProof ? (
                            <>
                              <CheckCircle2 className="w-10 h-10 text-[#1c1917] mb-4" />
                              <p className="text-[1.1rem] font-bold mb-2 text-[#1c1917]">{transferProof.name}</p>
                              <p className="text-[0.95rem] font-bold uppercase tracking-[0.1em] text-[#78716c]">Tap to change file</p>
                            </>
                          ) : (
                            <>
                              <Upload className="w-10 h-10 text-[#1c1917] opacity-50 mb-4" />
                              <p className="text-[1.1rem] font-bold mb-2 text-[#1c1917]">{lang === 'ID' ? 'Pilih berkas' : 'Select a file'}</p>
                              <p className="text-[0.9rem] font-bold uppercase tracking-[0.1em] text-[#78716c]">JPG, PNG max 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </section>
            </div>

            <div className="lg:pl-6">
              <div className="bg-[#ffffff] border-2 border-[#1c1917] p-8 sm:p-10 h-fit sticky top-28">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-[#e7e5e4]">
                  <Receipt className="w-5 h-5 text-[#1c1917]" />
                  <h3 className="text-[12px] tracking-[0.2em] uppercase font-bold text-[#1c1917]">
                    {trayCountLabel}
                  </h3>
                </div>

                <div className="space-y-6 mb-10 overflow-y-auto max-h-[400px] pr-2">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.note}`} className="flex gap-5 pb-6 border-b-2 border-[#f5f5f4]">
                      <div className="flex-1 min-w-0">
                        <p className="text-[1.1rem] font-bold text-[#1c1917] mb-2">{item.name}</p>
                        <div className="flex justify-between items-center text-[#574b3f]">
                          <span className="text-[1rem] font-semibold">{item.qty} ×</span>
                          <span className="text-[1rem] font-semibold tracking-wider text-[#1c1917]">{formatCurrency(item.price * item.qty)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t-2 border-[#e7e5e4] mb-12">
                  <div className="flex justify-between text-[1rem] font-normal text-[#574b3f]">
                    <span>{t.subtotal}</span>
                    <span className="tracking-widest">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[1rem] font-normal text-[#574b3f]">
                    <span>{t.serviceTax}</span>
                    <span className="tracking-widest">{formatCurrency(taxService)}</span>
                  </div>
                  <div className="flex justify-between text-[1.4rem] font-bold pt-6 mt-4 border-t-2 border-[#1c1917] text-[#1c1917]">
                    <span className="uppercase">{t.total}</span>
                    <span className="tracking-widest">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 mb-8 bg-[#fef2f2] border-2 border-[#ef4444] text-[#b91c1c] text-[1rem] font-bold">
                    {error}
                  </div>
                )}

                <button
                  onClick={() => onPlaceOrder(paymentMethod, selectedBank, transferProof)}
                  disabled={loading || !canSubmit}
                  className="w-full h-16 sm:h-20 flex items-center justify-between px-6 sm:px-8 text-[12px] sm:text-[14px] uppercase tracking-[0.25em] font-bold transition-all bg-[#1c1917] text-[#ffffff] hover:bg-black disabled:opacity-50 disabled:bg-[#d6d3d1]"
                >
                  <span>
                    {loading ? 'Processing...' : lang === 'ID' ? 'Konfirmasi' : 'Finalize Reservation'}
                  </span>
                  {!loading ? (
                    <div className="flex items-center gap-4">
                      <span className="text-[1.1rem] tracking-widest">{formatCurrency(grandTotal)}</span>
                      <ArrowLeft className="w-5 h-5 rotate-180" />
                    </div>
                  ) : (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
"""

# TrackingView.tsx - Keep exact text fields and icons
tracking_view = """import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle2, ChefHat, Search, Bell, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { TRANSLATIONS } from '../data/constants';
import { Language, FeedbackPayload } from '../types';
import { RatingModal } from '../components/RatingModal';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { mapOrderStatusToStep } from '../utils/statusMapping';
import { buildLegacyFeedback } from '../utils/feedbackMapping';

interface TrackingViewProps {
  roomNumber: string;
  onFinish: () => void;
  lang: Language;
  orderId: string | null;
  blockedWaUrl?: string | null;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ roomNumber, onFinish, lang, orderId, blockedWaUrl }) => {
  const [orderStatus, setOrderStatus] = useState(0);
  const [showRating, setShowRating] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(doc(db, 'orders', orderId), (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.data();
      const status = data.status;

      const newStep = mapOrderStatusToStep(status);
      setOrderStatus(newStep);

      if (status === 'completed' || status === 'delivered') {
        setTimeout(() => setShowRating(true), 2000);
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  const handleSubmitFeedback = async (payload: FeedbackPayload) => {
    if (orderId) {
       await updateDoc(doc(db, 'orders', orderId), {
         ...buildLegacyFeedback(payload),
         feedbackSubmittedAt: new Date().toISOString(),
       }).catch(console.error);
    }
    onFinish();
  };

  const steps = [
    { icon: <FileText className="w-6 h-6" />, label: 'Order received', sub: 'Your order has been logged and sent to the kitchen.' },
    { icon: <CheckCircle2 className="w-6 h-6" />, label: 'Confirmed by kitchen', sub: 'The kitchen has confirmed your order and queued preparation.' },
    { icon: <ChefHat className="w-6 h-6" />, label: 'Being prepared', sub: 'Your dishes are being freshly prepared.' },
    { icon: <Search className="w-6 h-6" />, label: 'Quality check', sub: 'Your order is being checked before dispatch.' },
    { icon: <Bell className="w-6 h-6" />, label: 'On the way', sub: `Our staff is on the way to Room ${roomNumber}.` },
    { icon: <Star className="w-6 h-6" />, label: 'Delivered', sub: 'Your order has arrived. Enjoy your meal.' },
  ];

  const lastUpdated = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-32" style={{ backgroundColor: '#fdfbf9', fontFamily: "'Manrope', sans-serif" }}>
      <div className="w-full max-w-4xl mx-auto px-6 sm:px-12 pt-16">
        
        <div className="mb-20 pb-16 border-b-2 border-[#e7e5e4]">
          <p className="text-[12px] uppercase tracking-[0.3em] font-bold mb-6 text-[#78716c]">
            Room {roomNumber}
          </p>
          <h2 className="text-[3rem] sm:text-[4.5rem] leading-[1] mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 500 }}>
            Service Itinerary
          </h2>
          <div className="inline-flex items-center px-6 py-3 border-2 border-[#1c1917] bg-[#ffffff] text-[12px] uppercase font-bold tracking-[0.25em] text-[#1c1917]">
            Order #{orderId?.slice(-6).toUpperCase() || 'UNKNOWN'}
          </div>
        </div>

        {blockedWaUrl && (
          <div className="mb-16 p-8 border-2 border-[#1c1917] bg-[#f5f5f4]">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] mb-6 text-[#1c1917]">
              WhatsApp message blocked by browser. Please click below:
            </p>
            <a 
              href={blockedWaUrl} target="_blank" rel="noopener noreferrer" 
              className="inline-flex h-14 px-8 items-center justify-center text-[11px] uppercase font-bold tracking-[0.25em] bg-[#1c1917] text-[#ffffff] hover:bg-black"
            >
              Open WhatsApp Manually
            </a>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_350px] gap-16">
          <div className="relative pl-8 sm:pl-12 pb-16">
            <div className="absolute top-0 bottom-0 left-8 sm:left-12 w-[2px] bg-[#e7e5e4]" />
            
            <div className="space-y-16 relative z-10">
              {steps.map((step, index) => {
                const isCompleted = index < orderStatus;
                const isCurrent = index === orderStatus;
                let displayTitle = step.label;
                if (index === 0 && displayTitle === 'Order received') displayTitle = 'Preparation initiated';
                
                return (
                  <div key={index} className="relative flex gap-8 pb-4">
                    <div className="absolute -left-8 sm:-left-12 w-20 flex justify-center">
                      <div className={`w-14 h-14 flex items-center justify-center border-2 transition-colors ${
                        isCurrent ? 'border-[#1c1917] bg-[#1c1917] text-white' : 
                        isCompleted ? 'border-[#1c1917] bg-[#ffffff] text-[#1c1917]' : 'border-[#e7e5e4] bg-[#ffffff] text-[#d6d3d1]'
                      }`}>
                        {step.icon}
                      </div>
                    </div>
                    
                    <div className={`flex-1 pt-2 ml-[3.5rem] transition-opacity ${isCompleted || isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                      <h3 className="text-[1.5rem] leading-none mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 600 }}>
                        {displayTitle}
                      </h3>
                      {isCurrent && (
                         <span className="inline-block mb-3 text-[10px] uppercase tracking-[0.25em] font-bold text-[#b91c1c]">Current</span>
                      )}
                      
                      <p className="text-[1.05rem] leading-relaxed font-normal text-[#574b3f]">
                        {step.sub}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            <div className="border-2 border-[#e7e5e4] bg-[#ffffff] p-8 sm:p-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8 text-[#1c1917] border-b-2 border-[#1c1917] pb-4 inline-block">
                Service details
              </p>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#78716c]">Room</p>
                  <p className="text-[1.1rem] font-bold text-[#1c1917]">{roomNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#78716c]">Expected arrival</p>
                  <p className="text-[1.1rem] font-bold text-[#1c1917]">20-30 min</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-[#78716c]">Last updated</p>
                  <p className="text-[1.1rem] font-bold text-[#1c1917]">{lastUpdated}</p>
                </div>
              </div>
            </div>
            
            <div className="border-2 border-[#1c1917] bg-[#1c1917] p-8 sm:p-10">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] mb-4 text-[#ffffff]">
                Exceptional Support
              </p>
              <p className="text-[1rem] font-normal mb-8 leading-relaxed text-[#f5f5f4]/80">
                Require an adjustment? Our dining concierge is available via WhatsApp.
              </p>
              <button
                onClick={onFinish}
                className="w-full h-14 text-[11px] uppercase tracking-[0.25em] font-bold border-2 border-white/30 text-white hover:bg-white hover:text-black transition-colors"
              >
                Contact Concierge
              </button>
            </div>
          </div>
        </div>

      </div>
      <RatingModal isOpen={showRating} onRate={handleSubmitFeedback} onSkip={onFinish} lang={lang} />
    </motion.div>
  );
};
"""

overwrite('src/views/CheckoutView.tsx', checkout_view)
overwrite('src/views/TrackingView.tsx', tracking_view)
print("Fix for tracking and checkout view applied.")
