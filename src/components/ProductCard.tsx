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
    <div className="w-full flex gap-5 py-5 border-b last:border-b-0 group transition-all" style={{ borderColor: 'rgba(45,45,45,0.08)' }}>
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-1.5">
          {item.tag && (
            <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-widest" style={{ color: '#a08850', border: '1px solid rgba(160,136,80,0.3)' }}>
              {item.tag}
            </span>
          )}
          {item.serviceTag && (
            <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-widest" style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}>
              {item.serviceTag}
            </span>
          )}
        </div>
        
        <h3 className="text-lg leading-tight mb-1.5" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
          {item.name}
        </h3>
        
        <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: '#888' }}>
          {item.description}
        </p>
        
        <div className="flex items-center gap-3 mb-3">
          <p className="text-sm font-semibold tracking-wide" style={{ color: '#2d2d2d' }}>
            {item.price > 0 ? formatCurrency(item.price) : freeLabel}
          </p>
          {(item.prepTime || item.spiceLevel) && (
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest" style={{ color: '#b8a898' }}>
              <span>•</span>
              {item.prepTime && <span>{item.prepTime}</span>}
              {item.prepTime && item.spiceLevel && <span>|</span>}
              {item.spiceLevel && <span className={item.spiceLevel === 'Hot' ? 'text-red-500/80' : ''}>{item.spiceLevel}</span>}
            </div>
          )}
        </div>
        
        <button
          onClick={onClick}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
          style={{ color: '#a08850' }}
        >
          <div className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors group-hover:bg-[#a08850] group-hover:text-white" style={{ borderColor: 'rgba(160,136,80,0.4)' }}>
            <Plus className="w-3 h-3" />
          </div>
          Add to order
        </button>
      </div>

      <div className="relative w-28 h-32 flex-shrink-0 cursor-pointer overflow-hidden bg-gray-100" onClick={onClick}>
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    </div>
  );
};
