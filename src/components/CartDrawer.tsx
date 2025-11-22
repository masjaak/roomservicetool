import React from 'react';
import { X, ChevronRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { formatCurrency } from '../utils/format';

interface CartDrawerProps {
  cart: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (index: number) => void;
  onCheckout: () => void;
  lang: 'EN' | 'ID';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ cart, isOpen, onClose, onRemove, onCheckout, lang }) => {
  const t = TRANSLATIONS[lang];
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

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
            className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-[2.5rem] h-[85vh] flex flex-col shadow-2xl pointer-events-auto relative z-10"
          >
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-slate-900">{t.cart}</h2>
              <button onClick={onClose} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-8">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-slate-300 rounded-full" />
                      <div className="w-2 h-2 bg-slate-300 rounded-full mx-1" />
                      <div className="w-2 h-2 bg-slate-300 rounded-full" />
                   </div>
                   <p className="font-medium">{t.emptyCart}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item, idx) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      key={`${item.id}-${idx}`} 
                      className="flex gap-4"
                    >
                      <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-100">
                        <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                         <div>
                             <div className="flex justify-between items-start">
                               <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h4>
                               <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">x{item.qty}</span>
                             </div>
                             {item.note && <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">"{item.note}"</p>}
                         </div>
                         <div className="flex justify-between items-end">
                            <p className="text-sm font-bold text-orange-600">
                              {item.price === 0 ? t.free : formatCurrency(item.price * item.qty)}
                            </p>
                            <button 
                              onClick={() => onRemove(idx)} 
                              className="text-red-400 hover:text-red-600 p-1 -mr-1 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50">
               <div className="flex justify-between items-center mb-6">
                 <span className="text-slate-500 font-medium text-sm">{t.subtotal}</span>
                 <span className="text-slate-900 font-bold text-lg">{formatCurrency(subtotal)}</span>
               </div>
               <button 
                 onClick={onCheckout} 
                 disabled={cart.length === 0}
                 className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-sm shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all uppercase tracking-widest flex items-center justify-between px-6 group"
               >
                 <span>{t.checkout}</span>
                 <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                   <ChevronRight className="w-4 h-4" />
                 </div>
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
