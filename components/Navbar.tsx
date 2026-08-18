'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Ticket, UtensilsCrossed, Store, ShieldCheck, User, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { currentUser, cartTotalItems, orders } = useApp();

  if (pathname === '/login') return null;

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  ).length;

  const roleLabel =
    currentUser.role === 'ADMIN'
      ? 'ผู้ดูแลระบบ 🛡️'
      : currentUser.role === 'MERCHANT'
      ? 'แม่ค้า 🏪'
      : currentUser.role === 'TEACHER'
      ? 'ครู 👨‍🏫'
      : 'นักเรียน 🎓';

  const roleBadgeColor =
    currentUser.role === 'ADMIN'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : currentUser.role === 'MERCHANT'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-brand-50 text-brand-700 border-brand-200';

  return (
    <header className="sticky top-0 z-40 w-full glass-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-2">
          
          {/* Logo & School Badge */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-glow group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <UtensilsCrossed className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg md:text-2xl bg-gradient-to-r from-brand-600 via-orange-500 to-amber-600 bg-clip-text text-transparent tracking-tight">
                  Sappha PreOrder
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold bg-brand-50 text-brand-700 rounded-full border border-brand-200/80">
                  <Sparkles className="w-2.5 h-2.5 text-brand-500" />
                  ส.ว.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                โรงเรียนสรรพวิทยาคม • สั่งวันนี้ รับพรุ่งนี้เช้า
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <span>🍱 ตลาดโรงอาหาร</span>
            </Link>

            <Link
              href="/orders"
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${
                pathname.startsWith('/orders')
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Ticket className="w-4 h-4 text-brand-500" />
              <span>ตั๋วรับอาหาร</span>
              {activeOrdersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {activeOrdersCount}
                </span>
              )}
            </Link>

            {/* Merchant link (Only for Merchant & Admin) */}
            {(currentUser.role === 'MERCHANT' || currentUser.role === 'ADMIN') && (
              <Link
                href="/merchant"
                className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith('/merchant')
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>หลังบ้านแม่ค้า</span>
              </Link>
            )}

            {/* Admin link (Only for Admin) */}
            {currentUser.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ผู้ดูแลระบบ</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons & User Badge */}
          <div className="flex items-center gap-2.5">
            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2.5 md:px-4 md:py-2.5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-brand-200/80 text-brand-700 hover:from-orange-100 hover:to-amber-100 transition-all flex items-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-5 h-5 text-brand-600" />
              <span className="hidden sm:inline font-bold text-xs md:text-sm">ตะกร้า</span>
              {cartTotalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 md:static md:w-5 md:h-5 w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] md:text-xs font-black flex items-center justify-center shadow-md animate-bounce">
                  {cartTotalItems}
                </span>
              )}
            </Link>

            {/* If NOT logged in: Show Login Button */}
            {!currentUser.isLoggedIn ? (
              <Link
                href="/login"
                className="px-3.5 py-2 rounded-2xl bg-[#06C755] hover:bg-[#05b34b] text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.019 9.587.39.085.922.26 1.057.595.121.302.079.774.039 1.08l-.168 1.014c-.052.308-.242 1.205 1.056.657 1.298-.548 7.009-4.128 9.563-7.067 1.62-1.745 2.434-3.535 2.434-5.866z"/>
                </svg>
                <span>เข้าสู่ระบบ</span>
              </Link>
            ) : (
              /* If Logged In: Sleek User Profile Badge */
              <Link
                href="/profile"
                className="flex items-center gap-2 pl-2 border-l border-slate-200 group hover:opacity-90 transition-all"
              >
                <div className="relative">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm overflow-hidden group-hover:ring-2 group-hover:ring-brand-400 group-hover:scale-105 transition-all">
                    {currentUser.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="hidden lg:block text-left">
                  <div className="text-xs font-black text-slate-800 leading-tight flex items-center gap-1.5">
                    <span>{currentUser.nickname || currentUser.name || 'ผู้ใช้งาน'}</span>
                    <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold border ${roleBadgeColor}`}>
                      {roleLabel}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium truncate max-w-[130px]">
                    {currentUser.gradeRoom || currentUser.studentId || currentUser.name}
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
