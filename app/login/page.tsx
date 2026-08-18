'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, switchRole, updateUserProfile, showToast } = useApp();

  const [loading, setLoading] = useState(false);
  // liffReady = true เมื่อ LIFF init + login เสร็จและได้โปรไฟล์มาแล้ว
  const [liffReady, setLiffReady] = useState(false);
  // liffError = ข้อความ error เมื่อ LIFF init ล้มเหลว
  const [liffError, setLiffError] = useState<string | null>(null);

  // Known Admin LINE UserIds
  const ADMIN_LINE_IDS = ['U203ff66b7e535c901dfbfa86d93eef46'];

  // Line Profile
  const [lineProfile, setLineProfile] = useState<{
    userId?: string;
    name: string;
    avatarUrl: string;
  }>({
    name: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  });

  // Selected Role for onboarding
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');

  // Onboarding fields (Real User Info)
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [nickname, setNickname] = useState('');
  const [gradeRoom, setGradeRoom] = useState('ม.5/2');
  const [phone, setPhone] = useState('');
  const [promptPay, setPromptPay] = useState('');

  const runLiffInit = useCallback(() => {
    setLiffError(null);

    // Timeout fallback: ถ้า 12 วิแล้วหน้ายัง loading อยู่ → แสดง error
    const timeoutId = setTimeout(() => {
      setLiffError('การเชื่อมต่อ LINE ใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง');
    }, 12000);

    import('@/lib/liff').then(({ initLiff }) => {
      initLiff().then((res) => {
        clearTimeout(timeoutId);

        // ถ้า initLiff คืน error field = เกิด error จริงๆ (ไม่ใช่แค่ redirect)
        if (!res.success && res.error) {
          setLiffError(`ไม่สามารถเชื่อมต่อ LINE ได้: ${res.error}`);
          return;
        }

        if (!res.success) {
          // liff.login() ถูกเรียกแล้วและกำลัง redirect ไป LINE auth — รอ redirect
          return;
        }

        if (res.success && res.profile) {
          const isLineAdmin = ADMIN_LINE_IDS.includes(res.profile.userId);
          setLineProfile({
            userId: res.profile.userId,
            name: res.profile.displayName,
            avatarUrl: res.profile.pictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          });
          setFullName(res.profile.displayName);
          setNickname(res.profile.displayName.slice(0, 10));

          // If Admin logs in via LINE LIFF, auto-login as ADMIN!
          if (isLineAdmin) {
            updateUserProfile({
              id: res.profile.userId,
              name: res.profile.displayName,
              nickname: 'แอดมิน',
              studentId: 'ADMIN-01',
              gradeRoom: 'ผู้ดูแลระบบโรงเรียน',
              phone: '089-123-4567',
              promptPayNumber: '0891234567',
              role: 'ADMIN',
              avatarUrl: res.profile.pictureUrl,
              lineUserId: res.profile.userId,
              isActive: true,
              isLoggedIn: true,
            });
            showToast('success', 'ยินดีต้อนรับผู้ดูแลระบบ! 🛡️', `เข้าสู่ระบบในฐานะ Admin (${res.profile.displayName})`);
            router.replace('/admin');
            return;
          }

          // User ปกติ: LINE profile พร้อม → แสดงฟอร์มกรอกข้อมูล
          setLiffReady(true);
        } else {
          // Login แล้วแต่ไม่มี profile (edge case) → แสดงฟอร์มโดยไม่มีรูป
          setLiffReady(true);
        }
      }).catch((err: any) => {
        clearTimeout(timeoutId);
        setLiffError(err?.message || 'เชื่อมต่อ LINE ไม่สำเร็จ กรุณาลองใหม่');
      });
    }).catch((err: any) => {
      clearTimeout(timeoutId);
      setLiffError(err?.message || 'โหลด LINE SDK ไม่สำเร็จ กรุณาลองใหม่');
    });
  }, [ADMIN_LINE_IDS, router, showToast, updateUserProfile]);

  useEffect(() => {
    runLiffInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isLineAdmin = lineProfile.userId && ADMIN_LINE_IDS.includes(lineProfile.userId);
    const effectiveRole = isLineAdmin ? 'ADMIN' : selectedRole;

    setTimeout(() => {
      switchRole(effectiveRole);
      updateUserProfile({
        name: fullName.trim() || lineProfile.name || (selectedRole === 'TEACHER' ? 'คุณครู สรรพวิทยาคม' : 'นักเรียน สรรพวิทยาคม'),
        nickname: nickname.trim() || (effectiveRole === 'ADMIN' ? 'แอดมิน' : selectedRole === 'TEACHER' ? 'ครู' : 'ส.ว.'),
        studentId: studentId.trim() || (effectiveRole === 'ADMIN' ? 'ADMIN-01' : selectedRole === 'TEACHER' ? 'T-STAFF' : '45892'),
        gradeRoom: gradeRoom.trim() || (effectiveRole === 'ADMIN' ? 'ผู้ดูแลระบบโรงเรียน' : selectedRole === 'TEACHER' ? 'กลุ่มสาระการเรียนรู้' : 'ม.5/2'),
        phone: phone.trim() || '089-123-4567',
        promptPayNumber: promptPay.trim() || phone.trim() || '0891234567',
        promptPayRefund: promptPay.trim() || '0891234567',
        avatarUrl: lineProfile.avatarUrl,
        lineUserId: lineProfile.userId,
        role: effectiveRole,
        isActive: true,
        isLoggedIn: true,
      });

      // Sync to Supabase
      import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
        if (isSupabaseConfigured && supabase) {
          supabase.from('users').upsert({
            id: lineProfile.userId || `user_${Date.now()}`,
            line_user_id: lineProfile.userId,
            name: fullName.trim() || lineProfile.name || 'ผู้ใช้งาน ส.ว.',
            nickname: nickname.trim(),
            student_id: studentId.trim(),
            grade_room: gradeRoom.trim(),
            phone: phone.trim(),
            promptpay_number: promptPay.trim(),
            promptpay_refund: promptPay.trim(),
            role: effectiveRole,
            avatar_url: lineProfile.avatarUrl,
            is_active: true,
          }).then();
        }
      }).catch(() => {});

      setLoading(false);
      if (effectiveRole === 'ADMIN') {
        showToast('success', 'เข้าสู่ระบบแอดมินสำเร็จ! 🛡️', 'ยินดีต้อนรับผู้ดูแลระบบโรงเรียน');
        router.replace('/admin');
      } else {
        const greeting = selectedRole === 'TEACHER' ? `สวัสดีครับคุณครู ${nickname || fullName}` : `สวัสดีครับน้อง ${nickname || fullName} (${gradeRoom})`;
        showToast('success', 'เข้าสู่ระบบสำเร็จ! 🎉', greeting);
        router.replace('/');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-100">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-7 text-center text-white relative">
          <div className="w-14 h-14 mx-auto rounded-3xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center font-black text-2xl shadow-lg mb-2.5">
            SW
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Sappha PreOrder
          </h1>
          <p className="text-[11px] text-slate-300 mt-0.5">
            เว็บสั่งอาหารล่วงหน้า โรงเรียนสรรพวิทยาคม
          </p>
        </div>

        {/* Loading while LIFF is initializing / redirecting to LINE login */}
        {!liffReady && (
          <div className="p-10 flex flex-col items-center justify-center gap-4 text-center">
            {liffError ? (
              /* Error State — แสดงเมื่อ LIFF ล้มเหลว พร้อมปุ่มลองใหม่ */
              <>
                <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 text-sm">เชื่อมต่อ LINE ไม่สำเร็จ</p>
                  <p className="text-[11px] text-slate-500">{liffError}</p>
                </div>
                <button
                  type="button"
                  onClick={runLiffInit}
                  className="mt-1 px-6 py-2.5 bg-[#06C755] hover:bg-[#05b34b] text-white font-extrabold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.085.922.26 1.057.595.121.302.079.774.039 1.08l-.168 1.014c-.052.308-.242 1.205 1.056.657 1.298-.548 7.009-4.128 9.563-7.067 1.62-1.745 2.434-3.535 2.434-5.866z"/></svg>
                  ลองเชื่อมต่อ LINE ใหม่
                </button>
              </>
            ) : (
              /* Normal Loading State */
              <>
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="#06C755"><path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.494.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/></svg>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">กำลังเชื่อมต่อบัญชี LINE...</p>
                  <p className="text-[11px] text-slate-500 mt-1">ระบบกำลังยืนยันตัวตนผ่าน LINE<br/>กรุณารอสักครู่</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Onboarding Form — แสดงเมื่อ LINE login สำเร็จแล้วเท่านั้น */}
        {liffReady && (
          <form onSubmit={handleCompleteOnboarding} className="p-6 sm:p-8 space-y-4 text-xs">
            <div className="text-center space-y-1 pb-2 border-b border-slate-100">
              <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-emerald-400 mb-1 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lineProfile.avatarUrl} alt="LINE avatar" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-extrabold text-base text-slate-900">
                {selectedRole === 'STUDENT' ? 'ข้อมูลนักเรียน สรรพวิทยาคม' : 'ข้อมูลครูและบุคลากร สรรพวิทยาคม'}
              </h2>
              {lineProfile.userId ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  เชื่อมต่อบัญชี LINE สำเร็จ ({lineProfile.name})
                </span>
              ) : (
                <p className="text-[11px] text-slate-500">
                  กรอกข้อมูลครั้งแรกเพื่อระบุตัวตนบนตั๋วรับอาหาร
                </p>
              )}
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('STUDENT');
                  if (gradeRoom === 'กลุ่มสาระวิทยาศาสตร์' || gradeRoom.includes('กลุ่มสาระ')) setGradeRoom('ม.5/2');
                }}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedRole === 'STUDENT'
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>🎓 นักเรียน</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('TEACHER');
                  if (gradeRoom === 'ม.5/2' || gradeRoom.includes('ม.')) setGradeRoom('กลุ่มสาระวิทยาศาสตร์');
                }}
                className={`py-2 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                  selectedRole === 'TEACHER'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>👨‍🏫 ครู / บุคลากร</span>
              </button>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                ชื่อ - นามสกุล <span className="text-red-500">*</span>:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={selectedRole === 'STUDENT' ? 'เช่น นายสมชาย ใจดี' : 'เช่น ครูวิภาดา สอนดี'}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ชื่อเล่น <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={selectedRole === 'STUDENT' ? 'เช่น ก้อง' : 'เช่น ครูวิ'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {selectedRole === 'STUDENT' ? 'รหัสนักเรียน (5 หลัก):' : 'รหัสประจำตัวครู (ถ้ามี):'}
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder={selectedRole === 'STUDENT' ? 'เช่น 45892' : 'เช่น T-102 หรือเว้นว่าง'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {selectedRole === 'STUDENT' ? 'ระดับชั้น / ห้องเรียน *:' : 'กลุ่มสาระการเรียนรู้ / ฝ่ายงาน *:'}
              </label>
              <input
                type="text"
                required
                value={gradeRoom}
                onChange={(e) => setGradeRoom(e.target.value)}
                placeholder={selectedRole === 'STUDENT' ? 'เช่น ม.5/2, ม.1/3, ม.6/1' : 'เช่น กลุ่มสาระวิทยาศาสตร์, ฝ่ายวิชาการ, ธุรการ'}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="089-123-4567"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                บัญชีพร้อมเพย์ (สำหรับรับเงินคืนกรณีของหมด/สลิปมีปัญหา):
              </label>
              <input
                type="text"
                value={promptPay}
                onChange={(e) => setPromptPay(e.target.value)}
                placeholder="เบอร์โทรหรือเลขบัตรประชาชน"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'กำลังบันทึก...' : 'เสร็จสิ้น เริ่มสั่งอาหารเลย 🍱'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
