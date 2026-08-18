'use client';

import React from 'react';
import { Search, X, Sparkles } from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categories = [
  { id: 'all', name: 'ทั้งหมด', icon: '🍽️', gradient: 'from-orange-500 to-amber-500' },
  { id: 'rice', name: 'ข้าว & จานหลัก', icon: '🍚', gradient: 'from-amber-500 to-yellow-500' },
  { id: 'noodle', name: 'ก๋วยเตี๋ยว & เส้น', icon: '🍜', gradient: 'from-red-500 to-orange-500' },
  { id: 'drink', name: 'ชานม & เครื่องดื่ม', icon: '🧋', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'dessert', name: 'ของหวาน & ปังปิ้ง', icon: '🍞', gradient: 'from-pink-500 to-rose-500' },
  { id: 'snack', name: 'ของทอด & ทานเล่น', icon: '🍗', gradient: 'from-purple-500 to-indigo-500' },
];

export default function CategoryPills({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: CategoryPillsProps) {
  return (
    <div className="space-y-4">
      {/* Search Input Bar */}
      <div className="relative w-full group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-orange-50 text-brand-600 flex items-center justify-center pointer-events-none group-focus-within:bg-brand-500 group-focus-within:text-white transition-all duration-300">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหาเมนูโปรด เช่น ข้าวมันไก่, ก๋วยเตี๋ยวต้มยำ, ชานม หรือชื่อร้าน..."
          className="w-full pl-14 pr-12 py-3.5 sm:py-4 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-500/15 focus:border-brand-500 text-xs sm:text-sm font-medium transition-all placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
            title="ล้างคำค้น"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills (Horizontal Scrollable with subtle glow) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar py-1">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                isSelected
                  ? `bg-gradient-to-r ${cat.gradient} text-white shadow-md shadow-brand-500/25 scale-[1.03]`
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 shadow-sm'
              }`}
            >
              <span className="text-base sm:text-lg">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
