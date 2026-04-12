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
  const heroTitle = lang === 'ID' ? `In-Room Dining : ${roomNumber}` : `In-Room Dining : ${roomNumber}`;
  const heroEyebrow = lang === 'ID' ? 'Menu sepanjang hari' : 'All-day dining';
  const heroKicker = lang === 'ID' ? 'Pengalaman in-room dining' : 'An elevated in-room dining experience';
  const heroDescription = lang === 'ID'
    ? 'Sebuah seleksi hidangan khas yang dikurasi khusus untuk melengkapi waktu Anda, dihadirkan dengan keanggunan.'
    : 'A thoughtfully curated selection of signature dishes, designed to complement your time with quiet elegance.';
  const sectionTitle = lang === 'ID' ? 'Seleksi Kurasi' : 'Curated Selection';
  const sectionDescription = lang === 'ID'
    ? 'Telusuri koleksi hidangan kami berdasarkan kategori.'
    : 'Peruse our dining collection by course or signature.';

  const filteredItems = searchQuery.length > 0
    ? MENU_ITEMS.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : MENU_ITEMS.filter((item) => item.category === selectedCategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-36"
      style={{ backgroundColor: '#fbfaf8', fontFamily: "'Lato', sans-serif" }}
    >
      <div className="w-full max-w-6xl mx-auto min-h-screen relative">
        {/* Header */}
        <div className="sticky top-0 z-30 px-6 sm:px-10 pt-6 pb-5 backdrop-blur-md" style={{ backgroundColor: 'rgba(251,250,248,0.95)', borderBottom: '1px solid rgba(26,26,26,0.06)' }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <p className="text-[9px] font-semibold tracking-[0.3em] uppercase mb-3" style={{ color: '#8a7648' }}>
                {getGreeting()}
              </p>
              <h2 className="text-[2.5rem] sm:text-[3.5rem] leading-[1]" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a', fontWeight: 500 }}>
                {heroTitle}
              </h2>
            </div>
            <button
              onClick={handleLogout}
              className="h-10 px-5 flex items-center justify-center transition-colors border text-[9px] font-semibold uppercase tracking-[0.25em] hover:bg-[#1a1a1a] hover:text-[#fbfaf8]"
              style={{ backgroundColor: 'transparent', color: '#1a1a1a', borderColor: 'rgba(26,26,26,0.15)', borderRadius: '2px' }}
            >
              <span className="hidden sm:inline mr-2">{lang === 'ID' ? 'Keluar' : 'Switch'}</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="border px-6 py-8 sm:px-10 sm:py-10 flex flex-col justify-between" style={{ backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.05)', borderRadius: '2px' }}>
              <div>
                <div className="flex items-center gap-3 mb-5 text-[9px] font-semibold uppercase tracking-[0.3em]" style={{ color: '#b59c6b' }}>
                  <Sparkles className="w-3 h-3" />
                  <span>{heroEyebrow}</span>
                </div>
                <h3 className="text-[2rem] sm:text-[2.8rem] leading-[1.1] mb-5 max-w-lg" style={{ fontFamily: "'Playfair Display', serif", color: '#fbfaf8', fontWeight: 400 }}>
                  {heroKicker}
                </h3>
                <p className="text-sm leading-relaxed max-w-xl font-light" style={{ color: 'rgba(251,250,248,0.7)' }}>
                  {heroDescription}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-0 mt-10 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
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
                    title: lang === 'ID' ? 'Opsional' : 'Surcharge',
                    value: '21%',
                  },
                ].map(({ icon: Icon, title, value }, idx) => (
                  <div key={title} className={`py-6 flex flex-col items-center justify-center text-center ${idx !== 2 ? 'border-r' : ''}`} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <p className="text-[8px] uppercase tracking-[0.3em] mb-2 font-semibold" style={{ color: 'rgba(251,250,248,0.5)' }}>{title}</p>
                    <p className="text-[13px] font-medium" style={{ color: '#fbfaf8' }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-t-4 px-6 py-8 sm:px-8 sm:py-10" style={{ backgroundColor: '#fff', borderColor: 'rgba(26,26,26,0.05)', borderTopColor: '#1a1a1a', borderRadius: '2px' }}>
              <p className="text-[9px] font-semibold uppercase tracking-[0.3em] mb-4" style={{ color: '#8a7648' }}>
                {sectionTitle}
              </p>
              <p className="text-sm leading-relaxed mb-8 font-light" style={{ color: '#574b3f' }}>
                {sectionDescription}
              </p>
              <div className="space-y-4">
                {categoryCounts.slice(0, 3).map(({ category, count }) => (
                  <div key={category} className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'rgba(26,26,26,0.08)' }}>
                    <span className="text-[13px] uppercase tracking-[0.1em]" style={{ color: '#1a1a1a' }}>{category}</span>
                    <span className="text-[10px] font-semibold" style={{ color: '#8a7648' }}>({count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-10 pt-10 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          <div className="lg:sticky lg:top-[280px] h-fit space-y-8">
            <div className="relative border-b" style={{ borderColor: 'rgba(26,26,26,0.2)' }}>
              <input
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-0 pr-8 py-3 text-sm focus:outline-none transition-all placeholder-[#888] bg-transparent"
                style={{ color: '#1a1a1a' }}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: '#1a1a1a' }}
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#1a1a1a' }} />
              )}
            </div>

            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat && !searchQuery;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between py-3 text-left transition-all border-b"
                    style={{ borderColor: 'transparent', borderBottomColor: isActive ? '#1a1a1a' : 'rgba(26,26,26,0.06)' }}
                  >
                    <span className={`text-[11px] uppercase tracking-[0.2em] ${isActive ? 'font-semibold' : 'font-normal'}`} style={{ color: isActive ? '#1a1a1a' : '#888' }}>{cat}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 border" style={{ backgroundColor: '#fff', borderColor: 'rgba(26,26,26,0.06)', borderRadius: '2px' }}>
              <p className="text-[9px] uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: '#8a7648' }}>
                {lang === 'ID' ? 'Catatan layanan' : 'Service note'}
              </p>
              <p className="text-xs leading-relaxed font-light" style={{ color: '#574b3f' }}>
                {lang === 'ID'
                  ? 'Tagihan dan pajak 21% ditambahkan saat checkout. Gunakan catatan item untuk preferensi dapur.'
                  : 'Tax and service are added at checkout. Use item notes for kitchen preferences and delivery instructions.'}
              </p>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-4 border-b" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: '#8a7648' }}>
                  {sectionTitle}
                </p>
                <h3 className="text-[2.2rem] sm:text-[3rem] leading-[1]" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a', fontWeight: 500 }}>
                  {searchQuery ? t.search : selectedCategory}
                </h3>
              </div>
              <p className="text-xs max-w-sm font-light text-right hidden sm:block" style={{ color: '#574b3f' }}>
                {searchQuery
                  ? t.searchEmpty
                  : lang === 'ID'
                    ? 'Disusun agar mencerminkan keunggulan cita rasa lokal dan internasional, dengan detail waktu pengolahan yang transparan.'
                    : 'Structured to reflect the excellence of our kitchen, complete with transparent preparation cues.'}
              </p>
            </div>

            {filteredItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 flex flex-col items-center justify-center text-center px-10 border"
                style={{ borderColor: 'rgba(26,26,26,0.1)', backgroundColor: '#fff', borderRadius: '2px' }}
              >
                <SearchX className="w-8 h-8 mb-6" style={{ color: '#b59c6b' }} />
                <h3 className="text-[2rem] sm:text-[2.5rem] mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a', fontWeight: 400 }}>
                  {searchQuery ? t.emptySearchTitle : t.emptyMenuTitle}
                </h3>
                <p className="text-sm max-w-[320px] font-light" style={{ color: '#574b3f' }}>
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
                className="w-full max-w-xl flex items-center justify-between px-8 py-5 shadow-2xl pointer-events-auto transition-transform active:scale-[0.99] border"
                style={{ backgroundColor: '#1a1a1a', color: '#fbfaf8', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}
              >
                <div className="flex items-center gap-6">
                  <div className="w-8 h-8 flex items-center justify-center text-[10px] font-bold border" style={{ borderColor: 'rgba(251,250,248,0.3)', color: '#fbfaf8', borderRadius: '1px' }}>
                    {totalQty}
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] uppercase tracking-[0.3em] font-semibold" style={{ color: '#b59c6b' }}>
                      {lang === 'ID' ? 'Siap ditinjau' : 'Ready to review'}
                    </p>
                    <span className="text-xs font-semibold tracking-[0.2em] uppercase mt-1 block">{t.cart}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] uppercase tracking-[0.3em] font-semibold" style={{ color: 'rgba(251,250,248,0.5)' }}>
                    {lang === 'ID' ? 'Total sementara' : 'Current total'}
                  </p>
                  <span className="text-sm font-semibold tracking-wider mt-1 block" style={{ color: '#fbfaf8' }}>{formatCurrency(grandTotal)}</span>
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
