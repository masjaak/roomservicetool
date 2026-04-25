import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, Building2, CheckCircle2, Loader2, QrCode, Receipt, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartItem, Language } from '../types';
import { BANKS, TRANSLATIONS } from '../data/constants';
import { useTheme } from '../contexts/ThemeContext';
import { calculateSubtotal, calculateTax, calculateTotal, formatCurrency } from '../utils/format';
import type { PaymentMethod } from '../machine/types';
import { CheckoutPaymentEvent, createInitialCheckoutPaymentState, getCheckoutPaymentSubmitState, transitionCheckoutPaymentState } from './checkoutPaymentState';

interface CheckoutViewProps {
  cart: CartItem[];
  onBack: () => void;
  onPlaceOrder: (paymentMethod: PaymentMethod, selectedBank: string | null, proof: File | null) => void;
  loading: boolean;
  error?: string | null;
  phoneNumber: string;
  lang: Language;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, onBack, onPlaceOrder, loading, error, phoneNumber, lang }) => {
  const { theme } = useTheme();
  const [paymentState, setPaymentState] = useState(createInitialCheckoutPaymentState);
  const t = TRANSLATIONS[lang];
  const selectedBankDetails = BANKS.find(b => b.id === paymentState.selectedBank) ?? null;
  const subtotal = calculateSubtotal(cart);
  const taxService = calculateTax(subtotal);
  const grandTotal = calculateTotal(subtotal);
  const hasNetworkIssue = Boolean(error);
  const canSubmit = getCheckoutPaymentSubmitState(paymentState, cart.length);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setPaymentState(s => transitionCheckoutPaymentState(s, { type: CheckoutPaymentEvent.AttachProof, file: e.target.files![0] }));
  };
  const handleMethod = (method: PaymentMethod) =>
    setPaymentState(s => transitionCheckoutPaymentState(s, { type: CheckoutPaymentEvent.SelectMethod, method }));

  const inputStyle: React.CSSProperties = {
    background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '0.875rem',
    padding: '0.875rem 1rem', fontSize: '14px', color: theme.textBase, outline: 'none',
    fontFamily: "'Manrope',sans-serif", width: '100%', boxSizing: 'border-box', transition: 'background 0.3s',
  };

  return (
    <div style={{ minHeight: '100dvh', background: theme.bgBase, fontFamily: "'Manrope',sans-serif", WebkitFontSmoothing: 'antialiased', transition: 'background 0.3s' }}>
      {/* Header */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: theme.bgHeader, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: `1px solid ${theme.borderFaint}`, transition: 'background 0.3s, border-color 0.3s' }}>
        <div style={{ maxWidth: '28rem', marginInline: 'auto', paddingTop: 'env(safe-area-inset-top)' }}>
          <div style={{ height: '3.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingInline: '1.5rem' }}>
            <button onClick={onBack} aria-label="Back" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: theme.bgInput, border: 'none', cursor: 'pointer', color: theme.textBase }}>
              <ArrowLeft size={18} />
            </button>
            <h1 style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: "'Noto Serif',serif", fontSize: '1.25rem', fontWeight: 400, fontStyle: 'italic', color: theme.textBase, lineHeight: 1, transition: 'color 0.3s' }}>
              {t.orderSummary}
            </h1>
            <div style={{ width: '2.25rem' }} />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '28rem', marginInline: 'auto', paddingTop: 'calc(env(safe-area-inset-top) + 3.75rem + 1.5rem)', paddingInline: '1.5rem', paddingBottom: '8rem' }}>
        <h2 className="sr-only">Checkout</h2>

        {/* Status banner */}
        {(loading || hasNetworkIssue) && (
          <section aria-live="polite" role={hasNetworkIssue ? 'alert' : 'status'}
            style={{ borderRadius: '1rem', border: `1px solid ${hasNetworkIssue ? theme.errorText + '40' : theme.border}`, background: hasNetworkIssue ? theme.errorBg : theme.bgSurface, padding: '1.25rem', marginBottom: '1.5rem', transition: 'background 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              {loading ? <Loader2 size={16} style={{ marginTop: '2px', color: theme.gold, animation: 'spin 1s linear infinite' }} /> : <AlertTriangle size={16} style={{ marginTop: '2px', color: theme.errorText }} />}
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: hasNetworkIssue ? theme.errorText : theme.textBase, marginBottom: '0.25rem' }}>
                  {loading ? t.processing : error}
                </p>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: theme.textMuted }}>{loading ? t.processingKeepOpen : t.networkRecoveryHint}</p>
                {phoneNumber && <p style={{ marginTop: '0.25rem', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.14em', color: theme.textMuted }}>WhatsApp: {phoneNumber}</p>}
              </div>
            </div>
          </section>
        )}

        {/* Price summary card */}
        <section style={{ borderRadius: '1.1rem', background: theme.bgSurface, padding: '1.75rem', marginBottom: '1.5rem', border: `1px solid ${theme.borderFaint}`, transition: 'background 0.3s, border-color 0.3s' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
            {[{ l: t.subtotal, v: subtotal }, { l: t.serviceTax, v: taxService }].map(({ l, v }) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: theme.textMuted }}>
                <span>{l}</span><span>{formatCurrency(v)}</span>
              </div>
            ))}
          </div>
          <div style={{ height: '1px', background: theme.divider, marginBottom: '1rem' }} />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: theme.textMuted }}>Grand Total</span>
            <span style={{ fontFamily: "'Noto Serif',serif", fontSize: '2.1rem', fontWeight: 400, color: theme.goldBright, lineHeight: 1, transition: 'color 0.3s' }}>{formatCurrency(grandTotal)}</span>
          </div>
        </section>

        {/* Chef notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="chef-notes" style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: theme.textMuted, marginBottom: '0.625rem', fontFamily: "'Manrope',sans-serif", fontWeight: 700 }}>{t.specialNotesChef}</label>
          <textarea id="chef-notes" placeholder={t.dietaryPlaceholder} rows={3}
            style={{ ...inputStyle, resize: 'none', height: '5rem' }} />
        </div>

        {/* Payment methods */}
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: theme.textMuted, marginBottom: '0.75rem', fontFamily: "'Manrope',sans-serif", fontWeight: 700 }}>{t.paymentMethod}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {([
              { id: 'room', label: t.chargeRoom, icon: Receipt },
              { id: 'qris', label: lang === 'ID' ? 'Bayar Saat Antar' : 'Pay on Delivery', icon: QrCode },
              { id: 'bank', label: 'Bank Transfer', icon: Building2 },
            ] as const).map(({ id, label, icon: Icon }) => {
              const active = paymentState.method === id;
              return (
                <button key={id} type="button" onClick={() => handleMethod(id as PaymentMethod)} aria-pressed={active}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '1.1rem', border: `1px solid ${active ? 'rgba(154,116,22,0.45)' : theme.borderFaint}`, background: active ? 'rgba(154,116,22,0.1)' : theme.bgSurface, padding: '1rem 1.25rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem', background: active ? 'rgba(154,116,22,0.15)' : theme.bgInput, color: active ? theme.goldBright : theme.textMuted, transition: 'all 0.2s' }}>
                      <Icon size={18} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: active ? theme.goldBright : theme.textSecondary, transition: 'color 0.2s' }}>{label}</span>
                  </div>
                  {active
                    ? <CheckCircle2 size={18} color={theme.goldBright} />
                    : <div style={{ width: '18px', height: '18px', borderRadius: '9999px', border: `1.5px solid ${theme.border}` }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conditional bank/qris panels */}
        <AnimatePresence initial={false}>
          {paymentState.method === 'bank' && (
            <motion.div key="bank" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ borderRadius: '1.1rem', background: theme.bgSurface, padding: '1.25rem', border: `1px solid ${theme.borderFaint}`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: theme.textMuted, fontWeight: 700 }}>Select Destination Bank</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.625rem' }}>
                  {BANKS.map(b => (
                    <button key={b.id} type="button" onClick={() => setPaymentState(s => transitionCheckoutPaymentState(s, { type: CheckoutPaymentEvent.SelectBank, bankId: b.id }))}
                      style={{ borderRadius: '0.625rem', padding: '0.625rem', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                        border: `1px solid ${paymentState.selectedBank === b.id ? 'rgba(154,116,22,0.5)' : theme.border}`,
                        background: paymentState.selectedBank === b.id ? 'rgba(154,116,22,0.15)' : theme.bgInput,
                        color: paymentState.selectedBank === b.id ? theme.goldBright : theme.textBase }}>
                      {b.name}
                    </button>
                  ))}
                </div>
                {selectedBankDetails && (
                  <div style={{ borderRadius: '0.75rem', background: theme.bgInput, padding: '1rem', border: `1px solid ${theme.borderFaint}` }}>
                    <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.14em', color: theme.textMuted, marginBottom: '0.25rem' }}>{t.vaNumber}</p>
                    <p style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.5rem', color: theme.textBase }}>{selectedBankDetails.code}</p>
                  </div>
                )}
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', borderRadius: '0.875rem', border: `1.5px dashed ${theme.border}`, padding: '1.25rem', fontSize: '13px', color: theme.textMuted, cursor: 'pointer' }}>
                  <Upload size={15} />
                  <span>{paymentState.transferProof ? paymentState.transferProof.name : t.uploadPrompt}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
            </motion.div>
          )}

          {paymentState.method === 'qris' && (
            <motion.div key="qris" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: '1.5rem' }}>
              <div style={{ borderRadius: '1.1rem', background: theme.bgSurface, padding: '1.25rem', border: `1px solid ${theme.borderFaint}`, display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div style={{ width: '10rem', height: '10rem', borderRadius: '1rem', background: theme.bgInput, border: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <QrCode size={32} color={theme.goldBright} />
                  <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.16em', color: theme.goldBright, fontWeight: 700 }}>QRIS</p>
                  <p style={{ fontSize: '11px', color: theme.textMuted, textAlign: 'center', maxWidth: '8rem', lineHeight: 1.4 }}>{t.scanQris}</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem', borderRadius: '0.875rem', border: `1.5px dashed ${theme.border}`, padding: '1.25rem', fontSize: '13px', color: theme.textMuted, cursor: 'pointer', width: '100%', boxSizing: 'border-box' }}>
                  <Upload size={15} />
                  <span>{paymentState.transferProof ? paymentState.transferProof.name : t.uploadProof}</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Folio summary */}
        <section style={{ borderRadius: '1.1rem', background: theme.bgSurface, padding: '1.5rem', border: `1px solid ${theme.borderFaint}`, marginBottom: '1.5rem', transition: 'background 0.3s' }}>
          <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.2rem', fontWeight: 400, fontStyle: 'italic', color: theme.textBase, marginBottom: '1rem', transition: 'color 0.3s' }}>Folio Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {cart.map((item, i) => (
              <div key={`${item.id}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', paddingBottom: '0.875rem', borderBottom: i < cart.length - 1 ? `1px solid ${theme.divider}` : 'none' }}>
                <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
                  <span style={{ marginRight: '0.5rem', fontWeight: 700, color: theme.goldBright }}>{item.qty}×</span>
                  <span style={{ fontWeight: 500, color: theme.textBase }}>{item.name}</span>
                  {item.note && <p style={{ marginTop: '0.2rem', paddingLeft: '1.25rem', fontSize: '12px', fontStyle: 'italic', color: theme.textMuted }}>{item.note}</p>}
                </div>
                <span style={{ whiteSpace: 'nowrap', fontSize: '14px', fontWeight: 600, color: theme.textSecondary }}>{formatCurrency(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* CTA footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: `linear-gradient(to top, ${theme.bgBase} 60%, transparent)`, paddingInline: '1.5rem', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)', paddingTop: '2.5rem', transition: 'background 0.3s' }}>
        <div style={{ maxWidth: '28rem', marginInline: 'auto' }}>
          <button type="button" onClick={() => onPlaceOrder(paymentState.method, paymentState.selectedBank, paymentState.transferProof)} disabled={!canSubmit || loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', height: '3.75rem', borderRadius: '1rem', background: 'linear-gradient(135deg,#7a5c10,#9a7416)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 14px 32px rgba(119,90,25,0.3)', color: '#fff', fontFamily: "'Manrope',sans-serif", fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: !canSubmit || loading ? 'not-allowed' : 'pointer', opacity: !canSubmit || loading ? 0.55 : 1, transition: 'opacity 0.2s' }}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
            <span>{loading ? t.processing : (lang === 'ID' ? 'Konfirmasi & Pesan' : 'Confirm & Place Order')}</span>
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </div>
      </div>
    </div>
  );
};
