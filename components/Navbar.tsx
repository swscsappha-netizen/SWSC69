'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ShoppingBag, Ticket, Store, ShieldCheck, Sparkles } from 'lucide-react';

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

  return (
    <header className="sticky top-0 z-40 w-full bg-[#6d28d9] text-white border-b-2 border-[#5b21b6] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18 gap-2">
          
          {/* Logo & School Emblem: Purple & Yellow */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            {/* School Dual Tile: Purple & Yellow */}
            <div className="flex items-center -space-x-1.5 group-hover:scale-105 transition-transform duration-200">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#facc15] flex items-center justify-center text-[#4c1d95] font-black text-xs shadow-md border border-white/30">
                ส
              </div>
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-[#4c1d95] flex items-center justify-center text-[#facc15] font-black text-xs shadow-md border border-white/30">
                ว
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-condensed font-black text-xl md:text-2xl tracking-wider text-white uppercase">
                  SAPPHA PRE-ORDER
                </span>
                <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black bg-[#facc15] text-[#4c1d95] rounded shadow-sm">
                  <Sparkles className="w-2.5 h-2.5 text-[#4c1d95]" />
                  ม่วง-เหลือง
                </span>
              </div>
              <p className="text-[11px] text-[#e9d5ff] font-medium hidden md:block tracking-wide">
                โรงเรียนสรรพวิทยาคม • สั่งวันนี้ รับพรุ่งนี้เช้า
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#5b21b6]/70 p-1 rounded-xl border border-white/10">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'bg-[#facc15] text-[#4c1d95] shadow-sm font-black'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🍱 ตลาดโรงอาหาร</span>
            </Link>

            <Link
              href="/orders"
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 ${
                pathname.startsWith('/orders')
                  ? 'bg-[#facc15] text-[#4c1d95] shadow-sm font-black'
                  : 'text-white/90 hover:text-white hover:bg-white/10'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>ตั๋วรับอาหาร</span>
              {activeOrdersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#facc15] text-[#4c1d95] text-[10px] font-black flex items-center justify-center animate-pulse">
                  {activeOrdersCount}
                </span>
              )}
            </Link>

            {/* Merchant link (Only for Merchant & Admin) */}
            {(currentUser.role === 'MERCHANT' || currentUser.role === 'ADMIN') && (
              <Link
                href="/merchant"
                className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 ${
                  pathname.startsWith('/merchant')
                    ? 'bg-[#facc15] text-[#4c1d95] shadow-md font-black'
                    : 'text-white/90 hover:bg-white/10'
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
                className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold tracking-wide uppercase transition-all flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#4c1d95] text-[#facc15] shadow-md border border-[#facc15]/30'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ผู้ดูแลระบบ</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons & User Badge */}
          <div className="flex items-center gap-2.5">
            {/* Cart Button with School Yellow CTA */}
            <Link
              href="/cart"
              className="relative px-3.5 py-2 rounded-xl bg-[#facc15] hover:bg-[#eab308] text-[#4c1d95] transition-all flex items-center gap-2 shadow-md font-black text-xs md:text-sm uppercase tracking-wider font-condensed"
            >
              <ShoppingBag className="w-4 h-4 text-[#4c1d95]" />
              <span className="hidden sm:inline">ตะกร้า</span>
              {cartTotalItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#4c1d95] text-[#facc15] text-[11px] font-black flex items-center justify-center shadow-inner">
                  {cartTotalItems}
                </span>
              )}
            </Link>

            {/* User Profile Badge */}
            {currentUser.isLoggedIn && (
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-[#facc15] flex items-center justify-center font-black text-xs text-[#4c1d95]">
                  {currentUser.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentUser.avatarUrl} alt={currentUser.nickname} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(currentUser.nickname || currentUser.name || 'SW').slice(0, 1)}</span>
                  )}
                </div>

                <div className="hidden lg:block text-left text-xs leading-tight">
                  <div className="font-bold truncate max-w-[100px]">
                    {currentUser.nickname || currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#e9d5ff]">
                    {roleLabel}
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
