import React from 'react';
import { Plus } from 'lucide-react';
import { MenuItem } from '../types';
import { formatCurrency } from '../utils/format';

interface ProductCardProps {
  item: MenuItem;
  onClick: () => void;
  freeLabel: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onClick, freeLabel }) => {
  return (
    <div 
      className="bg-white rounded-[1.5rem] overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex h-32 relative group cursor-pointer hover:shadow-md hover:border-slate-200 transition-all active:scale-[0.99]" 
      onClick={onClick}
    >
      <div className="w-32 h-full flex-shrink-0 bg-slate-100">
         <img 
           src={item.image} 
           alt={item.name} 
           loading="lazy"
           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
         />
      </div>
      <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
         <div>
            <div className="flex justify-between items-start gap-2">
                 <h3 className="font-serif font-bold text-slate-900 leading-tight mb-1 line-clamp-1 group-hover:text-orange-600 transition-colors">{item.name}</h3>
                 {item.tag && (
                   <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded uppercase flex-shrink-0 tracking-wide">
                     {item.tag}
                   </span>
                 )}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight line-clamp-2 mt-1">{item.description}</p>
         </div>
         <div className="flex items-end justify-between mt-2">
            <p className="font-bold text-sm text-slate-900">
              {item.price === 0 ? freeLabel : formatCurrency(item.price)}
            </p>
            <div className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-900 group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">
               <Plus className="w-4 h-4" />
            </div>
         </div>
      </div>
    </div>
  );
};
