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
      {/* Search Input Bar with Chipotle Burnt-Umber Outline */}
      <div className="relative w-full group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xs bg-[#f2f2f2] text-[#451400] flex items-center justify-center pointer-events-none group-focus-within:bg-[#451400] group-focus-within:text-white transition-all duration-150">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="ค้นหาเมนูโปรด เช่น ข้าวมันไก่, ก๋วยเตี๋ยวต้มยำ, ชานม หรือชื่อร้าน..."
          className="w-full pl-12 pr-12 py-2.5 sm:py-3 bg-white rounded-xs border border-[#786259] focus:outline-none focus:ring-1 focus:ring-[#451400] focus:border-[#451400] text-xs sm:text-sm font-sans font-medium transition-all placeholder:text-[#786259]"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xs text-[#786259] hover:text-[#451400] hover:bg-[#f2f2f2] transition-all"
            title="ล้างคำค้น"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills in Chipotle Hard-Corner Tile Style */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar py-0.5">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xs text-xs sm:text-sm font-display uppercase tracking-wider transition-all duration-150 active:scale-95 ${
                isSelected
                  ? 'bg-[#451400] text-white shadow-xs border border-[#000000] font-black'
                  : 'bg-white text-[#451400] hover:bg-[#f2f2f2] border border-[#451400] font-bold'
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
