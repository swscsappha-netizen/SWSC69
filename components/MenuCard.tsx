'use client';

import React from 'react';
import { Product } from '@/types';
import { Plus, Flame } from 'lucide-react';

interface MenuCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function MenuCard({ product, onSelect }: MenuCardProps) {
  const isOutOfStock = product.quotaRemaining <= 0 || !product.isAvailable;
  const isLowStock = product.quotaRemaining > 0 && product.quotaRemaining <= 10;

  return (
    <div
      onClick={() => !isOutOfStock && onSelect(product)}
      className={`bg-white rounded-xl p-3.5 border border-[#d9d9d9] shadow-sm transition-all duration-200 flex items-center justify-between gap-3.5 group ${
        isOutOfStock
          ? 'opacity-60 cursor-not-allowed bg-slate-50'
          : 'hover:border-[#10789f] hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
      }`}
    >
      {/* Left Info Column */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Quota / Hot Badges */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#858585]/20 text-[#333333]">
              โควตาเต็มแล้ว (หมด)
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#fff1f2] text-[#e3193b] border border-[#fecdd3] flex items-center gap-1 animate-pulse">
              <Flame className="w-3 h-3" />
              เหลือ {product.quotaRemaining} ที่สุดท้าย!
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f0f9fb] text-[#10789f] border border-[#b4e0ed]">
              โควตาเหลือ {product.quotaRemaining} ที่
            </span>
          )}

          {product.optionGroups.length > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#f4f6f8] text-[#858585] border border-[#d9d9d9]">
              ปรับแต่งได้
            </span>
          )}
        </div>

        {/* Product Title */}
        <h4 className="font-condensed font-bold text-lg text-[#333333] group-hover:text-[#10789f] transition-colors line-clamp-1 uppercase">
          {product.name}
        </h4>

        {/* Description */}
        <p className="text-xs text-[#858585] mt-0.5 line-clamp-2 leading-relaxed font-sans">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="font-condensed font-black text-xl text-[#333333]">
            ฿{product.basePrice}
          </span>
          <span className="text-[11px] text-[#858585] font-medium">เริ่มต้น</span>
        </div>
      </div>

      {/* Right Image & Add Button */}
      <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 border border-[#d9d9d9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Floating Plus Button with Domino's Red */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-lg bg-[#e3193b] hover:bg-[#cc1433] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all"
            aria-label="Add item"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
}
