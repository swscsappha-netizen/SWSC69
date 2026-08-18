'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ArrowRight, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { initLiff, loginWithLiff } from '@/lib/liff';

// Known Admin LINE UserIds (Must be defined outside component to avoid reference changes)
const ADMIN_LINE_IDS = ['U203ff66b7e535c901dfbfa86d93eef46'];

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, updateUserProfile, showToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [isLiffConnecting, setIsLiffConnecting] = useState(true);

  // Line Profile (null userId = not logged in LINE yet)
  const [lineProfile, setLineProfile] = useState<{
    userId?: string;
    name: string;
    avatarUrl: string;
  }>({
    name: '',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  });

  // Selected Role for onboarding
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');

  // Onboarding fields (Real User Info)
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [nickname, setNickname] = useState('');
  const [gradeRoom, setGradeRoom] = useState('ม.5/2');
  const [phone, setPhone] = useState('');
  const [promptPay, setPromptPay] = useState('');
  const [isLockedByDatabase, setIsLockedByDatabase] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLiffConnecting(true);

    initLiff().then(async (res) => {
      if (!mounted) return;
      setIsLiffConnecting(false);

      if (res && res.success && res.profile) {
        const isLineAdmin = ADMIN_LINE_IDS.includes(res.profile.userId);
        setLineProfile({
          userId: res.profile.userId,
          name: res.profile.displayName,
          avatarUrl: res.profile.pictureUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        });

        if (isLineAdmin) {
          setSelectedRole('ADMIN');
          setGradeRoom('ผู้ดูแลระบบโรงเรียน');
          setStudentId('ADMIN-01');
        }

        // Check if this user already registered in Supabase
        const { supabase, isSupabaseConfigured } = await import('@/lib/supabase');
        if (isSupabaseConfigured && supabase && res.profile.userId) {
          try {
            const { data: existingUser } = await supabase
              .from('users')
              .select('*')
              .or(`line_user_id.eq.${res.profile.userId},id.eq.${res.profile.userId}`)
              .maybeSingle();

            if (existingUser && existingUser.nickname && mounted) {
              const effectiveRole = isLineAdmin ? 'ADMIN' : (existingUser.role || 'STUDENT');
              updateUserProfile({
                id: existingUser.id,
                name: existingUser.name || res.profile.displayName,
                nickname: existingUser.nickname,
                studentId: existingUser.student_id || '',
                gradeRoom: existingUser.grade_room || '',
                phone: existingUser.phone || '',
                promptPayNumber: existingUser.promptpay_number || '',
                promptPayRefund: existingUser.promptpay_refund || existingUser.promptpay_number || '',
                role: effectiveRole,
                shopId: existingUser.shop_id,
                avatarUrl: res.profile.pictureUrl || existingUser.avatar_url,
                lineUserId: res.profile.userId,
                isActive: existingUser.is_active !== false,
                isLoggedIn: true,
              });

              showToast(
                'success',
                `ยินดีต้อนรับกลับ ${existingUser.nickname || existingUser.name}! 👋`,
                `เข้าสู่ระบบในฐานะ ${effectiveRole}`
              );

              if (effectiveRole === 'ADMIN') {
                router.replace('/admin');
              } else if (effectiveRole === 'MERCHANT') {
                router.replace('/merchant');
              } else {
                router.replace('/');
              }
            }
          } catch (dbErr) {
            console.warn('Check existing user err:', dbErr);
          }
        }
      }
    }).catch(() => {
      if (mounted) setIsLiffConnecting(false);
    });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLineLoginClick = () => {
    loginWithLiff();
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const isLineAdmin = lineProfile.userId && ADMIN_LINE_IDS.includes(lineProfile.userId);
    const effectiveRole = isLineAdmin ? 'ADMIN' : selectedRole;
    const finalUserId = lineProfile.userId || `user_${Date.now()}`;

    setTimeout(() => {
      updateUserProfile({
        id: finalUserId,
        name: fullName.trim() || lineProfile.name || (selectedRole === 'TEACHER' ? 'คุณครู สรรพวิทยาคม' : 'นักเรียน สรรพวิทยาคม'),
        nickname: nickname.trim() || (effectiveRole === 'ADMIN' ? 'แอดมิน' : selectedRole === 'TEACHER' ? 'ครู' : 'ส.ว.'),
        studentId: studentId.trim() || (effectiveRole === 'ADMIN' ? 'ADMIN-01' : selectedRole === 'TEACHER' ? 'T-STAFF' : '45892'),
        gradeRoom: gradeRoom.trim() || (effectiveRole === 'ADMIN' ? 'ผู้ดูแลระบบโรงเรียน' : selectedRole === 'TEACHER' ? 'กลุ่มสาระการเรียนรู้' : 'ม.5/2'),
        phone: phone.trim() || '089-123-4567',
        promptPayNumber: promptPay.trim() || phone.trim() || '0891234567',
        promptPayRefund: promptPay.trim() || '0891234567',
        avatarUrl: lineProfile.avatarUrl,
        lineUserId: lineProfile.userId || finalUserId,
        role: effectiveRole,
        isActive: true,
        isLoggedIn: true,
      });

      // Sync to Supabase
      import('@/lib/supabase').then(({ supabase, isSupabaseConfigured }) => {
        if (isSupabaseConfigured && supabase) {
          supabase.from('users').upsert({
            id: finalUserId,
            line_user_id: lineProfile.userId || finalUserId,
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
    }, 200);
  };

  const isLineAuthenticated = Boolean(lineProfile.userId);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-slate-100">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-7 text-center text-white relative">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center font-black text-2xl shadow-xl mb-3">
            SW
          </div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            <span>Sappha PreOrder</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            เว็บสั่งอาหารล่วงหน้า โรงเรียนสรรพวิทยาคม
          </p>
        </div>

        {/* STEP 1: Still waiting for LINE Login (Not logged in yet) */}
        {!isLineAuthenticated ? (
          <div className="p-7 sm:p-9 space-y-6 text-center">
            
            <div className="space-y-2">
              <h2 className="text-lg font-black text-slate-900">
                เข้าสู่ระบบด้วย LINE
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed px-2">
                กรุณาเข้าสู่ระบบด้วยบัญชี LINE เพื่อรับใบเสร็จ ตั๋วรับอาหาร และการแจ้งเตือนสถานะเมื่ออาหารพร้อมรับ
              </p>
            </div>

            {/* Official LINE Login Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleLineLoginClick}
                className="w-full py-4 px-6 bg-[#06C755] hover:bg-[#05b34b] active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-6 h-6 fill-white flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.085.922.26 1.057.595.121.302.079.774.039 1.08l-.168 1.014c-.052.308-.242 1.205 1.056.657 1.298-.548 7.009-4.128 9.563-7.067 1.62-1.745 2.434-3.535 2.434-5.866z"/>
                </svg>
                <span>เข้าสู่ระบบด้วย LINE (LINE Login)</span>
              </button>

              {isLiffConnecting && (
                <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-medium py-1 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>กำลังตรวจสอบการเชื่อมต่อ LINE...</span>
                </div>
              )}
            </div>

            {/* Features Info Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-600">
              <div className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ประโยชน์ของการเชื่อมต่อบัญชี LINE:</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-500 pl-5 list-disc">
                <li>รับสลิปตั๋วรับอาหาร (QR Code) เข้าแชท LINE ทันที</li>
                <li>แม่ค้ากดยืนยันหรืออาหารพร้อมรับ มีข้อความเด้งเตือน</li>
                <li>ไม่ต้องจำรหัสผ่าน ล็อกอินครั้งเดียวใช้งานได้ตลอด</li>
              </ul>
            </div>
          </div>
        ) : (
          /* STEP 2: LINE Login Succeeded -> Show Onboarding Form to register */
          <form onSubmit={handleCompleteOnboarding} className="p-6 sm:p-8 space-y-4 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Verified LINE Profile Header Banner */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200/90 rounded-2xl text-emerald-900 font-bold text-xs shadow-sm">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-400 flex-shrink-0 shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={lineProfile.avatarUrl} alt="LINE Profile" className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <p className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wider">บัญชี LINE ที่เชื่อมต่อ</p>
                  <p className="text-xs font-black truncate text-slate-900">{lineProfile.name}</p>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-black px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                เชื่อมต่อแล้ว
              </span>
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

            {/* Student ID Lookup Field (Top Priority for Students) */}
            {selectedRole === 'STUDENT' ? (
              <div className="space-y-1.5 p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-2xl">
                <label className="font-extrabold text-slate-800 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-brand-700">
                    <span>🆔 เลขประจำตัวนักเรียน (5 หลัก)</span>
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
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setStudentId(val);
                    if (val.length >= 4) {
                      import('@/lib/studentsLookup').then(({ findStudentById }) => {
                        const res = findStudentById(val);
                        if (res.found && res.student) {
                          setFullName(res.student.fullName);
                          setGradeRoom(res.student.gradeRoom);
                          setIsLockedByDatabase(true);
                          showToast(
                            'success',
                            'พบข้อมูลนักเรียน! 🎓',
                            `${res.student.fullName} (${res.student.gradeRoom}) เลขที่ ${res.student.studentNumber}`
                          );
                        } else {
                          setIsLockedByDatabase(false);
                        }
                      });
                    } else {
                      setIsLockedByDatabase(false);
                    }
                  }}
                  placeholder="เช่น 34890 หรือ 31774"
                  className="w-full p-3 bg-white border border-orange-300 rounded-xl font-mono font-black text-base text-brand-700 focus:ring-2 focus:ring-brand-500 shadow-sm"
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
            ) : (
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  รหัสประจำตัวครู / บุคลากร (ถ้ามี):
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น T-102 หรือเว้นว่างได้"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Name & Grade Room Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>ชื่อ - นามสกุลจริง <span className="text-red-500">*</span>:</span>
                  {selectedRole === 'STUDENT' && isLockedByDatabase && (
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5">
                      🔒 ล็อค
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  readOnly={selectedRole === 'STUDENT' && isLockedByDatabase}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={selectedRole === 'STUDENT' ? 'เช่น นายสมชาย ใจดี' : 'เช่น ครูวิภาดา สอนดี'}
                  className={`w-full p-2.5 border rounded-xl font-bold transition-all ${
                    selectedRole === 'STUDENT' && isLockedByDatabase
                      ? 'bg-slate-100/90 text-slate-700 cursor-not-allowed border-slate-300'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500'
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>{selectedRole === 'STUDENT' ? 'ระดับชั้น / ห้องเรียน *:' : 'กลุ่มสาระ / ฝ่ายงาน *:'}</span>
                  {selectedRole === 'STUDENT' && isLockedByDatabase && (
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-0.5">
                      🔒 ล็อค
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  required
                  readOnly={selectedRole === 'STUDENT' && isLockedByDatabase}
                  value={gradeRoom}
                  onChange={(e) => setGradeRoom(e.target.value)}
                  placeholder={selectedRole === 'STUDENT' ? 'เช่น ม.5/2, ม.1/1' : 'เช่น กลุ่มสาระวิทยาศาสตร์'}
                  className={`w-full p-2.5 border rounded-xl font-bold transition-all ${
                    selectedRole === 'STUDENT' && isLockedByDatabase
                      ? 'bg-slate-100/90 text-slate-700 cursor-not-allowed border-slate-300'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500'
                  }`}
                />
              </div>
            </div>

            {/* Nickname & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ชื่อเล่น (สำหรับเรียกรับอาหาร) <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={selectedRole === 'STUDENT' ? 'เช่น ก้อง' : 'เช่น ครูวิ'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>:
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="089-123-4567"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                บัญชีพร้อมเพย์ (สำหรับรับเงินคืนกรณีของหมด/สลิปมีปัญหา):
              </label>
              <input
                type="text"
                value={promptPay}
                onChange={(e) => setPromptPay(e.target.value)}
                placeholder="เบอร์โทรศัพท์ หรือเว้นว่างเพื่อใช้เบอร์ด้านบน"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !fullName || !studentId || !nickname || !phone}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mt-2"
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
