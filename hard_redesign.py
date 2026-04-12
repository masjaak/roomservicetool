import os

def overwrite(path, content):
    with open(path, 'w') as f:
        f.write(content)

# 1. ProductCard.tsx - Huge image, no borders, confident CTA
product_card = """import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { formatCurrency } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  item: MenuItem;
  onClick: () => void;
  freeLabel: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onClick, freeLabel }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left group flex flex-col mb-12 sm:mb-16 outline-none block"
    >
      {/* Huge Bleed Image */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] overflow-hidden bg-[#e7e5e4] mb-5">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105"
        />
        {/* Overlay Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {item.tag && (
            <span className="text-[10px] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[#1c1917] bg-[#fdfbf9] shadow-sm">
              {item.tag}
            </span>
          )}
          {item.serviceTag && (
            <span className="text-[10px] px-3 py-1 font-semibold uppercase tracking-[0.2em] text-[#fdfbf9] bg-[#1c1917] shadow-sm">
              {item.serviceTag}
            </span>
          )}
        </div>
      </div>

      <div className="px-1 sm:px-0 flex flex-col">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-[1.8rem] sm:text-[2rem] leading-[1.1]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 500 }}>
            {item.name}
          </h3>
          <p className="text-[1rem] sm:text-[1.1rem] font-medium tracking-wider" style={{ color: '#1c1917', fontFamily: "'Manrope', sans-serif" }}>
            {item.price > 0 ? formatCurrency(item.price) : freeLabel}
          </p>
        </div>
      
        <p className="text-[1rem] leading-[1.6] line-clamp-2 max-w-2xl mb-6" style={{ color: '#574b3f', fontWeight: 400, fontFamily: "'Manrope', sans-serif" }}>
          {item.description}
        </p>

        <div className="flex flex-row items-center justify-between gap-4 mt-auto pt-2">
          <div className="flex items-center gap-4">
            {item.prepTime && (
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#78716c]">
                {item.prepTime}
              </span>
            )}
            {item.spiceLevel && item.spiceLevel !== 'None' && (
              <span style={{ color: item.spiceLevel === 'Hot' ? '#b91c1c' : '#78716c' }} className="text-[11px] uppercase tracking-[0.2em] font-semibold">
                {item.spiceLevel}
              </span>
            )}
          </div>

          <div className="h-14 px-8 flex items-center justify-center gap-3 text-[12px] uppercase tracking-[0.2em] font-bold transition-all bg-[#f5f5f4] text-[#1c1917] group-hover:bg-[#1c1917] group-hover:text-white">
            <span>View dish</span>
          </div>
        </div>
      </div>
    </button>
  );
};
"""

# 2. MenuView.tsx - Extreme editorial header, clean scrolling, no nested boxes
menu_view = """import React, { useState } from 'react';
import { LogOut, Search, XCircle, SearchX } from 'lucide-react';
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
  roomNumber, cart, addToCart, removeFromCart, onCheckout, onOpenCart, onCloseCart, onLogout, isCartOpen, lang,
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen pb-32" style={{ backgroundColor: '#fdfbf9', fontFamily: "'Manrope', sans-serif" }}>
      
      {/* Super clean header, not sticky, letting the document flow naturally */}
      <div className="w-full px-6 sm:px-12 pt-12 pb-16 flex flex-col justify-start relative">
        <div className="flex justify-between items-start mb-16">
          <p className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: '#78716c' }}>
            Atelier Meridian
          </p>
          <button
            onClick={onLogout}
            className="flex items-center justify-center text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] transition-colors text-[#1c1917] hover:opacity-50"
          >
            <span className="mr-2">{lang === 'ID' ? 'Keluar' : 'Switch Room'}</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <div className="max-w-3xl">
          <p className="text-[12px] font-bold tracking-[0.4em] uppercase mb-6" style={{ color: '#a8a29e' }}>
            {getGreeting()}
          </p>
          <h1 className="text-[3rem] sm:text-[4.5rem] leading-[1]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 500 }}>
            {lang === 'ID' ? 'Layanan Kamar' : 'In-Room Dining'}
          </h1>
          <p className="text-[1.1rem] sm:text-[1.25rem] mt-6 leading-relaxed max-w-xl font-light" style={{ color: '#574b3f' }}>
            {lang === 'ID'
              ? `Pengalaman bersantap elegan di Kamar ${roomNumber}.`
              : `A thoughtfully curated selection of signature dishes for Room ${roomNumber}.`}
          </p>
        </div>
      </div>

      <div className="w-full px-6 sm:px-12 grid gap-16 lg:grid-cols-[280px_minmax(0,1fr)] max-w-[1400px] mx-auto">
        <div className="lg:sticky lg:top-[40px] h-fit">
          <div className="relative border-b-2 mb-10" style={{ borderColor: '#1c1917' }}>
            <input
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-0 pr-10 py-4 text-[1rem] font-medium focus:outline-none transition-all placeholder-[#a8a29e] bg-transparent"
              style={{ color: '#1c1917' }}
            />
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-[#1c1917]">
                <XCircle className="w-5 h-5" />
              </button>
            ) : (
              <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1c1917]" />
            )}
          </div>

          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-2 lg:gap-0 pb-4 lg:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat && !searchQuery;
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
                  className="whitespace-nowrap lg:w-full flex items-center lg:justify-between py-3 lg:py-4 px-4 lg:px-0 text-left transition-all border-b-2 lg:border-b-0 lg:border-l-2"
                  style={{ 
                    borderColor: isActive ? '#1c1917' : 'transparent',
                    opacity: isActive ? 1 : 0.4
                  }}
                >
                  <span className={`text-[12px] sm:text-[13px] uppercase tracking-[0.25em] lg:pl-6 ${isActive ? 'font-bold' : 'font-semibold'}`} style={{ color: '#1c1917' }}>
                    {cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 pb-10">
          <div className="mb-12">
            <h3 className="text-[2.5rem] sm:text-[3.5rem] leading-[1]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 500 }}>
              {searchQuery ? t.search : selectedCategory}
            </h3>
          </div>

          {filteredItems.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center">
              <SearchX className="w-10 h-10 mb-6 mx-auto" style={{ color: '#a8a29e' }} />
              <h3 className="text-[2rem] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917' }}>
                {searchQuery ? t.emptySearchTitle : t.emptyMenuTitle}
              </h3>
            </motion.div>
          ) : (
            <div className="grid gap-x-12 xl:grid-cols-2">
              {filteredItems.map((item) => (
                <ProductCard key={item.id} item={item} onClick={() => setSelectedItem(item)} freeLabel={t.free} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {totalQty > 0 && (
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-0 left-0 right-0 z-40">
            <button
              onClick={onOpenCart}
              className="w-full h-20 px-6 sm:px-12 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform active:scale-[0.99] border-t"
              style={{ backgroundColor: '#1c1917', color: '#ffffff', borderColor: '#292524' }}
            >
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 flex items-center justify-center text-[13px] font-bold bg-white text-[#1c1917] rounded-none">
                  {totalQty}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-[13px] font-bold tracking-[0.25em] uppercase">{t.cart}</span>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <span className="text-[1.2rem] font-medium tracking-wider">{formatCurrency(grandTotal)}</span>
                <span className="text-[12px] uppercase tracking-[0.2em] font-bold underline underline-offset-4 hidden sm:inline">Review</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ItemDetailModal item={selectedItem} isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} onAdd={addToCart} lang={lang} />
      <CartDrawer cart={cart} isOpen={isCartOpen} onClose={onCloseCart} onRemove={removeFromCart} onCheckout={onCheckout} lang={lang} />
    </motion.div>
  );
};
"""

# 3. ItemDetailModal.tsx - Full bleed image, huge CTA, aggressive luxury
item_modal = """import React, { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { formatCurrency } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItem, qty: number, note: string) => void;
  lang: Language;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, isOpen, onClose, onAdd, lang }) => {
  const t = TRANSLATIONS[lang];
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');

  const handleAdd = () => {
    if (item) {
      onAdd(item, qty, note);
      setQty(1); setNote('');
      onClose();
    }
  };

  const handleClose = () => {
    setQty(1); setNote('');
    onClose();
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && item && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="fixed inset-0 bg-[#000000]/40 backdrop-blur-md z-50" />
          <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-center sm:p-6">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-w-2xl bg-[#fdfbf9] pointer-events-auto overflow-hidden shadow-2xl flex flex-col h-[92vh] sm:h-[85vh] relative"
            >
              {/* Massive Bleed Header Image */}
              <div className="relative w-full h-[40vh] sm:h-[45vh] bg-[#e7e5e4] flex-shrink-0">
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-md text-[#1c1917] transition-transform active:scale-95 z-10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 sm:px-12 py-8 bg-[#fdfbf9]">
                <div className="mb-6 flex flex-col gap-2">
                  <h2 className="text-[2.2rem] sm:text-[2.8rem] leading-[1.1]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917' }}>
                    {item.name}
                  </h2>
                  <p className="text-[1.2rem] tracking-wider font-semibold" style={{ color: '#1c1917' }}>
                    {formatCurrency(item.price)}
                  </p>
                </div>

                {item.dietaryTags && item.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {item.dietaryTags.map(tag => (
                      <span key={tag} className="px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-[#e7e5e4] text-[#1c1917]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-[1.05rem] leading-[1.7] font-normal mb-10 text-[#574b3f]">
                  {item.description}
                </p>

                <div className="pt-8 border-t-2 border-[#e7e5e4]">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] mb-4 text-[#1c1917]">
                    {t.specialInstructions}
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={lang === 'ID' ? 'Ketik permintaan khusus di sini...' : 'Type specific preferences here...'}
                    className="w-full text-[1rem] p-5 border-2 outline-none transition-colors border-[#e7e5e4] bg-[#ffffff] focus:border-[#1c1917] resize-none"
                    rows={3}
                  />
                </div>
              </div>

              {/* Huge Bottom Action Bar */}
              <div className="p-6 sm:p-8 shrink-0 bg-white border-t-2 border-[#e7e5e4]">
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto sm:max-w-none">
                  {/* Quantity */}
                  <div className="flex items-center justify-between border-2 border-[#e7e5e4] px-4 w-full sm:w-48 h-16 bg-[#faf8f5]">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} className="w-12 h-12 flex items-center justify-center disabled:opacity-30">
                      <Minus className="w-5 h-5 text-[#1c1917]" />
                    </button>
                    <span className="text-[1.1rem] font-bold text-[#1c1917] w-8 text-center">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="w-12 h-12 flex items-center justify-center">
                      <Plus className="w-5 h-5 text-[#1c1917]" />
                    </button>
                  </div>
                  
                  {/* Huge Add Button */}
                  <button
                    onClick={handleAdd}
                    className="flex-1 h-16 px-8 text-[12px] uppercase tracking-[0.2em] font-bold flex items-center justify-between transition-colors outline-none bg-[#1c1917] text-[#ffffff] active:bg-black"
                  >
                    <span>{t.addToCart}</span>
                    <span className="text-[1.1rem] font-medium tracking-widest">{formatCurrency(item.price * qty)}</span>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
"""

# Write all to disk
overwrite('src/components/ProductCard.tsx', product_card)
overwrite('src/views/MenuView.tsx', menu_view)
overwrite('src/components/ItemDetailModal.tsx', item_modal)

print("Hard redesign applied successfully.")
