'use client';

import React, { useState } from 'react';
import { Order } from '@/types';
import { useApp } from '@/context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Store,
  Receipt,
  UserCheck,
  Star,
} from 'lucide-react';

interface TicketCardProps {
  order: Order;
  showFullDetails?: boolean;
  onOpenReview?: (order: Order) => void;
}

export default function TicketCard({ order, showFullDetails = false, onOpenReview }: TicketCardProps) {
  const { cancelOrder, showToast } = useApp();
  const [isExpanded, setIsExpanded] = useState(showFullDetails);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isPending = order.status === 'PENDING_APPROVAL' || order.status === 'PENDING_PAYMENT';
  const isConfirmed = order.status === 'CONFIRMED';
  const isReady = order.status === 'READY';
  const isCompleted = order.status === 'COMPLETED';
  const isCancelled = order.status === 'CANCELLED';

  const handleCancel = () => {
    cancelOrder(order.id, 'นักเรียนกดยกเลิกคำสั่งซื้อก่อนร้านยืนยัน');
    setShowCancelConfirm(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden transition-all duration-300">
      {/* Ticket Header & Big Code */}
      <div className="bg-gradient-to-r from-brand-600 to-amber-500 p-5 sm:p-6 text-white relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-md uppercase tracking-wider">
              ตั๋วรับอาหาร
            </span>
            <span className="text-xs text-amber-100 font-medium">
              โรงเรียนสรรพวิทยาคม
            </span>
          </div>

          {/* Status Pill in Header */}
          <div>
            {isPending && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                รอแม่ค้าตรวจสลิป
              </span>
            )}
            {isConfirmed && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-slate-950 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ยืนยันแล้ว • รอปรุง
              </span>
            )}
            {isReady && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-brand-700 animate-bounce flex items-center gap-1">
                🎉 พร้อมรับของแล้ว!
              </span>
            )}
            {isCompleted && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-slate-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                รับอาหารแล้ว
              </span>
            )}
            {isCancelled && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                ยกเลิกคำสั่งซื้อ
              </span>
            )}
          </div>
        </div>

        {/* Big Order Code */}
        <div className="mt-4 flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs text-amber-100 font-medium">รหัสออเดอร์สำหรับรับของ</div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow">
              #{order.orderCode}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-amber-100 font-medium">เวลานัดรับ</div>
            <div className="text-sm sm:text-base font-extrabold text-white">
              {order.pickupDate} ({order.pickupTimeWindow})
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Pickup Stall Location Banner */}
      <div className="bg-amber-50 px-5 py-3 border-b border-amber-200/60 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm font-bold">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wide">
            จุดรับอาหาร / ล็อกโรงอาหาร
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
            {order.stallName}
          </div>
        </div>
        <div className="text-xs font-semibold text-slate-600 bg-white px-2.5 py-1 rounded-xl border border-amber-200">
          {order.shopName}
        </div>
      </div>

      {/* Urgent Late Alert Banner */}
      {order.isUrgentLate && !isCompleted && !isCancelled && (
        <div className="bg-red-50 px-5 py-3 border-b border-red-200 flex items-center gap-3 text-red-700">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 animate-bounce" />
          <div className="text-xs font-bold">
            ⚠️ เลยเวลารับของช่วงเช้า (07:45 น.) แล้ว กรุณาติดต่อที่หน้าร้านค้าโดยด่วน
          </div>
        </div>
      )}

      {/* Cancellation / Rejection Notice */}
      {isCancelled && (
        <div className="bg-red-50 p-4 border-b border-red-200 text-xs text-red-800 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>ออเดอร์นี้ถูกยกเลิกแล้ว</span>
          </div>
          {order.paymentSlip?.rejectionReason && (
            <p>สาเหตุ: {order.paymentSlip.rejectionReason}</p>
          )}
          {order.paymentSlip?.refundSlipUrl && (
            <div className="pt-2 border-t border-red-200/60">
              <span className="font-bold text-emerald-800">✅ แม่ค้าแนบสลิปโอนเงินคืนแล้ว</span>
              <a
                href={order.paymentSlip.refundSlipUrl}
                target="_blank"
                rel="noreferrer"
                className="block text-brand-600 underline mt-1 font-medium"
              >
                คลิกดูหลักฐานสลิปคืนเงิน
              </a>
            </div>
          )}
        </div>
      )}

      {/* Main Ticket Content: QR & Details */}
      <div className="p-5 sm:p-6 space-y-6">
        {/* QR Code and Quick Code Display */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200">
            <QRCodeSVG
              value={`SAPPHA:${order.orderCode}:${order.id}`}
              size={130}
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="text-center sm:text-left space-y-1.5">
            <div className="text-xs text-slate-400 font-medium">รหัส 4 หลักสำหรับแม่ค้า</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-wider">
              {order.pickupCode4Digits}
            </div>
            <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed">
              ยื่นตั๋วนี้หรือแจ้งรหัส 4 หลักให้แม่ค้าที่หน้าร้านเพื่อรับอาหาร
            </p>
          </div>
        </div>

        {/* Step Timeline Indicator */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            ขั้นตอนสถานะ
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
            <div
              className={`p-2 rounded-xl border ${
                isPending
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                  : isConfirmed || isReady || isCompleted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              1. ตรวจสลิป
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isConfirmed
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                  : isReady || isCompleted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              2. ยืนยันออเดอร์
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isReady
                  ? 'bg-brand-50 border-brand-400 text-brand-800 font-bold animate-pulse'
                  : isCompleted
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              3. พร้อมรับของ
            </div>
            <div
              className={`p-2 rounded-xl border ${
                isCompleted
                  ? 'bg-slate-900 border-slate-900 text-white font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              4. รับสำเร็จ
            </div>
          </div>
        </div>

        {/* Ordered Food Items Accordion */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 hover:text-slate-900"
          >
            <span>รายการอาหารในออเดอร์ ({order.items.length} รายการ)</span>
            <div className="flex items-center gap-1 text-slate-400">
              <span>{isExpanded ? 'ซ่อน' : 'แสดง'}</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {isExpanded && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-3 pb-2 border-b border-slate-200/60 last:border-0 last:pb-0">
                  <div>
                    <div className="font-bold text-slate-900">
                      {item.productName} <span className="text-brand-600">x{item.quantity}</span>
                    </div>
                    {item.selectedOptions.length > 0 && (
                      <div className="text-[11px] text-slate-500 mt-0.5 space-y-0.5">
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
                  </div>
                  <div className="font-extrabold text-slate-900">
                    ฿{item.totalPrice}
                  </div>
                </div>
              ))}

              {/* Total Summary */}
              <div className="pt-2 border-t border-slate-300/80 flex items-center justify-between font-bold text-sm">
                <span className="text-slate-700">ยอดชำระรวม (PromptPay)</span>
                <span className="text-brand-600 font-extrabold text-base">฿{order.subtotal}</span>
              </div>

              {/* Student Profile Info */}
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
                <span>ผู้สั่ง: {order.userName} ({order.userNickname}) {order.userGradeRoom}</span>
                <span>โทร: {order.userPhone}</span>
              </div>
            </div>
          )}
        </div>

        {/* Share Receipt to LINE button */}
        <button
          onClick={async () => {
            const { sendReceiptToLineChat } = await import('@/lib/liff');
            const res = await sendReceiptToLineChat(order);
            showToast(res.success ? 'success' : 'info', 'LINE Flex Message', res.message);
          }}
          className="w-full py-2.5 bg-[#06C755]/10 hover:bg-[#06C755]/20 text-[#06C755] font-bold text-xs rounded-2xl border border-[#06C755]/30 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 fill-[#06C755]" viewBox="0 0 24 24">
            <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.085.922.26 1.057.595.121.302.079.774.039 1.08l-.168 1.014c-.052.308-.242 1.205 1.056.657 1.298-.548 7.009-4.128 9.563-7.067 1.62-1.745 2.434-3.535 2.434-5.866z"/>
          </svg>
          <span>แชร์สลิปตั๋วเข้าแชท LINE 💬</span>
        </button>

        {/* Rating & Review Action (When Completed) */}
        {isCompleted && onOpenReview && (
          <div className="pt-2">
            {!order.reviewed ? (
              <button
                onClick={() => onOpenReview(order)}
                className="w-full py-3 text-xs font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-brand-500 hover:from-amber-600 hover:to-brand-600 rounded-2xl shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95"
              >
                <Star className="w-4 h-4 fill-white animate-pulse" />
                <span>ให้คะแนนความอร่อย &amp; เขียนรีวิว ⭐</span>
              </button>
            ) : (
              <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>คุณได้เขียนรีวิวให้ออเดอร์นี้เรียบร้อยแล้ว ⭐</span>
              </div>
            )}
          </div>
        )}

        {/* Cancellation Action (Allowed only when pending approval) */}
        {isPending && (
          <div className="pt-2">
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full py-2.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-2xl transition-all"
              >
                ยกเลิกออเดอร์นี้ (ก่อนแม่ค้ายืนยันสลิป)
              </button>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-center space-y-2">
                <div className="font-bold text-red-800">
                  ต้องการยืนยันการยกเลิกออเดอร์ #{order.orderCode} ใช่หรือไม่?
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-1.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-sm"
                  >
                    ยืนยันยกเลิก
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-4 py-1.5 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300"
                  >
                    ไม่ยกเลิก
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
