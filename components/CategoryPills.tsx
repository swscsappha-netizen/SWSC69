'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface CategoryPillsProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const categories = [
  { id: 'all', name: 'ทั้งหมด', icon: '🍽️' },
  { id: 'rice', name: 'ข้าว & จานหลัก', icon: '🍚' },
  { id: 'noodle', name: 'ก๋วยเตี๋ยว & เส้น', icon: '🍜' },
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
    <div className="space-y-3.5">
      {/* Search Input Bar with School Purple Accent */}
      <div className="relative w-full group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#faf5ff] text-[#6d28d9] flex items-center justify-center pointer-events-none group-focus-within:bg-[#6d28d9] group-focus-within:text-white transition-all duration-200">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหาเมนูโปรด เช่น ข้าวมันไก่, ก๋วยเตี๋ยวต้มยำ, ชานม หรือชื่อร้าน..."
          className="w-full pl-13 pr-12 py-3 bg-white rounded-xl border border-[#e9d5ff] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6d28d9]/20 focus:border-[#6d28d9] text-xs sm:text-sm font-medium transition-all placeholder:text-[#9ca3af]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded text-[#9ca3af] hover:text-[#6d28d9] hover:bg-[#faf5ff] transition-all"
            title="ล้างคำค้น"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills in School Purple & Yellow Style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar py-0.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-condensed font-bold uppercase tracking-wider transition-all duration-150 active:scale-95 ${
                isSelected
                  ? 'bg-[#6d28d9] text-[#facc15] shadow-md border border-[#5b21b6] font-black'
                  : 'bg-white text-[#1e1b4b] hover:text-[#6d28d9] hover:border-[#6d28d9] border border-[#e9d5ff]'
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
