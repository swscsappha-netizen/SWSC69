'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Store,
  MapPin,
  Clock,
  CreditCard,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Phone,
  User,
} from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { currentUser, stalls, addShop, shops, showToast } = useApp();

  // Check if current user already has a shop or pending shop
  const userShop = shops.find((s) => s.id === currentUser.shopId);

  const [shopName, setShopName] = useState('');
  const [stallName, setStallName] = useState(stalls[0]?.name || 'ล็อก 1 (โซนข้าวแกง & อาหารตามสั่ง)');
  const [description, setDescription] = useState('');
  const [ownerName, setOwnerName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [promptPayNo, setPromptPayNo] = useState(currentUser.promptPayRefund || currentUser.phone || '');
  const [cutoffTime, setCutoffTime] = useState('20:00');
  const [bannerUrl, setBannerUrl] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'
  );
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80'
  );

  // Fee Slip Upload
  const [feeSlip, setFeeSlip] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSlipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast('info', 'กำลังอัปโหลดสลิป...', 'กำลังส่งรูปภาพเข้าสู่ไดรฟ์');
      const { uploadImage } = await import('@/lib/uploadHelper');
      const res = await uploadImage(file, `fee_reg_${Date.now()}.jpg`);
      setFeeSlip(res.fileUrl);
      showToast('success', 'แนบสลิปแล้ว 📄', res.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopName.trim() || !ownerName.trim() || !phone.trim() || !promptPayNo.trim()) {
      showToast('error', 'กรุณากรอกข้อมูลให้ครบ', 'โปรดระบุชื่อร้านค้า ชื่อเจ้าของ และเบอร์พร้อมเพย์');
      return;
    }

    setIsSubmitting(true);

    const matchingStall = stalls.find((s) => s.name === stallName);
    const resolvedStallId = matchingStall?.id || stalls[0]?.id || 'stall_1';

    setTimeout(() => {
      // Create shop with isApproved: false (Waiting for Admin approval)
      addShop(
        {
          stallId: resolvedStallId,
          stallName,
          name: shopName.trim(),
          description: description.trim(),
          ownerName: ownerName.trim(),
          phone: phone.trim(),
          promptPayNo: promptPayNo.trim(),
          promptPayName: ownerName.trim(),
          cutoffTime,
          isOpen: true,
          isApproved: false, // Requires admin approval!
          registrationFeePaid: !!feeSlip,
          bannerUrl,
          imageUrl,
          subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        currentUser.id
      );

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}

      setIsSubmitting(false);
      showToast(
        'success',
        'ส่งใบสมัครเปิดร้านค้าเรียบร้อย! 🎉',
        'คำขอของคุณถูกส่งไปยังฝ่ายบริหารโรงเรียนเพื่อรอการอนุมัติ'
      );
      router.push('/profile');
    }, 800);
  };

  // If already registered and waiting or approved
  if (userShop) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 space-y-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
          <Store className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">คุณมีร้านค้าในระบบแล้ว</h1>
          <p className="text-xs text-slate-500">
            ร้าน: <strong>{userShop.name}</strong> ({userShop.stallName})
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          สถานะร้านค้า:{' '}
          <strong className={userShop.isApproved ? 'text-emerald-600' : 'text-amber-600'}>
            {userShop.isApproved ? 'อนุมัติแล้ว 🟢' : '⏳ อยู่ระหว่างรอแอดมินอนุมัติ'}
          </strong>
        </div>

        <div className="flex justify-center gap-3">
          <Link
            href="/profile"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            กลับสู่โปรไฟล์
          </Link>
          {userShop.isApproved && (
            <Link
              href="/merchant"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              ไปยังแดชบอร์ดแม่ค้า →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับสู่หน้าโปรไฟล์</span>
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-black text-2xl shadow-lg mb-3">
          <Store className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white">
          ลงทะเบียนเปิดร้านค้าในโรงอาหาร
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-lg leading-relaxed">
          โรงเรียนสรรพวิทยาคม ยินดีต้อนรับผู้ประกอบการร้านอาหารและเครื่องดื่ม กรอกข้อมูลเพื่อส่งให้ฝ่ายบริหารพิจารณาอนุมัติ
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-5 text-xs"
      >
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
              1
            </span>
            <span>ข้อมูลร้านค้าและสถานที่จำหน่าย</span>
          </h2>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">
            ชื่อร้านค้า <span className="text-red-500">*</span>:
          </label>
          <input
            type="text"
            required
            placeholder="เช่น ร้านข้าวมันไก่ &amp; ข้าวหมูกรอบ ป้าณี"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              เลือกล็อกโรงอาหารที่ต้องการเปิด <span className="text-red-500">*</span>:
            </label>
            <select
              value={stallName}
              onChange={(e) => setStallName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {stalls.map((stall) => (
                <option key={stall.id} value={stall.name}>
                  {stall.code} - {stall.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              เวลาตัดรอบรับออเดอร์ตอนค่ำ (Cutoff Time):
            </label>
            <input
              type="time"
              required
              value={cutoffTime}
              onChange={(e) => setCutoffTime(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">คำอธิบายร้าน / เมนูแนะนำ:</label>
          <textarea
            rows={2}
            placeholder="เช่น ไก่ตอนเนื้อนุ่ม น้ำจิ้มรสเด็ด น้ำซุปฟักร้อนๆ..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Section 2: Owner & Payment */}
        <div className="border-b border-slate-100 pb-3 pt-2">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
              2
            </span>
            <span>ข้อมูลผู้ประกอบการและพร้อมเพย์รับเงิน</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              ชื่อเจ้าของร้าน <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ป้าณี"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>:
            </label>
            <input
              type="tel"
              required
              placeholder="081-987-6543"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              เบอร์พร้อมเพย์รับเงิน <span className="text-red-500">*</span>:
            </label>
            <input
              type="text"
              required
              placeholder="0819876543"
              value={promptPayNo}
              onChange={(e) => setPromptPayNo(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Section 3: Registration Fee 20 THB */}
        <div className="border-b border-slate-100 pb-3 pt-2">
          <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
              3
            </span>
            <span>ค่าธรรมเนียมแรกเข้าเปิดร้าน (20 บาท)</span>
          </h2>
        </div>

        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-extrabold text-xs text-slate-900">ค่าธรรมเนียมแรกเข้าสู่ระบบโรงอาหาร</div>
              <div className="text-[11px] text-slate-500">พร้อมเพย์โรงเรียนสรรพวิทยาคม: <strong>086-555-8899</strong></div>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-emerald-700">20.00 บาท</span>
            </div>
          </div>

          {/* Slip Upload Box */}
          <label className="block p-4 border-2 border-dashed border-emerald-300 rounded-2xl hover:bg-emerald-100/50 cursor-pointer transition text-center">
            {feeSlip ? (
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-xl overflow-hidden border border-emerald-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={feeSlip} alt="fee slip" className="w-full h-full object-cover" />
                </div>
                <div className="text-emerald-800 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>แนบสลิป 20 บาทเรียบร้อยแล้ว</span>
                </div>
                <span className="text-[10px] text-slate-400 underline">คลิกเพื่อเปลี่ยนรูปสลิป</span>
              </div>
            ) : (
              <div className="space-y-1">
                <UploadCloud className="w-6 h-6 text-emerald-600 mx-auto" />
                <div className="font-bold text-slate-700">คลิกเพื่อแนบสลิปโอนเงิน 20 บาท (ถ้ามี)</div>
                <p className="text-[10px] text-slate-400">สามารถโอนและแนบสลิปเพื่อให้แอดมินอนุมัติเร็วขึ้น</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleSlipUpload} className="hidden" />
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
        >
          <span>{isSubmitting ? 'กำลังส่งใบสมัคร...' : 'ส่งใบสมัครเปิดร้านค้าในโรงอาหาร 🏪'}</span>
        </button>
      </form>
    </div>
  );
}
