import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { guestTheme } from '../styles/guestTheme';
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
      className={`group flex cursor-pointer overflow-hidden rounded-[1.35rem] ${guestTheme.bg.surface} shadow-[0_0_0_1px_rgba(227,226,224,0.8)] transition-all duration-300`}
    >
      <div className={`h-36 w-[9.25rem] flex-shrink-0 overflow-hidden ${guestTheme.bg.surfaceMuted}`}>
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between px-5 py-4">
        <div>
          <h3 className={`font-headline text-[2.05rem] leading-[1.06] ${guestTheme.text.base}`}>{item.name}</h3>
          <p className={`mt-2 line-clamp-2 text-[1rem] italic leading-[1.45] ${guestTheme.text.muted}`}>{item.description}</p>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <span className={`font-headline text-[2rem] leading-none ${guestTheme.text.primary}`}>
            {item.price > 0 ? formatCurrency(item.price) : freeLabel}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(e);
            }}
            style={{ touchAction: 'manipulation' }}
            aria-label={`Add ${item.name} to cart`}
            className={`inline-flex h-11 min-w-[6.75rem] items-center justify-center gap-1 rounded-md ${guestTheme.bg.primary} px-4 text-sm font-semibold uppercase tracking-[0.12em] ${guestTheme.text.onPrimary} transition-all hover:brightness-110 active:scale-95`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
