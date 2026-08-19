'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import BannerCarousel from '@/components/BannerCarousel';
import CategoryPills from '@/components/CategoryPills';
import ShopCard from '@/components/ShopCard';
import MenuCard from '@/components/MenuCard';
import CustomizationModal from '@/components/CustomizationModal';
import { Product, Shop } from '@/types';
import {
  Utensils,
  Sparkles,
  Clock,
  Store,
  ShieldCheck,
  Zap,
  CreditCard,
  Ticket,
  ChevronRight,
  PlusCircle,
} from 'lucide-react';

export default function HomePage() {
  const { shops, products, currentUser, systemSettings } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);

  // Filter products based on category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && p.isAvailable;
  });

  // Filter shops based on search query
  const filteredShops = shops.filter((s) => {
    if (!s.isApproved) return false;
    if (!searchQuery) return true;
    return (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.stallName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleProductSelect = (product: Product) => {
    const shop = shops.find((s) => s.id === product.shopId) || null;
    setSelectedProduct(product);
    setSelectedShop(shop);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Carousel (If any announcements exist) */}
      <BannerCarousel />

      {/* School Canteen Info Bar & Welcome Hero in Chipotle Burnt Umber Style */}
      <div className="relative overflow-hidden rounded-md bg-[#451400] p-6 sm:p-8 text-white shadow-tile border border-[#000000]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xs text-xs font-black font-display uppercase tracking-wider bg-[#b68207] text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                โรงเรียนสรรพวิทยาคม
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xs text-xs font-bold bg-[#6b321b] text-[#f2f2f2] border border-[#786259]">
                {currentUser.isLoggedIn
                  ? `ยินดีต้อนรับ, ${currentUser.nickname || currentUser.name} (${currentUser.gradeRoom || 'ส.ว.'})`
                  : 'ระบบสั่งอาหารล่วงหน้าออนไลน์'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-wider uppercase text-white">
              สั่งอาหารล่วงหน้าง่ายๆ <span className="text-[#b68207]">รับไวไม่ต้องรอคิว</span> 🍱
            </h1>

            <p className="text-xs sm:text-sm text-[#dec2b4] flex items-center gap-2 flex-wrap font-medium font-sans">
              <span className="inline-flex items-center gap-1 text-white font-bold bg-[#6b321b] px-2.5 py-1 rounded-xs border border-[#786259]">
                <Clock className="w-4 h-4 text-[#b68207]" />
                เวลารับอาหาร: {systemSettings.pickupTimeWindow || '06:45 - 07:45 น.'}
              </span>
              <span className="text-white/40 hidden sm:inline">•</span>
              <span>จุดรับ: ล็อกหน้าร้านค้าในโรงอาหาร</span>
            </p>
          </div>

          {/* Live Status Pill */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-3 rounded-xs bg-[#6b321b] border border-[#786259] flex items-center gap-3 shadow-inner">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b68207] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#b68207]" />
              </span>
              <div>
                <div className="text-xs font-black uppercase tracking-wider font-display text-white">เปิดรับออเดอร์มื้อเช้า</div>
                <div className="text-[11px] text-[#dec2b4] font-semibold">สั่งวันนี้ รับพรุ่งนี้เช้า</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Quick Benefit Pills */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#6b321b] text-xs text-[#dec2b4] font-sans">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xs bg-[#b68207] text-white flex items-center justify-center shrink-0 shadow-xs font-black">
              <Zap className="w-4 h-4" />
            </div>
            <span className="font-semibold text-white">สั่งล่วงหน้า ไม่ต้องยืนต่อแถวนาน</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xs bg-[#6b321b] border border-[#786259] text-[#b68207] flex items-center justify-center shrink-0 shadow-xs">
              <CreditCard className="w-4 h-4 text-[#b68207]" />
            </div>
            <span className="font-semibold text-white">สแกนจ่ายสะดวกด้วย พร้อมเพย์ (PromptPay)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xs bg-[#6b321b] border border-[#786259] text-[#b68207] flex items-center justify-center shrink-0 shadow-xs">
              <Ticket className="w-4 h-4 text-[#b68207]" />
            </div>
            <span className="font-semibold text-white">ยื่นตั๋วรับของด้วยรหัส 4 หลักรวดเร็ว</span>
          </div>
        </div>
      </div>

      {/* Search Bar & Category Filter */}
      <CategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Section 1: Canteen Shops (ร้านค้าในโรงอาหาร) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xs bg-[#f2f2f2] text-[#451400] border border-[#451400] flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#451400] tracking-wide uppercase">
                ร้านค้าในโรงอาหารสรรพวิทยาคม
              </h2>
              <p className="text-[11px] text-[#786259] font-medium font-sans">เลือกร้านค้าเพื่อดูเมนูและสั่งอาหารล่วงหน้า</p>
            </div>
          </div>
          <span className="text-xs font-bold font-display uppercase tracking-wider text-[#451400] px-3 py-1 bg-[#f2f2f2] rounded-xs border border-[#451400]">
            {filteredShops.length} ร้านค้าที่เปิดรับ
          </span>
        </div>

        {/* When NO shops in Supabase: Beautiful & Informative Empty State */}
        {filteredShops.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white to-slate-50 border border-slate-200/90 p-8 sm:p-12 shadow-sm text-center space-y-6">
            
            {/* Ambient Badge */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-100 via-orange-100 to-amber-50 text-brand-600 flex items-center justify-center text-4xl shadow-glow border border-amber-200 animate-bounce">
              🍱
            </div>

            <div className="space-y-2 max-w-lg mx-auto">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                ยังไม่มีร้านค้าเปิดรับออเดอร์ในขณะนี้
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                ระบบเชื่อมต่อฐานข้อมูล Supabase Cloud เรียบร้อยแล้ว เมื่อแม่ค้าเปิดร้านและเพิ่มรายการอาหาร เมนูทั้งหมดจะแสดงที่นี่แบบเรียลไทม์ทันที
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/merchant/register"
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ ยื่นขอเปิดร้านค้าใหม่ (สำหรับแม่ค้า)</span>
              </Link>

              {currentUser.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>จัดการร้านค้าและระบบ (แอดมิน)</span>
                </Link>
              )}
            </div>

            {/* How it works 3-Step Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 text-left">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center font-black text-xs">
                  1
                </div>
                <div className="font-bold text-xs text-slate-800">เลือกร้านและเมนูโปรด</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  เลือกอาหาร เครื่องดื่ม พร้อมระบุตัวเลือก เช่น ขนาด หวานน้อย หรือท็อปปิ้ง
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">
                  2
                </div>
                <div className="font-bold text-xs text-slate-800">สแกนจ่ายด้วย PromptPay</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  โอนเงินเข้าบัญชีพร้อมเพย์ของร้านค้า แนบสลิป แม่ค้าตรวจสอบทันที
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                  3
                </div>
                <div className="font-bold text-xs text-slate-800">รับอาหารเช้าด้วยรหัส 4 หลัก</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  ไปที่หน้าร้านค้าตามเวลา 06:45 - 07:45 น. ยื่นรหัสตั๋วรับอาหารได้ทันที
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} products={products} />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Available Menus (เมนูอาหารพร้อมสั่ง) - Only display if there are products */}
      {filteredProducts.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#d4cbc7]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xs bg-[#f2f2f2] text-[#451400] border border-[#451400] flex items-center justify-center shadow-xs">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#451400] tracking-wide uppercase">
                  เมนูอาหารแนะนำพร้อมสั่ง
                </h2>
                <p className="text-[11px] text-[#786259] font-medium font-sans">เลือกเมนูใส่ตะกร้าและสั่งจองล่วงหน้า</p>
              </div>
            </div>
            <span className="text-xs font-bold font-display uppercase tracking-wider text-[#451400] px-3 py-1 bg-[#f2f2f2] rounded-xs border border-[#451400]">
              {filteredProducts.length} รายการ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <MenuCard
                key={product.id}
                product={product}
                onSelect={handleProductSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Food Customization Modal */}
      <CustomizationModal
        product={selectedProduct}
        shop={selectedShop}
        onClose={() => {
          setSelectedProduct(null);
          setSelectedShop(null);
        }}
      />
    </div>
  );
}
