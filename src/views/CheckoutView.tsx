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
      style={{ backgroundColor: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-6xl mx-auto min-h-screen relative">
        {/* Header */}
        <div className="sticky top-0 z-30 px-5 sm:px-6 pt-5 pb-4 flex items-center gap-4 backdrop-blur-md" style={{ backgroundColor: 'rgba(250,248,245,0.92)', boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
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

        <div className="px-5 sm:px-6 py-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[30px] border p-6 sm:p-8" style={{ backgroundColor: '#2d2d2d', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-3" style={{ color: '#c4b5a4' }}>
                {lang === 'ID' ? 'Finalisasi pesanan' : 'Finalize your order'}
              </p>
              <h3 className="text-3xl mb-3" style={{ fontFamily: "'DM Serif Display', serif", color: '#faf8f5' }}>
                {lang === 'ID' ? 'Checkout yang lebih jelas dan rapi.' : 'A clearer, more composed checkout.'}
              </h3>
              <p className="text-sm leading-7 max-w-2xl" style={{ color: 'rgba(250,248,245,0.72)' }}>
                {lang === 'ID'
                  ? 'Pilih metode pembayaran, unggah bukti bila diperlukan, lalu tinjau ringkasan akhir sebelum pesanan diproses.'
                  : 'Choose your payment method, add proof when needed, and review the final summary before the kitchen receives the order.'}
              </p>
            </div>

            <div className="rounded-[30px] border p-5 sm:p-6" style={{ backgroundColor: '#fff', borderColor: 'rgba(45,45,45,0.06)' }}>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: '#8a7648' }}>
                    Payment guidance
                  </p>
                  <h3 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>{t.paymentMethod}</h3>
                </div>
                <div className="rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ backgroundColor: '#f7f2ea', color: '#8a7648' }}>
                  {trayCountLabel}
                </div>
              </div>

              <div className="space-y-4">
            {([
                {
                  method: 'room' as PaymentMethod,
                  icon: Building2,
                  label: t.chargeRoom,
                  desc: lang === 'ID' ? 'Paling cepat untuk tamu menginap. Tagihan dimasukkan ke folio kamar.' : 'Fastest for staying guests. Charges are posted to the room folio.',
                },
                {
                  method: 'qris' as PaymentMethod,
                  icon: QrCode,
                  label: 'QRIS / E-Wallet',
                  desc: lang === 'ID' ? 'Pindai kode QR lalu unggah tangkapan layar konfirmasi pembayaran.' : 'Scan the QR code and upload your payment confirmation screenshot.',
                },
                {
                  method: 'bank' as PaymentMethod,
                  icon: CreditCard,
                  label: t.bankTransfer,
                  desc: lang === 'ID' ? 'Pilih bank virtual account lalu lampirkan bukti transfer.' : 'Select a virtual account bank and attach the transfer proof before submitting.',
                },
              ]).map(({ method, icon: Icon, label, desc }) => (
              <label
                key={method}
                className="flex items-start gap-4 p-4 sm:p-5 cursor-pointer transition-all w-full border rounded-[24px]"
                style={{
                  borderColor: paymentMethod === method ? '#2d2d2d' : 'rgba(45,45,45,0.1)',
                  backgroundColor: paymentMethod === method ? '#faf8f5' : '#fff',
                }}
              >
                <input type="radio" name="pay" className="hidden" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} />
                <div className="p-2 shrink-0 border" style={{ backgroundColor: paymentMethod === method ? '#2d2d2d' : '#fff', borderColor: 'rgba(45,45,45,0.1)', color: paymentMethod === method ? '#fff' : '#b8a898' }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-sm" style={{ color: '#2d2d2d' }}>{label}</span>
                  <p className="text-sm mt-2 leading-6" style={{ color: '#7a6a5a' }}>{desc}</p>
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
                      <div className="grid gap-2 sm:grid-cols-3 mb-6">
                        {BANKS.map((bank) => (
                          <button
                            key={bank.id}
                            onClick={() => setSelectedBank(bank.id)}
                            className="px-4 py-4 text-sm font-semibold transition-all text-left border rounded-[18px]"
                            style={
                              selectedBank === bank.id
                                ? { backgroundColor: '#2d2d2d', color: '#faf8f5', borderColor: '#2d2d2d' }
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
                          className="p-5 text-center mb-4 border rounded-[24px]"
                          style={{ backgroundColor: '#faf8f5', borderColor: 'rgba(45,45,45,0.1)' }}
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
                    <div className="mt-8 p-8 flex flex-col items-center text-center border bg-white rounded-[24px]" style={{ borderColor: 'rgba(45,45,45,0.1)' }}>
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
                      <label className="flex flex-col items-center justify-center w-full h-36 cursor-pointer transition-all group relative overflow-hidden bg-white rounded-[24px]" style={{ border: '1px dashed rgba(45,45,45,0.3)' }}>
                        <div className="flex flex-col items-center justify-center relative z-10">
                          {transferProof ? (
                            <div className="flex flex-col items-center px-4 text-center" style={{ color: '#a08850' }}>
                              <CheckCircle2 className="w-6 h-6 mb-2" />
                              <p className="text-xs font-semibold break-all line-clamp-1">{transferProof.name}</p>
                              <p className="text-[9px] uppercase tracking-widest font-bold mt-1" style={{ color: '#a08850' }}>{t.fileSelected}</p>
                            </div>
                          ) : (
                            <>
                              <div className="w-10 h-10 flex items-center justify-center mb-2 border rounded-full" style={{ borderColor: 'rgba(45,45,45,0.1)' }}>
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
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border p-6 bg-white" style={{ borderColor: 'rgba(45,45,45,0.06)' }}>
              <div className="flex items-center justify-between gap-4 mb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: '#8a7648' }}>
                    Order review
                  </p>
                  <h3 className="text-2xl" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>{t.summary || 'Summary'}</h3>
                </div>
                <div className="rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ backgroundColor: '#f7f2ea', color: '#8a7648' }}>
                  {trayCountLabel}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${index}`} className="flex items-start justify-between gap-3 rounded-[20px] px-4 py-4" style={{ backgroundColor: '#faf8f5' }}>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>{item.name}</p>
                      <p className="text-xs mt-1" style={{ color: '#7a6a5a' }}>
                        {item.qty} x {formatCurrency(item.price)}
                      </p>
                      {item.note && <p className="text-xs mt-2 italic" style={{ color: '#7a6a5a' }}>"{item.note}"</p>}
                    </div>
                    <span className="text-sm font-semibold whitespace-nowrap" style={{ color: '#2d2d2d' }}>{formatCurrency(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] p-4 mb-5" style={{ backgroundColor: '#f7f2ea' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] mb-2" style={{ color: '#8a7648' }}>
                  {lang === 'ID' ? 'Catatan pembayaran' : 'Payment note'}
                </p>
                <p className="text-sm leading-7" style={{ color: '#574b3f' }}>
                  {lang === 'ID'
                    ? 'Pesanan baru dikirim setelah pembayaran tervalidasi atau tagihan kamar dipilih.'
                    : 'The order is submitted only after room charge is selected or payment proof has been attached successfully.'}
                </p>
              </div>

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
        </div>
      </div>
    </motion.div>
  );
};
