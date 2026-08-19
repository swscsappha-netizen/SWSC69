'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Store,
  Save,
  Camera,
  Clock,
  CreditCard,
  Phone,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Image as ImageIcon,
  MapPin,
  Sparkles,
  Check,
} from 'lucide-react';

const PRESET_LOGOS = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
];

const PRESET_BANNERS = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80',
  'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80',
];

export default function MerchantSettingsPage() {
  const router = useRouter();
  const { currentUser, shops, stalls, updateShop, showToast } = useApp();

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

  return <MerchantSettingsForm shop={shop} stalls={stalls} updateShop={updateShop} showToast={showToast} router={router} />;
}

function MerchantSettingsForm({
  shop,
  stalls,
  updateShop,
  showToast,
  router,
}: {
  shop: any;
  stalls: any[];
  updateShop: (shopId: string, updates: Record<string, unknown>) => void;
  showToast: any;
  router: any;
}) {
  const [shopName, setShopName] = useState(shop.name || '');
  const [description, setDescription] = useState(shop.description || '');
  const [phone, setPhone] = useState(shop.phone || '');
  const [promptPayNo, setPromptPayNo] = useState(shop.promptPayNo || '');
  const [promptPayName, setPromptPayName] = useState(shop.promptPayName || '');
  const [cutoffTime, setCutoffTime] = useState(shop.cutoffTime || '20:00');
  const [stallId, setStallId] = useState(shop.stallId || stalls[0]?.id || 'stall_1');
  const [imageUrl, setImageUrl] = useState(shop.imageUrl || '');
  const [bannerUrl, setBannerUrl] = useState(shop.bannerUrl || '');
  const [ownerName, setOwnerName] = useState(shop.ownerName || '');
  const [saving, setSaving] = useState(false);

  const selectedStall = stalls.find((s) => s.id === stallId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateShop(shop.id, {
        name: shopName.trim(),
        description: description.trim(),
        phone: phone.trim(),
        promptPayNo: promptPayNo.trim(),
        promptPayName: promptPayName.trim(),
        cutoffTime: cutoffTime.trim(),
        stallId,
        stallName: selectedStall?.name || shop.stallName,
        imageUrl: imageUrl.trim(),
        bannerUrl: bannerUrl.trim(),
        ownerName: ownerName.trim(),
      });
      setSaving(false);
      showToast('success', 'บันทึกการตั้งค่าร้านสำเร็จ! 🎉', 'ข้อมูลร้านค้าได้รับการอัปเดตลงฐานข้อมูลเรียบร้อยแล้ว');
    }, 400);
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
          <div className="text-[11px] text-slate-500">📍 {shop.stallName}</div>
        </div>
      </div>

      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          ตั้งค่าข้อมูลร้านค้า & บัญชีรับเงิน (Shop Customization)
        </h1>
        <p className="text-xs text-slate-500">
          ปรับแต่งรูปภาพหน้าร้าน, โลโก้, เวลาตัดรอบ, เบอร์พร้อมเพย์รับเงิน และล็อกโรงอาหาร
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        
        {/* Visual Branding Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Camera className="w-4 h-4 text-brand-600" />
            <span>รูปภาพโลโก้ และภาพแบนเนอร์หน้าร้าน</span>
          </h2>

          <div className="space-y-4 text-xs">
            {/* Banner Preview */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">ภาพแบนเนอร์ปกหน้าร้าน (Cover Banner):</label>
              <div className="w-full h-32 sm:h-40 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 relative shadow-inner">
                {bannerUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bannerUrl} alt="Cover Banner" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    ไม่มีรูปแบนเนอร์
                  </div>
                )}
              </div>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="กรอก URL รูปภาพแบนเนอร์ https://..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
              />
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] text-slate-400">หรือเลือกภาพสำเร็จรูป:</span>
                {PRESET_BANNERS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBannerUrl(url)}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold"
                  >
                    แบนเนอร์ {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo Preview */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">โลโก้ร้านค้า (Shop Profile Image):</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shrink-0 shadow-inner">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Store className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="กรอก URL โลโก้ https://..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400">หรือเลือก:</span>
                    {PRESET_LOGOS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(url)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold"
                      >
                        โลโก้ {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Shop Info Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>ข้อมูลพื้นฐาน & ทำเลที่ตั้ง</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                ชื่อร้านค้า <span className="text-red-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                ล็อกโรงอาหารที่ตั้ง <span className="text-red-500">*</span>:
              </label>
              <select
                value={stallId}
                onChange={(e) => setStallId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                {stalls.map((stall) => (
                  <option key={stall.id} value={stall.id}>
                    {stall.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">
                คำอธิบาย / สโลแกนร้านค้า:
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="เช่น จำหน่ายอาหารจานเดียว ปรุงสดใหม่ทุกเช้า รับอาหารได้ที่ล็อก 3"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"
              />
            </div>
          </div>
        </div>

        {/* Payment & Cutoff Time Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>บัญชีพร้อมเพย์รับเงิน & เวลาตัดรอบ</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                เบอร์พร้อมเพย์รับเงิน (PromptPay) <span className="text-red-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={promptPayNo}
                onChange={(e) => setPromptPayNo(e.target.value)}
                placeholder="เช่น 0891234567 หรือ เลขประจำตัว 13 หลัก"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                ระบบจะนำเบอร์นี้ไปสร้าง QR Code พร้อมเพย์ให้นักเรียนสแกนจ่ายเงิน
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                ชื่อบัญชีพร้อมเพย์ (แสดงให้นักเรียนตรวจสอบ):
              </label>
              <input
                type="text"
                value={promptPayName}
                onChange={(e) => setPromptPayName(e.target.value)}
                placeholder="เช่น นายสมใจ ใจดี"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                ชื่อเจ้าของร้าน / ผู้ดูแล:
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                เบอร์โทรศัพท์ติดต่อร้าน:
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                เวลาปิดรับออเดอร์มื้อเช้า (Cutoff Time):
              </label>
              <input
                type="time"
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'กำลังบันทึกลงฐานข้อมูล...' : 'บันทึกการตั้งค่าร้านค้า'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
