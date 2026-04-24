import React, { useState } from 'react';
import { X, Minus, Plus, ChevronDown, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, Language } from '../types';
import { TRANSLATIONS } from '../data/constants';
import { useTheme } from '../contexts/ThemeContext';
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
  const { theme } = useTheme();
  const t = TRANSLATIONS[lang];
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [showAllergens, setShowAllergens] = useState(false);

  const handleAdd = () => {
    if (item) { onAdd(item, qty, note); setQty(1); setNote(''); onClose(); }
  };
  const handleClose = () => { setQty(1); setNote(''); onClose(); };
  if (!item) return null;

  const totalPrice = item.price * qty;
  const allergens = typeof item.allergens === 'string'
    ? item.allergens.split(',').map(v => v.trim()).filter(Boolean) : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pointerEvents: 'none' }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ pointerEvents: 'auto', width: '100%', maxWidth: '28rem', background: theme.bgSurface, borderTopLeftRadius: '1.75rem', borderTopRightRadius: '1.75rem', overflow: 'hidden', maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -20px 60px rgba(0,0,0,0.5)', transition: 'background 0.3s' }}>

              {/* Image */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '3/2', maxHeight: '32vh', background: theme.bgMuted, flexShrink: 0 }}>
                <button onClick={handleClose} aria-label="Close" style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, width: '2.25rem', height: '2.25rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', borderRadius: '9999px', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
                <ImageWithFallback src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              {/* Scroll body */}
              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
                <div style={{ padding: '1.75rem 1.5rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.625rem' }}>
                    <h2 style={{ fontFamily: "'Noto Serif',serif", fontSize: '1.7rem', fontWeight: 400, lineHeight: 1.15, color: theme.textBase, transition: 'color 0.3s' }}>{item.name}</h2>
                    {(item.tag || item.serviceTag) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end', flexShrink: 0, paddingTop: '0.25rem' }}>
                        {item.tag && <span style={{ fontSize: '9px', padding: '0.2rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', background: theme.bgInput, color: theme.textMuted, borderRadius: '0.2rem' }}>{item.tag}</span>}
                        {item.serviceTag && <span style={{ fontSize: '9px', padding: '0.2rem 0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', background: 'rgba(154,116,22,0.18)', color: theme.goldBright, borderRadius: '0.2rem' }}>{item.serviceTag}</span>}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '14px', lineHeight: 1.7, color: theme.textMuted, marginBottom: '1.25rem', transition: 'color 0.3s' }}>{item.description}</p>

                  {(item.prepTime || (item.spiceLevel && item.spiceLevel !== 'None')) && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      {item.prepTime && <div style={{ display: 'flex', background: theme.bgInput, border: `1px solid ${theme.borderFaint}`, padding: '0.35rem 0.875rem', borderRadius: '9999px' }}><span style={{ fontSize: '10px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Prep: {item.prepTime}</span></div>}
                      {item.spiceLevel && item.spiceLevel !== 'None' && <div style={{ display: 'flex', background: theme.bgInput, border: `1px solid ${theme.borderFaint}`, padding: '0.35rem 0.875rem', borderRadius: '9999px' }}><span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: item.spiceLevel === 'Hot' ? '#f87171' : '#fbbf24' }}>Spice: {item.spiceLevel}</span></div>}
                    </div>
                  )}

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: theme.textMuted, marginBottom: '0.5rem', fontFamily: "'Manrope',sans-serif" }}>{t.specialInstructions}</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.placeholderNote} style={{ width: '100%', background: theme.bgInput, border: `1px solid ${theme.border}`, borderRadius: '0.875rem', padding: '0.875rem 1rem', fontSize: '14px', color: theme.textBase, resize: 'none', height: '5.5rem', outline: 'none', fontFamily: "'Manrope',sans-serif", boxSizing: 'border-box', transition: 'background 0.3s, border-color 0.3s' }} />
                  </div>

                  {allergens.length > 0 && (
                    <div style={{ border: `1px solid ${theme.border}`, borderRadius: '0.875rem', overflow: 'hidden' }}>
                      <button onClick={() => setShowAllergens(!showAllergens)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: theme.bgInput, border: 'none', cursor: 'pointer', color: theme.textSecondary }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <AlertTriangle size={14} color={theme.goldBright} />
                          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'Manrope',sans-serif" }}>{t.containsAllergens}</span>
                        </div>
                        <ChevronDown size={15} style={{ transition: 'transform 0.2s', transform: showAllergens ? 'rotate(180deg)' : 'none', color: theme.textMuted }} />
                      </button>
                      <AnimatePresence>
                        {showAllergens && (
                          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                            <div style={{ padding: '0.875rem 1rem', borderTop: `1px solid ${theme.borderFaint}`, display: 'flex', flexWrap: 'wrap', gap: '0.5rem', background: theme.bgInput }}>
                              {allergens.map(a => <span key={a} style={{ padding: '0.25rem 0.75rem', background: theme.bgMuted, color: theme.textMuted, fontSize: '11px', borderRadius: '9999px', fontWeight: 500 }}>{a}</span>)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '1rem 1.5rem', paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)', background: theme.bgSurface, borderTop: `1px solid ${theme.borderFaint}`, display: 'grid', gridTemplateColumns: '6.5rem 1fr', gap: '0.75rem', transition: 'background 0.3s, border-color 0.3s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.bgInput, borderRadius: '9999px', padding: '0 0.25rem', height: '3.5rem', border: `1px solid ${theme.borderFaint}` }}>
                  <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: qty <= 1 ? 'not-allowed' : 'pointer', color: qty <= 1 ? theme.textMuted : theme.textSecondary, borderRadius: '9999px' }}>
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: theme.textBase, minWidth: '1.25rem', textAlign: 'center' }}>{qty}</span>
                  <button onClick={() => setQty(qty + 1)} style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, borderRadius: '9999px' }}>
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={handleAdd} style={{ height: '3.5rem', background: 'linear-gradient(135deg,#7a5c10,#9a7416)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 24px rgba(119,90,25,0.28)', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingInline: '1.25rem', cursor: 'pointer' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#fff', fontFamily: "'Manrope',sans-serif" }}>{t.addToCart}</span>
                  <span style={{ fontFamily: "'Noto Serif',serif", fontSize: '15px', color: 'rgba(255,255,255,0.85)' }}>{formatCurrency(totalPrice)}</span>
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
