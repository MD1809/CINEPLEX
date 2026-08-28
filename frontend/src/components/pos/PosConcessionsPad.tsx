import React, { useState } from 'react';
import { Snack } from '../../types/snack';
import { Popcorn, Plus, Minus } from 'lucide-react';

interface PosConcessionsPadProps {
  snacks: Snack[];
  selectedSnacks: { [snackId: number]: number };
  onUpdateQuantity: (snackId: number, delta: number) => void;
  isLoading: boolean;
}

export const PosConcessionsPad: React.FC<PosConcessionsPadProps> = ({
  snacks,
  selectedSnacks,
  onUpdateQuantity,
  isLoading,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories: { label: string; value: string }[] = [
    { label: 'Tất Cả', value: 'ALL' },
    { label: 'Bắp Rang', value: 'POPCORN' },
    { label: 'Nước Uống', value: 'DRINK' },
    { label: 'Combo Tiết Kiệm', value: 'COMBO' },
    { label: 'Ăn Vặt', value: 'SNACK' },
  ];

  const filteredSnacks = snacks.filter(
    (s) => selectedCategory === 'ALL' || s.category === selectedCategory
  );

  return (
    <div className="flex flex-col h-full bg-[#161b22] rounded-3xl border border-slate-800/80 p-4 shadow-xl select-none">
      {/* Header & Categories */}
      <div className="space-y-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Popcorn className="w-4 h-4" />
            </div>
            <h2 className="font-extrabold text-white text-sm tracking-wide">Bắp Nước & Combo</h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Chọn nhanh tại quầy</span>
        </div>

        {/* Category Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Snack Grid */}
      <div className="flex-1 overflow-y-auto pt-2.5 pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-2">
            <div className="w-7 h-7 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Đang tải danh mục bắp nước...</span>
          </div>
        ) : filteredSnacks.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-xs font-bold">Không có sản phẩm nào trong mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {filteredSnacks.map((snack) => {
              const qty = selectedSnacks[snack.id] || 0;
              const hasSelected = qty > 0;

              return (
                <div
                  key={snack.id}
                  className={`flex flex-col justify-between p-3 rounded-2xl border transition-all duration-150 ${
                    hasSelected
                      ? 'bg-gradient-to-b from-amber-500/15 to-[#161b22] border-amber-400/80 shadow-md shadow-amber-500/10'
                      : 'bg-[#0d1117]/90 hover:bg-[#0d1117] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-white text-xs line-clamp-1">
                        {snack.name}
                      </h4>
                      {snack.category === 'COMBO' && (
                        <span className="text-[9px] bg-red-500/20 text-red-300 font-black px-1 rounded border border-red-500/30">
                          HOT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-400 font-extrabold mt-1">
                      {snack.price.toLocaleString('vi-VN')}₫
                    </p>
                  </div>

                  {/* Quantity Actions */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                    <button
                      disabled={qty <= 0}
                      onClick={() => onUpdateQuantity(snack.id, -1)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        qty > 0
                          ? 'bg-slate-800 hover:bg-slate-700 text-white active:scale-90 cursor-pointer'
                          : 'bg-slate-900 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span
                      className={`text-xs font-black ${
                        qty > 0 ? 'text-amber-400' : 'text-slate-500'
                      }`}
                    >
                      {qty}
                    </span>

                    <button
                      onClick={() => onUpdateQuantity(snack.id, 1)}
                      className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm shadow-amber-500/20 active:scale-90 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
