import React from 'react';
import { Plus, Minus, Sparkles } from 'lucide-react';
import { Snack } from '../../types/snack';

interface SnackCardProps {
  snack: Snack;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export const SnackCard: React.FC<SnackCardProps> = ({
  snack,
  quantity,
  onIncrease,
  onDecrease,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const isSelected = quantity > 0;
  const isCombo = snack.category === 'COMBO';

  const defaultImage = isCombo
    ? 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=500&auto=format&fit=crop&q=80'
    : snack.category === 'DRINK'
    ? 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&auto=format&fit=crop&q=80';

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl bg-[#18191E] border transition-all duration-300 overflow-hidden group shadow-lg ${
        isSelected
          ? 'border-red-500/80 bg-[#202127] shadow-[0_0_20px_rgba(229,9,20,0.25)] scale-[1.01]'
          : 'border-white/10 hover:border-white/20 hover:bg-[#1e1f25]'
      }`}
    >
      {/* Category Ribbon / Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center space-x-1">
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-md ${
            isCombo
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black flex items-center space-x-1'
              : snack.category === 'DRINK'
              ? 'bg-blue-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {isCombo && <Sparkles className="w-2.5 h-2.5" />}
          <span>{isCombo ? 'Combo Tiết Kiệm' : snack.category === 'DRINK' ? 'Nước Ngọt' : 'Bắp Rang'}</span>
        </span>
      </div>

      {/* Image Thumbnail */}
      <div className="relative w-full aspect-[16/10] bg-black/40 overflow-hidden">
        <img
          src={snack.imageUrl || defaultImage}
          alt={snack.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18191E] via-transparent to-transparent" />
      </div>

      {/* Body Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight line-clamp-1 font-serif">
            {snack.name}
          </h4>
          {snack.description && (
            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
              {snack.description}
            </p>
          )}
        </div>

        {/* Price & Quantity Selector */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
          <span className="text-base font-black text-red-500 font-mono tracking-tight">
            {formatPrice(snack.price)}
          </span>

          <div className="flex items-center space-x-1.5 bg-[#121317] p-1 rounded-xl border border-white/10">
            <button
              onClick={onDecrease}
              disabled={quantity === 0}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                quantity > 0
                  ? 'bg-white/10 hover:bg-white/20 text-white active:scale-90'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-6 text-center font-mono font-bold text-xs text-white">
              {quantity}
            </span>

            <button
              onClick={onIncrease}
              className="w-7 h-7 rounded-lg bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-sm shadow-red-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
