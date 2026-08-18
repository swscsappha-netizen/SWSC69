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
} from 'lucide-react';

export default function MerchantDashboardPage() {
  const { shops, orders, currentUser, toggleShopOpen, stalls, showToast } = useApp();
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

  // Filter orders for this shop
  const shopOrders = orders.filter((o) => o.shopId === shop?.id);
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
      
      {/* Admin Shop Switcher Bar (If user is Admin & there are multiple shops) */}
      {currentUser.role === 'ADMIN' && shops.length > 1 && (
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-900 font-bold">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>โหมดแอดมิน: เลือกร้านค้าที่จะเข้าดูหลังบ้าน</span>
          </div>
          <select
            value={shop?.id}
            onChange={(e) => setAdminSelectedShopId(e.target.value)}
            className="p-2 bg-white border border-blue-300 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
          >
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.stallName})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Top Shop Control Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md p-1 border border-white/20 shrink-0 overflow-hidden flex items-center justify-center">
            {shop?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shop.imageUrl} alt={shop.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Store className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                {shop?.stallName || 'ล็อกโรงอาหาร'}
              </span>
              <span className="text-xs text-emerald-200">
                เวลาปิดรับ: {shop?.cutoffTime || '20:00'} น.
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {shop?.name || 'ร้านค้าของฉัน'}
            </h1>
            <p className="text-xs text-emerald-200">
              เจ้าของร้าน: {shop?.ownerName} • พร้อมเพย์: {shop?.promptPayNo}
            </p>
          </div>
        </div>

        {/* Store Open/Close Switch */}
        <div className="flex items-center gap-3 bg-black/30 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0">
          <div>
            <div className="text-xs text-slate-300 font-medium">สถานะเปิดรับออเดอร์</div>
            <div className="text-sm font-bold text-white">
              {shop?.isOpen ? 'เปิดรับออเดอร์ปกติ 🟢' : 'ปิดรับชั่วคราว 🔴'}
            </div>
          </div>
          {shop && (
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
          )}
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-medium flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            ยอดขายรอบเช้าวันพรุ่งนี้
          </div>
          <div className="text-2xl font-black text-emerald-600">฿{totalTomorrowSales}</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-medium flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5 text-brand-600" />
            จำนวนจาน/แก้วที่ต้องทำ
          </div>
          <div className="text-2xl font-black text-brand-600">{totalTomorrowDishes} ที่</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            รอตรวจสอบสลิป
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingSlipOrders.length} ออเดอร์</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-1">
          <div className="text-slate-500 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            เตรียมปรุงอาหาร
          </div>
          <div className="text-2xl font-black text-blue-600">{confirmedOrders.length} ออเดอร์</div>
        </div>
      </div>

      {/* Quick Navigation Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/merchant/menu"
          className="p-5 bg-white hover:bg-slate-50 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                จัดการเมนูอาหาร & โควตา
              </div>
              <div className="text-slate-500 text-xs mt-0.5">เพิ่ม ลด ปรับราคา และกำหนดจำนวนจาน</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/merchant/prep"
          className="p-5 bg-white hover:bg-slate-50 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors">
                ใบสรุปยอดเตรียมอาหารเช้า
              </div>
              <div className="text-slate-500 text-xs mt-0.5">พิมพ์ Kitchen Prep Sheet สำหรับแม่ครัว</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/merchant/settings"
          className="p-5 bg-white hover:bg-slate-50 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                ตั้งค่าร้าน & พร้อมเพย์
              </div>
              <div className="text-slate-500 text-xs mt-0.5">แก้ไขเวลาปิดรับ, รูปหน้าร้าน, เบอร์บัญชี</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
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
