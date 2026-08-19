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
  ShieldCheck,
  PlusCircle,
  Sparkles,
  ShoppingBag,
  Check,
  X,
  Phone,
  Layers,
  Printer,
  Sliders,
} from 'lucide-react';

export default function MerchantDashboardPage() {
  const {
    shops,
    orders,
    products,
    currentUser,
    toggleShopOpen,
    approveOrderSlip,
    rejectOrderSlip,
    markOrderReady,
    markOrderCompleted,
    stalls,
    showToast,
  } = useApp();

  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<Order | null>(null);
  const [adminSelectedShopId, setAdminSelectedShopId] = useState<string>('');

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

  // If student (and not admin), show the Shop Application Form
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

  // If no shops exist yet in the system
  if (shops.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-100 to-teal-50 text-emerald-600 flex items-center justify-center text-4xl shadow-glow border border-emerald-200">
          🏪
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">ยังไม่มีร้านค้าในระบบ</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {currentUser.role === 'ADMIN'
              ? 'คุณกำลังเข้าใช้งานในฐานะผู้ดูแลระบบ (Admin) สามารถเพิ่มร้านค้าแรกของโรงเรียนได้จากหน้าแอดมิน'
              : 'ยังไม่มีร้านค้าเปิดรับออเดอร์ในขณะนี้ คุณสามารถยื่นขอเปิดร้านค้าเพื่อเริ่มจำหน่ายอาหารได้'}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {currentUser.role === 'ADMIN' ? (
            <Link
              href="/admin"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-600/25 transition-all inline-flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>ไปที่หน้าจัดการร้านค้า (แอดมิน)</span>
            </Link>
          ) : (
            <Link
              href="/merchant/register"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ ยื่นขอเปิดร้านค้าใหม่</span>
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Get active shop
  const activeShopId =
    currentUser.role === 'ADMIN'
      ? adminSelectedShopId || currentUser.shopId || shops[0]?.id
      : currentUser.shopId || shops.find((s) => s.ownerName === currentUser.name || s.phone === currentUser.phone)?.id || shops[0]?.id;

  const shop = shops.find((s) => s.id === activeShopId) || shops[0];
  const shopProducts = products.filter((p) => p.shopId === shop?.id);

  // Filter orders for this shop
  const shopOrders = orders.filter((o) => o.shopId === shop?.id);
  const pendingSlipOrders = shopOrders.filter((o) => o.status === 'PENDING_APPROVAL');
  const confirmedOrders = shopOrders.filter((o) => o.status === 'CONFIRMED');
  const readyOrders = shopOrders.filter((o) => o.status === 'READY');
  const completedOrders = shopOrders.filter((o) => o.status === 'COMPLETED');

  const totalTomorrowSales = shopOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.subtotal, 0);

  const totalTomorrowDishes = shopOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Admin Shop Switcher Bar (If user is Admin & there are multiple shops) */}
      {currentUser.role === 'ADMIN' && shops.length > 1 && (
        <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span>โหมดแอดมิน: สลับหน้าร้านค้าเพื่อจัดการหลังบ้าน</span>
          </div>
          <select
            value={shop?.id}
            onChange={(e) => setAdminSelectedShopId(e.target.value)}
            className="p-2.5 bg-white/10 border border-white/20 rounded-xl font-bold text-white text-xs focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            {shops.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                {s.name} ({s.stallName})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Top Shop Control Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-700/30 relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 shrink-0 overflow-hidden flex items-center justify-center shadow-lg">
            {shop?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Store className="w-9 h-9 text-emerald-300" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
                📍 {shop?.stallName || 'ล็อกโรงอาหาร'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-emerald-200 border border-white/10 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>ปิดรับ {shop?.cutoffTime || '20:00'} น.</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {shop?.name || 'ร้านค้าของฉัน'}
            </h1>
            <p className="text-xs text-emerald-200 font-medium">
              เจ้าของ: {shop?.ownerName} • พร้อมเพย์: <span className="font-mono font-bold text-white">{shop?.promptPayNo}</span>
            </p>
          </div>
        </div>

        {/* Store Open/Close Switch */}
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0 relative z-10">
          <div>
            <div className="text-[11px] text-slate-300 font-medium">สถานะรับออเดอร์รอบเช้า</div>
            <div className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
              <span className={`w-2.5 h-2.5 rounded-full ${shop?.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
              <span>{shop?.isOpen ? 'เปิดรับออเดอร์ปกติ' : 'ปิดรับชั่วคราว'}</span>
            </div>
          </div>
          {shop && (
            <button
              onClick={() => toggleShopOpen(shop.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg active:scale-95 ${
                shop.isOpen
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{shop.isOpen ? 'กดเพื่อปิดรับ' : 'กดเพื่อเปิดรับ'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1 hover:border-emerald-300 transition-colors">
          <div className="text-slate-500 font-medium flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>ยอดขายรอบเช้าพรุ่งนี้</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">฿{totalTomorrowSales.toLocaleString()}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1 hover:border-brand-300 transition-colors">
          <div className="text-slate-500 font-medium flex items-center gap-1.5">
            <Utensils className="w-4 h-4 text-brand-600" />
            <span>จำนวนจาน/แก้วที่ต้องปรุง</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand-600">{totalTomorrowDishes} ที่</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1 hover:border-amber-300 transition-colors">
          <div className="text-slate-500 font-medium flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>รอตรวจสลิปโอนเงิน</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 flex items-center gap-2">
            <span>{pendingSlipOrders.length}</span>
            {pendingSlipOrders.length > 0 && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
                ด่วน!
              </span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1 hover:border-blue-300 transition-colors">
          <div className="text-slate-500 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>ยืนยัน & กำลังปรุง</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600">{confirmedOrders.length + readyOrders.length} ออเดอร์</div>
        </div>
      </div>

      {/* Quick Navigation 4-Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Orders & Slips */}
        <Link
          href="/merchant/orders"
          className="p-5 bg-white hover:bg-slate-50 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md hover:border-emerald-300 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            {pendingSlipOrders.length > 0 && (
              <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[11px] font-black rounded-full shadow-sm animate-bounce">
                {pendingSlipOrders.length} รอตรวจ
              </span>
            )}
          </div>
          <div>
            <div className="font-extrabold text-base text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
              <span>จัดการออเดอร์ & สลิป</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-slate-500 text-xs mt-1">ตรวจสลิป, ตัดจ่ายรับของ 4 หลัก, สรุปสถานะ</p>
          </div>
        </Link>

        {/* 2. Menu & Stock */}
        <Link
          href="/merchant/menu"
          className="p-5 bg-white hover:bg-slate-50 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md hover:border-brand-300 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold">
              <Utensils className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-full border border-slate-200">
              {shopProducts.length} เมนู
            </span>
          </div>
          <div>
            <div className="font-extrabold text-base text-slate-900 group-hover:text-brand-600 transition-colors flex items-center justify-between">
              <span>จัดการเมนู & สต็อก</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-slate-500 text-xs mt-1">เพิ่ม/แก้ไขเมนู, ปรับราคา, โควตาจาน, ท็อปปิ้ง</p>
          </div>
        </Link>

        {/* 3. Kitchen Prep Sheet */}
        <Link
          href="/merchant/prep-sheet"
          className="p-5 bg-white hover:bg-slate-50 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md hover:border-emerald-300 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1">
              <Printer className="w-3 h-3" />
              <span>พิมพ์ได้</span>
            </span>
          </div>
          <div>
            <div className="font-extrabold text-base text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
              <span>ใบเตรียมอาหารเช้า</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-slate-500 text-xs mt-1">รวมยอดวัตถุดิบและรายการอาหารสำหรับแม่ครัว</p>
          </div>
        </Link>

        {/* 4. Shop Settings */}
        <Link
          href="/merchant/settings"
          className="p-5 bg-white hover:bg-slate-50 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group transition-all hover:shadow-md hover:border-blue-300 relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Sliders className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-200">
              ตั้งค่าร้าน
            </span>
          </div>
          <div>
            <div className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
              <span>ตั้งค่าร้าน & พร้อมเพย์</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-slate-500 text-xs mt-1">แก้ไขโลโก้, แบนเนอร์, เบอร์รับเงิน, เวลาตัดรอบ</p>
          </div>
        </Link>
      </div>

      {/* Live Recent Orders Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900">ออเดอร์ล่าสุดของร้าน ({shopOrders.length} รายการ)</h2>
              <p className="text-xs text-slate-500">ตรวจสอบและอนุมัติสลิปการโอนเงินเพื่อยืนยันออเดอร์</p>
            </div>
          </div>

          <Link
            href="/merchant/orders"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
          >
            <span>ดูออเดอร์ทั้งหมด</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {shopOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">ยังไม่มีออเดอร์เข้ามาในขณะนี้</div>
            <p className="text-xs">เมื่อมีนักเรียนสั่งซื้อล่วงหน้า รายการจะแสดงขึ้นที่นี่อัตโนมัติ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {shopOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="p-4 bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                      #{order.orderCode}
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      รหัสรับ: {order.pickupCode4Digits}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                      order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'READY' ? 'bg-emerald-100 text-emerald-800' :
                      order.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {order.status === 'PENDING_APPROVAL' ? '🟡 รอตรวจสลิป' :
                       order.status === 'CONFIRMED' ? '🔵 ยืนยันแล้ว' :
                       order.status === 'READY' ? '🟢 พร้อมรับ' :
                       order.status === 'COMPLETED' ? '✅ สำเร็จ' : '❌ ยกเลิก'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-medium">
                    ผู้สั่ง: <span className="font-bold">{order.userName}</span> ({order.userNickname}) • {order.userGradeRoom} • 📞 {order.userPhone}
                  </div>

                  <div className="text-xs text-slate-500">
                    รายการ: {order.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <div className="text-right mr-2">
                    <div className="text-xs text-slate-400">ยอดรวม</div>
                    <div className="text-base font-black text-emerald-600">฿{order.subtotal}</div>
                  </div>

                  {(order.slipUrl || order.paymentSlip?.slipUrl) && (
                    <button
                      onClick={() => setSelectedOrderForSlip(order)}
                      className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-sm flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>ดูสลิป</span>
                    </button>
                  )}

                  {order.status === 'PENDING_APPROVAL' && (
                    <button
                      onClick={() => approveOrderSlip(order.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>อนุมัติ</span>
                    </button>
                  )}

                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={() => markOrderReady(order.id)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>พร้อมรับ</span>
                    </button>
                  )}

                  {order.status === 'READY' && (
                    <button
                      onClick={() => markOrderCompleted(order.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>ส่งมอบแล้ว</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slip Modal Component */}
      {selectedOrderForSlip && (
        <SlipModal
          order={selectedOrderForSlip}
          onClose={() => setSelectedOrderForSlip(null)}
        />
      )}
    </div>
  );
}
