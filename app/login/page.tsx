'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  User,
  ShieldCheck,
  Store,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Phone,
  CreditCard,
  Building,
  School,
  Lock,
} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, switchRole, updateUserProfile, showToast } = useApp();

  const [step, setStep] = useState<'LOGIN' | 'ONBOARDING'>('LOGIN');
  const [loading, setLoading] = useState(false);

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

  React.useEffect(() => {
    import('@/lib/liff').then(({ initLiff, loginWithLiff }) => {
      initLiff().then((res) => {
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

          setStep('ONBOARDING');
        } else {
          // Zero-Click Auto LINE Login
          loginWithLiff();
        }
      });
    }).catch(() => {});
  }, []);

  const handleLineLogin = async () => {
    setLoading(true);
    const { initLiff, loginWithLiff } = await import('@/lib/liff');
    const res = await initLiff();
    if (res.success && res.profile) {
      setStep('ONBOARDING');
      setLoading(false);
    } else {
      loginWithLiff();
    }
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isLineAdmin = lineProfile.userId && ADMIN_LINE_IDS.includes(lineProfile.userId);
    const effectiveRole = isLineAdmin ? 'ADMIN' : selectedRole;

    setTimeout(() => {
      switchRole(effectiveRole);
      updateUserProfile({
        name: fullName.trim() || lineProfile.name,
        nickname: nickname.trim() || (effectiveRole === 'ADMIN' ? 'แอดมิน' : selectedRole === 'TEACHER' ? 'ครู' : 'ก้อง'),
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
            name: fullName.trim() || lineProfile.name,
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
        const greeting = selectedRole === 'TEACHER' ? `สวัสดีครับคุณครู ${nickname}` : `สวัสดีครับน้อง ${nickname} (${gradeRoom})`;
        showToast('success', 'ลงทะเบียนเข้าสู่ระบบสำเร็จ! 🎉', greeting);
        router.replace('/');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-100">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 text-center text-white relative">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center font-black text-2xl shadow-lg mb-3 animate-pulse">
            SW
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Sappha PreOrder
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            เว็บสั่งอาหารล่วงหน้า โรงเรียนสรรพวิทยาคม
          </p>
        </div>

        {/* Step 1: Initial Auto-Login Screen */}
        {step === 'LOGIN' && (
          <div className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
            <div className="space-y-1">
              <h2 className="font-extrabold text-base text-slate-900">
                กำลังเชื่อมต่อบัญชี LINE...
              </h2>
              <p className="text-xs text-slate-500">
                ระบบกำลังเข้าสู่ระบบให้อัตโนมัติ กรุณารอสักครู่
              </p>
            </div>

            {/* Fallback button if auto-redirect is blocked */}
            <button
              onClick={handleLineLogin}
              className="py-2.5 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold rounded-xl transition inline-flex items-center gap-2 shadow-sm"
            >
              <span>หากไม่เปลี่ยนหน้า กดเข้าสู่ระบบที่นี่</span>
            </button>
          </div>
        )}

        {/* Step 2: First Time Onboarding Form */}
        {step === 'ONBOARDING' && (
          <form onSubmit={handleCompleteOnboarding} className="p-6 sm:p-8 space-y-4 text-xs">
            <div className="text-center space-y-1 pb-2 border-b border-slate-100">
              <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-emerald-400 mb-1 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lineProfile.avatarUrl} alt="LINE avatar" className="w-full h-full object-cover" />
              </div>
              <h2 className="font-extrabold text-base text-slate-900">
                {selectedRole === 'STUDENT' ? 'ข้อมูลนักเรียน สรรพวิทยาคม' : 'ข้อมูลครูและบุคลากร สรรพวิทยาคม'}
              </h2>
              <p className="text-[11px] text-slate-500">
                กรอกข้อมูลครั้งแรกเพื่อระบุตัวตนบนตั๋วรับอาหาร
              </p>
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
