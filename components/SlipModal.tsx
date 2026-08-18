'use client';

import React, { useState } from 'react';
import { Order } from '@/types';
import { useApp } from '@/context/AppContext';
import { X, CheckCircle2, XCircle, ZoomIn, ZoomOut, UploadCloud, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SlipModalProps {
  order: Order | null;
  onClose: () => void;
}

export default function SlipModal({ order, onClose }: SlipModalProps) {
  const { approveOrderSlip, rejectOrderSlip } = useApp();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('ยอดเงินไม่ตรงกับยอดออเดอร์');
  const [refundSlipPreview, setRefundSlipPreview] = useState<string | null>(null);

  if (!order || !order.paymentSlip) return null;

  const handleApprove = () => {
    approveOrderSlip(order.id);
    onClose();
  };

  const handleReject = () => {
    rejectOrderSlip(
      order.id,
      rejectReason,
      refundSlipPreview || undefined
    );
    onClose();
  };

  const handleRefundSlipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRefundSlipPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                ตรวจสอบสลิปโอนเงิน (Slip Verification)
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                ออเดอร์ #{order.orderCode} • {order.userName} ({order.userNickname}) {order.userGradeRoom}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Meta summary card */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-brand-50/60 border border-brand-200/80 rounded-2xl text-xs">
              <div>
                <span className="text-slate-500">ยอดที่ต้องโอน:</span>
                <div className="font-extrabold text-base text-brand-600">฿{order.subtotal}</div>
              </div>
              <div>
                <span className="text-slate-500">เบอร์โทร / พร้อมเพย์ผู้สั่ง:</span>
                <div className="font-bold text-slate-900">{order.userPhone}</div>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500">เวลาที่อัปโหลดสลิป:</span>
                <div className="font-medium text-slate-800">
                  {new Date(order.paymentSlip.uploadedAt).toLocaleTimeString('th-TH')} น.
                </div>
              </div>
            </div>

            {/* Slip Image Preview Area */}
            {!isRejecting ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>รูปภาพสลิปที่ลูกค้าแนบมา:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                      className="p-1 bg-slate-100 rounded-lg hover:bg-slate-200"
                      title="ซูมออก"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                      className="p-1 bg-slate-100 rounded-lg hover:bg-slate-200"
                      title="ซูมเข้า"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-auto bg-slate-900 border border-slate-200 flex items-center justify-center p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={order.paymentSlip.slipUrl}
                    alt="Payment Slip"
                    style={{ transform: `scale(${zoomLevel})` }}
                    className="max-h-full object-contain transition-transform duration-200"
                  />
                </div>
              </div>
            ) : (
              /* Reject & Refund Form */
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span>ปฏิเสธสลิป และ แนบหลักฐานการโอนเงินคืน</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ระบุสาเหตุที่ปฏิเสธ:
                  </label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-red-500"
                  >
                    <option value="ยอดเงินในสลิปไม่ตรงกับยอดออเดอร์">ยอดเงินในสลิปไม่ตรงกับยอดออเดอร์</option>
                    <option value="วันเวลาในสลิปไม่ถูกต้อง (สลิปเก่า)">วันเวลาในสลิปไม่ถูกต้อง (สลิปเก่า)</option>
                    <option value="สลิปซ้ำ หรือรูปภาพไม่ชัดเจน">สลิปซ้ำ หรือรูปภาพไม่ชัดเจน</option>
                    <option value="วัตถุดิบหมดกะทันหัน โอนเงินคืนเรียบร้อย">วัตถุดิบหมดกะทันหัน โอนเงินคืนเรียบร้อย</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    แนบสลิปที่โอนเงินคืน (PromptPay: {order.userPhone}):
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-red-300 bg-white rounded-xl cursor-pointer hover:bg-red-50/50 transition-colors">
                    <UploadCloud className="w-6 h-6 text-red-500 mb-1" />
                    <span className="text-xs font-semibold text-slate-600">
                      {refundSlipPreview ? 'เลือกรูปสลิปคืนเงินแล้ว ✅' : 'คลิกเพื่ออัปโหลดสลิปคืนเงิน'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleRefundSlipUpload}
                      className="hidden"
                    />
                  </label>

                  {refundSlipPreview && (
                    <div className="mt-2 h-28 w-28 rounded-xl overflow-hidden border border-slate-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={refundSlipPreview} alt="Refund Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            {!isRejecting ? (
              <>
                <button
                  onClick={() => setIsRejecting(true)}
                  className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-2xl transition-all border border-red-200 flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>ปฏิเสธสลิป / คืนเงิน</span>
                </button>

                <button
                  onClick={handleApprove}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>อนุมัติสลิป & ยืนยันออเดอร์</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsRejecting(false)}
                  className="px-4 py-3 bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl hover:bg-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>ยืนยันปฏิเสธและคืนเงิน</span>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
