'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import MenuCard from '@/components/MenuCard';
import CustomizationModal from '@/components/CustomizationModal';
import { Product, Shop } from '@/types';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Star,
  Phone,
  Store,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  const { shops, products, getShopReviews, getShopAverageRating } = useApp();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('all');

  const shop = shops.find((s) => s.id === shopId);
  const shopProducts = products.filter((p) => p.shopId === shopId);
  const shopReviews = shop ? getShopReviews(shop.id) : [];
  const ratingData = shop ? getShopAverageRating(shop.id) : { average: 5.0, count: 0 };

  if (!shop) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">ไม่พบร้านค้านี้ในระบบ</h1>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-2xl text-xs font-bold"
        >
          กลับหน้าหลัก
        </Link>
      </div>
    );
  }

  // Categories present in this shop
  const categoriesInShop = Array.from(new Set(shopProducts.map((p) => p.category)));

  const filteredShopProducts = shopProducts.filter((p) => {
    if (activeCategoryTab === 'all') return true;
    return p.category === activeCategoryTab;
  });

  const categoryLabels: Record<string, string> = {
    all: 'ทั้งหมด',
    rice: 'ข้าว & อาหารจานเดียว',
    noodle: 'ก๋วยเตี๋ยว & เส้น',
    drink: 'เครื่องดื่ม & ชานม',
    dessert: 'ของหวาน & ปังปิ้ง',
    snack: 'ของทานเล่น',
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับตลาดโรงอาหาร</span>
      </Link>

      {/* Shop Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden">
        {/* Banner */}
        <div className="relative h-48 sm:h-64 md:h-72 w-full bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shop.bannerUrl || shop.imageUrl}
            alt={shop.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Floating Badges on Banner */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-white/90 text-slate-900 backdrop-blur-md shadow-md flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              {shop.stallName}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            {shop.isOpen ? (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                เปิดรับออเดอร์
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-800 text-slate-300">
                ปิดรับชั่วคราว
              </span>
            )}
          </div>

          {/* Shop Title Info at bottom of Banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{ratingData.count > 0 ? ratingData.average.toFixed(1) : shop.rating.toFixed(1)}</span>
                <span className="text-slate-300">({ratingData.count > 0 ? ratingData.count : shop.totalOrdersCount} รีวิว)</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl text-amber-200">
                <Clock className="w-3.5 h-3.5" />
                <span>ปิดรับ {shop.cutoffTime} น.</span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md tracking-tight">
              {shop.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl line-clamp-2">
              {shop.description}
            </p>
          </div>
        </div>

        {/* Shop Meta Details Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span>เจ้าของร้าน: <strong>{shop.ownerName}</strong></span>
            <span>เบอร์โทร: <strong>{shop.phone}</strong></span>
            <span>พร้อมเพย์: <strong>{shop.promptPayNo}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-brand-700 bg-brand-50 px-3 py-1.5 rounded-xl border border-brand-200 font-semibold">
            <Info className="w-3.5 h-3.5" />
            <span>รับอาหารที่: {shop.stallName}</span>
          </div>
        </div>
      </div>

      {/* Sticky Category Tabs */}
      <div className="sticky top-16 md:top-20 z-20 bg-white/95 backdrop-blur-md py-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar">
        <button
          onClick={() => setActiveCategoryTab('all')}
          className={`shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeCategoryTab === 'all'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ทั้งหมด ({shopProducts.length})
        </button>

        {categoriesInShop.map((cat) => {
          const count = shopProducts.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategoryTab(cat)}
              className={`shrink-0 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeCategoryTab === cat
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {categoryLabels[cat] || cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Menu Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {categoryLabels[activeCategoryTab] || 'รายการเมนู'}
          </h2>
          <span className="text-xs text-slate-500 font-semibold">
            {filteredShopProducts.length} รายการ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShopProducts.map((product) => (
            <MenuCard
              key={product.id}
              product={product}
              onSelect={(p) => setSelectedProduct(p)}
            />
          ))}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 pt-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                คะแนน &amp; รีวิวจากเพื่อนๆ ในโรงเรียน
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              รีวิวร้าน {shop.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ความคิดเห็นจริงจากนักเรียนและคุณครูที่สั่งผ่านระบบ
            </p>
          </div>

          {/* Rating Summary Box */}
          <div className="flex items-center gap-4 bg-amber-50/70 border border-amber-200/80 px-5 py-3 rounded-2xl self-start sm:self-auto">
            <div className="text-center">
              <div className="text-3xl font-black text-amber-500 leading-none">
                {ratingData.average.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(ratingData.average) ? 'fill-current' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="border-l border-amber-200 pl-4 text-xs space-y-0.5">
              <div className="font-extrabold text-slate-900">
                คะแนนรวม
              </div>
              <div className="text-[11px] text-slate-500">
                จากทั้งหมด {shopReviews.length} รีวิว
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {shopReviews.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <div className="text-3xl">🍲</div>
            <div className="font-bold text-sm text-slate-700">ยังไม่มีรีวิวสำหรับร้านนี้</div>
            <p className="text-xs text-slate-400">
              สั่งอาหารล่วงหน้าแล้วมารีวิวความอร่อยเป็นคนแรกได้เลย!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3 hover:bg-slate-100/60 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center">
                      {rev.isAnonymous ? '?' : rev.userNickname.slice(0, 1)}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">
                        {rev.isAnonymous ? 'ไม่ระบุตัวตน' : `${rev.userNickname}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rev.userGradeRoom} • {new Date(rev.createdAt).toLocaleDateString('th-TH')}
                      </div>
                    </div>
                  </div>

                  {/* Stars Badge */}
                  <div className="flex items-center gap-0.5 px-2 py-1 bg-white rounded-xl border border-slate-200 shadow-2xs text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rev.rating}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-slate-100">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customization Modal */}
      <CustomizationModal
        product={selectedProduct}
        shop={shop}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
