'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Shop, Product } from '@/types';
import { Clock, Star, MapPin, ChevronRight, Sparkles } from 'lucide-react';

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
      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/70 shadow-sm hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Shop Banner & Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shop.imageUrl}
          alt={shop.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

        {/* Stall Badge (Top Left) */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-800 shadow-md flex items-center gap-1.5 border border-slate-100">
          <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span className="truncate max-w-[170px]">{shop.stallName}</span>
        </div>

        {/* Open/Close Status (Top Right) */}
        <div className="absolute top-3 right-3">
          {shop.isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              เปิดรับออเดอร์
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-800/90 text-slate-200 backdrop-blur-md">
              ปิดรับชั่วคราว
            </span>
          )}
        </div>

        {/* Cutoff Time Countdown (Bottom Left of Image) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 font-semibold bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>ปิดรับ {shop.cutoffTime} น.</span>
          </div>

          <div className="flex items-center gap-1 font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded-xl shadow-sm">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{displayRating.toFixed(1)}</span>
            {ratingData.count > 0 && <span className="text-[10px] text-slate-800">({ratingData.count})</span>}
          </div>
        </div>
      </div>

      {/* Shop Info Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
            {shop.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {shop.description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">
              {shopProducts.length} เมนูพร้อมสั่ง
            </span>
            {totalQuotaLeft > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-orange-50 text-brand-600 text-[11px] font-bold">
                เหลือ {totalQuotaLeft} ที่
              </span>
            )}
          </div>

          <div className="text-brand-600 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>สั่งเลย</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
