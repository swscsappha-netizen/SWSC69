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
      className={`bg-white rounded-3xl p-4 border border-slate-200/70 shadow-sm transition-all duration-200 flex items-center justify-between gap-4 group ${
        isOutOfStock
          ? 'opacity-60 cursor-not-allowed bg-slate-50'
          : 'hover:border-brand-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer'
      }`}
    >
      {/* Left Info Column */}
      <div className="flex-1 min-w-0 pr-2">
        {/* Quota / Hot Badges */}
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
          {isOutOfStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              โควตาเต็มแล้ว (หมด)
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600 flex items-center gap-1 animate-pulse">
              <Flame className="w-3 h-3" />
              เหลือ {product.quotaRemaining} ที่สุดท้าย!
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
              โควตาเหลือ {product.quotaRemaining} ที่
            </span>
          )}

          {product.optionGroups.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
              ปรับแต่งได้
            </span>
          )}
        </div>

        {/* Product Title */}
        <h4 className="font-bold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
          {product.name}
        </h4>

        {/* Description */}
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Price & Action */}
        <div className="mt-3 flex items-center gap-3">
          <span className="font-extrabold text-base text-slate-900">
            ฿{product.basePrice}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">เริ่มต้น</span>
        </div>
      </div>

      {/* Right Image & Add Button */}
      <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shadow-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Floating Plus Button */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="absolute bottom-1.5 right-1.5 w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
            aria-label="Add item"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
}
