import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { MenuItem, CartItem, Language } from '../types';
import { CATEGORIES, MENU_ITEMS, TRANSLATIONS } from '../data/constants';
// Kita bypass formatCurrency luar
// import { formatCurrency } from '../utils/format';
import { ProductCard } from '../components/ProductCard';
import { ItemDetailModal } from '../components/ItemDetailModal';
import { CartDrawer } from '../components/CartDrawer';

interface MenuViewProps {
  roomNumber: string;
  cart: CartItem[];
  addToCart: (item: MenuItem, qty: number, note: string) => void;
  removeFromCart: (index: number) => void;
  onCheckout: () => void;
  lang: Language;
}

export const MenuView: React.FC<MenuViewProps> = ({ 
  roomNumber, 
  cart, 
  addToCart, 
  removeFromCart, 
  onCheckout,
  lang 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  // --- 1. JURUS PEMBERSIH ANGKA ---
  const parseNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    const cleanStr = String(value).replace(/[^0-9]/g, '');
    return parseInt(cleanStr, 10) || 0;
  };

  // --- 2. FORMAT RUPIAH ---
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.morning;
    if (hour < 18) return t.afternoon;
    return t.evening;
  };

  // --- 3. HITUNG GRAND TOTAL & TOTAL QTY YANG AMAN ---
  const grandTotal = cart.reduce((sum, item) => {
    const p = parseNumber(item.price);
    const q = parseNumber(item.qty);
    return sum + (p * q);
  }, 0);

  const totalQty = cart.reduce((acc, item) => {
    return acc + parseNumber(item.qty);
  }, 0);

  const filteredItems = MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 font-sans pb-32"
    >
      <div className="w-full max-w-3xl mx-auto bg-slate-50 min-h-screen relative shadow-2xl shadow-slate-200/50">
        
        {/* Header */}
        <div className="bg-white sticky top-0 z-30 px-6 pt-8 pb-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-6">
             <div>
               <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">{getGreeting()}</p>
               <h2 className="text-2xl font-serif font-bold text-slate-900">Room {roomNumber}</h2>
             </div>
             <div className="w-10 h-10 bg-orange-50 rounded-full overflow-hidden border border-orange-100">
               <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${roomNumber}`} alt="user" />
             </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6 scroll-smooth">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)} 
                className={`
                  px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0
                  ${selectedCategory === cat 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        <div className="p-6 space-y-5 animate-in fade-in duration-500">
          {filteredItems.map((item) => (
            <ProductCard 
              key={item.id} 
              item={item} 
              onClick={() => setSelectedItem(item)} 
              freeLabel={t.free}
            />
          ))}
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
                  onClick={() => setIsCartOpen(true)} 
                  className="w-full bg-slate-900 text-white p-2 pr-6 rounded-full shadow-2xl shadow-slate-900/30 flex justify-between items-center hover:bg-slate-800 transition-colors active:scale-[0.98]"
                >
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white text-slate-900 rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
                       {/* Total Qty yang aman */}
                       {totalQty}
                     </div>
                     <div className="text-left">
                       <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">{t.total}</p>
                       {/* Grand Total yang aman */}
                       <p className="font-bold text-base">{formatRupiah(grandTotal)}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-2 font-bold text-xs tracking-widest uppercase">
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
          onClose={() => setIsCartOpen(false)} 
          onRemove={removeFromCart}
          onCheckout={onCheckout}
          lang={lang}
        />
      </div>
    </motion.div>
  );
};