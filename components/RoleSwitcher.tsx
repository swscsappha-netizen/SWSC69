'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { GraduationCap, Store, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function RoleSwitcher() {
  const { currentUser, switchRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40">
      <div className="relative">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-900/90 text-white rounded-full shadow-2xl backdrop-blur-md border border-slate-700/60 hover:bg-slate-800 transition-all hover:scale-105 group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <div className="flex items-center gap-1.5 text-xs font-medium">
            <span className="text-slate-400">บทบาท:</span>
            <span className="font-semibold text-brand-400 flex items-center gap-1">
              {currentUser.role === 'STUDENT' && <GraduationCap className="w-3.5 h-3.5" />}
              {currentUser.role === 'MERCHANT' && <Store className="w-3.5 h-3.5" />}
              {currentUser.role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5" />}
              {currentUser.role === 'STUDENT' ? 'นักเรียน' : currentUser.role === 'MERCHANT' ? 'แม่ค้า (ป้าณี)' : 'แอดมินโรงเรียน'}
            </span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute bottom-12 right-0 w-80 bg-white/95 backdrop-blur-xl rounded-3xl p-3 shadow-2xl border border-slate-200/80 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="p-2 border-b border-slate-100 mb-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                สลับบทบาทเพื่อทดสอบระบบ
              </div>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <span>กำลังจำลองเป็น:</span>
                <span className="text-brand-600">{currentUser.name} ({currentUser.nickname})</span>
              </div>
            </div>

            <div className="space-y-1.5">
              {/* Option 1: Student */}
              <button
                onClick={() => {
                  switchRole('STUDENT');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                  currentUser.role === 'STUDENT'
                    ? 'bg-brand-50 border border-brand-200 text-brand-900 shadow-sm'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-brand-600 flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">นักเรียน / ครู (ผู้ซื้อ)</div>
                    <div className="text-xs text-slate-500">นายสมชาย (ม.5/2) • สั่งอาหาร & รับตั๋ว</div>
                  </div>
                </div>
                {currentUser.role === 'STUDENT' && <span className="text-xs font-bold text-brand-600">กำลังใช้</span>}
              </button>

              {/* Option 2: Merchant */}
              <button
                onClick={() => {
                  switchRole('MERCHANT');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                  currentUser.role === 'MERCHANT'
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">แม่ค้า (ป้าณีข้าวมันไก่)</div>
                    <div className="text-xs text-slate-500">ล็อก 3 • ตรวจสลิป & Prep Sheet</div>
                  </div>
                </div>
                {currentUser.role === 'MERCHANT' && <span className="text-xs font-bold text-emerald-600">กำลังใช้</span>}
              </button>

              {/* Option 3: Admin */}
              <button
                onClick={() => {
                  switchRole('ADMIN');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-blue-50 border border-blue-200 text-blue-900 shadow-sm'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">ผู้ดูแลระบบโรงเรียน (Admin)</div>
                    <div className="text-xs text-slate-500">จัดการล็อก, ค่าบริการ 20 บ., ปฏิทินวันหยุด</div>
                  </div>
                </div>
                {currentUser.role === 'ADMIN' && <span className="text-xs font-bold text-blue-600">กำลังใช้</span>}
              </button>
            </div>

            {/* Direct Jump Links */}
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between px-2 text-xs">
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="text-brand-600 hover:underline font-bold flex items-center gap-1"
              >
                <span>หน้าเข้าสู่ระบบ (LINE) 💬</span>
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/merchant"
                  onClick={() => {
                    switchRole('MERCHANT');
                    setIsOpen(false);
                  }}
                  className="text-emerald-600 hover:underline font-medium"
                >
                  หน้าแม่ค้า →
                </Link>
                <Link
                  href="/admin"
                  onClick={() => {
                    switchRole('ADMIN');
                    setIsOpen(false);
                  }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  หน้าแอดมิน →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
