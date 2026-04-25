import React, { useState } from 'react';
import { SearchX, ShoppingBag, LogOut, Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartItem, Language, MenuItem } from '../types';
import { CATEGORIES, MENU_ITEMS, TRANSLATIONS } from '../data/constants';
import { formatCurrency } from '../utils/format';
import { CartDrawer } from '../components/CartDrawer';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { ProductCard } from '../components/ProductCard';
import { useTheme } from '../contexts/ThemeContext';

interface MenuViewProps {
  roomNumber: string;
  cart: CartItem[];
  addToCart: (item: MenuItem, qty: number, note: string) => void;
  removeFromCart: (index: number) => void;
  onCheckout: () => void;
  onOpenCart: () => void;
  onCloseCart: () => void;
  onLogout: () => void;
  isCartOpen: boolean;
  lang: Language;
}

const CATEGORY_LABELS = ['Breakfast', 'Mains', 'Beverages', 'Snacks'];

export const MenuView: React.FC<MenuViewProps> = ({
  roomNumber, cart, addToCart, removeFromCart,
  onCheckout, onOpenCart, onCloseCart, onLogout, isCartOpen, lang,
}) => {
  const { theme, toggle: toggleTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const tr = TRANSLATIONS[lang];
  const isLight = theme.mode === 'light';

  const grandTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const totalQty = cart.reduce((a, i) => a + i.qty, 0);
  const filteredItems = MENU_ITEMS.filter((i) => i.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100dvh',
        background: theme.bgBase,
        fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 5rem)',
        transition: 'background 0.3s',
      }}
    >
      {/* ── Header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: theme.bgHeader,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.borderFaint}`,
        transition: 'background 0.3s, border-color 0.3s',
      }}>
        <div style={{ maxWidth: '28rem', marginInline: 'auto', paddingTop: 'env(safe-area-inset-top)' }}>
          <div style={{ height: '3.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingInline: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.28em', color: theme.textMuted, fontFamily: "'Manrope',sans-serif", marginBottom: '1px', transition: 'color 0.3s' }}>
                {lang === 'ID' ? 'Kamar' : 'Room'} {roomNumber}
              </p>
              <h1 style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.15rem', fontWeight: 400, fontStyle: 'italic', color: theme.textBase, lineHeight: 1, transition: 'color 0.3s' }}>
                Atelier Meridian
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              {/* Theme toggle */}
              <button onClick={toggleTheme} aria-label="Toggle theme"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: isLight ? 'rgba(26,23,20,0.07)' : 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', color: theme.goldBright, transition: 'background 0.3s, color 0.3s' }}>
                {isLight ? <Moon size={16} /> : <Sun size={16} />}
              </button>
              <button onClick={onOpenCart} aria-label="Open cart"
                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: isLight ? 'rgba(26,23,20,0.07)' : 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', color: theme.textBase, transition: 'background 0.3s' }}>
                <ShoppingBag size={18} />
                {totalQty > 0 && (
                  <span style={{ position: 'absolute', top: '1px', right: '1px', minWidth: '1rem', height: '1rem', borderRadius: '9999px', background: theme.gold, color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                    {totalQty}
                  </span>
                )}
              </button>
              <button onClick={onLogout} aria-label="Switch room"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '2.25rem', height: '2.25rem', borderRadius: '9999px', background: isLight ? 'rgba(26,23,20,0.07)' : 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', color: theme.textMuted, transition: 'background 0.3s' }}>
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '28rem', marginInline: 'auto', paddingTop: 'calc(env(safe-area-inset-top) + 3.75rem)' }}>
        {/* Category tabs */}
        <nav style={{ position: 'sticky', top: 'calc(env(safe-area-inset-top) + 3.75rem)', zIndex: 40, background: isLight ? 'rgba(250,249,247,0.94)' : 'rgba(13,12,11,0.94)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: `1px solid ${theme.borderFaint}`, padding: '0.75rem 1.5rem', transition: 'background 0.3s' }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {CATEGORY_LABELS.map((label, i) => {
              const cat = CATEGORIES[Math.min(i, CATEGORIES.length - 1)];
              const active = selectedCategory === cat;
              return (
                <button key={label} onClick={() => setSelectedCategory(cat)}
                  style={{ whiteSpace: 'nowrap', borderRadius: '9999px', padding: '0.45rem 1.1rem', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'Manrope',sans-serif", fontWeight: 700, flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s',
                    border: active ? `1px solid rgba(154,116,22,0.45)` : `1px solid ${theme.border}`,
                    background: active ? 'rgba(154,116,22,0.14)' : theme.bgInput,
                    color: active ? theme.goldBright : theme.textMuted,
                  }}>
                  {label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Section heading */}
        <section style={{ padding: '1.75rem 1.5rem 1rem' }}>
          <p style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.28em', color: theme.gold, fontFamily: "'Manrope',sans-serif", fontWeight: 700, marginBottom: '0.4rem', transition: 'color 0.3s' }}>
            Atelier Meridian
          </p>
          <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: '2.1rem', fontWeight: 400, color: theme.textBase, lineHeight: 1.1, marginBottom: '0.625rem', transition: 'color 0.3s' }}>
            {tr.dinnerMenu}
          </h2>
          <p style={{ maxWidth: '22rem', fontSize: '13px', lineHeight: 1.7, color: theme.textMuted, transition: 'color 0.3s' }}>
            {tr.curatedMenuIntro}
          </p>
        </section>

        {/* Menu items */}
        <main style={{ paddingInline: '1.5rem' }}>
          {filteredItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '9999px', background: theme.bgMuted }}>
                <SearchX size={24} color={theme.textMuted} />
              </div>
              <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.5rem', color: theme.textBase, fontWeight: 400 }}>{tr.emptyMenuTitle}</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '14px', color: theme.textMuted, maxWidth: '20rem', lineHeight: 1.6 }}>{tr.emptyMenuDesc}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredItems.map((item) => (
                <ProductCard key={item.id} item={item}
                  onClick={() => setSelectedItem(item)}
                  onAdd={(e) => { e.stopPropagation(); addToCart(item, 1, ''); }}
                  freeLabel={tr.free} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Floating cart CTA */}
      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            style={{ position: 'fixed', bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)', left: '50%', transform: 'translateX(-50%)', width: 'calc(min(28rem, 100%) - 3rem)', zIndex: 40 }}>
            <button onClick={onOpenCart} aria-label="Open cart"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '3.75rem', borderRadius: '1.25rem', background: 'linear-gradient(135deg,#7a5c10,#9a7416)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 16px 40px rgba(119,90,25,0.38)', padding: '0 0.5rem 0 1.5rem', cursor: 'pointer' }}>
              <div>
                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.65)', fontFamily: "'Manrope',sans-serif", fontWeight: 700 }}>
                  {tr.cart}: {totalQty} {totalQty > 1 ? 'Items' : 'Item'}
                </p>
                <p style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.15rem', fontWeight: 400, color: '#fff', lineHeight: 1 }}>{formatCurrency(grandTotal)}</p>
              </div>
              <span style={{ borderRadius: '0.875rem', background: 'rgba(255,255,255,0.14)', padding: '0.75rem 1.25rem', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#fff', fontFamily: "'Manrope',sans-serif" }}>
                {tr.viewOrder}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20, background: theme.bgNav, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: `1px solid ${theme.borderFaint}`, paddingBottom: 'env(safe-area-inset-bottom)', transition: 'background 0.3s, border-color 0.3s' }}>
        <div style={{ maxWidth: '28rem', marginInline: 'auto', height: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-around', paddingInline: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: theme.gold }}>
            <span style={{ fontSize: '10px', lineHeight: 1 }}>●</span>
            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Manrope',sans-serif" }}>Menu</span>
          </div>
          {['Orders', 'Suite', 'Inquiry'].map((l) => (
            <span key={l} style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: theme.textMuted, opacity: 0.45, fontFamily: "'Manrope',sans-serif" }}>{l}</span>
          ))}
        </div>
      </nav>

      <ItemDetailModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} onAdd={addToCart} lang={lang} />
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        onClose={onCloseCart}
        onRemove={removeFromCart}
        onAddSuggestion={(item) => addToCart(item, 1, '')}
        onCheckout={onCheckout}
        lang={lang}
      />
    </motion.div>
  );
};
