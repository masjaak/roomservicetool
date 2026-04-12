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
      className="w-full text-left group border transition-all duration-500 hover:-translate-y-0.5"
      style={{ backgroundColor: '#fff', borderColor: 'rgba(36,31,26,0.1)', boxShadow: '0 8px 30px rgba(36,31,26,0.03)' }}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-48 h-56 sm:h-auto flex-shrink-0 overflow-hidden bg-[#faf8f5]">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="flex-1 min-w-0 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
          {item.tag && (
              <span className="text-[9px] px-2 py-1 font-bold uppercase tracking-[0.2em] border" style={{ color: '#8a7648', backgroundColor: 'transparent', borderColor: 'rgba(138,118,72,0.3)' }}>
              {item.tag}
            </span>
          )}
          {item.serviceTag && (
              <span className="text-[9px] px-2 py-1 font-bold uppercase tracking-[0.2em]" style={{ backgroundColor: '#241f1a', color: '#faf8f5' }}>
              {item.serviceTag}
            </span>
          )}
        </div>
        
          <h3 className="text-[1.85rem] leading-[1.1] mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#1a1a1a', fontWeight: 500 }}>
          {item.name}
        </h3>
        
          <p className="text-sm leading-relaxed line-clamp-3 mb-6" style={{ color: '#574b3f', fontWeight: 300 }}>
          {item.description}
        </p>
        
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {item.prepTime && (
              <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#8a7648]">
                {item.prepTime}
              </span>
            )}
            {item.spiceLevel && item.spiceLevel !== 'None' && (
              <span className="text-[9px] uppercase tracking-[0.25em] font-semibold" style={{ color: item.spiceLevel === 'Hot' ? '#b43c3c' : '#8a7648' }}>
                {item.spiceLevel}
              </span>
            )}
            {item.dietaryTags?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] uppercase tracking-[0.25em] font-semibold text-[#8a7648]">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 border-t pt-5 mt-auto" style={{ borderColor: 'rgba(36,31,26,0.06)' }}>
            <p className="text-sm font-medium tracking-widest" style={{ color: '#1a1a1a' }}>
            {item.price > 0 ? formatCurrency(item.price) : freeLabel}
          </p>
            <div
              className="inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.25em] font-semibold transition-all group-hover:text-[#1a1a1a]"
              style={{ color: '#8a7648' }}
            >
              <span>View dish</span>
              <div className="w-8 h-8 flex items-center justify-center transition-colors border" style={{ borderColor: 'rgba(36,31,26,0.1)' }}>
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
