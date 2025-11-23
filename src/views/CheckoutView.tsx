import React, { useState } from 'react';
import { ChevronLeft, Building2, QrCode, CreditCard, CheckCircle2, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, Language } from '../types';
import { BANKS, TRANSLATIONS } from '../data/constants';

interface CheckoutViewProps {
  cart: CartItem[];
  onBack: () => void;
  onPlaceOrder: (paymentMethod: string, proof: File | null) => void;
  loading: boolean;
  phoneNumber: string;
  lang: Language;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ 
  cart, 
  onBack, 
  onPlaceOrder, 
  loading, 
  phoneNumber,
  lang 
}) => {
  const [paymentMethod, setPaymentMethod] = useState("room");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const t = TRANSLATIONS[lang];

  // --- 1. HELPER: PEMBERSIH HARGA (Jurus Anti-NaN) ---
  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    // Hapus "Rp", titik, spasi, lalu jadikan angka
    const cleanStr = String(value).replace(/[^0-9]/g, '');
    return parseInt(cleanStr, 10) || 0;
  };

  // --- 2. HELPER: FORMAT RUPIAH ---
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // --- 3. KALKULATOR AMAN ---
  // Kita bersihkan dulu harga & qty sebelum dikali
  const subtotal = cart.reduce((sum, item) => {
    const p = parseNumber(item.price);
    const q = parseNumber(item.qty);
    return sum + (p * q);
  }, 0);

  const taxService = subtotal * 0.21;
  const grandTotal = subtotal + taxService;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTransferProof(e.target.files[0]);
    }
  };

  const canSubmit = paymentMethod === 'room' || (paymentMethod !== 'room' && transferProof);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-slate-50 font-sans pb-32"
    >
      <div className="w-full max-w-3xl mx-auto bg-slate-50 min-h-screen relative">
          
          {/* Header */}
          <div className="bg-white sticky top-0 z-30 px-6 pt-6 pb-4 shadow-sm flex items-center gap-4">
            <button 
              onClick={onBack} 
              className="group flex items-center gap-3 pl-2 pr-5 py-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all active:scale-95"
            >
               <div className="bg-white p-1.5 rounded-full shadow-sm border border-slate-200 group-hover:border-orange-200">
                  <ChevronLeft className="w-4 h-4 text-slate-900" />
               </div>
               <span className="text-xs font-bold text-slate-700 uppercase tracking-wider group-hover:text-slate-900">{t.backToMenu}</span>
            </button>
            <div className="flex-1 text-right">
               <h2 className="text-lg font-bold font-serif text-slate-900">{t.checkout}</h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Payment Methods */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
               <h3 className="font-bold text-slate-900 mb-4">{t.paymentMethod}</h3>
               <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all w-full ${paymentMethod === 'room' ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="pay" className="hidden" checked={paymentMethod === 'room'} onChange={() => setPaymentMethod('room')} />
                      <div className={`p-2 rounded-full ${paymentMethod === 'room' ? 'bg-orange-100' : 'bg-slate-100'}`}>
                        <Building2 className={`w-5 h-5 ${paymentMethod === 'room' ? 'text-orange-600' : 'text-slate-400'}`} />
                      </div>
                      <span className="font-bold text-sm text-slate-900">{t.chargeRoom}</span>
                      {paymentMethod === 'room' && <CheckCircle2 className="w-5 h-5 text-orange-500 ml-auto" />}
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all w-full ${paymentMethod === 'qris' ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="pay" className="hidden" checked={paymentMethod === 'qris'} onChange={() => setPaymentMethod('qris')} />
                      <div className={`p-2 rounded-full ${paymentMethod === 'qris' ? 'bg-orange-100' : 'bg-slate-100'}`}>
                        <QrCode className={`w-5 h-5 ${paymentMethod === 'qris' ? 'text-orange-600' : 'text-slate-400'}`} />
                      </div>
                      <span className="font-bold text-sm text-slate-900">QRIS / E-Wallet</span>
                      {paymentMethod === 'qris' && <CheckCircle2 className="w-5 h-5 text-orange-500 ml-auto" />}
                  </label>

                  <label className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all w-full ${paymentMethod === 'bank' ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                      <input type="radio" name="pay" className="hidden" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                      <div className={`p-2 rounded-full ${paymentMethod === 'bank' ? 'bg-orange-100' : 'bg-slate-100'}`}>
                        <CreditCard className={`w-5 h-5 ${paymentMethod === 'bank' ? 'text-orange-600' : 'text-slate-400'}`} />
                      </div>
                      <span className="font-bold text-sm text-slate-900">{t.bankTransfer}</span>
                      {paymentMethod === 'bank' && <CheckCircle2 className="w-5 h-5 text-orange-500 ml-auto" />}
                  </label>
               </div>

               <AnimatePresence>
                 {paymentMethod === 'bank' && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }} 
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="overflow-hidden"
                   >
                       <div className="mt-6 pl-2">
                           <p className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider">Select Bank</p>
                           <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                               {BANKS.map(bank => (
                                   <button 
                                      key={bank.id} 
                                      onClick={() => setSelectedBank(bank.id)} 
                                      className={`
                                        px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border
                                        ${selectedBank === bank.id 
                                          ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' 
                                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}
                                      `}
                                    >
                                      {bank.name}
                                   </button>
                               ))}
                           </div>
                           {selectedBank && (
                               <motion.div 
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 className="bg-slate-50 p-4 rounded-xl text-center mb-4 border border-slate-200 relative overflow-hidden"
                               >
                                   <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                                   <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Virtual Account Number</p>
                                   <p className="text-xl font-mono font-bold text-slate-900 tracking-widest select-all cursor-pointer">
                                     {BANKS.find(b => b.id === selectedBank)?.code}
                                     <span className="text-orange-600">{phoneNumber}</span>
                                   </p>
                               </motion.div>
                           )}
                       </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <AnimatePresence>
                 {paymentMethod === 'qris' && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }} 
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="overflow-hidden"
                   >
                       <div className="mt-4 bg-white border-2 border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center">
                           <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" className="w-40 h-40 opacity-90 mix-blend-multiply mb-2" alt="QRIS" />
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.scanQris}</p>
                       </div>
                   </motion.div>
                 )}
               </AnimatePresence>

               <AnimatePresence>
                 {(paymentMethod === 'qris' || (paymentMethod === 'bank' && selectedBank)) && (
                   <motion.div 
                     initial={{ opacity: 0, height: 0 }} 
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="overflow-hidden"
                   >
                       <div className="mt-6 pt-6 border-t border-slate-100">
                           <p className="text-xs font-bold text-slate-900 mb-3">{t.uploadProof}</p>
                           <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all group relative overflow-hidden">
                               <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                                   {transferProof ? (
                                       <div className="flex flex-col items-center text-green-600 px-4 text-center">
                                           <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                              <CheckCircle2 className="w-5 h-5" />
                                           </div>
                                           <p className="text-xs font-bold break-all line-clamp-1">{transferProof.name}</p>
                                           <p className="text-[10px] text-green-500">{t.fileSelected}</p>
                                       </div>
                                   ) : (
                                       <>
                                           <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                             <Upload className="w-5 h-5 text-slate-400" />
                                           </div>
                                           <p className="text-[11px] text-slate-500 font-bold">{t.uploadPrompt}</p>
                                           <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-1">JPG, PNG</p>
                                       </>
                                   )}
                               </div>
                               {transferProof && <div className="absolute inset-0 bg-green-50/50" />}
                               <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                           </label>
                       </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-4">Summary</h3>
              <div className="space-y-3 text-sm">
                {/* GANTI BAGIAN INI DENGAN FORMATRUPIAH BUATAN KITA SENDIRI */}
                <div className="flex justify-between text-slate-500"><span>{t.subtotal}</span><span>{formatRupiah(subtotal)}</span></div>
                <div className="flex justify-between text-slate-500"><span>{t.serviceTax}</span><span>{formatRupiah(taxService)}</span></div>
                <div className="flex justify-between text-xl font-bold text-slate-900 mt-4 pt-4 border-t border-slate-100"><span>{t.total}</span><span>{formatRupiah(grandTotal)}</span></div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="sticky bottom-0 left-0 right-0 z-40 p-6 bg-gradient-to-t from-white via-white to-transparent">
             <button 
               onClick={() => onPlaceOrder(paymentMethod, transferProof)} 
               disabled={loading || !canSubmit} 
               className={`
                 w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex justify-center items-center gap-2 transition-all
                 ${loading || !canSubmit 
                   ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                   : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] hover:shadow-2xl'}
               `}
             >
               {loading ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" />
                   {t.processing}
                 </>
               ) : (
                 !canSubmit ? 'Complete Payment details' : t.placeOrder
               )}
             </button>
          </div>
      </div>
    </motion.div>
  );
};