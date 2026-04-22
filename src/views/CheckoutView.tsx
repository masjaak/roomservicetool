import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, Building2, CheckCircle2, Loader2, QrCode, Receipt, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartItem, Language } from '../types';
import { BANKS, TRANSLATIONS } from '../data/constants';
import { guestTheme } from '../styles/guestTheme';
import { calculateSubtotal, calculateTax, calculateTotal, formatCurrency } from '../utils/format';
import type { PaymentMethod } from '../machine/types';
import {
  CheckoutPaymentEvent,
  createInitialCheckoutPaymentState,
  getCheckoutPaymentSubmitState,
  transitionCheckoutPaymentState,
} from './checkoutPaymentState';

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
  const [paymentState, setPaymentState] = useState(createInitialCheckoutPaymentState);
  const t = TRANSLATIONS[lang];
  const selectedBankDetails = BANKS.find((bank) => bank.id === paymentState.selectedBank) ?? null;

  const subtotal = calculateSubtotal(cart);
  const taxService = calculateTax(subtotal);
  const grandTotal = calculateTotal(subtotal);
  const hasNetworkIssue = Boolean(error);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentState((currentState) => transitionCheckoutPaymentState(currentState, {
        type: CheckoutPaymentEvent.AttachProof,
        file: e.target.files?.[0] ?? null,
      }));
    }
  };

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentState((currentState) => transitionCheckoutPaymentState(currentState, {
      type: CheckoutPaymentEvent.SelectMethod,
      method,
    }));
  };

  const canSubmit = getCheckoutPaymentSubmitState(paymentState, cart.length);

  return (
    <div className={`min-h-screen ${guestTheme.bg.canvas}`}>
      <header className={`hcs-safe-top fixed top-0 z-50 w-full ${guestTheme.bg.surface} shadow-[0_1px_0_rgba(227,226,224,0.8)]`}>
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-6">
          <button onClick={onBack} aria-label="Back to Menu" className={`flex items-center justify-center p-2 ${guestTheme.text.primary}`}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className={`font-headline absolute left-1/2 -translate-x-1/2 text-lg font-medium ${guestTheme.text.base}`}>
            {t.orderSummary}
          </h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="hcs-header-content-offset mx-auto max-w-md space-y-10 px-6 pb-40">
        <h2 className="sr-only">Checkout</h2>

        {(loading || hasNetworkIssue) && (
          <section
            aria-live="polite"
            role={hasNetworkIssue ? 'alert' : 'status'}
            className={`rounded-xl border ${hasNetworkIssue ? `${guestTheme.border.error} ${guestTheme.bg.errorSoft}` : `${guestTheme.border.strong} ${guestTheme.bg.surface}`} p-5 shadow-[0_8px_20px_rgba(26,28,27,0.04)]`}
          >
            <div className="flex items-start gap-3">
              {loading ? <Loader2 className={`mt-0.5 h-4 w-4 animate-spin ${guestTheme.text.primary}`} /> : <AlertTriangle className={`mt-0.5 h-4 w-4 ${guestTheme.text.error}`} />}
              <div className="space-y-2">
                <p className={`text-sm font-semibold ${hasNetworkIssue ? guestTheme.text.error : guestTheme.text.base}`}>
                  {loading ? t.processing : error}
                </p>
                <p className={`text-sm leading-relaxed ${guestTheme.text.muted}`}>
                  {loading ? t.processingKeepOpen : t.networkRecoveryHint}
                </p>
                {phoneNumber && (
                  <p className={`text-xs uppercase tracking-[0.14em] ${guestTheme.text.muted}`}>
                    WhatsApp: {phoneNumber}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <section className={`rounded-[1.5rem] ${guestTheme.bg.surface} p-7 shadow-[0_0_0_1px_rgba(227,226,224,0.8),0_24px_40px_rgba(26,28,27,0.04)]`}>
          <div className={`mb-5 flex flex-col gap-4 text-sm font-medium ${guestTheme.text.muted}`}>
            <div className="flex items-center justify-between">
              <span>{t.subtotal}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.serviceTax}</span>
              <span>{formatCurrency(taxService)}</span>
            </div>
          </div>
          <div className={`mb-3 h-px ${guestTheme.bg.surfaceMuted}`} />
          <div className="flex items-end justify-between">
            <span className={`text-[10px] uppercase tracking-[0.12em] ${guestTheme.text.muted}`}>{t.total}</span>
            <span className={`font-headline text-[3.4rem] font-medium tracking-tight ${guestTheme.text.primary}`}>{formatCurrency(grandTotal)}</span>
          </div>
        </section>

        <section className="space-y-8">
          <div>
            <label htmlFor="chef-notes" className={`ml-1 block text-[10px] uppercase tracking-[0.12em] ${guestTheme.text.muted}`}>
              {t.specialNotesChef}
            </label>
            <textarea
              id="chef-notes"
              placeholder={t.dietaryPlaceholder}
              rows={3}
              className={`mt-3 w-full resize-none rounded-lg border-none ${guestTheme.bg.surfaceSoft} p-5 text-sm ${guestTheme.text.base} placeholder:text-[color:rgba(78,70,57,0.5)] focus:bg-[var(--hcs-surface)] focus:ring-0 focus:shadow-[0_8px_20px_rgba(26,28,27,0.04)]`}
            />
          </div>

          <div>
            <span className={`ml-1 block text-[10px] uppercase tracking-[0.12em] ${guestTheme.text.muted}`}>
              Billing Method
            </span>
            <div className="mt-3 space-y-3">
              {[
                { id: 'room', label: t.chargeRoom, icon: Receipt },
                { id: 'qris', label: t.qris, icon: QrCode },
                { id: 'bank', label: 'Bank Transfer', icon: Building2 },
              ].map((method) => {
                const active = paymentState.method === method.id;
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => handlePaymentMethodChange(method.id as PaymentMethod)}
                    className={`relative flex w-full items-center justify-between rounded-[1.25rem] p-5 text-left transition-all ${
                      active
                        ? `${guestTheme.bg.surface} shadow-[0_0_0_1px_rgba(209,197,180,0.8),0_16px_28px_rgba(119,90,25,0.06)]`
                        : `${guestTheme.bg.surfaceSoft} opacity-90 hover:bg-[var(--hcs-surface)]`
                    }`}
                    aria-pressed={active}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${active ? `${guestTheme.bg.primary}/10 ${guestTheme.text.primary}` : `${guestTheme.bg.surfaceMuted} ${guestTheme.text.muted}`}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-base font-medium ${active ? guestTheme.text.primary : guestTheme.text.muted}`}>{method.label}</span>
                    </div>
                    {active ? <CheckCircle2 className={`h-5 w-5 ${guestTheme.text.primary}`} /> : <div className={`h-5 w-5 rounded-full border ${guestTheme.border.base}`} />}
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {paymentState.method === 'bank' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className={`space-y-4 rounded-[1.25rem] ${guestTheme.bg.surface} p-5 shadow-[0_0_0_1px_rgba(227,226,224,0.8)]`}>
                  <p className={`text-xs uppercase tracking-[0.12em] ${guestTheme.text.muted}`}>Select Destination Bank</p>
                  <div className="grid grid-cols-3 gap-3">
                    {BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        type="button"
                            onClick={() => setPaymentState((currentState) => transitionCheckoutPaymentState(currentState, {
                              type: CheckoutPaymentEvent.SelectBank,
                              bankId: bank.id,
                            }))}
                            className={`rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                          paymentState.selectedBank === bank.id
                            ? `border ${guestTheme.border.strong} ${guestTheme.bg.primary} ${guestTheme.text.onPrimary}`
                            : `border ${guestTheme.border.strong} ${guestTheme.bg.canvas} ${guestTheme.text.base}`
                        }`}
                      >
                        {bank.name}
                      </button>
                    ))}
                  </div>
                  {selectedBankDetails && (
                    <div className={`rounded-lg ${guestTheme.bg.surfaceSoft} p-4`}>
                      <p className={`text-xs uppercase tracking-[0.12em] ${guestTheme.text.muted}`}>{t.vaNumber}</p>
                      <p className={`mt-2 font-headline text-2xl ${guestTheme.text.base}`}>{selectedBankDetails.code}</p>
                    </div>
                  )}
                  <label className={`block text-xs uppercase tracking-[0.12em] ${guestTheme.text.muted}`}>{t.uploadProof}</label>
                  <label className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed ${guestTheme.border.base} p-5 text-sm ${guestTheme.text.muted}`}>
                    <Upload className="h-4 w-4" />
                    <span>{paymentState.transferProof ? paymentState.transferProof.name : t.uploadPrompt}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </motion.div>
            )}

            {paymentState.method === 'qris' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className={`space-y-4 rounded-[1.25rem] ${guestTheme.bg.surface} p-5 shadow-[0_0_0_1px_rgba(227,226,224,0.8)]`}>
                  <div className="flex justify-center">
                    <div className={`flex h-44 w-44 flex-col items-center justify-center rounded-lg ${guestTheme.bg.surfaceSoft} text-center`}>
                      <QrCode className={`mb-3 h-8 w-8 ${guestTheme.text.primary}`} />
                      <p className={`text-xs uppercase tracking-[0.18em] ${guestTheme.text.primary}`}>QRIS</p>
                      <p className={`mt-2 max-w-[11rem] text-sm ${guestTheme.text.muted}`}>{t.scanQris}</p>
                    </div>
                  </div>
                  <label className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border border-dashed ${guestTheme.border.base} p-5 text-sm ${guestTheme.text.muted}`}>
                    <Upload className="h-4 w-4" />
                    <span>{paymentState.transferProof ? paymentState.transferProof.name : t.uploadProof}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <section className={`rounded-[1.25rem] ${guestTheme.bg.surface} p-6 shadow-[0_0_0_1px_rgba(227,226,224,0.8)]`}>
            <h2 className={`font-headline mb-4 text-xl font-semibold ${guestTheme.text.base}`}>Folio Summary</h2>
            <div className="space-y-4">
              {cart.map((item, i) => (
                <div key={`${item.id}-${item.note}-${i}`} className={`flex justify-between gap-4 border-b ${guestTheme.border.strong} pb-4 last:border-b-0`}>
                  <div className="pr-2 text-sm leading-relaxed">
                    <span className={`mr-2 font-semibold ${guestTheme.text.primary}`}>{item.qty}x</span>
                    <span className={`font-medium ${guestTheme.text.base}`}>{item.name}</span>
                    {item.note && <p className={`mt-1 pl-6 text-xs italic ${guestTheme.text.muted}`}>{item.note}</p>}
                  </div>
                  <span className={`whitespace-nowrap text-sm font-semibold ${guestTheme.text.base}`}>
                    {formatCurrency(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>

      <div className={`hcs-safe-bottom fixed bottom-0 left-0 w-full ${guestTheme.bg.surface} px-6 pb-8 pt-5 shadow-[0_-1px_0_rgba(227,226,224,0.8)]`}>
        <div className="mx-auto max-w-md">
          <button
            onClick={() => onPlaceOrder(paymentState.method, paymentState.selectedBank, paymentState.transferProof)}
            disabled={!canSubmit || loading}
            className={`flex h-16 w-full items-center justify-center gap-3 rounded-md ${guestTheme.bg.primary} px-8 text-sm font-semibold uppercase tracking-[0.12em] ${guestTheme.text.onPrimary} shadow-[0_10px_30px_rgba(119,90,25,0.2)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>{loading ? t.processing : t.placeOrder}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
