import React, { useState } from 'react';
import { X, Minus, Plus, ChevronDown, AlertTriangle } from 'lucide-react';
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
  const [showAllergens, setShowAllergens] = useState(false);

  const handleAdd = () => {
    if (item) {
      onAdd(item, qty, note);
      setQty(1);
      setNote('');
      onClose();
    }
  };

  const handleClose = () => {
    setQty(1);
    setNote('');
    onClose();
  };

  if (!item) return null;

  const totalPrice = item.price * qty;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'rgba(45,45,45,0.5)' }}
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 pointer-events-none">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full max-w-md pointer-events-auto flex flex-col overflow-hidden sm:rounded-3xl rounded-t-3xl"
              style={{ backgroundColor: '#faf8f5', maxHeight: '85vh' }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full transition-all"
                style={{ backgroundColor: 'rgba(45,45,45,0.6)', color: '#faf8f5' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto w-full p-6 pb-24 space-y-5 bg-white relative">
              <div className="text-center pt-2">
                <h3 className="text-2xl font-bold mb-2 leading-tight" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                  {item.name}
                </h3>
                <p className="text-sm leading-relaxed mx-auto max-w-sm" style={{ color: '#888' }}>
                  {item.description}
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 pt-4 text-[9px] uppercase font-bold tracking-widest">
                  {item.serviceTag && (
                    <span className="px-2 py-1 rounded-sm border" style={{ backgroundColor: 'transparent', color: '#2d2d2d', borderColor: 'rgba(45,45,45,0.1)' }}>{item.serviceTag}</span>
                  )}
                  {item.spiceLevel && item.spiceLevel !== 'None' && (
                    <span className="px-2 py-1 rounded-sm border" style={{ backgroundColor: 'transparent', color: '#b43c3c', borderColor: 'rgba(180,60,60,0.2)' }}>{item.spiceLevel}</span>
                  )}
                  {item.prepTime && (
                    <span className="px-2 py-1 rounded-sm border" style={{ backgroundColor: 'transparent', color: '#888', borderColor: 'rgba(45,45,45,0.1)' }}>{item.prepTime}</span>
                  )}
                  {item.dietaryTags?.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded-sm border" style={{ backgroundColor: 'transparent', color: '#a08850', borderColor: 'rgba(160,136,80,0.2)' }}>{tag}</span>
                  ))}
                </div>
              </div>

              {item.allergens && (
                <div className="py-3 mt-4 border-t border-b" style={{ borderColor: 'rgba(45,45,45,0.06)' }}>
                  <button
                    onClick={() => setShowAllergens(!showAllergens)}
                    className="flex items-center justify-between w-full text-left"
                    style={{ color: '#2d2d2d' }}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 text-[#a08850]" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{t.containsAllergens}</span>
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showAllergens ? 'rotate-180' : ''}`} style={{ color: '#888' }} />
                  </button>
                  {showAllergens && (
                    <p className="text-xs mt-3 leading-relaxed" style={{ color: '#888' }}>{item.allergens}</p>
                  )}
                </div>
              )}

              <div className="pt-2">
                <label className="text-[9px] font-bold tracking-widest uppercase mb-2 block" style={{ color: '#888' }}>
                  {lang === 'ID' ? 'Instruksi Khusus' : 'Special Instructions'}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={2}
                  className="w-full px-4 py-3 text-sm focus:outline-none transition-all placeholder-gray-300"
                  style={{
                    backgroundColor: 'transparent',
                    borderBottom: '1px solid rgba(45,45,45,0.1)',
                    color: '#2d2d2d',
                  }}
                />
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md" style={{ borderTop: '1px solid rgba(45,45,45,0.06)' }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 bg-gray-50 rounded-full p-1 border" style={{ borderColor: 'rgba(45,45,45,0.06)' }}>
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-sm disabled:opacity-50"
                    disabled={qty <= 1}
                    style={{ color: '#2d2d2d' }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-lg w-4 text-center" style={{ color: '#2d2d2d' }}>{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-sm"
                    style={{ color: '#2d2d2d' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  onClick={handleAdd}
                  className="flex-1 py-4 px-6 rounded-full font-bold text-sm tracking-wide uppercase flex items-center justify-between transition-all active:scale-[0.98]"
                  style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}
                >
                  <span>{t.addToCart}</span>
                  <span style={{ color: '#a08850' }}>{formatCurrency(totalPrice)}</span>
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