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
      {isOpen && item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#fcfaf7]/90 backdrop-blur-sm z-50 pointer-events-auto"
          />
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="w-full max-w-lg bg-white pointer-events-auto overflow-hidden shadow-xl border-none flex flex-col max-h-[85vh]"
              style={{ borderRadius: '1px', borderColor: 'rgba(26,26,26,0.1)' }}
            >
              {/* Header Image */}
              <div className="relative h-[45vh] min-h-[300px] w-full bg-[#fbfaf8]">
                <ImageWithFallback 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Close Button overlay */}
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center bg-white/90 backdrop-blur border text-[#1a1a1a] transition-all hover:bg-[#1a1a1a] hover:text-white"
                    style={{ borderRadius: '1px', borderColor: 'rgba(26,26,26,0.1)' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content body mapping to a printed order sheet */}
              <div className="flex-1 overflow-y-auto px-8 py-8 styling-sheet border-t" style={{ borderColor: 'rgba(26,26,26,0.1)', fontFamily: "'Manrope', sans-serif" }}>
                
                <div className="mb-8">
                  <h2 className="text-[2.2rem] leading-tight mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1a1a1a' }}>
                    {item.name}
                  </h2>
                  <p className="text-xl tracking-widest font-light" style={{ color: '#8a7648' }}>
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <p className="text-sm leading-relaxed font-light mb-8 pt-6 border-t" style={{ color: '#574b3f', borderColor: 'rgba(26,26,26,0.1)' }}>
                  {item.description}
                </p>

                {item.dietaryTags && item.dietaryTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {item.dietaryTags.map(tag => (
                      <span key={tag} className="border px-4 py-2 text-[9px] uppercase tracking-[0.25em] font-semibold" style={{ borderColor: 'rgba(26,26,26,0.1)', color: '#1a1a1a', borderRadius: '1px' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="space-y-6 pt-6 border-t" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: '#1a1a1a' }}>
                      {t.specialInstructions}
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={lang === 'ID' ? 'Ketik permintaan khusus di sini...' : 'Type specific preferences here...'}
                      className="w-full text-sm font-light p-4 border focus:ring-0 transition-colors"
                      style={{ backgroundColor: '#fcfaf7', color: '#1a1a1a', borderColor: 'rgba(26,26,26,0.15)', borderRadius: '1px' }}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Controls */}
              <div className="p-8 border-t bg-white" style={{ borderColor: 'rgba(26,26,26,0.1)' }}>
                <div className="flex gap-4">
                  {/* Quantity */}
                  <div className="border flex items-center px-4" style={{ borderColor: 'rgba(26,26,26,0.1)', borderRadius: '1px' }}>
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-8 h-8 flex items-center justify-center transition-all disabled:opacity-30"
                      disabled={qty <= 1}
                      style={{ color: '#1a1a1a' }}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center" style={{ color: '#1a1a1a' }}>{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="w-8 h-8 flex items-center justify-center transition-all"
                      style={{ color: '#1a1a1a' }}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Add to Cart */}
                  <button
                    onClick={handleAdd}
                    className="flex-1 py-4 px-6 text-[10px] uppercase tracking-[0.25em] font-semibold flex items-center justify-between transition-colors outline-none"
                    style={{ backgroundColor: '#2a2723', color: '#ffffff', borderRadius: '1px' }}
                  >
                    <span>{t.addToCart}</span>
                    <span style={{ color: 'rgba(251,250,248,0.7)' }}>{formatCurrency(item.price * qty)}</span>
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
