'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Store, Save, Camera, Clock, CreditCard, Phone, FileText, ShieldCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function MerchantSettingsPage() {
  const { currentUser, shops, updateShop } = useApp();

  if (shops.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Store className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-xl font-bold text-slate-800">ยังไม่มีร้านค้าในระบบ</h1>
        <p className="text-xs text-slate-500">กรุณาสร้างร้านค้าก่อนจึงจะสามารถตั้งค่าข้อมูลร้านได้</p>
        <Link
          href={currentUser.role === 'ADMIN' ? '/admin' : '/merchant'}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-2xl text-xs font-bold"
        >
          {currentUser.role === 'ADMIN' ? 'ไปที่หน้าแอดมิน' : 'กลับแดชบอร์ด'}
        </Link>
      </div>
    );
  }

  const currentShopId = currentUser.shopId || shops[0]?.id;
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
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ตั้งค่าข้อมูลร้านค้า
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            แก้ไขข้อมูลหน้าร้าน เบอร์พร้อมเพย์รับเงิน และเวลาตัดรอบ
          </p>
        </div>

        <Link
          href="/merchant"
          className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm"
        >
          ← แดชบอร์ด
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>ข้อมูลพื้นฐานของร้านค้า</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">ชื่อร้านค้า:</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => { setShopName(e.target.value); mark(); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">คำอธิบายหน้าร้าน / จุดเด่นของเมนู:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => { setDescription(e.target.value); mark(); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 resize-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ชื่อผู้ประกอบการ / เจ้าของร้าน:</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => { setOwnerName(e.target.value); mark(); }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">เบอร์โทรศัพท์ติดต่อ:</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); mark(); }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Cutoff Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-brand-600" />
            <span>บัญชีพร้อมเพย์และเวลาตัดรอบ</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">เบอร์พร้อมเพย์รับเงิน:</label>
              <input
                type="text"
                required
                value={promptPayNo}
                onChange={(e) => { setPromptPayNo(e.target.value); mark(); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-brand-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">เวลาปิดรับออเดอร์ (Cutoff Time):</label>
              <input
                type="time"
                required
                value={cutoffTime}
                onChange={(e) => { setCutoffTime(e.target.value); mark(); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving || !changed}
          className={`w-full py-4 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
            changed
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 scale-[1.01]'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'กำลังบันทึก...' : changed ? 'บันทึกการเปลี่ยนแปลง' : 'ข้อมูลเป็นปัจจุบันแล้ว'}</span>
        </button>
      </form>
    </div>
  );
}
