import React, { useState } from 'react';
import { X, Minus, Plus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MenuItem } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { formatCurrency } from '../utils/format';

interface ItemDetailModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: MenuItem, qty: number, note: string) => void;
  lang: 'EN' | 'ID';
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, isOpen, onClose, onAdd, lang }) => {
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const t = TRANSLATIONS[lang];

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setQty(1);
      setNote("");
    }
  }, [isOpen]);

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-[2.5rem] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto relative z-10"
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-200 rounded-full sm:hidden" />

            <div className="flex justify-between items-start mb-6 mt-4 sm:mt-0">
              <div className="max-w-[80%]">
                <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">{item.name}</h2>
                <p className="text-orange-600 font-bold text-xl">
                  {item.price === 0 ? t.free : formatCurrency(item.price)}
                </p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            
            <div className="relative aspect-video rounded-xl overflow-hidden mb-6 bg-slate-100">
               <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>

            <p className="text-slate-600 text-sm mb-6 leading-relaxed">{item.description}</p>
            
            {item.allergens && (
              <div className="bg-amber-50 p-4 rounded-xl mb-6 flex gap-3 items-start border border-amber-100/50">
                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">{t.containsAllergens}</p>
                  <p className="text-sm text-amber-700">{item.allergens}</p>
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Notes to Kitchen</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none" 
                rows={2} 
                placeholder={t.notesPlaceholder}
                value={note} 
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            <div className="flex gap-4 items-center pt-4 border-t border-slate-100">
              <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))} 
                  className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-slate-50 text-slate-900 active:scale-95 transition-all disabled:opacity-50"
                  disabled={qty <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold text-slate-900 text-lg tabular-nums">{qty}</span>
                <button 
                  onClick={() => setQty(qty + 1)} 
                  className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-slate-50 text-slate-900 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => { onAdd(item, qty, note); onClose(); }} 
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-full font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>{t.addToCart}</span>
                <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                <span>{item.price === 0 ? t.free : formatCurrency(item.price * qty)}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};