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
      className="w-full text-left group rounded-[28px] border overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
      style={{ backgroundColor: '#fff', borderColor: 'rgba(45,45,45,0.08)', boxShadow: '0 18px 32px rgba(45,45,45,0.05)' }}
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative w-full sm:w-44 h-48 sm:h-auto flex-shrink-0 overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.18), transparent)' }} />
        </div>

        <div className="flex-1 min-w-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
          {item.tag && (
              <span className="text-[9px] px-2 py-1 font-bold uppercase tracking-widest rounded-full" style={{ color: '#8a7648', backgroundColor: '#f7f2ea' }}>
              {item.tag}
            </span>
          )}
          {item.serviceTag && (
              <span className="text-[9px] px-2 py-1 font-bold uppercase tracking-widest rounded-full" style={{ backgroundColor: '#2d2d2d', color: '#faf8f5' }}>
              {item.serviceTag}
            </span>
          )}
        </div>
        
          <h3 className="text-[1.55rem] leading-tight mb-2" style={{ fontFamily: "'DM Serif Display', serif", color: '#2d2d2d' }}>
          {item.name}
        </h3>
        
          <p className="text-sm leading-7 line-clamp-3 mb-5" style={{ color: '#6c5f51' }}>
          {item.description}
        </p>
        
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {item.prepTime && (
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-2 rounded-full" style={{ color: '#7c6a54', backgroundColor: '#f6f1e9' }}>
                {item.prepTime}
              </span>
            )}
            {item.spiceLevel && item.spiceLevel !== 'None' && (
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-2 rounded-full" style={{ color: item.spiceLevel === 'Hot' ? '#b43c3c' : '#7c6a54', backgroundColor: '#f6f1e9' }}>
                {item.spiceLevel}
              </span>
            )}
            {item.dietaryTags?.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] uppercase tracking-[0.2em] font-bold px-3 py-2 rounded-full" style={{ color: '#7c6a54', backgroundColor: '#f6f1e9' }}>
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-base font-semibold tracking-wide" style={{ color: '#2d2d2d' }}>
            {item.price > 0 ? formatCurrency(item.price) : freeLabel}
          </p>
            <div
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] transition-all"
              style={{ color: '#8a7648' }}
            >
              <span>View dish</span>
              <div className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors group-hover:bg-[#2d2d2d] group-hover:text-white" style={{ borderColor: 'rgba(160,136,80,0.35)' }}>
                <Plus className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};
