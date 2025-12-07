import React, { useState } from 'react';
import { ChevronRight, LogOut, Search, XCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { MenuItem, CartItem, Language } from '../types';
import { CATEGORIES, MENU_ITEMS, TRANSLATIONS, PROMO_BANNERS } from '../data/constants';
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

  const [searchQuery, setSearchQuery] = useState("");

  // Initialize Embla Carousel with Autoplay
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000 })]);

  const handleLogout = () => {
    if (window.confirm("Ganti nomor kamar? Keranjang akan dikosongkan.")) {
      localStorage.removeItem('ciputra_cart');
      window.location.reload();
    }
  };

  

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

  // --- GANTI LOGIC FILTER LAMA DENGAN INI ---
  const filteredItems = searchQuery.length > 0 
    ? MENU_ITEMS.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : MENU_ITEMS.filter(item => item.category === selectedCategory);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-50 font-sans pb-32"
    >
      <div className="w-full max-w-3xl mx-auto bg-slate-50 min-h-screen relative shadow-2xl shadow-slate-200/50">
        
        {/* Header */}
       {/* --- COPY DARI SINI --- */}
        <div className="bg-white sticky top-0 z-30 px-6 pt-8 pb-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between mb-6">
             <div>
               <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">{getGreeting()}</p>
               <h2 className="text-2xl font-serif font-bold text-slate-900">Room {roomNumber}</h2>
             </div>
             
             {/* 1. INI TOMBOL LOGOUT + FOTO PROFIL */}
             <div className="flex items-center gap-3">
                <button 
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* 2. INI SEARCH BAR BARU */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 text-slate-900 pl-11 pr-10 py-3 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 3. KATEGORI (Hilang otomatis kalau lagi search) */}
          {searchQuery.length === 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-6 px-6 scroll-smooth">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)} 
                  className={`
                    px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex-shrink-0 flex items-center gap-1.5
                    ${cat === 'PROMO' 
                      ? selectedCategory === cat
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-transparent shadow-lg scale-105'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-transparent shadow-md hover:shadow-lg hover:scale-105'
                      : selectedCategory === cat 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'
                    }
                  `}
                >
                  {cat === 'PROMO' && <Sparkles className="w-3.5 h-3.5" />}
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* --- SAMPAI SINI --- */}

        {/* Product List */}
        <div className="p-6 space-y-5 animate-in fade-in duration-500">
          {/* Promo Carousel Banner */}
          {selectedCategory === 'PROMO' && (
            <div className="embla overflow-hidden rounded-3xl shadow-2xl mb-6" ref={emblaRef}>
              <div className="embla__container flex">
                {PROMO_BANNERS.map((banner) => (
                  <div 
                    key={banner.id} 
                    className="embla__slide flex-[0_0_100%] min-w-0 relative"
                    style={{ aspectRatio: '21/9' }}
                  >
                    <img 
                      src={banner.image} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                      <div className="p-8 pb-6">
                        <motion.h2 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-white font-bold tracking-tight"
                        >
                          {banner.title}
                        </motion.h2>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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