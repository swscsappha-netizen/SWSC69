'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { User, Save, Camera, BadgeCheck, Phone, BookOpen, CreditCard, Hash, Store, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { currentUser, updateUserProfile, showToast, shops, switchRole } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [gradeRoom, setGradeRoom] = useState(currentUser.gradeRoom);
  const [phone, setPhone] = useState(currentUser.phone);
  const [promptPay, setPromptPay] = useState(currentUser.promptPayRefund || currentUser.phone);
  const [studentId, setStudentId] = useState(currentUser.studentId || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(false);
  const [isLockedByDatabase, setIsLockedByDatabase] = useState(false);

  // Check if studentId is in official database on mount or change
  useEffect(() => {
    if (currentUser.studentId && currentUser.studentId.length >= 4) {
      import('@/lib/studentsLookup').then(({ findStudentById }) => {
        const res = findStudentById(currentUser.studentId || '');
        if (res.found) {
          setIsLockedByDatabase(true);
        }
      });
    }
  }, [currentUser.studentId]);

  // Reset form if user switches role
  useEffect(() => {
    setName(currentUser.name);
    setNickname(currentUser.nickname);
    setGradeRoom(currentUser.gradeRoom);
    setPhone(currentUser.phone);
    setPromptPay(currentUser.promptPayRefund || currentUser.phone);
    setStudentId(currentUser.studentId || '');
    setAvatarUrl(currentUser.avatarUrl || '');
    setChanged(false);
  }, [currentUser.role]);

  const markChanged = () => setChanged(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      updateUserProfile({
        name,
        nickname,
        gradeRoom,
        phone,
        promptPayRefund: promptPay,
        studentId,
        avatarUrl,
      });

      // Sync to Supabase
      import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
        if (isSupabaseConfigured && supabase && currentUser.id) {
          supabase.from('users').update({
            name,
            nickname,
            grade_room: gradeRoom,
            phone,
            promptpay_refund: promptPay,
            student_id: studentId,
            avatar_url: avatarUrl,
          }).eq('id', currentUser.id).then();
        }
      }).catch(() => {});

      setSaving(false);
      setChanged(false);
      showToast('success', 'บันทึกโปรไฟล์สำเร็จ! ✨', 'ข้อมูลส่วนตัวได้รับการอัปเดตเรียบร้อย');
    }, 500);
  };

  const roleLabel =
    currentUser.role === 'MERCHANT'
      ? 'แม่ค้า / พ่อค้า'
      : currentUser.role === 'ADMIN'
      ? 'ผู้ดูแลระบบโรงเรียน'
      : 'นักเรียน / ครู / บุคลากร';

  const roleColor =
    currentUser.role === 'MERCHANT'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : currentUser.role === 'ADMIN'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : 'bg-brand-100 text-brand-700 border-brand-200';

  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const { processImageFile } = await import('@/lib/imageUtils');
      const optimizedBase64 = await processImageFile(file, 600, 0.85);
      setAvatarUrl(optimizedBase64);
      markChanged();
      showToast('success', 'เปลี่ยนรูปโปรไฟล์แล้ว ✨', 'อย่าลืมกดปุ่มบันทึกการเปลี่ยนแปลง');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="relative w-24 h-24 mx-auto">
          <input
            type="file"
            ref={avatarInputRef}
            onChange={handleAvatarFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center text-4xl font-black shadow-lg overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={nickname} className="w-full h-full object-cover" />
            ) : (
              <span>{nickname.slice(0, 1)}</span>
            )}
          </div>
          <button
            type="button"
            className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center shadow-md hover:bg-slate-50 transition cursor-pointer"
            onClick={() => avatarInputRef.current?.click()}
            title="กดเพื่อเลือกรูปโปรไฟล์จากเครื่อง หรือถ่ายรูปใหม่"
          >
            <Camera className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900">{currentUser.nickname}</h1>
          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${roleColor} mt-1`}>
            <BadgeCheck className="w-3.5 h-3.5" />
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSave}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h2 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-600" />
            ข้อมูลส่วนตัว
          </h2>
          {changed && (
            <span className="text-[11px] text-amber-600 font-semibold animate-pulse">● มีการแก้ไขที่ยังไม่ได้บันทึก</span>
          )}
        </div>

        <div className="p-6 space-y-4 text-xs">
          {/* Locked Notice */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-2.5 text-slate-600">
            <span className="text-base">🔒</span>
            <div className="flex-1 text-[11px] leading-relaxed">
              <span className="font-bold text-slate-800">ข้อมูลทะเบียนทางการถูกล็อคถาวร</span>
              <p className="text-slate-500 text-[10px]">รหัสนักเรียน ชื่อจริง และห้องเรียนผูกกับทะเบียนโรงเรียน หากต้องการแก้ไขกรุณาติดต่อแอดมิน</p>
            </div>
          </div>

          {/* Name & Nickname */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>ชื่อ-นามสกุลจริง:</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  🔒 ทะเบียนทางการ
                </span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={name}
                className="w-full p-3 bg-slate-100/90 text-slate-700 border border-slate-300 rounded-2xl cursor-not-allowed font-medium"
                placeholder="ชื่อ-นามสกุลจริง"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                ชื่อเล่น (ที่เรียกขานหน้าร้าน) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => { setNickname(e.target.value); markChanged(); }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition font-bold"
                placeholder="เช่น ชาย"
              />
            </div>
          </div>

          {/* Grade & Student ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-slate-500" />
                  ระดับชั้น / ห้อง / ตำแหน่ง
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  🔒 ทะเบียนทางการ
                </span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={gradeRoom}
                className="w-full p-3 bg-slate-100/90 text-slate-700 border border-slate-300 rounded-2xl cursor-not-allowed font-bold"
                placeholder="เช่น ม.5/2"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-500" />
                  รหัสนักเรียน (5 หลัก)
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  🔒 ล็อคถาวร
                </span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={studentId}
                className="w-full p-3 bg-slate-100/90 text-slate-700 border border-slate-300 rounded-2xl cursor-not-allowed font-mono font-bold tracking-widest"
                placeholder="เช่น 34890"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-500" />
              เบอร์โทรศัพท์ที่ติดต่อได้ <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => { setPhone(e.target.value); markChanged(); }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition font-mono font-bold tracking-wider"
              placeholder="0812345678"
            />
          </div>

          {/* PromptPay for Refund */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-slate-500" />
              เบอร์พร้อมเพย์สำหรับรับเงินคืน (กรณียกเลิกออเดอร์)
            </label>
            <input
              type="text"
              value={promptPay}
              onChange={(e) => { setPromptPay(e.target.value); markChanged(); }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition font-mono font-bold tracking-wider"
              placeholder="เบอร์โทรหรือเลขบัตร"
            />
            <p className="mt-1 text-slate-400 text-[11px]">
              แม่ค้าจะโอนเงินคืนมาที่บัญชีนี้หากมีการยกเลิกออเดอร์
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            ← กลับหน้าหลัก
          </Link>
          <button
            type="submit"
            disabled={saving || !changed}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-extrabold shadow-md transition-all ${
              changed
                ? 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 text-white shadow-brand-600/25 hover:scale-105 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </form>

      {/* Merchant Application & Shop Dashboard Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              การเปิดร้านค้าในโรงอาหาร (Merchant Space)
            </h3>
            <p className="text-xs text-slate-500">
              สำหรับผู้ประกอบการที่ต้องการเปิดร้านขายอาหารและเครื่องดื่มในโรงเรียนสรรพวิทยาคม
            </p>
          </div>
        </div>

        {(() => {
          const userShop = shops.find(
            (s) =>
              s.id === currentUser.shopId ||
              s.ownerName === currentUser.name ||
              s.phone === currentUser.phone
          );

          if (!userShop) {
            return (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs">
                  <div className="font-bold text-slate-900">ยังไม่มีร้านค้าในระบบ</div>
                  <div className="text-slate-500">
                    ยื่นขอเปิดล็อกร้านค้า แนบสลิปค่าแรกเข้า 20 บาท และรอฝ่ายบริหารอนุมัติ
                  </div>
                </div>
                <Link
                  href="/merchant/register"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition whitespace-nowrap self-start sm:self-auto"
                >
                  + ยื่นขอเปิดร้านค้าใหม่ 🏪
                </Link>
              </div>
            );
          }

          if (!userShop.isApproved) {
            return (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>คำขอเปิดร้าน &ldquo;{userShop.name}&rdquo; อยู่ระหว่างการตรวจสอบ ⏳</span>
                </div>
                <p className="text-amber-800">
                  ล็อกที่ขอ: <strong>{userShop.stallName}</strong> • เมื่อแอดมินอนุมัติแล้ว คุณจะสามารถเข้าสู่ระบบจัดการเมนูและรับออเดอร์ได้ทันที
                </p>
              </div>
            );
          }

          return (
            <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-900">{userShop.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      อนุมัติแล้ว 🟢
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{userShop.stallName} • เวลาตัดรอบ {userShop.cutoffTime} น.</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/merchant"
                  onClick={() => switchRole('MERCHANT')}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" />
                  <span>เข้าสู่แดชบอร์ดจัดการร้านค้า (Merchant Portal) →</span>
                </Link>
                <Link
                  href="/merchant/settings"
                  className="py-2.5 px-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition"
                >
                  ตั้งค่าร้าน
                </Link>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
