'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import BannerCarousel from '@/components/BannerCarousel';
import CategoryPills from '@/components/CategoryPills';
import ShopCard from '@/components/ShopCard';
import MenuCard from '@/components/MenuCard';
import CustomizationModal from '@/components/CustomizationModal';
import { Product, Shop } from '@/types';
import { Utensils, Sparkles, Clock, MapPin, Store } from 'lucide-react';

export default function HomePage() {
  const { shops, products, currentUser } = useApp();
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Banner Carousel */}
      <BannerCarousel />

      {/* School Canteen Info Bar */}
      <div className="bg-gradient-to-r from-brand-50 via-amber-50 to-emerald-50 rounded-3xl p-4 sm:p-5 border border-brand-200/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            ☀️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-900">
                ยินดีต้อนรับ, คุณ{currentUser.nickname} ({currentUser.gradeRoom})
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500 text-white font-bold">
                มื้อเช้าวันพรุ่งนี้
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <Clock className="w-3.5 h-3.5 text-brand-600" />
              <span>เวลารับอาหาร: 06:45 - 07:45 น. ที่หน้าร้านค้าในโรงอาหาร</span>
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2 text-xs font-bold text-emerald-800 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border border-emerald-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>ระบบเปิดรับออเดอร์สำหรับวันพรุ่งนี้</span>
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              ร้านค้าในโรงอาหารสรรพวิทยาคม
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredShops.length} ร้านค้าที่เปิดรับ
          </span>
        </div>

        {filteredShops.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl shadow-sm">
              🍱
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-800">
                ยังไม่มีร้านค้าเปิดรับออเดอร์ในขณะนี้
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                เมื่อแม่ค้าในโรงอาหารเปิดร้านและเพิ่มเมนู รายการอาหารและร้านค้าจะปรากฏที่นี่แบบเรียลไทม์
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href="/merchant/register"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all inline-flex items-center gap-2"
              >
                <span>+ ยื่นขอเปิดร้านค้าใหม่ 🏪</span>
              </a>
              {currentUser.role === 'ADMIN' && (
                <a
                  href="/admin"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>จัดการร้านค้าในระบบ (แอดมิน) 🛡️</span>
                </a>
              )}
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

      {/* Section 2: Popular & Available Menus (เมนูอาหารพร้อมสั่ง) */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              เมนูแนะนำประจำวัน
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {filteredProducts.length} รายการ
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <Utensils className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-bold text-slate-700">ไม่พบเมนูอาหารที่ค้นหา</div>
            <p className="text-xs">ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่นดูนะครับ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <MenuCard
                key={product.id}
                product={product}
                onSelect={handleProductSelect}
              />
            ))}
          </div>
        )}
      </div>

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
