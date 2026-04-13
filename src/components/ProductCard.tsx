import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { formatCurrency } from '../utils/format';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProductCardProps {
  item: MenuItem;
  onClick: () => void;
  onAdd: (e: React.MouseEvent) => void;
  freeLabel: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onClick, onAdd, freeLabel }) => {
  return (
    <div 
      onClick={onClick}
      className="w-full bg-[#ffffff] border-b border-[#e7e5e4] last:border-b-0 py-6 mb-2 cursor-pointer group"
    >
      <div className="flex flex-row gap-5 items-start p-4 bg-[#ffffff]">
        {/* Left: Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Tagging / Badge */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {item.tag && (
                <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-[0.1em] text-[#78716c] bg-[#f5f5f4] rounded-sm">
                  {item.tag}
                </span>
              )}
              {item.serviceTag && (
                <span className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-[0.1em] text-white bg-[#2d2d2d] rounded-sm">
                  {item.serviceTag}
                </span>
              )}
            </div>
            
            {/* Title & Price */}
            <h3 className="text-[1.1rem] leading-tight font-bold mb-1" style={{ color: '#1c1917', fontFamily: "'DM Serif Display', serif" }}>
              {item.name}
            </h3>
            <p className="text-[0.95rem] font-bold tracking-tight mb-2" style={{ color: '#44403c' }}>
              {item.price > 0 ? formatCurrency(item.price) : freeLabel}
            </p>
            
            {/* Description */}
            <p className="text-[0.8rem] leading-relaxed text-[#78716c] line-clamp-2 pr-1 mb-3 font-normal">
              {item.description}
            </p>
            
            {/* Meta */}
            <div className="flex items-center gap-3">
              {item.prepTime && (
                <span className="text-[10px] font-semibold text-[#a8a29e] flex items-center gap-1">
                  <span>⏰</span> {item.prepTime}
                </span>
              )}
              {item.spiceLevel && item.spiceLevel !== 'None' && (
                <span style={{ color: item.spiceLevel === 'Hot' ? '#b91c1c' : '#d97706' }} className="text-[10px] font-bold">
                  {item.spiceLevel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Image & Action */}
        <div className="flex flex-col items-center shrink-0 w-24 sm:w-28 pl-1">
          <div className="relative w-full aspect-square bg-[#f5f5f4] rounded-lg overflow-hidden shrink-0 mb-3 border border-[#e7e5e4]/50">
            <ImageWithFallback
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 max-w-full"
            />
          </div>
          
          {/* Isolated Action Button (Decoupled from Card Click) */}
          <div className="w-full flex justify-end group/add">
            <button
              onClick={(e) => { e.stopPropagation(); onAdd(e); }}
              style={{ touchAction: 'manipulation' }}
              aria-label={`Add ${item.name} to cart`}
              className="inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white border border-[#e7e5e4] shadow-[0_2px_8px_rgba(0,0,0,0.04)] text-[#1c1917] hover:border-[#1c1917] hover:bg-[#1c1917] hover:text-[#ffffff] rounded-full transition-colors font-bold text-[10px] uppercase tracking-widest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c1917]/50"
            >
              <Plus className="w-3 h-3 transition-transform group-hover/add:scale-110" aria-hidden="true" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
