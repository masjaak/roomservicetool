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
    <div className="w-full bg-[#ffffff] border-b border-[#e7e5e4] last:border-b-0 py-6 mb-2">
      <div className="flex flex-row gap-5 items-start">
        {/* Left: Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
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
            <h3 className="text-[1.15rem] leading-tight font-bold mb-1" style={{ color: '#1c1917', fontFamily: "'DM Serif Display', serif" }}>
              {item.name}
            </h3>
            <p className="text-[0.95rem] font-bold tracking-tight mb-2" style={{ color: '#44403c' }}>
              {item.price > 0 ? formatCurrency(item.price) : freeLabel}
            </p>
            
            {/* Description */}
            <p className="text-[0.8rem] leading-relaxed text-[#78716c] line-clamp-2 pr-2 mb-4 font-normal">
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

          {/* CTA: Distinct, unmistakable action */}
          <div className="mt-5">
            <button
              onClick={(e) => { e.stopPropagation(); onClick(); }}
              className="group inline-flex items-center gap-2 px-6 py-2.5 bg-[#f5f5f4] hover:bg-[#2d2d2d] hover:text-[#ffffff] text-[#1c1917] rounded-full transition-colors font-bold text-[11px] uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Right: Image */}
        <div 
          className="relative w-[100px] sm:w-[130px] aspect-square flex-shrink-0 bg-[#f5f5f4] rounded-lg overflow-hidden cursor-pointer"
          onClick={onClick}
        >
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
      </div>
    </div>
  );
};
