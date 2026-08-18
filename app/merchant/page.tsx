'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import SlipModal from '@/components/SlipModal';
import { Order } from '@/types';
import {
  Store,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  QrCode,
  Utensils,
  DollarSign,
  TrendingUp,
  MapPin,
  Eye,
  Power,
  ChevronRight,
} from 'lucide-react';

export default function MerchantDashboardPage() {
  const { shops, orders, currentUser, toggleShopOpen, stalls, showToast } = useApp();
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<Order | null>(null);

  // Application form states for student role
  const [applyShopName, setApplyShopName] = useState('');
  const [applyOwnerName, setApplyOwnerName] = useState(currentUser.name);
  const [applyPhone, setApplyPhone] = useState(currentUser.phone);
  const [applyPromptPay, setApplyPromptPay] = useState(currentUser.phone.replace(/[^0-9]/g, ''));
  const [applyStallId, setApplyStallId] = useState(stalls[0]?.id || 'stall_1');
  const [applyDesc, setApplyDesc] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  const handleStudentApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyShopName.trim()) return;
    setHasApplied(true);
    showToast(
      'success',
      'ส่งคำขอเปิดร้านค้าแล้ว 🎉',
      'ข้อมูลของคุณถูกส่งไปยังฝ่ายบริหารโรงเรียนเรียบร้อยแล้ว กรุณารอการอนุมัติและชำระค่าแรกเข้า 20 บาท'
    );
  };

  // If student visits /merchant, show the Shop Application Form
  if (currentUser.role === 'STUDENT') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            สมัครเปิดร้านค้าในโรงเรียน (Sappha Merchant)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            สำหรับนักเรียน ครู หรือผู้ประกอบการที่ต้องการเปิดขายอาหาร/สินค้าล่วงหน้าในโรงเรียนสรรพวิทยาคม
          </p>
        </div>

        {/* Fee Info Card */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-5 rounded-3xl border border-amber-200/80 text-xs text-amber-900 space-y-2">
          <div className="font-extrabold text-sm flex items-center gap-1.5 text-amber-950">
            <DollarSign className="w-4 h-4 text-brand-600" />
            <span>ข้อกำหนดและค่าธรรมเนียมการเปิดร้าน:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            <li><strong>ค่าสมัครแรกเข้า:</strong> 20 บาท (ชำระครั้งเดียวเมื่อแอดมินอนุมัติ)</li>
            <li><strong>ค่าบำรุงรักษาระบบ:</strong> 20 บาท/เดือน</li>
            <li><strong>การรับเงิน:</strong> รับเงิน 100% ตรงเข้าบัญชี PromptPay ของร้านคุณ ไม่มีหัก GP</li>
          </ul>
        </div>

        {hasApplied ? (
          <div className="p-8 bg-white rounded-3xl border border-emerald-200 text-center space-y-4 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <h2 className="text-xl font-bold text-slate-900">
              ส่งคำขอเปิดร้าน &ldquo;{applyShopName}&rdquo; สำเร็จแล้ว!
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              ฝ่ายบริหารโรงเรียนกำลังตรวจสอบข้อมูล เมื่อได้รับการอนุมัติ คุณจะสามารถเข้าใช้งานหลังบ้านแม่ค้าเพื่อลงเมนูอาหารได้ทันที
            </p>
            <div className="pt-2">
              <Link
                href="/"
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md inline-block"
              >
                กลับไปหน้าหลักตลาดโรงอาหาร
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleStudentApply}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 text-xs"
          >
            <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
              กรอกข้อมูลเพื่อขอเปิดร้านค้า
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อร้านค้าที่ต้องการเปิด:</label>
                <input
                  type="text"
                  required
                  value={applyShopName}
                  onChange={(e) => setApplyShopName(e.target.value)}
                  placeholder="เช่น ร้านแซนวิช & ครอฟเฟิล โฮมเมด ม.5/2"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ชื่อผู้ประกอบการ:</label>
                  <input
                    type="text"
                    required
                    value={applyOwnerName}
                    onChange={(e) => setApplyOwnerName(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
                  <input
                    type="text"
                    required
                    value={applyPhone}
                    onChange={(e) => setApplyPhone(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">เบอร์พร้อมเพย์รับเงิน:</label>
                  <input
                    type="text"
                    required
                    value={applyPromptPay}
                    onChange={(e) => setApplyPromptPay(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ล็อกโรงอาหารที่ต้องการ:</label>
                  <select
                    value={applyStallId}
                    onChange={(e) => setApplyStallId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {stalls.map((stall) => (
                      <option key={stall.id} value={stall.id}>
                        {stall.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">รายละเอียดเมนูอาหารที่ต้องการจำหน่าย:</label>
                <textarea
                  rows={3}
                  value={applyDesc}
                  onChange={(e) => setApplyDesc(e.target.value)}
                  placeholder="เช่น จำหน่ายแซนวิชไข่กุ้ง, แซนวิชโบราณ, ครอฟเฟิลเนยสดแท้ ทำสดใหม่ทุกเช้า"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-95"
            >
              ส่งคำขอเปิดร้านค้าไปยังแอดมิน
            </button>
          </form>
        )}
      </div>
    );
  }

  // Get current merchant's shop (e.g. shop_1: ป้าณี)
  const currentShopId = currentUser.shopId || 'shop_1';
  const shop = shops.find((s) => s.id === currentShopId) || shops[0];

  // Filter orders for this shop
  const shopOrders = orders.filter((o) => o.shopId === shop.id);
  const pendingSlipOrders = shopOrders.filter((o) => o.status === 'PENDING_APPROVAL');
  const confirmedOrders = shopOrders.filter((o) => o.status === 'CONFIRMED' || o.status === 'READY');
  const completedOrders = shopOrders.filter((o) => o.status === 'COMPLETED');

  const totalTomorrowSales = shopOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const totalTomorrowDishes = shopOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Shop Control Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                {shop.stallName}
              </span>
              <span className="text-xs text-emerald-200">
                เวลาปิดรับ: {shop.cutoffTime} น.
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {shop.name}
            </h1>
            <p className="text-xs text-emerald-200">
              เจ้าของร้าน: {shop.ownerName} • พร้อมเพย์: {shop.promptPayNo}
            </p>
          </div>
        </div>

        {/* Store Open/Close Switch */}
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0">
          <div>
            <div className="text-xs text-slate-300 font-medium">สถานะเปิดรับออเดอร์</div>
            <div className="text-sm font-bold text-white">
              {shop.isOpen ? 'เปิดรับออเดอร์ปกติ 🟢' : 'ปิดรับชั่วคราว 🔴'}
            </div>
          </div>
          <button
            onClick={() => toggleShopOpen(shop.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              shop.isOpen
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{shop.isOpen ? 'กดเพื่อปิดร้าน' : 'กดเพื่อเปิดร้าน'}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Button 1: Kitchen Prep Sheet */}
        <Link
          href="/merchant/prep-sheet"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-brand-600 transition-colors">
                Kitchen Prep Sheet
              </div>
              <p className="text-xs text-slate-500">สรุปยอดที่ต้องปรุงตอนเช้า & พิมพ์</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Button 2: Quick Pickup Lookup */}
        <Link
          href="/merchant/orders"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-600 transition-colors">
                ค้นหารหัสรับของ 4 หลัก
              </div>
              <p className="text-xs text-slate-500">ยิง QR หรือกรอกรหัสตัดรับของ</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Button 3: Menu & Quota Manager */}
        <Link
          href="/merchant/menu"
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors">
                จัดการเมนู & โควตา
              </div>
              <p className="text-xs text-slate-500">ปรับราคา สต็อกรายวัน และเวลาปิดรอบ</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">ยอดสั่งรอบเช้าพรุ่งนี้</div>
          <div className="text-xl sm:text-2xl font-black text-brand-600 mt-1">
            ฿{totalTomorrowSales}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            {shopOrders.length} ออเดอร์ทั้งหมด
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">จำนวนจาน/กล่องที่ต้องทำ</div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {totalTomorrowDishes} <span className="text-sm font-bold text-slate-500">จาน</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">เช้า 06:45 - 07:45 น.</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">สลิปที่รอตรวจสอบ</div>
          <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
            {pendingSlipOrders.length} <span className="text-sm font-bold text-slate-500">รายการ</span>
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">ต้องตรวจก่อนเริ่มทำ</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="text-xs text-slate-500 font-medium">ส่งมอบเรียบร้อยแล้ว</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
            {completedOrders.length} <span className="text-sm font-bold text-slate-500">ออเดอร์</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">นักเรียนรับแล้ว</div>
        </div>
      </div>

      {/* Section: Pending Slips Review Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              รายการที่รอแม่ค้าตรวจสอบสลิป ({pendingSlipOrders.length} รายการ)
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            โอนผ่าน PromptPay
          </span>
        </div>

        {pendingSlipOrders.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <div className="font-bold text-slate-700">ไม่มีสลิปค้างตรวจในขณะนี้</div>
            <p>ทุกออเดอร์ได้รับการตรวจสอบและยืนยันเรียบร้อยแล้ว</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSlipOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-900">
                      #{order.orderCode} ({order.pickupCode4Digits})
                    </span>
                    <span className="text-base font-black text-brand-600">
                      ฿{order.subtotal}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    ผู้สั่ง: <strong>{order.userName} ({order.userNickname})</strong> {order.userGradeRoom}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 space-y-0.5">
                    {order.items.map((it, i) => (
                      <div key={i}>
                        • {it.productName} (x{it.quantity})
                        {it.specialInstructions && ` [หมายเหตุ: ${it.specialInstructions}]`}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-amber-200/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    แนบเมื่อ {new Date(order.paymentSlip?.uploadedAt || Date.now()).toLocaleTimeString('th-TH')} น.
                  </span>

                  <button
                    onClick={() => setSelectedOrderForSlip(order)}
                    className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ตรวจสลิป & อนุมัติ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slip Modal Popup */}
      <SlipModal
        order={selectedOrderForSlip}
        onClose={() => setSelectedOrderForSlip(null)}
      />
    </div>
  );
}
