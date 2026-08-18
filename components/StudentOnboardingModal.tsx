'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, ShieldCheck, UserCheck, Phone, BookOpen, Hash } from 'lucide-react';
import { findStudentById } from '@/lib/studentsLookup';

export default function StudentOnboardingModal() {
  const { currentUser, isAuthReady, updateUserProfile, showToast } = useApp();

  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [gradeRoom, setGradeRoom] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [isLockedByDatabase, setIsLockedByDatabase] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if onboarding is needed
  // Condition: Only check AFTER isAuthReady is true (100% finished syncing with Supabase)
  useEffect(() => {
    if (!isAuthReady) {
      setOpen(false);
      return;
    }

    const isMockOrEmptyId = !currentUser.studentId || 
      currentUser.studentId.length < 4 || 
      currentUser.studentId.startsWith('user_') || 
      currentUser.studentId === 'ADMIN-01' || 
      currentUser.studentId === '45892';

    if (currentUser.isLoggedIn && isMockOrEmptyId) {
      // Smooth 200ms delay so loading screen fades out first before popup slides in
      const timer = setTimeout(() => {
        setOpen(true);
        if (currentUser.name) setFullName(currentUser.name);
        if (currentUser.nickname) setNickname(currentUser.nickname);
        if (currentUser.phone) setPhone(currentUser.phone);
        if (currentUser.gradeRoom) setGradeRoom(currentUser.gradeRoom);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setOpen(false);
    }
  }, [currentUser.isLoggedIn, currentUser.studentId, currentUser.role, isAuthReady]);

  if (!open) return null;

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setStudentId(val);

    if (val.length >= 4) {
      const res = findStudentById(val);
      if (res.found && res.student) {
        setFullName(res.student.fullName);
        setGradeRoom(res.student.gradeRoom);
        setIsLockedByDatabase(true);
        showToast(
          'success',
          'พบข้อมูลนักเรียนในระบบ! 🎓',
          `${res.student.fullName} (${res.student.gradeRoom}) เลขที่ ${res.student.studentNumber}`
        );
      } else {
        setIsLockedByDatabase(false);
      }
    } else {
      setIsLockedByDatabase(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || studentId.length < 4) {
      showToast('error', 'กรุณากรอกรหัสนักเรียน', 'กรุณากรอกเลขประจำตัวนักเรียน 5 หลัก');
      return;
    }
    if (!nickname.trim()) {
      showToast('error', 'กรุณากรอกชื่อเล่น', 'ชื่อเล่นจะใช้สำหรับเรียกรับอาหารหน้าร้าน');
      return;
    }
    if (!phone.trim()) {
      showToast('error', 'กรุณากรอกเบอร์โทรศัพท์', 'เบอร์โทรสำหรับให้แม่ค้าติดต่อ');
      return;
    }

    setSubmitting(true);

    const isLineAdmin = ['U203ff66b7e535c901dfbfa86d93eef46'].includes(currentUser.lineUserId || currentUser.id) || currentUser.role === 'ADMIN';
    const effectiveRole = isLineAdmin ? 'ADMIN' : (currentUser.role || 'STUDENT');

    const updatedUser = {
      name: fullName.trim() || currentUser.name || (effectiveRole === 'ADMIN' ? 'ผู้ดูแลระบบ ส.ว.' : 'นักเรียน ส.ว.'),
      nickname: nickname.trim() || (effectiveRole === 'ADMIN' ? 'แอดมิน' : 'ส.ว.'),
      studentId: studentId.trim(),
      gradeRoom: gradeRoom.trim() || (effectiveRole === 'ADMIN' ? 'ผู้ดูแลระบบโรงเรียน' : 'ม.5/2'),
      phone: phone.trim(),
      promptPayRefund: phone.trim(),
      role: effectiveRole,
      isLoggedIn: true,
    };

    updateUserProfile(updatedUser);

    // Sync to Supabase
    import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
      if (isSupabaseConfigured && supabase && currentUser.id) {
        supabase
          .from('users')
          .update({
            name: updatedUser.name,
            nickname: updatedUser.nickname,
            student_id: updatedUser.studentId,
            grade_room: updatedUser.gradeRoom,
            phone: updatedUser.phone,
            promptpay_refund: updatedUser.promptPayRefund,
            role: effectiveRole,
          })
          .eq('id', currentUser.id)
          .then();
      }
    }).catch(() => {});

    setTimeout(() => {
      setSubmitting(false);
      setOpen(false);
      const greeting = effectiveRole === 'ADMIN'
        ? `ยินดีต้อนรับแอดมิน ${updatedUser.nickname} (${updatedUser.gradeRoom}) 🛡️`
        : `ยินดีต้อนรับน้อง ${updatedUser.nickname} (${updatedUser.gradeRoom}) 🎉`;
      showToast('success', 'ลงทะเบียนสำเร็จ!', greeting);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-center text-white relative">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center font-black text-xl shadow-lg mb-2.5">
            SW
          </div>
          <h2 className="text-lg font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>ยินดีต้อนรับสู่ Sappha PreOrder</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            โรงเรียนสรรพวิทยาคม • กรอกรหัสนักเรียนเพื่อเริ่มต้นใช้งาน
          </p>
        </div>

        {/* LINE Connected Badge */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs shadow-sm">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-400 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt="LINE Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="truncate text-left">
                <p className="text-[10px] text-emerald-600 font-extrabold uppercase">บัญชี LINE ที่เชื่อมต่อ</p>
                <p className="text-xs font-black truncate text-slate-900">{currentUser.name || 'ผู้ใช้งาน LINE'}</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full flex-shrink-0">
              เชื่อมต่อแล้ว ✅
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Student ID 5 Digits */}
          <div className="space-y-1.5 p-3.5 bg-orange-50/80 border border-orange-200 rounded-2xl text-left">
            <label className="font-extrabold text-slate-800 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-brand-700">
                <Hash className="w-4 h-4 text-brand-600" />
                <span>เลขประจำตัวนักเรียน (5 หลัก)</span>
                <span className="text-red-500">*</span>
              </span>
              <span className="text-[10px] text-brand-600 font-bold bg-white px-2 py-0.5 rounded-full border border-orange-200">
                ดึงชื่อและห้องอัตโนมัติ ⚡
              </span>
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={studentId}
              onChange={handleStudentIdChange}
              placeholder="เช่น 34890 หรือ 31774"
              className="w-full p-3 bg-white border border-orange-300 rounded-xl font-mono font-black text-base text-brand-700 focus:ring-2 focus:ring-brand-500 shadow-sm"
              autoFocus
            />

            {fullName && gradeRoom && (
              <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-[11px] animate-in fade-in slide-in-from-top-1">
                <span className="text-sm">🔒</span>
                <div className="flex-1 truncate">
                  <span className="font-extrabold">{fullName}</span> ({gradeRoom})
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold">
                  ฐานข้อมูลทางการ
                </span>
              </div>
            )}
          </div>

          {/* Full Name & Grade Room (Readonly when locked) */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>ชื่อ-นามสกุลจริง <span className="text-red-500">*</span></span>
                {isLockedByDatabase && (
                  <span className="text-[10px] text-slate-500 font-bold">🔒 ล็อค</span>
                )}
              </label>
              <input
                type="text"
                required
                readOnly={isLockedByDatabase}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="เช่น นายสมชาย ใจดี"
                className={`w-full p-2.5 border rounded-xl font-bold transition-all ${
                  isLockedByDatabase
                    ? 'bg-slate-100/90 text-slate-700 cursor-not-allowed border-slate-300'
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500'
                }`}
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>ระดับชั้น/ห้อง <span className="text-red-500">*</span></span>
                {isLockedByDatabase && (
                  <span className="text-[10px] text-slate-500 font-bold">🔒 ล็อค</span>
                )}
              </label>
              <input
                type="text"
                required
                readOnly={isLockedByDatabase}
                value={gradeRoom}
                onChange={(e) => setGradeRoom(e.target.value)}
                placeholder="เช่น ม.5/2"
                className={`w-full p-2.5 border rounded-xl font-bold transition-all ${
                  isLockedByDatabase
                    ? 'bg-slate-100/90 text-slate-700 cursor-not-allowed border-slate-300'
                    : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500'
                }`}
              />
            </div>
          </div>

          {/* Nickname & Phone */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                ชื่อเล่น (เรียกรับอาหาร) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="เช่น ก้อง"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812345678"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500 hover:from-brand-700 hover:to-amber-600 active:scale-95 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {submitting ? (
              <span>กำลังบันทึกข้อมูล...</span>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>บันทึกและเริ่มสั่งอาหาร 🍱</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
