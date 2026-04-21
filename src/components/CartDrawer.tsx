import React from 'react';
import { ArrowLeft, MessageSquare, PencilLine, ShoppingBag, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartItem, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { guestTheme } from '../styles/guestTheme';
import { calculateSubtotal, calculateTax, calculateTotal, formatCurrency } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface CartDrawerProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (index: number) => void;
  onCheckout: () => void;
  lang: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  cart,
  isOpen,
  onClose,
  onRemove,
  onCheckout,
  lang,
}) => {
  const t = TRANSLATIONS[lang];
  const subtotal = calculateSubtotal(cart);
  const tax = calculateTax(subtotal);
  const total = calculateTotal(subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 ${guestTheme.bg.overlay} backdrop-blur-sm`}
            onClick={onClose}
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className={`pointer-events-auto hcs-mobile-canvas flex h-full w-full flex-col ${guestTheme.bg.canvas} shadow-2xl`}
            >
              <header className={`hcs-safe-top sticky top-0 z-10 flex items-center justify-between ${guestTheme.bg.canvas}/90 px-6 py-5 backdrop-blur-xl`}>
                <button
                  aria-label="Close cart"
                  onClick={onClose}
                  className={`rounded-full p-2 ${guestTheme.text.muted} transition-colors hover:bg-[var(--hcs-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hcs-primary)]/40`}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className={`font-headline absolute left-1/2 -translate-x-1/2 text-3xl font-semibold ${guestTheme.text.base}`}>
                  {t.cart}
                </h2>
                <div className="w-9" />
              </header>

              <div className="flex-1 overflow-y-auto px-6 pb-40 pt-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${guestTheme.bg.surfaceMuted}`}>
                      <ShoppingBag className={`h-6 w-6 ${guestTheme.text.primary}/50`} />
                    </div>
                    <p className={`font-headline text-2xl ${guestTheme.text.base}`}>{t.emptyCart}</p>
                    <p className={`mt-3 max-w-sm text-sm ${guestTheme.text.muted}`}>
                      {lang === 'ID' ? 'Item pilihan Anda akan muncul di sini.' : 'Your selected items will appear here.'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${item.note}-${index}`}
                        className={`group rounded-[1.4rem] ${guestTheme.bg.surface} p-5 shadow-[0_0_0_1px_rgba(227,226,224,0.65)]`}
                      >
                        <div className="flex items-start gap-5">
                          <div className={`h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg ${guestTheme.bg.surfaceMuted}`}>
                            <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex min-h-[7rem] flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className={`font-headline text-[2rem] leading-[1.05] ${guestTheme.text.base}`}>
                                  {item.name}
                                </h3>
                                {item.note && <p className={`mt-2 max-w-[10rem] text-base ${guestTheme.text.muted}`}>{item.note}</p>}
                              </div>
                              <button
                                aria-label="Remove item"
                                onClick={() => onRemove(index)}
                                className={`p-1 ${guestTheme.text.muted}/55 transition-colors hover:text-[var(--hcs-error)]`}
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                            <div className="mt-5 flex items-end justify-between gap-4">
                              <span className={`text-2xl font-semibold ${guestTheme.text.primary}`}>{formatCurrency(item.price * item.qty)}</span>
                              <div className={`flex items-center gap-5 rounded-full ${guestTheme.bg.surface} px-4 py-2 shadow-[0_0_0_1px_rgba(227,226,224,0.75)]`}>
                                <span className={`text-2xl ${guestTheme.text.muted}`}>−</span>
                                <span className={`min-w-4 text-center text-xl font-semibold ${guestTheme.text.base}`}>{item.qty}</span>
                                <span className={`text-2xl ${guestTheme.text.muted}`}>+</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className={`mt-1 inline-flex items-center gap-3 self-start text-xl ${guestTheme.text.primary}`}
                    >
                      <PencilLine className="h-5 w-5" />
                      <span>{lang === 'ID' ? 'Tambah catatan pesanan' : 'Add an order note'}</span>
                    </button>
                    <section className="pt-10">
                      <p className={`mb-5 border-b ${guestTheme.border.strong} pb-3 text-xs uppercase tracking-[0.2em] ${guestTheme.text.muted}/80`}>
                        {lang === 'ID' ? 'Cocok untuk pesanan Anda' : 'Perfect with your meal'}
                      </p>
                      <div className="-mx-6 hide-scrollbar flex gap-4 overflow-x-auto px-6 pb-2">
                        {[...cart].slice(0, 2).map((item, index) => (
                          <div
                            key={`${item.id}-cross-sell-${index}`}
                            className={`flex min-w-[18rem] items-center gap-4 rounded-lg ${guestTheme.bg.surface} p-3 shadow-[0_0_0_1px_rgba(227,226,224,0.75)]`}
                          >
                            <div className={`h-16 w-16 overflow-hidden rounded-md ${guestTheme.bg.surfaceMuted}`}>
                              <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-lg font-medium ${guestTheme.text.base}`}>{item.name}</p>
                              <p className={`mt-1 text-sm ${guestTheme.text.primary}`}>+{formatCurrency(Math.max(item.price * 0.2, 60000))}</p>
                            </div>
                            <div className={`flex h-14 w-14 items-center justify-center rounded-full ${guestTheme.bg.surfaceSoft} ${guestTheme.text.primary}`}>
                              +
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className={`hcs-safe-bottom fixed bottom-0 right-0 z-10 hcs-mobile-canvas w-full ${guestTheme.bg.canvas}/96 px-6 py-4 backdrop-blur-2xl shadow-[0_-12px_32px_rgba(26,28,27,0.06)]`}>
                  <div className="mb-4 flex items-end justify-between px-2">
                    <div className="flex flex-col">
                      <span className={`text-xs uppercase tracking-[0.18em] ${guestTheme.text.muted}/70`}>{t.total}</span>
                      <span className={`font-headline text-[2.1rem] leading-none ${guestTheme.text.base}`}>{formatCurrency(total)}</span>
                    </div>
                    <button type="button" className={`text-lg underline underline-offset-4 ${guestTheme.text.primary}`}>Details</button>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(onCheckout, 300);
                    }}
                    className={`flex h-16 w-full items-center justify-center gap-3 rounded-md ${guestTheme.bg.primary} text-xl font-medium ${guestTheme.text.onPrimary} shadow-[0_8px_24px_rgba(119,90,25,0.24)] transition-all active:scale-[0.98]`}
                  >
                    <span>{lang === 'ID' ? 'Lanjut ke Checkout' : 'Proceed to Checkout'}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                  <div className="sr-only">
                    {t.subtotal}: {formatCurrency(subtotal)}. {t.serviceTax}: {formatCurrency(tax)}.
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
