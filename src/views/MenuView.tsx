import React, { useState } from 'react';
import { Menu as MenuIcon, SearchX, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { CartItem, Language, MenuItem } from '../types';
import { CATEGORIES, MENU_ITEMS, TRANSLATIONS } from '../data/constants';
import { guestTheme } from '../styles/guestTheme';
import { formatCurrency } from '../utils/format';
import { CartDrawer } from '../components/CartDrawer';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { ProductCard } from '../components/ProductCard';

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

export const MenuView: React.FC<MenuViewProps> = ({
  roomNumber,
  cart,
  addToCart,
  removeFromCart,
  onCheckout,
  onOpenCart,
  onCloseCart,
  onLogout,
  isCartOpen,
  lang,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const t = TRANSLATIONS[lang];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.morning;
    if (hour < 18) return t.afternoon;
    return t.evening;
  };

  const grandTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
  const filteredItems = searchQuery.length > 0
    ? MENU_ITEMS.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : MENU_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`min-h-screen ${guestTheme.bg.canvas} pb-52`}>
      <header className={`hcs-safe-top fixed top-0 z-50 w-full ${guestTheme.bg.canvas}/82 backdrop-blur-xl shadow-[0_20px_40px_rgba(26,28,27,0.06)]`}>
        <div className="hcs-mobile-canvas flex h-16 w-full items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className={`rounded-full p-2 ${guestTheme.text.primary} transition-colors hover:bg-[var(--hcs-surface-muted)]`}
              aria-label="Exit room"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div>
              <h1 className={`font-headline text-[2rem] leading-none ${guestTheme.text.base}`}>
                {getGreeting()} Guest
              </h1>
              <p className={`mt-1 text-[10px] uppercase tracking-[0.18em] ${guestTheme.text.primary}`}>Room {roomNumber}</p>
            </div>
          </div>
          <button
            onClick={onOpenCart}
            className={`relative flex items-center justify-center rounded-full p-2 transition-colors hover:bg-[var(--hcs-surface-muted)]`}
            aria-label="Open cart"
          >
            <ShoppingBag className={`h-6 w-6 ${guestTheme.text.base}`} />
            <span className={`absolute right-1 top-1.5 flex h-4 w-4 items-center justify-center rounded-full ${guestTheme.bg.primary} text-[10px] font-bold ${guestTheme.text.onPrimary}`}>
              {totalQty}
            </span>
          </button>
        </div>
      </header>

      <div className="hcs-mobile-canvas min-h-screen w-full pt-16">
        {!searchQuery && (
          <nav className={`sticky top-16 z-40 overflow-hidden ${guestTheme.bg.canvas}/90 px-6 py-4 backdrop-blur-md`}>
            <div className="hide-scrollbar flex gap-3 overflow-x-auto">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-full px-6 py-2 text-xs uppercase tracking-widest transition-all ${
                    selectedCategory === cat
                      ? `${guestTheme.bg.inverse} ${guestTheme.text.inverse} shadow-md`
                      : `border ${guestTheme.border.base} ${guestTheme.text.muted} hover:bg-[var(--hcs-surface-muted)]`
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </nav>
        )}

        <main>
          <section className="px-6 py-10">
            <div>
              <p className={`mb-2 text-[10px] font-bold uppercase tracking-[0.2em] ${guestTheme.text.primary}`}>Atelier Meridian</p>
              <h2 className={`font-headline mb-5 text-[4.2rem] leading-[0.92] tracking-tight ${guestTheme.text.base}`}>
                {searchQuery ? t.search : t.dinnerMenu}
              </h2>
              <p className={`text-[1.1rem] leading-[1.65] ${guestTheme.text.muted}`}>{t.curatedMenuIntro}</p>
            </div>
          </section>

          <section className="space-y-8 px-6">
            {filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
                <div className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${guestTheme.bg.surfaceMuted}`}>
                  <SearchX className={`h-6 w-6 ${guestTheme.text.primary}/50`} />
                </div>
                <h3 className={`font-headline text-2xl ${guestTheme.text.base}`}>
                  {searchQuery ? t.emptySearchTitle : t.emptyMenuTitle}
                </h3>
                <p className={`mt-2 max-w-sm text-sm leading-relaxed ${guestTheme.text.muted}`}>
                  {searchQuery ? t.searchEmpty : t.emptyMenuDesc}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                  onAdd={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    addToCart(item, 1, '');
                  }}
                  freeLabel={t.free}
                />
              ))
            )}
          </section>

          {!searchQuery && (
            <section className="px-6 py-8">
              <div className={`relative flex h-60 items-end overflow-hidden ${guestTheme.bg.inverse} p-8`}>
                <div className="absolute inset-0 opacity-40">
                  <img src="/assets/hero.jpg" alt="" className="h-full w-full object-cover" />
                </div>
                <div className="relative z-10">
                  <h4 className={`font-headline mb-2 text-[3rem] leading-[0.98] ${guestTheme.text.inverse}`}>{t.perfectWithMeal}</h4>
                  <p className={`text-sm uppercase tracking-[0.14em] ${guestTheme.text.inverse}/70`}>Explore our sommelier&apos;s selection</p>
                </div>
              </div>
            </section>
          )}
        </main>

        <AnimatePresence>
          {totalQty > 0 && (
            <motion.div
              initial={{ y: 150 }}
              animate={{ y: 0 }}
              exit={{ y: 150 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="hcs-safe-bottom-space pointer-events-none fixed bottom-6 left-1/2 z-40 hcs-mobile-canvas w-[calc(100%-3rem)] -translate-x-1/2 px-6"
            >
              <button
                onClick={onOpenCart}
                aria-label="Open cart"
                className={`pointer-events-auto flex h-16 w-full items-center justify-between rounded-full ${guestTheme.bg.inverse} ${guestTheme.text.inverse} px-2 shadow-[0_20px_40px_rgba(0,0,0,0.3)] backdrop-blur-md`}
              >
                <div className="pl-6 text-left">
                  <p className={`text-[10px] uppercase tracking-[0.2em] ${guestTheme.text.inverse}/60`}>
                    {t.cart}: {totalQty} {totalQty > 1 ? 'Items' : 'Item'}
                  </p>
                  <p className="font-headline text-lg leading-none">{formatCurrency(grandTotal)}</p>
                </div>
                <span className={`rounded-full ${guestTheme.bg.primary} px-8 py-4 text-xs font-bold uppercase tracking-[0.18em] ${guestTheme.text.onPrimary}`}>
                  {t.viewOrder}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {!searchQuery && (
          <nav className={`fixed bottom-0 left-0 z-20 h-20 w-full ${guestTheme.bg.surface}/70 backdrop-blur-2xl`}>
            <div className="hcs-mobile-canvas flex h-full items-center justify-around px-8">
              <div className={`relative flex flex-col items-center justify-center ${guestTheme.text.primary}`}>
                <span className="text-lg">•</span>
                <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]">Menu</span>
              </div>
              <div className={`${guestTheme.text.muted}/45 text-[10px] font-bold uppercase tracking-[0.12em]`}>Orders</div>
              <div className={`${guestTheme.text.muted}/45 text-[10px] font-bold uppercase tracking-[0.12em]`}>Suite</div>
              <div className={`${guestTheme.text.muted}/45 text-[10px] font-bold uppercase tracking-[0.12em]`}>Inquiry</div>
            </div>
          </nav>
        )}

        <ItemDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={addToCart}
          lang={lang}
        />

        <CartDrawer
          cart={cart}
          isOpen={isCartOpen}
          onClose={onCloseCart}
          onRemove={removeFromCart}
          onCheckout={onCheckout}
          lang={lang}
        />
      </div>
    </motion.div>
  );
};
