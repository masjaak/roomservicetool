import React from 'react';
import { ArrowLeft, MessageSquare, ShoppingBag, Trash2 } from 'lucide-react';
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
              className={`pointer-events-auto flex h-full w-full max-w-2xl flex-col ${guestTheme.bg.canvas} shadow-2xl`}
            >
              <header className={`hcs-safe-top sticky top-0 z-10 flex items-center justify-between border-b ${guestTheme.border.strong} ${guestTheme.bg.canvas}/90 px-6 py-4 backdrop-blur-xl`}>
                <button
                  aria-label="Close cart"
                  onClick={onClose}
                  className={`rounded-full p-2 ${guestTheme.text.primary} transition-colors hover:bg-[var(--hcs-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hcs-primary)]/40`}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className={`font-headline absolute left-1/2 -translate-x-1/2 text-lg font-medium ${guestTheme.text.base}`}>
                  {t.cart}
                </h2>
                <div className="w-9" />
              </header>

              <div className="flex-1 overflow-y-auto px-6 pb-32 pt-8">
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
                        className={`group flex items-start gap-5 rounded-xl border ${guestTheme.border.strong} ${guestTheme.bg.surfaceSoft} p-4`}
                      >
                        <div className={`h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg ${guestTheme.bg.surfaceMuted} shadow-[0_4px_12px_rgba(26,28,27,0.04)]`}>
                          <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="flex min-h-[6rem] flex-1 flex-col justify-between">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className={`font-headline text-lg font-semibold leading-tight ${guestTheme.text.base}`}>
                                {item.name}
                              </h3>
                              {item.note && <p className={`mt-1 text-sm ${guestTheme.text.muted}/80`}>{item.note}</p>}
                            </div>
                            <button
                              aria-label="Remove item"
                              onClick={() => onRemove(index)}
                              className={`p-1 ${guestTheme.text.muted}/50 transition-colors hover:text-[var(--hcs-error)]`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="mt-4 flex items-end justify-between gap-4">
                            <span className={`font-semibold ${guestTheme.text.primary}`}>{formatCurrency(item.price * item.qty)}</span>
                            <div className={`rounded-full border ${guestTheme.border.strong} ${guestTheme.bg.surface} px-3 py-1 text-sm font-semibold ${guestTheme.text.base}`}>
                              Qty {item.qty}
                            </div>
                          </div>
                          {item.note && (
                            <div className={`mt-3 flex items-center gap-2 text-xs italic ${guestTheme.text.muted}`}>
                              <MessageSquare className={`h-3.5 w-3.5 ${guestTheme.text.primary}`} />
                              <span className="line-clamp-1">{item.note}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className={`hcs-safe-bottom fixed bottom-0 right-0 z-10 w-full max-w-2xl border-t ${guestTheme.border.strong} ${guestTheme.bg.canvas}/95 px-6 py-4 backdrop-blur-2xl`}>
                  <div className="mb-4 flex items-end justify-between px-2">
                    <div className="flex flex-col">
                      <span className={`text-xs uppercase tracking-[0.18em] ${guestTheme.text.muted}/70`}>{t.total}</span>
                      <span className={`font-headline text-2xl font-bold ${guestTheme.text.base}`}>{formatCurrency(total)}</span>
                    </div>
                    <div className={`text-right text-sm ${guestTheme.text.muted}`}>
                      <div>{t.subtotal}: {formatCurrency(subtotal)}</div>
                      <div>{t.serviceTax}: {formatCurrency(tax)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      setTimeout(onCheckout, 300);
                    }}
                    className={`flex h-14 w-full items-center justify-center gap-2 rounded-lg ${guestTheme.bg.primary} text-sm font-semibold ${guestTheme.text.onPrimary} shadow-[0_8px_20px_rgba(119,90,25,0.2)] transition-all active:scale-[0.98]`}
                  >
                    {t.checkout}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
