'use client';

import React from 'react';
import { Search } from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categories = [
  { id: 'all', name: 'ทั้งหมด', icon: '🍽️' },
  { id: 'rice', name: 'ข้าว & อาหารจานเดียว', icon: '🍚' },
  { id: 'noodle', name: 'ก๋วยเตี๋ยว & บะหมี่', icon: '🍜' },
  { id: 'drink', name: 'ชานม & เครื่องดื่ม', icon: '🧋' },
  { id: 'dessert', name: 'ของหวาน & ปังปิ้ง', icon: '🍞' },
  { id: 'snack', name: 'ของทอด & ทานเล่น', icon: '🍗' },
];

export default function CategoryPills({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}: CategoryPillsProps) {
  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหาชื่ออาหาร, ร้านค้า, หรือล็อกโรงอาหาร..."
          className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-lg"
          >
            ล้างคำค้น
          </button>
        )}
      </div>

      {/* Category Pills (Horizontal Scrollable) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-brand-600 to-amber-500 text-white shadow-md shadow-brand-500/25 scale-[1.02]'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/70 hover:border-slate-300'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
