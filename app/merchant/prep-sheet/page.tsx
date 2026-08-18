'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  ArrowLeft,
  Printer,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Sparkles,
  Utensils,
  MapPin,
  Clock,
} from 'lucide-react';

export default function KitchenPrepSheetPage() {
  const router = useRouter();
  const { shops, orders, currentUser } = useApp();
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const currentShopId = currentUser.shopId || 'shop_1';
  const shop = shops.find((s) => s.id === currentShopId) || shops[0];

  // Get all valid orders for this shop
  const validOrders = orders.filter(
    (o) => o.shopId === shop.id && o.status !== 'CANCELLED'
  );

  // Aggregate dishes and their options
  const dishMap: Record<
    string,
    {
      productName: string;
      totalQuantity: number;
      variants: Record<string, number>;
      notes: string[];
    }
  > = {};

  validOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!dishMap[item.productName]) {
        dishMap[item.productName] = {
          productName: item.productName,
          totalQuantity: 0,
          variants: {},
          notes: [],
        };
      }

      dishMap[item.productName].totalQuantity += item.quantity;

      // Build variant string
      const variantKey =
        item.selectedOptions.map((o) => `${o.itemName}`).join(', ') || 'สูตรมาตรฐาน';

      dishMap[item.productName].variants[variantKey] =
        (dishMap[item.productName].variants[variantKey] || 0) + item.quantity;

      if (item.specialInstructions) {
        dishMap[item.productName].notes.push(
          `#${order.pickupCode4Digits} (${order.userNickname}): ${item.specialInstructions}`
        );
      }
    });
  });

  const dishesList = Object.values(dishMap);
  const totalDishesCount = dishesList.reduce((sum, d) => sum + d.totalQuantity, 0);

  const toggleComplete = (key: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Header & Print Actions (Hidden on Print) */}
      <div className="no-print flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับแดชบอร์ด</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์ใบเตรียมอาหาร (Print Sheet)</span>
        </button>
      </div>

      {/* Printable Paper / Sheet Container */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 print-card">
        
        {/* Kitchen Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-widest bg-slate-900 text-white px-2 py-0.5 rounded">
                KITCHEN PREP SHEET
              </span>
              <span className="text-xs font-bold text-slate-500">
                โรงเรียนสรรพวิทยาคม
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {shop.name}
            </h1>
            <p className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
              <span>{shop.stallName}</span> • <span>เวลารับมอบ: 06:45 - 07:45 น.</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400 font-semibold">ยอดรวมที่ต้องปรุงเช้านี้</div>
            <div className="text-3xl sm:text-4xl font-black text-brand-600">
              {totalDishesCount} <span className="text-base font-bold text-slate-700">ที่/กล่อง</span>
            </div>
            <div className="text-[11px] text-slate-400">
              จากทั้งหมด {validOrders.length} ออเดอร์
            </div>
          </div>
        </div>

        {/* Aggregated Dish Check-off List */}
        <div className="space-y-4">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
            สรุปยอดรายการอาหารที่ต้องปรุง (Grouped by Menu)
          </div>

          {dishesList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              ยังไม่มีออเดอร์สำหรับรอบเช้าวันพรุ่งนี้
            </div>
          ) : (
            <div className="space-y-4">
              {dishesList.map((dish, idx) => {
                const dishKey = `dish_${idx}`;
                const isDone = !!completedItems[dishKey];

                return (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                      isDone
                        ? 'bg-emerald-50/60 border-emerald-300 opacity-60'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleComplete(dishKey)}
                          className="no-print mt-0.5 text-slate-700 hover:text-emerald-600"
                        >
                          {isDone ? (
                            <CheckSquare className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                          ) : (
                            <Square className="w-6 h-6 text-slate-400" />
                          )}
                        </button>

                        <div>
                          <h3 className={`text-base sm:text-lg font-black text-slate-900 ${isDone ? 'line-through' : ''}`}>
                            {dish.productName}
                          </h3>

                          {/* Variants Breakdown */}
                          <div className="mt-2 space-y-1">
                            {Object.entries(dish.variants).map(([variant, count], vIdx) => (
                              <div
                                key={vIdx}
                                className="text-xs font-semibold text-slate-700 flex items-center gap-2"
                              >
                                <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-900 flex items-center justify-center font-bold text-xs shrink-0">
                                  {count}
                                </span>
                                <span>{variant}</span>
                              </div>
                            ))}
                          </div>

                          {/* Special Notes */}
                          {dish.notes.length > 0 && (
                            <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-0.5">
                              <div className="font-bold text-amber-950">หมายเหตุพิเศษจากลูกค้า:</div>
                              {dish.notes.map((note, nIdx) => (
                                <div key={nIdx}>• {note}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total Count Badge */}
                      <div className="text-right shrink-0">
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-300">
                          {dish.totalQuantity}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">กล่อง</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Detailed Orders Breakdown Table */}
        <div className="pt-4 border-t-2 border-slate-900 space-y-3">
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
            รายชื่อออเดอร์และรหัสรับของ (Order Manifest)
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 text-slate-500">
                  <th className="py-2 font-bold">รหัสรับของ</th>
                  <th className="py-2 font-bold">ชื่อนักเรียน / ห้อง</th>
                  <th className="py-2 font-bold">รายการอาหาร</th>
                  <th className="py-2 font-bold text-right">ยอดรวม</th>
                  <th className="py-2 font-bold text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="py-2.5 font-black text-slate-900">
                      #{order.orderCode} ({order.pickupCode4Digits})
                    </td>
                    <td className="py-2.5">
                      <div className="font-bold text-slate-800">{order.userName} ({order.userNickname})</div>
                      <div className="text-[10px] text-slate-400">{order.userGradeRoom}</div>
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-900">
                      ฿{order.subtotal}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'COMPLETED'
                          ? 'bg-slate-900 text-white'
                          : order.status === 'READY'
                          ? 'bg-brand-500 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {order.status === 'COMPLETED'
                          ? 'รับแล้ว'
                          : order.status === 'READY'
                          ? 'พร้อมรับ'
                          : 'ยืนยันแล้ว'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-400 flex justify-between">
          <span>Sappha PreOrder • พิมพ์เมื่อ {new Date().toLocaleString('th-TH')}</span>
          <span>หน้า 1/1</span>
        </div>
      </div>
    </div>
  );
}
