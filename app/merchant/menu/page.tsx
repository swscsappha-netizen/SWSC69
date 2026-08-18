'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  Plus,
  Clock,
  Utensils,
  Save,
  CheckCircle2,
  Power,
  Edit2,
  Trash2,
  ShieldCheck,
} from 'lucide-react';

export default function MerchantMenuManagerPage() {
  const router = useRouter();
  const { shops, products, currentUser, updateShop, updateProductQuota, toggleProductAvailability, deleteProduct, showToast } =
    useApp();

  if (shops.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Utensils className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">ยังไม่มีร้านค้าในระบบ</h1>
        <p className="text-xs text-slate-500">กรุณาสร้างหรือเปิดร้านค้าก่อนจึงจะสามารถจัดการเมนูอาหารได้</p>
        <Link
          href={currentUser.role === 'ADMIN' ? '/admin' : '/merchant'}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-2xl text-xs font-bold"
        >
          {currentUser.role === 'ADMIN' ? 'ไปที่หน้าแอดมิน' : 'กลับแดชบอร์ด'}
        </Link>
      </div>
    );
  }

  const currentShopId = currentUser.shopId || shops[0]?.id;
  const shop = shops.find((s) => s.id === currentShopId) || shops[0];
  const shopProducts = products.filter((p) => p.shopId === shop?.id);

  // Shop Cutoff Time state
  const [cutoffTime, setCutoffTime] = useState(shop?.cutoffTime || '20:00');

  const handleSaveCutoff = () => {
    if (!shop) return;
    updateShop(shop.id, { cutoffTime });
    showToast('success', 'บันทึกเวลาตัดรอบแล้ว', `เวลาปิดรับออเดอร์ใหม่คือ ${cutoffTime} น.`);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`ต้องการลบเมนู "${productName}" ออกจากระบบหรือไม่?`)) {
      deleteProduct(productId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับแดชบอร์ด</span>
        </button>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-900">{shop?.name}</span>
          <div className="text-[11px] text-slate-500">{shop?.stallName}</div>
        </div>
      </div>

      {/* Cutoff Time Config Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900">เวลาตัดรอบรับออเดอร์ของร้าน</div>
            <div className="text-xs text-slate-500">ระบบจะปิดรับออเดอร์สำหรับมื้อเช้าวันพรุ่งนี้อัตโนมัติ</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="time"
            value={cutoffTime}
            onChange={(e) => setCutoffTime(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
          />
          <button
            onClick={handleSaveCutoff}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึก</span>
          </button>
        </div>
      </div>

      {/* Product List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">รายการเมนูอาหาร ({shopProducts.length} เมนู)</h2>
            <p className="text-xs text-slate-500">เปิด-ปิดการขาย และกำหนดจำนวนจานที่พร้อมขายในแต่ละวัน</p>
          </div>

          <Link
            href="/merchant/menu/new"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มเมนูใหม่</span>
          </Link>
        </div>

        {shopProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <Utensils className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-bold text-slate-700">ยังไม่มีรายการเมนูในร้านนี้</div>
            <p className="text-xs">กดปุ่ม &quot;เพิ่มเมนูใหม่&quot; เพื่อเริ่มลงรายการอาหาร</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shopProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <Utensils className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">{product.name}</div>
                    <div className="text-xs text-brand-600 font-extrabold mt-0.5">฿{product.basePrice}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">โควตา: {product.dailyQuota} ที่ / วัน</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => toggleProductAvailability(product.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      product.isAvailable
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {product.isAvailable ? 'เปิดขาย 🟢' : 'ปิดชั่วคราว 🔴'}
                  </button>

                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    title="ลบเมนู"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
