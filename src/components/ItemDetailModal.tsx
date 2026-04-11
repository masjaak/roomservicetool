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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-4 space-y-4">
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
                  {item.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#b8a898' }}>
                  {item.description}
                </p>
              </div>

              {item.allergens && (
                <button
                  onClick={() => setShowAllergens(!showAllergens)}
                  className="flex items-center gap-2 w-full text-left py-2 rounded-lg px-3"
                  style={{ backgroundColor: 'rgba(160,136,80,0.06)', color: '#a08850' }}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold flex-1">{t.containsAllergens}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAllergens ? 'rotate-180' : ''}`} />
                </button>
              )}
              {showAllergens && item.allergens && (
                <p className="text-xs pl-4" style={{ color: '#b8a898' }}>{item.allergens}</p>
              )}

              <div>
                <label className="text-[10px] font-semibold tracking-widest uppercase mb-2 block" style={{ color: '#b8a898' }}>
                  {lang === 'ID' ? 'Catatan' : 'Notes'}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t.notesPlaceholder}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'rgba(45,45,45,0.04)',
                    border: '1px solid rgba(45,45,45,0.08)',
                    color: '#2d2d2d',
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6" style={{ borderTop: '1px solid rgba(45,45,45,0.06)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ border: '1px solid rgba(45,45,45,0.12)', color: '#2d2d2d' }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-xl w-8 text-center" style={{ color: '#2d2d2d' }}>{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-0.5" style={{ color: '#b8a898' }}>{t.total}</p>
                  <p className="text-lg font-bold" style={{ color: '#a08850' }}>{formatCurrency(totalPrice)}</p>
                </div>
              </div>

              <button
                onClick={handleAdd}
                className="w-full py-4 rounded-xl font-semibold text-sm uppercase tracking-widest transition-all active:scale-[0.98]"
                style={{ backgroundColor: '#2d2d2d', color: '#faf8f5', boxShadow: '0 4px 16px rgba(45,45,45,0.15)' }}
              >
                {t.addToCart}
              </button>
            </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};