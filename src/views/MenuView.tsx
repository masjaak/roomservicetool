import React, { useState } from 'react';
import { LogOut, Search, XCircle, SearchX, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, CartItem, Language } from '../types';
import { CATEGORIES, MENU_ITEMS, TRANSLATIONS } from '../data/constants';
import { formatCurrency } from '../utils/format';
import { ProductCard } from '../components/ProductCard';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { CartDrawer } from '../components/CartDrawer';

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
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-36 bg-[#fdfbf9]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-4xl mx-auto min-h-screen relative">
        {/* Top Header */}
        <div className="px-6 sm:px-8 pt-10 pb-6">
          <div className="flex flex-row items-start justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#a08850] mb-2">
                {getGreeting()}
              </p>
              <h2 className="text-[2.5rem] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: '#1c1917' }}>
                Room {roomNumber}
              </h2>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 flex items-center justify-center gap-2 border border-[#e7e5e4] text-[10px] font-bold uppercase tracking-widest text-[#1c1917] hover:bg-[#1c1917] hover:text-white transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]/50"
            >
              <span className="hidden sm:inline">{lang === 'ID' ? 'Keluar' : 'Exit'}</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8a29e]" />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-[#f5f5f4] text-[0.95rem] font-medium text-[#1c1917] placeholder-[#a8a29e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]/20 transition-shadow border-none"
            />
            {searchQuery && (
              <button aria-label="Clear search" onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#a8a29e] hover:text-[#1c1917] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]/50 rounded-full">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sticky Category Navigation */}
        {!searchQuery && (
          <div className="sticky top-0 z-30 bg-[#fdfbf9]/90 backdrop-blur-md border-b border-[#e7e5e4] px-4">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 py-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-[12px] font-bold tracking-wider uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]/50 ${
                    selectedCategory === cat
                      ? 'bg-[#1c1917] text-[#ffffff]'
                      : 'bg-transparent text-[#78716c] hover:bg-[#f5f5f4]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List Header */}
        <div className="px-6 sm:px-8 mt-6 mb-4">
          <h3 className="text-[1.2rem] font-bold" style={{ color: '#1c1917', fontFamily: "'DM Serif Display', serif" }}>
            {searchQuery ? t.search : selectedCategory}
          </h3>
        </div>

        {/* Item List */}
        <div className="px-6 sm:px-8 flex flex-col">
          {filteredItems.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-[#f5f5f4] flex items-center justify-center mb-4">
                <SearchX className="w-6 h-6 text-[#a8a29e]" />
              </div>
              <h3 className="text-[1.25rem] font-bold text-[#1c1917] mb-2 font-serif">
                {searchQuery ? t.emptySearchTitle : t.emptyMenuTitle}
              </h3>
              <p className="text-[0.95rem] text-[#78716c] max-w-xs leading-relaxed">
                {searchQuery ? t.searchEmpty : t.emptyMenuDesc}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
                freeLabel={t.free}
              />
            ))
          )}
        </div>

        {/* Floating Cart CTA */}
        <AnimatePresence>
          {totalQty > 0 && (
            <motion.div
              initial={{ y: 150 }}
              animate={{ y: 0 }}
              exit={{ y: 150 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-6 left-0 right-0 px-6 z-40 flex justify-center pointer-events-none"
            >
              <button
                onClick={onOpenCart}
                aria-label="Open cart"
                className="w-full max-w-md h-16 flex items-center justify-between px-6 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] pointer-events-auto transition-transform active:scale-[0.98] bg-[#1c1917] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1c1917]/50"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <ShoppingBag className="w-5 h-5 text-white" />
                    <div className="absolute -top-2 -right-3 w-5 h-5 bg-[#a08850] rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm border border-[#1c1917]">
                      {totalQty}
                    </div>
                  </div>
                  <span className="text-[12px] font-bold tracking-widest uppercase ml-2">{t.cart}</span>
                </div>
                <span className="text-[14px] font-bold text-[#a08850]">{formatCurrency(grandTotal)}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlays */}
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
