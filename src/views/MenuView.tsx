import React, { useState } from 'react';
import { LogOut, Search, XCircle, SearchX, Sparkles, Clock3, UtensilsCrossed, ArrowUpRight } from 'lucide-react';
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
  const categoryCounts = CATEGORIES.map((category) => ({
    category,
    count: MENU_ITEMS.filter((item) => item.category === category).length,
  }));

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
  const heroTitle = lang === 'ID' ? `Private dining untuk Kamar ${roomNumber}` : `Private dining for Room ${roomNumber}`;
  const heroEyebrow = lang === 'ID' ? 'Dikurasi sepanjang hari' : 'Curated around the clock';
  const heroDescription = lang === 'ID'
    ? 'Pilihan hidangan khas, comfort food, dan minuman dipresentasikan dengan ritme yang lebih rapi dan mudah dijelajahi.'
    : 'A more composed in-room dining experience with signature plates, classics, and refreshments presented with clear hierarchy.';
  const sectionTitle = lang === 'ID' ? 'Pilihan kurasi' : 'Curated selection';
  const sectionDescription = lang === 'ID'
    ? 'Jelajahi berdasarkan kategori atau gunakan pencarian untuk menemukan hidangan yang tepat.'
    : 'Browse by course or search directly to find the right dish for the moment.';

  const filteredItems = searchQuery.length > 0
    ? MENU_ITEMS.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : MENU_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-36"
      style={{ backgroundColor: '#faf8f5', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full max-w-6xl mx-auto min-h-screen relative">
        {/* Header */}
        <div className="sticky top-0 z-30 px-5 sm:px-6 pt-5 pb-4 backdrop-blur-md" style={{ backgroundColor: 'rgba(250,248,245,0.92)', boxShadow: '0 1px 0 rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#b8a898' }}>
                {getGreeting()}
              </p>
              <h2 className="text-2xl sm:text-[2rem] leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                {heroTitle}
              </h2>
            </div>
            <button
              onClick={handleLogout}
              className="h-11 px-4 flex items-center justify-center rounded-full transition-all text-[10px] font-bold uppercase tracking-[0.28em]"
              style={{ backgroundColor: '#fff', color: '#7c6a54', border: '1px solid rgba(45,45,45,0.08)' }}
            >
              <span className="hidden sm:inline mr-2">{lang === 'ID' ? 'Keluar' : 'Switch'}</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-[28px] border px-5 py-5 sm:px-7 sm:py-6" style={{ backgroundColor: '#2d2d2d', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-[0.28em]" style={{ color: '#c4b5a4' }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{heroEyebrow}</span>
              </div>
              <p className="text-sm sm:text-[15px] leading-7 max-w-2xl" style={{ color: 'rgba(250,248,245,0.76)' }}>
                {heroDescription}
              </p>
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  {
                    icon: Clock3,
                    title: lang === 'ID' ? 'Estimasi' : 'Estimated',
                    value: '20-30 min',
                  },
                  {
                    icon: UtensilsCrossed,
                    title: lang === 'ID' ? 'Pilihan' : 'Selection',
                    value: `${MENU_ITEMS.length} ${lang === 'ID' ? 'hidangan' : 'dishes'}`,
                  },
                  {
                    icon: ArrowUpRight,
                    title: lang === 'ID' ? 'Layanan' : 'Service',
                    value: '21%',
                  },
                ].map(({ icon: Icon, title, value }) => (
                  <div key={title} className="rounded-[22px] px-4 py-4 border" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
                    <Icon className="w-4 h-4 mb-3" style={{ color: '#c4b5a4' }} />
                    <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: 'rgba(250,248,245,0.55)' }}>{title}</p>
                    <p className="text-sm font-semibold" style={{ color: '#faf8f5' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border px-5 py-5 sm:px-6 sm:py-6" style={{ backgroundColor: '#f3eee7', borderColor: 'rgba(45,45,45,0.08)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-3" style={{ color: '#8a7648' }}>
                {sectionTitle}
              </p>
              <p className="text-sm leading-7 mb-5" style={{ color: '#574b3f' }}>
                {sectionDescription}
              </p>
              <div className="space-y-3">
                {categoryCounts.slice(0, 3).map(({ category, count }) => (
                  <div key={category} className="flex items-center justify-between rounded-[18px] px-4 py-3" style={{ backgroundColor: '#fff', border: '1px solid rgba(45,45,45,0.06)' }}>
                    <span className="text-sm font-semibold" style={{ color: '#2d2d2d' }}>{category}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: '#8a7648' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-6 pt-6 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-[230px] h-fit space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8a7648' }} />
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-4 rounded-2xl text-sm font-medium focus:outline-none transition-all"
                style={{ backgroundColor: '#fff', color: '#2d2d2d', border: '1px solid rgba(45,45,45,0.08)' }}
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

            <div className="rounded-[28px] border p-3" style={{ backgroundColor: '#fff', borderColor: 'rgba(45,45,45,0.06)' }}>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat && !searchQuery;
                const categoryCount = MENU_ITEMS.filter((item) => item.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between rounded-[20px] px-4 py-3 text-left transition-all"
                    style={isActive
                      ? { backgroundColor: '#2d2d2d', color: '#faf8f5' }
                      : { backgroundColor: 'transparent', color: '#4e4338' }}
                  >
                    <span className="text-sm font-semibold">{cat}</span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.22em] rounded-full px-2 py-1"
                      style={isActive
                        ? { backgroundColor: 'rgba(255,255,255,0.1)', color: '#c4b5a4' }
                        : { backgroundColor: '#f3eee7', color: '#8a7648' }}
                    >
                      {categoryCount}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-[28px] border p-5" style={{ backgroundColor: '#f7f2ea', borderColor: 'rgba(45,45,45,0.06)' }}>
              <p className="text-[10px] uppercase tracking-[0.24em] font-bold mb-2" style={{ color: '#8a7648' }}>
                {lang === 'ID' ? 'Catatan layanan' : 'Service note'}
              </p>
              <p className="text-sm leading-7" style={{ color: '#574b3f' }}>
                {lang === 'ID'
                  ? 'Tagihan dan pajak 21% ditambahkan saat checkout. Gunakan catatan item untuk preferensi dapur.'
                  : 'Tax and service are added at checkout. Use item notes for kitchen preferences and delivery instructions.'}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] mb-2" style={{ color: '#8a7648' }}>
                  {sectionTitle}
                </p>
                <h3 className="text-3xl leading-none" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                  {searchQuery ? t.search : selectedCategory}
                </h3>
              </div>
              <p className="text-xs sm:text-sm max-w-md" style={{ color: '#7a6a5a' }}>
                {searchQuery
                  ? t.searchEmpty
                  : lang === 'ID'
                    ? 'Disusun agar mudah dibaca, dengan detail servis, estimasi waktu, dan harga yang lebih tegas.'
                    : 'Structured for quick reading, with clearer service detail, prep cues, and stronger pricing hierarchy.'}
              </p>
            </div>

            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center text-center px-6 rounded-[28px] border border-dashed"
                style={{ borderColor: 'rgba(184,168,152,0.3)', backgroundColor: 'rgba(255,255,255,0.55)' }}
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#fff' }}>
                  <SearchX className="w-6 h-6" style={{ color: '#b8a898' }} />
                </div>
                <h3 className="text-xl mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                  {searchQuery ? t.emptySearchTitle : t.emptyMenuTitle}
                </h3>
                <p className="text-sm max-w-[280px]" style={{ color: '#7a6a5a' }}>
                  {searchQuery ? t.searchEmpty : t.emptyMenuDesc}
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                    freeLabel={t.free}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Cart CTA */}
        <AnimatePresence>
          {totalQty > 0 && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-0 right-0 px-5 sm:px-6 z-40 flex justify-center pointer-events-none"
            >
              <button
                onClick={onOpenCart}
                className="w-full max-w-xl flex items-center justify-between px-5 py-4 rounded-[24px] shadow-2xl pointer-events-auto transition-transform active:scale-95"
                style={{ backgroundColor: '#2d2d2d', color: '#faf8f5', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-[#2d2d2d] bg-[#faf8f5]">
                    {totalQty}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'rgba(250,248,245,0.6)' }}>
                      {lang === 'ID' ? 'Siap ditinjau' : 'Ready to review'}
                    </p>
                    <span className="text-sm font-semibold tracking-wide uppercase">{t.cart}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'rgba(250,248,245,0.6)' }}>
                    {lang === 'ID' ? 'Total sementara' : 'Current total'}
                  </p>
                  <span className="text-sm font-bold" style={{ color: '#c4b5a4' }}>{formatCurrency(grandTotal)}</span>
                </div>
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
