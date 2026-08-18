'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { initLiff, loginWithLiff } from '@/lib/liff';

export default function LoadingAuthScreen() {
  const [statusText, setStatusText] = useState('กำลังเชื่อมต่อระบบ LINE...');

  useEffect(() => {
    let mounted = true;

    // Timeout safety messages
    const t1 = setTimeout(() => {
      if (mounted) setStatusText('กำลังตรวจสอบบัญชีและสิทธิ์การใช้งาน...');
    }, 1200);

    const t2 = setTimeout(() => {
      if (mounted) setStatusText('กำลังเข้าสู่ระบบตลาดอาหาร สรรพวิทยาคม...');
    }, 2400);

    return () => {
      mounted = false;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 px-4 text-white">
      
      {/* Animated Brand Glow */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-brand-500 to-amber-400 opacity-30 blur-2xl animate-pulse"></div>
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-brand-500 via-orange-500 to-amber-400 text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-2xl shadow-brand-500/40 border border-white/20 animate-bounce duration-1000">
          SW
        </div>
      </div>

      {/* App Title */}
      <div className="text-center space-y-1.5 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <span>Sappha PreOrder</span>
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin duration-3000" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          ระบบสั่งอาหารล่วงหน้า โรงเรียนสรรพวิทยาคม
        </p>
      </div>

      {/* Loading Progress Card */}
      <div className="w-full max-w-xs bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3.5 text-center">
        
        {/* Animated Emerald Progress Bar */}
        <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-white/10">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full animate-progress"></div>
        </div>

        {/* Dynamic Status Text */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-200">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span>{statusText}</span>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>เชื่อมต่อผ่าน LINE LIFF อย่างปลอดภัย</span>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="mt-8 text-[11px] text-slate-400 text-center">
        สั่งวันนี้ รับพรุ่งนี้เช้า 06:45 - 07:45 น. 🍱
      </div>
    </div>
  );
}
