import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { formatCurrency } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  item: MenuItem;
  onClick: () => void;
  freeLabel: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onClick, freeLabel }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 rounded-2xl overflow-hidden p-4 transition-all text-left group active:scale-[0.99]"
      style={{
        backgroundColor: '#fff',
        border: '1px solid rgba(45,45,45,0.06)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.tag && (
          <span
            className="absolute top-1.5 left-1.5 text-[8px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{ backgroundColor: 'rgba(45,45,45,0.85)', color: '#faf8f5' }}
          >
            {item.tag}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0 self-start">
        <h3 className="font-semibold text-sm leading-tight mb-1" style={{ color: '#2d2d2d' }}>
          {item.name}
        </h3>
        <p className="text-[11px] leading-snug line-clamp-2 mb-2" style={{ color: '#b8a898' }}>
          {item.description}
        </p>
        <p className="text-sm font-bold" style={{ color: '#a08850' }}>
          {item.price > 0 ? formatCurrency(item.price) : freeLabel}
        </p>
      </div>

      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-110"
        style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}
      >
        <Plus className="w-4 h-4" />
      </div>
    </button>
  );
};
