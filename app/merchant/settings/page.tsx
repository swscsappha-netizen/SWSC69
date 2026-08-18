'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Store, Save, Camera, Clock, CreditCard, Phone, FileText, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function MerchantSettingsPage() {
  const { currentUser, shops, updateShop, switchRole, showToast } = useApp();

  // Access guard: only merchant or admin
  if (currentUser.role === 'STUDENT') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h1 className="text-xl font-black text-slate-900">เฉพาะแม่ค้าเท่านั้น</h1>
        <p className="text-xs text-slate-500">หน้านี้ใช้งานได้เฉพาะบัญชีที่เป็นเจ้าของร้านค้าในระบบ Sappha PreOrder</p>
        <button
          onClick={() => switchRole('MERCHANT')}
          className="mt-2 px-6 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-md"
        >
          สลับเป็นบทบาทแม่ค้า (ทดสอบ)
        </button>
      </div>
    );
  }

  const currentShopId = currentUser.shopId || 'shop_1';
  const shop = shops.find((s) => s.id === currentShopId) || shops[0];

  return <MerchantSettingsForm shop={shop} updateShop={updateShop} />;
}

function MerchantSettingsForm({
  shop,
  updateShop,
}: {
  shop: { id: string; name: string; ownerName: string; description: string; imageUrl: string; bannerUrl: string; phone: string; promptPayNo: string; promptPayName: string; cutoffTime: string; stallName: string; isApproved: boolean; registrationFeePaid: boolean; subscriptionExpiresAt: string };
  updateShop: (shopId: string, updates: Record<string, unknown>) => void;
}) {
  const [shopName, setShopName] = useState(shop.name);
  const [description, setDescription] = useState(shop.description);
  const [phone, setPhone] = useState(shop.phone);
  const [promptPayNo, setPromptPayNo] = useState(shop.promptPayNo);
  const [promptPayName, setPromptPayName] = useState(shop.promptPayName);
  const [cutoffTime, setCutoffTime] = useState(shop.cutoffTime);
  const [imageUrl, setImageUrl] = useState(shop.imageUrl);
  const [bannerUrl, setBannerUrl] = useState(shop.bannerUrl);
  const [ownerName, setOwnerName] = useState(shop.ownerName);
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);

  const mark = () => setChanged(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateShop(shop.id, {
        name: shopName,
        description,
        phone,
        promptPayNo,
        promptPayName,
        cutoffTime,
        imageUrl,
        bannerUrl,
        ownerName,
      });
      setSaving(false);
      setChanged(false);
    }, 600);
  };

  const subExpiry = new Date(shop.subscriptionExpiresAt);
  const daysLeft = Math.ceil((subExpiry.getTime() - Date.now()) / 86400000);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={shopName} className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition"
            onClick={() => {
              const url = prompt('วาง URL รูปโลโก้ร้าน:');
              if (url) { setImageUrl(url); mark(); }
            }}
          >
            <Camera className="w-3 h-3 text-slate-600" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">{shopName}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{shop.stallName}</p>
          <div className="flex items-center gap-2 mt-1">
            {shop.isApproved ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">
                <ShieldCheck className="w-3 h-3" /> ได้รับอนุมัติแล้ว
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200 rounded-full">
                <AlertTriangle className="w-3 h-3" /> รอการอนุมัติ
              </span>
            )}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full border ${
              daysLeft > 7 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {daysLeft > 0 ? `สมาชิก: เหลือ ${daysLeft} วัน` : 'สมาชิกหมดอายุแล้ว!'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-4">

        {/* Basic Info */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-600" />
              ข้อมูลร้านค้า
            </h2>
            {changed && <span className="text-[11px] text-amber-600 font-semibold animate-pulse">● มีการแก้ไขที่ยังไม่ได้บันทึก</span>}
          </div>
          <div className="p-6 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                ชื่อร้านค้า <span className="text-red-500">*</span>
              </label>
              <input
                type="text" required value={shopName}
                onChange={(e) => { setShopName(e.target.value); mark(); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-400 transition font-bold text-sm"
                placeholder="เช่น ป้าณี ข้าวมันไก่ & ข้าวหมูกรอบ"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                คำอธิบายร้านค้า (แสดงบนหน้าร้าน)
              </label>
              <textarea
                rows={2} value={description}
                onChange={(e) => { setDescription(e.target.value); mark(); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-400 transition resize-none"
                placeholder="เช่น ข้าวมันไก่ตอนนุ่มเด้ง สูตรต้นตำรับ พร้อมข้าวหมูกรอบทอดสด"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">ชื่อเจ้าของร้าน / ผู้รับผิดชอบ</label>
              <input
                type="text" value={ownerName}
                onChange={(e) => { setOwnerName(e.target.value); mark(); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-400 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">URL รูปปกร้านค้า (Banner)</label>
              <div className="flex gap-2">
                <input
                  type="text" value={bannerUrl}
                  onChange={(e) => { setBannerUrl(e.target.value); mark(); }}
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-400 transition text-[11px] font-mono"
                  placeholder="https://..."
                />
                {bannerUrl && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={bannerUrl} alt="banner preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Hours */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
            <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              การรับเงิน & เวลารับออเดอร์
            </h2>
          </div>
          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  เบอร์โทรติดต่อร้าน <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel" required value={phone}
                  onChange={(e) => { setPhone(e.target.value); mark(); }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-400 transition font-mono font-bold tracking-wider"
                  placeholder="0812345678"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  เวลาปิดรับออเดอร์ (Cutoff Time) <span className="text-red-500">*</span>
                </label>
                <input
                  type="time" required value={cutoffTime}
                  onChange={(e) => { setCutoffTime(e.target.value); mark(); }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-400 transition font-mono font-bold text-lg"
                />
                <p className="mt-1 text-slate-400 text-[11px]">ลูกค้าจะสั่งได้ถึงเวลานี้ก่อน 00:00 น. ของคืนก่อนวันส่ง</p>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                เบอร์ / เลข PromptPay สำหรับรับเงิน <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text" required value={promptPayNo}
                  onChange={(e) => { setPromptPayNo(e.target.value); mark(); }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-400 transition font-mono font-bold tracking-widest"
                  placeholder="0812345678"
                />
                <input
                  type="text" value={promptPayName}
                  onChange={(e) => { setPromptPayName(e.target.value); mark(); }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-400 transition"
                  placeholder="ชื่อบัญชี เช่น นางณี สุขใจ"
                />
              </div>
              <p className="mt-1.5 text-slate-400 text-[11px]">
                ลูกค้าจะเห็น QR Code PromptPay นี้ในหน้าชำระเงิน ตรวจสอบความถูกต้องก่อนบันทึก
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <Link
            href="/merchant"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            ← กลับหน้าหลักร้านค้า
          </Link>
          <button
            type="submit"
            disabled={saving || !changed}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-xs font-extrabold shadow-md transition-all ${
              changed
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 text-white shadow-emerald-600/25 hover:scale-105 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="animate-spin text-base leading-none">⟳</span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าร้านค้า'}
          </button>
        </div>
      </form>
    </div>
  );
}
