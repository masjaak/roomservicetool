import React, { useState } from 'react';
import { ChevronRight, LogOut, Search, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
          {searchQuery.length === 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
                  style={
                    selectedCategory === cat
                      ? { backgroundColor: '#2d2d2d', color: '#faf8f5', border: '1px solid #2d2d2d' }
                      : { backgroundColor: 'transparent', color: '#3a3a3a', border: '1px solid rgba(45,45,45,0.15)' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product List */}
        <div className="p-6 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm font-medium" style={{ color: '#b8a898' }}>
              {searchQuery ? t.searchEmpty : 'No items found.'}
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

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <div className="fixed bottom-8 left-0 right-0 z-40 flex justify-center px-6 pointer-events-none">
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full max-w-md pointer-events-auto"
            >
              <button
                onClick={onOpenCart}
                className="w-full p-2 pr-6 rounded-full flex justify-between items-center transition-colors active:scale-[0.98]"
                style={{ backgroundColor: '#2d2d2d', color: '#faf8f5', boxShadow: '0 8px 32px rgba(45,45,45,0.25)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl" style={{ backgroundColor: '#faf8f5', color: '#2d2d2d' }}>
                    {totalQty}
                  </div>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#b8a898' }}>{t.total}</p>
                    <p className="font-bold text-base">{formatCurrency(grandTotal)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 font-semibold text-xs tracking-widest uppercase">
                  {t.cart} <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          </div>
        )}

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