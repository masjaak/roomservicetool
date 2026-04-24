import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  item: MenuItem;
  onClick: () => void;
  onAdd: (e: React.MouseEvent) => void;
  freeLabel: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onClick, onAdd, freeLabel }) => {
  const { theme } = useTheme();
  return (
  <div onClick={onClick} style={{ display: 'flex', overflow: 'hidden', borderRadius: '1.1rem', background: theme.bgSurface, border: `1px solid ${theme.borderFaint}`, cursor: 'pointer', transition: 'background 0.3s, border-color 0.3s' }}>
    <div style={{ width: '7.5rem', flexShrink: 0, overflow: 'hidden' }}>
      <ImageWithFallback src={item.image} alt={item.name} className="h-full w-full object-cover" />
    </div>
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '0.875rem 1rem' }}>
      <div>
        <h3 style={{ fontFamily: "'Noto Serif',serif", fontSize: '1rem', fontWeight: 400, lineHeight: 1.25, color: theme.textBase, marginBottom: '0.25rem', transition: 'color 0.3s' }}>{item.name}</h3>
        <p style={{ fontSize: '12px', fontStyle: 'italic', lineHeight: 1.4, color: theme.textMuted, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', transition: 'color 0.3s' }}>{item.description}</p>
      </div>
      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem' }}>
        <span style={{ fontFamily: "'Noto Serif',serif", fontSize: '0.95rem', fontWeight: 400, color: theme.goldBright, lineHeight: 1, transition: 'color 0.3s' }}>
          {item.price > 0 ? formatCurrency(item.price) : freeLabel}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onAdd(e); }} aria-label={`Add ${item.name}`}
          style={{ touchAction: 'manipulation', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', height: '2.25rem', minWidth: '5.5rem', borderRadius: '0.625rem', background: 'rgba(154,116,22,0.14)', border: '1px solid rgba(154,116,22,0.32)', color: theme.goldBright, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'Manrope',sans-serif", cursor: 'pointer', transition: 'background 0.2s' }}>
          <Plus size={13} aria-hidden="true" /><span>Add</span>
        </button>
      </div>
    </div>
  </div>
  );
};
