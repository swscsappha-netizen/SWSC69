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
} from 'lucide-react';

export default function MerchantMenuManagerPage() {
  const router = useRouter();
  const { shops, products, currentUser, updateShop, updateProductQuota, toggleProductAvailability, deleteProduct, showToast } =
    useApp();

  const currentShopId = currentUser.shopId || 'shop_1';
  const shop = shops.find((s) => s.id === currentShopId) || shops[0];
  const shopProducts = products.filter((p) => p.shopId === shop.id);

  // Shop Cutoff Time state
  const [cutoffTime, setCutoffTime] = useState(shop.cutoffTime);

  const handleSaveCutoff = () => {
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
          <span className="text-xs font-bold text-slate-900">{shop.name}</span>
          <div className="text-[11px] text-slate-500">{shop.stallName}</div>
        </div>
      </div>

      {/* Cutoff Time Manager Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-slate-900">
              ตั้งค่าเวลาปิดรับออเดอร์ประจำวัน (Daily Cut-off Time)
            </h2>
            <p className="text-xs text-slate-500">
              เมื่อถึงเวลานี้ ระบบจะปิดรับออเดอร์ของร้านนี้โดยอัตโนมัติ
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="w-full sm:w-64">
            <label className="text-xs font-bold text-slate-700 block mb-1">เวลาปิดรับออเดอร์:</label>
            <input
              type="time"
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-base focus:bg-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            onClick={handleSaveCutoff}
            className="w-full sm:w-auto sm:self-end px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกเวลาปิดรอบ</span>
          </button>
        </div>
      </div>

      {/* Menu List & Quota Manager Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                รายการเมนูอาหาร &amp; โควตาประจำวัน ({shopProducts.length} เมนู)
              </h2>
              <p className="text-xs text-slate-500">ปรับโควตากล่องต่อวัน หรือเปิด-ปิดเมนูที่หมด</p>
            </div>
          </div>

          <Link
            href="/merchant/menu/new"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มเมนูใหม่</span>
          </Link>
        </div>


        {/* Existing Products List */}
        <div className="space-y-3 divide-y divide-slate-100">
          {shopProducts.map((product) => (
            <div
              key={product.id}
              className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{product.name}</h4>
                  <div className="text-slate-500">
                    ฿{product.basePrice} • {product.optionGroups.length} กลุ่มตัวเลือก
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                {/* Quota Input */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl">
                  <span className="text-slate-400">โควตา:</span>
                  <input
                    type="number"
                    value={product.dailyQuota}
                    onChange={(e) =>
                      updateProductQuota(product.id, parseInt(e.target.value) || 0)
                    }
                    className="w-12 text-center font-bold bg-white border border-slate-200 rounded-lg p-0.5"
                  />
                  <span className="text-slate-400">ที่</span>
                </div>

                {/* Availability Toggle */}
                <button
                  onClick={() => toggleProductAvailability(product.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                    product.isAvailable
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {product.isAvailable ? 'พร้อมขาย 🟢' : 'ปิดชั่วคราว 🔴'}
                </button>

                {/* Edit Button */}
                <Link
                  href={`/merchant/menu/${product.id}/edit`}
                  className="p-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition"
                  title="แก้ไขเมนู"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Link>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition"
                  title="ลบเมนู"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
