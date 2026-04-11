import React, { useState } from 'react';
import { ChevronRight, LogOut, Search, XCircle, SearchX } from 'lucide-react';
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

  const handleLogout = () => {
    onLogout();
  };

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
      className="min-h-screen pb-32"
      style={{ backgroundColor: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-3xl mx-auto min-h-screen relative">
        {/* Header */}
        <div className="sticky top-0 z-30 px-6 pt-8 pb-4" style={{ backgroundColor: '#faf8f5', boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#b8a898' }}>
                {getGreeting()}
              </p>
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                Room {roomNumber}
              </h2>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-all"
              style={{ backgroundColor: 'rgba(45,45,45,0.06)', color: '#b8a898' }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#b8a898' }} />
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl text-sm font-medium focus:outline-none transition-all"
              style={{ backgroundColor: 'rgba(45,45,45,0.04)', color: '#2d2d2d', border: '1px solid rgba(45,45,45,0.08)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: '#b8a898' }}
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex overflow-x-auto hide-scrollbar gap-6 px-6 pb-2 mb-6 border-b" style={{ borderColor: 'rgba(45,45,45,0.06)' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSearchQuery('');
                }}
                className={`whitespace-nowrap pb-3 text-sm font-semibold tracking-wide transition-all relative ${
                  selectedCategory === cat && !searchQuery
                    ? 'text-[#2d2d2d]'
                    : 'text-[#b8a898]'
                }`}
              >
                {cat}
                {selectedCategory === cat && !searchQuery && (
                  <motion.div
                    layoutId="activeCategory"
                    className="absolute bottom-0 left-0 right-0 h-[2px]"
                    style={{ backgroundColor: '#2d2d2d' }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="px-6 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#2d2d2d' }}>
              {searchQuery ? t.search : selectedCategory}
            </h3>
          </div>
        </div>

        {/* Product List */}
        <div className="px-6 flex flex-col">
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 flex flex-col items-center justify-center text-center px-4 rounded-xl border border-dashed"
              style={{ borderColor: 'rgba(184,168,152,0.3)', backgroundColor: 'transparent' }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(45,45,45,0.04)' }}>
                <SearchX className="w-6 h-6" style={{ color: '#b8a898' }} />
              </div>
              <h3 className="text-base font-bold mb-1" style={{ color: '#2d2d2d' }}>
                {searchQuery ? t.emptySearchTitle : t.emptyMenuTitle}
              </h3>
              <p className="text-xs max-w-[200px]" style={{ color: '#b8a898' }}>
                {searchQuery ? t.searchEmpty : t.emptyMenuDesc}
              </p>
            </motion.div>
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
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-0 right-0 px-6 z-40 flex justify-center pointer-events-none"
            >
              <button
                onClick={onOpenCart}
                className="w-full max-w-sm flex items-center justify-between px-6 py-4 rounded-full shadow-2xl pointer-events-auto transition-transform active:scale-95"
                style={{ backgroundColor: '#2d2d2d', color: '#faf8f5', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-[#2d2d2d] bg-[#faf8f5]">
                    {totalQty}
                  </div>
                  <span className="text-sm font-semibold tracking-wide uppercase">{t.cart}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: '#a08850' }}>{formatCurrency(grandTotal)}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
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