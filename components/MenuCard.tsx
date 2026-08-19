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
      className={`bg-white rounded-xs p-3.5 border border-[#451400] shadow-tile transition-all duration-200 flex items-center justify-between gap-3.5 group ${
        isOutOfStock
          ? 'opacity-60 cursor-not-allowed bg-slate-50'
          : 'hover:border-[#000000] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer'
      }`}
    >
      {/* Left Info Column */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Quota / Hot Badges */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-[#786259]/20 text-[#451400]">
              โควตาเต็มแล้ว (หมด)
            </span>
          ) : isLowStock ? (
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-black bg-[#fef08a] text-[#ad2118] border border-[#ad2118]/30 flex items-center gap-1 animate-pulse font-sans">
              <Flame className="w-3 h-3 text-[#ad2118]" />
              เหลือ {product.quotaRemaining} ที่สุดท้าย!
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold bg-[#f2f2f2] text-[#451400] border border-[#d4cbc7] font-sans">
              โควตาเหลือ {product.quotaRemaining} ที่
            </span>
          )}

          {product.optionGroups.length > 0 && (
            <span className="px-2 py-0.5 rounded-xs text-[10px] font-semibold bg-[#f2f2f2] text-[#786259] border border-[#d4cbc7] font-sans">
              ปรับแต่งได้
            </span>
          )}
        </div>

        {/* Product Title (24px Trade Gothic / Oswald Stack) */}
        <h4 className="font-display font-bold text-lg text-[#451400] group-hover:text-[#b68207] transition-colors line-clamp-1 uppercase tracking-wide">
          {product.name}
        </h4>

        {/* Description (Nunito 18/400) */}
        <p className="text-xs text-[#786259] mt-0.5 line-clamp-2 leading-relaxed font-sans">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="mt-2.5 flex items-center gap-2">
          <span className="font-display font-black text-xl text-[#451400]">
            ฿{product.basePrice}
          </span>
          <span className="text-[11px] text-[#786259] font-medium font-sans">เริ่มต้น</span>
        </div>
      </div>

      {/* Right Image & Add Button (Die-Cut Food Photography on 4px-cornered box) */}
      <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xs overflow-hidden bg-slate-100 border border-[#d4cbc7]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Floating Plus Button with Burnt Umber */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-xs bg-[#451400] hover:bg-[#6b321b] text-white flex items-center justify-center border border-[#000000] shadow-xs hover:scale-110 active:scale-95 transition-all"
            aria-label="Add item"
          >
            <Plus className="w-5 h-5 stroke-[3] text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
