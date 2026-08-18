'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Store,
  MapPin,
  ArrowLeft,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotalPrice, cartTotalItems } =
    useApp();

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-100 text-brand-600 flex items-center justify-center shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          ยังไม่มีรายการอาหารในตะกร้า
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          เลือกสั่งเมนูโปรดล่วงหน้าวันนี้ เพื่อไปรับอาหารร้อนๆ ที่โรงอาหารสรรพวิทยาคมในตอนเช้า
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-600 to-amber-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-xl transition-all"
        >
          <span>ไปเลือกสั่งอาหารเลย</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Group cart items by shop
  const groupedByShop = cart.reduce((acc, item) => {
    if (!acc[item.shopId]) {
      acc[item.shopId] = {
        shopId: item.shopId,
        shopName: item.shopName,
        stallName: item.stallName,
        items: [],
        subtotal: 0,
      };
    }
    acc[item.shopId].items.push(item);
    acc[item.shopId].subtotal += item.unitPrice * item.quantity;
    return acc;
  }, {} as Record<string, { shopId: string; shopName: string; stallName: string; items: typeof cart; subtotal: number }>);

  const shopGroups = Object.values(groupedByShop);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ตะกร้าสินค้า ({cartTotalItems} รายการ)
            </h1>
            <p className="text-xs text-slate-500">
              สั่งวันนี้ รับพรุ่งนี้เช้า (06:45 - 07:45 น.)
            </p>
          </div>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl transition-colors"
        >
          ล้างตะกร้า
        </button>
      </div>

      {/* Cart Items Grouped by Shop */}
      <div className="space-y-6">
        {shopGroups.map((group) => (
          <div
            key={group.shopId}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden"
          >
            {/* Shop Header */}
            <div className="bg-slate-50 p-4 border-b border-slate-200/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{group.shopName}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 text-brand-600" />
                    <span>{group.stallName}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400">ยอดรวมร้านนี้</span>
                <div className="font-extrabold text-sm text-brand-600">฿{group.subtotal}</div>
              </div>
            </div>

            {/* Item list */}
            <div className="p-4 space-y-4 divide-y divide-slate-100">
              {group.items.map((item) => (
                <div key={item.id} className="pt-4 first:pt-0 flex items-start gap-3">
                  {/* Photo */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {item.productName}
                      </h4>
                      <span className="font-extrabold text-sm text-slate-900 ml-2">
                        ฿{item.unitPrice * item.quantity}
                      </span>
                    </div>

                    {/* Selected Options */}
                    {item.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                        {item.selectedOptions.map((opt, i) => (
                          <div key={i}>
                            • {opt.groupTitle}: {opt.itemName} {opt.priceDelta > 0 && `(+${opt.priceDelta}฿)`}
                          </div>
                        ))}
                      </div>
                    )}

                    {item.specialInstructions && (
                      <div className="text-[11px] text-amber-700 font-medium mt-1">
                        หมายเหตุ: {item.specialInstructions}
                      </div>
                    )}

                    {/* Controls */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-bold text-xs text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors"
                        title="ลบรายการนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary & Checkout Button Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-md space-y-4">
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-500">
            <span>จำนวนรายการทั้งหมด:</span>
            <span className="font-bold text-slate-800">{cartTotalItems} รายการ</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>จำนวนร้านค้าที่สั่ง:</span>
            <span className="font-bold text-slate-800">{shopGroups.length} ร้านค้า</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold">
            <span className="text-slate-800 text-sm sm:text-base">ยอดรวมสุทธิ (PromptPay):</span>
            <span className="text-2xl sm:text-3xl font-black text-brand-600">฿{cartTotalPrice}</span>
          </div>
        </div>

        <Link
          href="/checkout"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-brand-500/25 hover:shadow-2xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>ดำเนินการชำระเงิน (Split Checkout)</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
