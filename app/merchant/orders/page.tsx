'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Order } from '@/types';
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  QrCode,
  Check,
  User,
  Clock,
  MapPin,
  Utensils,
  Sparkles,
} from 'lucide-react';

export default function MerchantOrdersHandoverPage() {
  const router = useRouter();
  const { shops, orders, currentUser, findOrderByPickupCode, markOrderCompleted, markOrderReady, showToast } =
    useApp();

  const [searchCode, setSearchCode] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'ready' | 'completed'>('all');

  const currentShopId = currentUser.shopId || 'shop_1';
  const shop = shops.find((s) => s.id === currentShopId) || shops[0];

  const shopOrders = orders.filter((o) => o.shopId === shop.id);

  // Search match
  const matchedOrder = searchCode.trim() ? findOrderByPickupCode(searchCode) : null;

  const filteredOrders = shopOrders.filter((o) => {
    if (activeFilter === 'pending') return o.status === 'CONFIRMED';
    if (activeFilter === 'ready') return o.status === 'READY';
    if (activeFilter === 'completed') return o.status === 'COMPLETED';
    return true;
  });

  const handleCompleteOrder = (orderId: string) => {
    markOrderCompleted(orderId);
    setSearchCode('');
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

      {/* Quick 4-digit Pickup Search / Scan Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <div className="text-center space-y-1">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand-500 text-white uppercase tracking-wider">
            ระบบส่งมอบอาหารหน้าร้าน
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
            พิมพ์รหัส 4 หลัก หรือ ยิง QR เพื่อตัดรับของ
          </h1>
          <p className="text-xs text-slate-300">
            เมื่อนักเรียนยื่นตั๋วรับของ กรอกเลข 4 หลักด้านล่างเพื่อตรวจสอบความถูกต้อง
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-md mx-auto relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="กรอกเลข 4 หลัก เช่น 4089 หรือ SW-4089"
            className="w-full pl-14 pr-24 py-4 bg-white/10 border-2 border-white/20 rounded-2xl text-xl sm:text-2xl font-black text-white placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:bg-white/20 text-center tracking-wider transition-all"
          />
          {searchCode && (
            <button
              onClick={() => setSearchCode('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl"
            >
              ล้าง
            </button>
          )}
        </div>

        {/* Quick Matched Order Card Preview */}
        {matchedOrder && (
          <div className="max-w-md mx-auto bg-white text-slate-900 rounded-2xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">พบข้อมูลออเดอร์</span>
                <div className="text-xl font-black text-brand-600">
                  #{matchedOrder.orderCode}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                matchedOrder.status === 'COMPLETED'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {matchedOrder.status === 'COMPLETED' ? 'ส่งมอบแล้ว' : 'พร้อมส่งมอบ'}
              </span>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600">
              <div className="font-bold text-sm text-slate-900">
                ผู้สั่ง: {matchedOrder.userName} ({matchedOrder.userNickname}) {matchedOrder.userGradeRoom}
              </div>
              <div className="text-slate-500">โทร: {matchedOrder.userPhone}</div>
              <div className="pt-2 border-t border-slate-100 space-y-1 font-semibold text-slate-800">
                {matchedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between">
                    <span>• {item.productName} (x{item.quantity})</span>
                    <span>฿{item.totalPrice}</span>
                  </div>
                ))}
              </div>
            </div>

            {matchedOrder.status !== 'COMPLETED' ? (
              <button
                onClick={() => handleCompleteOrder(matchedOrder.id)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>ยืนยันมอบอาหารให้นักเรียน (Mark Picked Up)</span>
              </button>
            ) : (
              <div className="p-2.5 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-500">
                ✅ ออเดอร์นี้รับสินค้าไปเรียบร้อยแล้ว
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ทั้งหมด ({shopOrders.length})
        </button>

        <button
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeFilter === 'pending'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ยืนยันแล้ว รอรับ ({shopOrders.filter((o) => o.status === 'CONFIRMED').length})
        </button>

        <button
          onClick={() => setActiveFilter('ready')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeFilter === 'ready'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          พร้อมรับของ ({shopOrders.filter((o) => o.status === 'READY').length})
        </button>

        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
            activeFilter === 'completed'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          ส่งมอบแล้ว ({shopOrders.filter((o) => o.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900">
                  #{order.orderCode}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-orange-100 text-brand-700 text-xs font-extrabold">
                  รหัส: {order.pickupCode4Digits}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  ฿{order.subtotal}
                </span>
              </div>

              <div className="text-xs text-slate-700 font-medium mt-1">
                ผู้สั่ง: <strong>{order.userName} ({order.userNickname})</strong> {order.userGradeRoom} • โทร {order.userPhone}
              </div>

              <div className="text-[11px] text-slate-500 mt-1">
                {order.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
              </div>
            </div>

            {/* Handover Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {order.status === 'CONFIRMED' && (
                <button
                  onClick={() => markOrderReady(order.id)}
                  className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs rounded-xl border border-brand-200 transition-all"
                >
                  แจ้งพร้อมรับ 🔔
                </button>
              )}

              {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                <button
                  onClick={() => markOrderCompleted(order.id)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ส่งมอบแล้ว</span>
                </button>
              )}

              {order.status === 'COMPLETED' && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  ✅ รับสินค้าเรียบร้อย
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
