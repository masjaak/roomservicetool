import React from 'react';
import { ArrowLeft, ShoppingBag, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartItem, Language, MenuItem } from '../types';
import { MENU_ITEMS, TRANSLATIONS } from '../data/constants';
import { useTheme } from '../contexts/ThemeContext';
import { calculateSubtotal, calculateTax, calculateTotal, formatCurrency } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getCartPairingSuggestions } from '../utils/cartPairings';

interface CartDrawerProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (index: number) => void;
  onAddSuggestion: (item: MenuItem) => void;
  onCheckout: () => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ cart, isOpen, onClose, onRemove, onAddSuggestion, onCheckout, lang }) => {
  const { theme } = useTheme();
  const t = TRANSLATIONS[lang];
  const subtotal = calculateSubtotal(cart);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal);
  const pairingSuggestions = getCartPairingSuggestions(cart, MENU_ITEMS);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
            onClick={onClose} />
          <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', maxWidth: '28rem', background: theme.bgBase, boxShadow: '-20px 0 60px rgba(0,0,0,0.4)', transition: 'background 0.3s' }}>

              <header style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.bgBase, borderBottom: `1px solid ${theme.borderFaint}`, paddingInline: '1.5rem', paddingTop: 'calc(env(safe-area-inset-top) + 1rem)', paddingBottom: '1rem', transition: 'background 0.3s, border-color 0.3s' }}>
                <button onClick={onClose} aria-label="Close cart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: theme.bgInput, border: 'none', cursor: 'pointer', color: theme.textMuted }}>
                  <ArrowLeft size={18} />
                </button>
                <h2 style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontFamily: "'Noto Serif',serif", fontSize: '1.5rem', fontWeight: 400, fontStyle: 'italic', color: theme.textBase, lineHeight: 1, transition: 'color 0.3s' }}>
                  {lang === 'ID' ? 'Pesanan Anda' : 'Your Order'}
                </h2>
                <div style={{ width: '2.25rem' }} />
              </header>

              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', paddingBottom: cart.length > 0 ? '11rem' : '1.5rem', scrollbarWidth: 'none' }}>
                {cart.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem', textAlign: 'center' }}>
                    <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '9999px', background: theme.bgMuted }}>
                      <ShoppingBag size={22} color={theme.textMuted} />
                    </div>
                    <p style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.5rem', fontWeight: 400, color: theme.textBase }}>{t.emptyCart}</p>
                    <p style={{ marginTop: '0.5rem', fontSize: '14px', color: theme.textMuted, maxWidth: '18rem', lineHeight: 1.6 }}>
                      {lang === 'ID' ? 'Item pilihan Anda akan muncul di sini.' : 'Your selected items will appear here.'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${item.note}-${index}`} style={{ borderRadius: '1rem', background: theme.bgSurface, border: `1px solid ${theme.borderFaint}`, padding: '1rem', transition: 'background 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem' }}>
                          <div style={{ width: '5.5rem', height: '5.5rem', flexShrink: 0, overflow: 'hidden', borderRadius: '0.625rem', background: theme.bgMuted }}>
                            <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '5.5rem', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <div>
                                <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: '1rem', fontWeight: 400, lineHeight: 1.25, color: theme.textBase }}>{item.name}</h3>
                                {item.note && <p style={{ marginTop: '0.2rem', fontSize: '12px', color: theme.textMuted, maxWidth: '12rem' }}>{item.note}</p>}
                              </div>
                              <button onClick={() => onRemove(index)} aria-label="Remove item" style={{ padding: '0.2rem', background: 'none', border: 'none', cursor: 'pointer', color: theme.textMuted, flexShrink: 0 }}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <span style={{ fontFamily: "'Noto Serif',serif", fontSize: '1rem', color: theme.goldBright }}>{formatCurrency(item.price * item.qty)}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '9999px', background: theme.bgInput, padding: '0.3rem 0.875rem', border: `1px solid ${theme.borderFaint}` }}>
                                <span style={{ fontSize: '18px', color: theme.textMuted, lineHeight: 1 }}>−</span>
                                <span style={{ minWidth: '1.25rem', textAlign: 'center', fontSize: '15px', fontWeight: 600, color: theme.textBase }}>{item.qty}</span>
                                <span style={{ fontSize: '18px', color: theme.textMuted, lineHeight: 1 }}>+</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {pairingSuggestions.length > 0 && (
                      <section
                        aria-label={t.perfectWithMeal}
                        style={{
                          marginTop: '0.5rem',
                          borderRadius: '1rem',
                          background: theme.bgSurface,
                          border: `1px solid ${theme.borderFaint}`,
                          padding: '1rem',
                          transition: 'background 0.3s',
                        }}
                      >
                        <div style={{ marginBottom: '0.875rem' }}>
                          <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.22em', color: theme.gold, fontFamily: "'Manrope',sans-serif", fontWeight: 700, marginBottom: '0.35rem' }}>
                            {lang === 'ID' ? 'Tambahan Pilihan' : 'Suggested Pairing'}
                          </p>
                          <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.2rem', fontWeight: 400, color: theme.textBase, lineHeight: 1.2 }}>
                            {t.perfectWithMeal}
                          </h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {pairingSuggestions.map((item) => (
                            <div
                              key={`pairing-${item.id}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                borderRadius: '0.875rem',
                                background: theme.bgInput,
                                border: `1px solid ${theme.borderFaint}`,
                                padding: '0.75rem',
                              }}
                            >
                              <div style={{ width: '4rem', height: '4rem', flexShrink: 0, overflow: 'hidden', borderRadius: '0.625rem', background: theme.bgMuted }}>
                                <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontFamily: "'Noto Serif',serif", fontSize: '0.95rem', lineHeight: 1.25, color: theme.textBase, marginBottom: '0.2rem' }}>
                                  {item.name}
                                </p>
                                <p style={{ fontSize: '12px', color: theme.textMuted, lineHeight: 1.45, marginBottom: '0.35rem' }}>
                                  {item.description}
                                </p>
                                <span style={{ fontSize: '12px', fontWeight: 700, color: theme.goldBright }}>
                                  {formatCurrency(item.price)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => onAddSuggestion(item)}
                                style={{
                                  flexShrink: 0,
                                  borderRadius: '9999px',
                                  border: `1px solid rgba(154,116,22,0.28)`,
                                  background: 'rgba(154,116,22,0.12)',
                                  color: theme.goldBright,
                                  padding: '0.55rem 0.9rem',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.12em',
                                  cursor: 'pointer',
                                }}
                              >
                                {lang === 'ID' ? 'Tambah' : 'Add'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div style={{ position: 'fixed', bottom: 0, right: 0, width: '100%', maxWidth: '28rem', zIndex: 10, background: theme.bgBase, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderTop: `1px solid ${theme.borderFaint}`, padding: '1.25rem 1.5rem', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)', transition: 'background 0.3s, border-color 0.3s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '1rem', paddingInline: '0.25rem' }}>
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', color: theme.textMuted, display: 'block', marginBottom: '2px', fontFamily: "'Manrope',sans-serif" }}>{t.total}</span>
                      <span style={{ fontFamily: "'Noto Serif',serif", fontSize: '2rem', fontWeight: 400, color: theme.textBase, lineHeight: 1 }}>{formatCurrency(total)}</span>
                    </div>
                    <button type="button" style={{ fontSize: '13px', color: theme.textMuted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Details</button>
                  </div>
                  <button onClick={() => { onClose(); setTimeout(onCheckout, 300); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', height: '3.75rem', borderRadius: '1rem', background: 'linear-gradient(135deg,#7a5c10,#9a7416)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 28px rgba(119,90,25,0.28)', color: '#fff', fontFamily: "'Manrope',sans-serif", fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', cursor: 'pointer' }}>
                    <span>{lang === 'ID' ? 'Lanjut ke Checkout' : 'Proceed to Checkout'}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                  <div className="sr-only">{t.subtotal}: {formatCurrency(subtotal)}. {t.serviceTax}: {formatCurrency(tax)}.</div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
