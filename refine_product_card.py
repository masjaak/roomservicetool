import re

with open('src/components/ProductCard.tsx', 'r') as f:
    content = f.read()

# Let's completely rewrite ProductCard for a luxury feel:
# Removed ugly borders, replaced with subtle line separators, quiet typography, sophisticated layout.
new_card = """import React from 'react';
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
      className="w-full text-left group transition-all duration-500 overflow-hidden bg-transparent border-b pb-8 mb-4 last:border-b-0 hover:bg-white/50"
      style={{ borderColor: 'rgba(0,0,0,0.06)' }}
    >
      <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 items-stretch">
        <div className="relative w-full sm:w-40 sm:h-40 aspect-square flex-shrink-0 overflow-hidden bg-[#faf8f5]">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-105 filter group-hover:contrast-125"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col pt-2 sm:pt-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {item.tag && (
              <span className="text-[10px] px-2 py-0.5 font-medium uppercase tracking-[0.15em] text-[#78716c] border border-[#e7e5e4]">
                {item.tag}
              </span>
            )}
            {item.serviceTag && (
              <span className="text-[10px] px-2 py-0.5 font-medium uppercase tracking-[0.15em] text-white bg-[#1c1917]">
                {item.serviceTag}
              </span>
            )}
          </div>
        
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="text-[1.35rem] leading-[1.2]" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#1c1917', fontWeight: 600 }}>
              {item.name}
            </h3>
            <p className="text-[0.9rem] font-medium tracking-wide mt-1" style={{ color: '#1c1917', fontFamily: "'Manrope', sans-serif" }}>
              {item.price > 0 ? formatCurrency(item.price) : freeLabel}
            </p>
          </div>
        
          <p className="text-[0.85rem] leading-relaxed line-clamp-2 max-w-lg mb-6" style={{ color: '#78716c', fontWeight: 400, fontFamily: "'Manrope', sans-serif" }}>
            {item.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-auto">
            {item.prepTime && (
              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-[#a8a29e]">
                {item.prepTime}
              </span>
            )}
            {item.spiceLevel && item.spiceLevel !== 'None' && (
              <span style={{ color: item.spiceLevel === 'Hot' ? '#991b1b' : '#a8a29e' }} className="text-[10px] uppercase tracking-[0.15em] font-semibold">
                {item.spiceLevel}
              </span>
            )}
            <div className="ml-auto inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] font-semibold transition-all text-[#1c1917]/50 group-hover:text-[#1c1917]">
              <span>View</span>
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
"""

with open('src/components/ProductCard.tsx', 'w') as f:
    f.write(new_card)

print("ProductCard refined.")
