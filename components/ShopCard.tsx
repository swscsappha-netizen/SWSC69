'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Shop, Product } from '@/types';
import { Clock, Star, MapPin, ChevronRight } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
  products: Product[];
}

export default function ShopCard({ shop, products }: ShopCardProps) {
  const { getShopAverageRating } = useApp();
  const shopProducts = products.filter((p) => p.shopId === shop.id && p.isAvailable);
  const totalQuotaLeft = shopProducts.reduce((sum, p) => sum + p.quotaRemaining, 0);
  const ratingData = getShopAverageRating(shop.id);
  const displayRating = ratingData.count > 0 ? ratingData.average : shop.rating;

  return (
    <Link
      href={`/shop/${shop.id}`}
      className="group bg-white rounded-xs overflow-hidden border border-[#451400] shadow-tile hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {/* Shop Banner & Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shop.imageUrl}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#451400]/80 via-transparent to-black/20" />

        {/* Stall Badge (Top Left) */}
        <div className="absolute top-2.5 left-2.5 bg-white px-2.5 py-1 rounded-xs text-xs font-bold text-[#451400] shadow-xs flex items-center gap-1.5 border border-[#451400]">
          <MapPin className="w-3.5 h-3.5 text-[#451400] shrink-0" />
          <span className="truncate max-w-[170px]">{shop.stallName}</span>
        </div>

        {/* Open/Close Status (Top Right) */}
        <div className="absolute top-2.5 right-2.5">
          {shop.isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-bold bg-[#451400] text-white shadow-xs border border-white/20">
              <span className="w-2 h-2 rounded-full bg-[#b68207] animate-pulse" />
              เปิดรับออเดอร์
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs text-xs font-bold bg-[#786259] text-white">
              ปิดรับชั่วคราว
            </span>
          )}
        </div>

        {/* Cutoff Time Countdown (Bottom Left of Image) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs font-sans">
          <div className="flex items-center gap-1.5 font-semibold bg-black/70 px-2.5 py-1 rounded-xs">
            <Clock className="w-3.5 h-3.5 text-[#facc15]" />
            <span>ปิดรับ {shop.cutoffTime} น.</span>
          </div>

          <div className="flex items-center gap-1 font-bold bg-[#b68207] text-white px-2 py-0.5 rounded-xs shadow-xs">
            <Star className="w-3 h-3 fill-current" />
            <span>{displayRating.toFixed(1)}</span>
            {ratingData.count > 0 && <span className="text-[10px] text-white/90">({ratingData.count})</span>}
          </div>
        </div>
      </div>

      {/* Shop Info Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display font-bold text-xl text-[#451400] group-hover:text-[#b68207] transition-colors line-clamp-1 uppercase">
            {shop.name}
          </h3>
          <p className="text-xs text-[#786259] mt-1 line-clamp-2 leading-relaxed font-sans">
            {shop.description}
          </p>
        </div>

        {/* Footer Meta with Chipotle Burnt-Umber CTA Button */}
        <div className="mt-3.5 pt-3 border-t border-[#d4cbc7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#786259] font-sans">
              {shopProducts.length} เมนู
            </span>
            {totalQuotaLeft > 0 && (
              <span className="px-2 py-0.5 rounded-xs bg-[#f2f2f2] text-[#451400] text-[11px] font-bold border border-[#d4cbc7]">
                เหลือ {totalQuotaLeft} ที่
              </span>
            )}
          </div>

          <div className="bg-[#451400] group-hover:bg-[#6b321b] text-white font-sans uppercase font-extrabold text-xs px-3.5 py-1.5 rounded-xs flex items-center gap-1 border border-[#000000] shadow-xs transition-colors tracking-wider">
            <span>สั่งซื้อ</span>
            <ChevronRight className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
