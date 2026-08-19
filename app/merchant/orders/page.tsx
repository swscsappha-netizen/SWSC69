'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Order, OrderStatus } from '@/types';
import SlipModal from '@/components/SlipModal';
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
  Eye,
  X,
  Phone,
  CreditCard,
  AlertCircle,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function MerchantOrdersHandoverPage() {
  const router = useRouter();
  const {
    shops,
    orders,
    currentUser,
    findOrderByPickupCode,
    approveOrderSlip,
    rejectOrderSlip,
    markOrderReady,
    markOrderCompleted,
    showToast,
  } = useApp();

  const [searchCode, setSearchCode] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrderForSlip, setSelectedOrderForSlip] = useState<Order | null>(null);
  
  // Rejection modal
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('ยอดเงินในสลิปไม่ถูกต้อง หรือสลิปซ้ำ');
  const [refundSlipUrl, setRefundSlipUrl] = useState('');

  const currentShopId = currentUser.shopId || shops[0]?.id;
  const shop = shops.find((s) => s.id === currentShopId) || shops[0];

  const shopOrders = orders.filter((o) => o.shopId === shop?.id);

  // Search match by 4 digits or order code
  const matchedOrder = searchCode.trim()
    ? shopOrders.find(
        (o) =>
          o.pickupCode4Digits === searchCode.trim() ||
          o.orderCode.toLowerCase().includes(searchCode.trim().toLowerCase()) ||
          o.userNickname.toLowerCase().includes(searchCode.trim().toLowerCase()) ||
          o.userName.toLowerCase().includes(searchCode.trim().toLowerCase())
      ) || findOrderByPickupCode(searchCode.trim())
    : null;

  const filteredOrders = shopOrders.filter((o) => {
    if (activeTab === 'pending') return o.status === 'PENDING_APPROVAL';
    if (activeTab === 'confirmed') return o.status === 'CONFIRMED';
    if (activeTab === 'ready') return o.status === 'READY';
    if (activeTab === 'completed') return o.status === 'COMPLETED';
    if (activeTab === 'cancelled') return o.status === 'CANCELLED';
    return true;
  });

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrder) return;
    rejectOrderSlip(rejectingOrder.id, rejectReason, refundSlipUrl);
    setRejectingOrder(null);
    setRefundSlipUrl('');
  };

  const pendingCount = shopOrders.filter((o) => o.status === 'PENDING_APPROVAL').length;
  const confirmedCount = shopOrders.filter((o) => o.status === 'CONFIRMED').length;
  const readyCount = shopOrders.filter((o) => o.status === 'READY').length;
  const completedCount = shopOrders.filter((o) => o.status === 'COMPLETED').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
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
          <div className="text-[11px] text-slate-500">📍 {shop?.stallName}</div>
        </div>
      </div>

      {/* Quick 4-digit Pickup Search / Scan Section */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 border border-indigo-900/40 relative overflow-hidden">
        
        <div className="text-center space-y-1 relative z-10">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-500 text-white uppercase tracking-wider shadow-sm">
            ⚡ ค้นหาและตัดรับอาหารหน้าร้าน
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
            พิมพ์รหัส 4 หลัก หรือชื่อนักเรียนเพื่อตัดรับ
          </h1>
          <p className="text-xs text-slate-300">
            เมื่อนักเรียนยื่นตั๋วรับของ กรอกเลข 4 หลักเพื่อตรวจสอบและยืนยันการส่งมอบอาหารทันที
          </p>
        </div>

        {/* Input Form */}
        <div className="max-w-md mx-auto relative z-10">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
          <input
            type="text"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            placeholder="เช่น 4089, ก้อง, หรือ SW-4089"
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

        {/* Instant Matched Order Card */}
        {matchedOrder && (
          <div className="p-5 bg-white text-slate-900 rounded-2xl shadow-xl border-2 border-brand-400 space-y-3 animate-fade-in relative z-10">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-base text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-lg border border-brand-200">
                  #{matchedOrder.orderCode}
                </span>
                <span className="font-mono font-black text-base text-white bg-slate-900 px-3 py-0.5 rounded-lg">
                  รหัสรับ: {matchedOrder.pickupCode4Digits}
                </span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                matchedOrder.status === 'READY' ? 'bg-emerald-100 text-emerald-800' :
                matchedOrder.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                matchedOrder.status === 'COMPLETED' ? 'bg-slate-200 text-slate-700' :
                'bg-amber-100 text-amber-800'
              }`}>
                {matchedOrder.status === 'READY' ? '🟢 พร้อมรับของ' :
                 matchedOrder.status === 'CONFIRMED' ? '🔵 กำลังปรุง' :
                 matchedOrder.status === 'COMPLETED' ? '✅ ส่งมอบแล้ว' : '🟡 รอตรวจสลิป'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">ผู้สั่ง: </span>
                <span className="font-bold text-slate-900">{matchedOrder.userName} ({matchedOrder.userNickname})</span>
              </div>
              <div>
                <span className="text-slate-500">ห้องเรียน: </span>
                <span className="font-bold text-slate-900">{matchedOrder.userGradeRoom}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">รายการ: </span>
                <span className="font-bold text-slate-900">
                  {matchedOrder.items.map((i) => `${i.productName} x${i.quantity}`).join(', ')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="text-sm font-black text-emerald-600">฿{matchedOrder.subtotal}</div>
              
              {matchedOrder.status !== 'COMPLETED' && (
                <button
                  onClick={() => {
                    markOrderCompleted(matchedOrder.id);
                    setSearchCode('');
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันส่งมอบอาหารสำเร็จ ✅</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Orders Management Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900">รายการออเดอร์ทั้งหมด ({shopOrders.length})</h2>
            <p className="text-xs text-slate-500">ตรวจสลิป, เตรียมอาหาร, และตัดจ่ายรับของ</p>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'all' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ทั้งหมด ({shopOrders.length})
            </button>

            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'pending' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
              }`}
            >
              <span>🟡 รอตรวจสลิป</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-amber-700 rounded-full text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('confirmed')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'confirmed' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              🔵 ยืนยันแล้ว ({confirmedCount})
            </button>

            <button
              onClick={() => setActiveTab('ready')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'ready' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              🟢 พร้อมรับ ({readyCount})
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'completed' ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              ✅ สำเร็จแล้ว ({completedCount})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
            <Clock className="w-10 h-10 mx-auto text-slate-300" />
            <div className="font-bold text-slate-700 text-sm">ไม่มีออเดอร์ในสถานะนี้</div>
            <p className="text-xs">เลือกแท็บอื่นเพื่อดูรายการออเดอร์ในระบบ</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Top Row: Order Code, Pickup Code, Status, Time */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
                      #{order.orderCode}
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl border border-emerald-300">
                      รหัสรับ: {order.pickupCode4Digits}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${
                      order.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      order.status === 'READY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      order.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                      'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {order.status === 'PENDING_APPROVAL' ? '🟡 รอตรวจสลิป' :
                       order.status === 'CONFIRMED' ? '🔵 ยืนยันแล้ว/กำลังปรุง' :
                       order.status === 'READY' ? '🟢 พร้อมรับหน้าร้าน' :
                       order.status === 'COMPLETED' ? '✅ ส่งมอบสำเร็จ' : '❌ ยกเลิก'}
                    </span>

                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>
                </div>

                {/* Middle Row: Customer Details & Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-500 font-medium">ข้อมูลผู้สั่ง:</div>
                    <div className="font-bold text-slate-900 text-sm">
                      {order.userName} <span className="text-brand-600 font-extrabold">({order.userNickname})</span>
                    </div>
                    <div className="text-slate-600">
                      ชั้น/ห้อง: <span className="font-bold text-slate-800">{order.userGradeRoom}</span> • รหัส: <span className="font-mono">{order.userStudentId || '-'}</span>
                    </div>
                    <div className="text-slate-600 flex items-center gap-2">
                      <span>📞 {order.userPhone}</span>
                      {order.userPromptPayRefund && (
                        <span className="text-slate-400">• พร้อมเพย์คืนเงิน: {order.userPromptPayRefund}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="text-slate-500 font-medium">รายการอาหาร ({order.items.length} อย่าง):</div>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="font-bold text-slate-900">{item.productName}</span>
                          <span className="font-bold text-brand-600 ml-1">x{item.quantity}</span>
                          {item.selectedOptions && item.selectedOptions.length > 0 && (
                            <div className="text-[11px] text-slate-500">
                              + {item.selectedOptions.map((o) => o.itemName).join(', ')}
                            </div>
                          )}
                          {item.specialInstructions && (
                            <div className="text-[10px] text-amber-700 italic">
                              หมายเหตุ: {item.specialInstructions}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-slate-700">฿{item.totalPrice}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Row: Amount & Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-slate-400 text-[11px]">ยอดชำระ:</span>
                      <div className="text-lg font-black text-emerald-600">฿{order.subtotal}</div>
                    </div>

                    {(order.slipUrl || order.paymentSlip?.slipUrl) && (
                      <button
                        onClick={() => setSelectedOrderForSlip(order)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>เปิดตรวจสลิปโอนเงิน</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'PENDING_APPROVAL' && (
                      <>
                        <button
                          onClick={() => setRejectingOrder(order)}
                          className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center gap-1 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>ปฏิเสธสลิป</span>
                        </button>
                        <button
                          onClick={() => approveOrderSlip(order.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                        >
                          <Check className="w-4 h-4" />
                          <span>อนุมัติสลิป & ยืนยัน</span>
                        </button>
                      </>
                    )}

                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => markOrderReady(order.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                      >
                        <Utensils className="w-4 h-4" />
                        <span>ปรุงเสร็จแล้ว ➜ พร้อมรับ</span>
                      </button>
                    )}

                    {order.status === 'READY' && (
                      <button
                        onClick={() => markOrderCompleted(order.id)}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all hover:scale-105"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ตัดรับของ ➜ ส่งมอบสำเร็จ</span>
                      </button>
                    )}
                  </div>
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

      {/* Reject Slip Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                <AlertCircle className="w-5 h-5" />
                <span>ปฏิเสธสลิปออเดอร์ #{rejectingOrder.orderCode}</span>
              </div>
              <button
                onClick={() => setRejectingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">เหตุผลในการปฏิเสธ:</label>
                <input
                  type="text"
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="เช่น ยอดเงินไม่ถูกต้อง หรือสลิปไม่ชัดเจน"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ลิงก์สลิปโอนเงินคืน (ถ้ามีการโอนคืน):
                </label>
                <input
                  type="url"
                  value={refundSlipUrl}
                  onChange={(e) => setRefundSlipUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                พร้อมเพย์ผู้รับเงินคืน: <strong className="text-slate-800">{rejectingOrder.userPromptPayRefund || rejectingOrder.userPhone}</strong>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-md"
                >
                  ยืนยันปฏิเสธสลิป
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
