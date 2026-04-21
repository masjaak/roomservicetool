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
      className={`group flex cursor-pointer overflow-hidden rounded-xl border ${guestTheme.border.strong} ${guestTheme.bg.surface} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(26,28,27,0.06)]`}
    >
      <div className={`h-32 w-32 flex-shrink-0 overflow-hidden ${guestTheme.bg.surfaceMuted}`}>
        <ImageWithFallback
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {item.tag && (
              <span className={`rounded-sm ${guestTheme.bg.surfaceSoft} px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${guestTheme.text.muted}`}>
                {item.tag}
              </span>
            )}
            {item.serviceTag && (
              <span className={`rounded-sm ${guestTheme.bg.primary} px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${guestTheme.text.onPrimary}`}>
                {item.serviceTag}
              </span>
            )}
          </div>
          <h3 className={`font-headline text-lg font-medium leading-tight ${guestTheme.text.base}`}>{item.name}</h3>
          <p className={`mt-1 text-xs italic ${guestTheme.text.muted}`}>{item.description}</p>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4">
          <span className={`font-headline text-base font-medium ${guestTheme.text.primary}`}>
            {item.price > 0 ? formatCurrency(item.price) : freeLabel}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(e);
            }}
            style={{ touchAction: 'manipulation' }}
            aria-label={`Add ${item.name} to cart`}
            className={`inline-flex items-center gap-1 rounded-lg ${guestTheme.bg.primary} px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] ${guestTheme.text.onPrimary} transition-all hover:brightness-110 active:scale-95`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
