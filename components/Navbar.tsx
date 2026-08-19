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
    <header className="sticky top-0 z-40 w-full bg-white text-[#451400] border-b border-[#451400] shadow-xs">
      {/* Top Mustard Gold Mini Announcement Strip (Chipotle Signature) */}
      <div className="bg-[#b68207] text-white text-[11px] font-bold py-1 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3 h-3" />
        <span>สั่งอาหารเช้าล่วงหน้า โรงเรียนสรรพวิทยาคม • รับอาหาร 06:45 - 07:45 น.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18 gap-2">
          
          {/* Logo & Emblem in Chipotle Foil-Stamped Style */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            {/* Chipotle-style circular medallion */}
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#451400] border border-[#000000] flex items-center justify-center text-[#ffffff] font-black text-xs shadow-xs group-hover:scale-105 transition-transform duration-150">
              <span className="font-display text-sm tracking-tighter">ส.ว.</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-xl md:text-2xl tracking-wide text-[#451400] uppercase">
                  SAPPHA PRE-ORDER
                </span>
                <span className="hidden xl:inline-flex items-center px-2 py-0.5 text-[10px] font-black bg-[#f2f2f2] text-[#451400] rounded-xs border border-[#451400]">
                  CHIPOTLE STYLE
                </span>
              </div>
              <p className="text-[11px] text-[#786259] font-semibold hidden md:block tracking-wide">
                โรงเรียนสรรพวิทยาคม • FAST-CASUAL PRE-ORDER
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xs text-xs md:text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                pathname === '/'
                  ? 'bg-[#451400] text-white shadow-xs'
                  : 'text-[#451400] hover:bg-[#f2f2f2]'
              }`}
            >
              <span>🍱 เมนูอาหาร</span>
            </Link>

            <Link
              href="/orders"
              className={`px-4 py-2 rounded-xs text-xs md:text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                pathname.startsWith('/orders')
                  ? 'bg-[#451400] text-white shadow-xs'
                  : 'text-[#451400] hover:bg-[#f2f2f2]'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>ตั๋วรับอาหาร</span>
              {activeOrdersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#ad2118] text-white text-[10px] font-black flex items-center justify-center">
                  {activeOrdersCount}
                </span>
              )}
            </Link>

            {/* Merchant link */}
            {(currentUser.role === 'MERCHANT' || currentUser.role === 'ADMIN') && (
              <Link
                href="/merchant"
                className={`px-3.5 py-2 rounded-xs text-xs md:text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                  pathname.startsWith('/merchant')
                    ? 'bg-[#451400] text-white shadow-xs'
                    : 'text-[#451400] hover:bg-[#f2f2f2]'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>หลังบ้านแม่ค้า</span>
              </Link>
            )}

            {/* Admin link */}
            {currentUser.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={`px-3.5 py-2 rounded-xs text-xs md:text-sm font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${
                  pathname.startsWith('/admin')
                    ? 'bg-[#b68207] text-white shadow-xs'
                    : 'text-[#451400] hover:bg-[#f2f2f2]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ผู้ดูแลระบบ</span>
              </Link>
            )}
          </nav>

          {/* Right Action Icons & User Badge */}
          <div className="flex items-center gap-2.5">
            {/* Cart Button: Burnt Umber CTA, 4px radius */}
            <Link
              href="/cart"
              className="relative px-4 py-2 rounded-xs bg-[#451400] hover:bg-[#6b321b] text-white transition-all flex items-center gap-2 border border-[#000000] font-extrabold text-xs md:text-sm uppercase tracking-wider shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">ตะกร้า</span>
              {cartTotalItems > 0 && (
                <span className="w-5 h-5 rounded-xs bg-[#b68207] text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                  {cartTotalItems}
                </span>
              )}
            </Link>

            {/* User Profile Badge */}
            {currentUser.isLoggedIn && (
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xs bg-[#f2f2f2] hover:bg-[#eddcd4] border border-[#d4cbc7] transition-all text-[#451400]"
              >
                <div className="w-7 h-7 rounded-xs overflow-hidden bg-[#451400] flex items-center justify-center font-black text-xs text-white">
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
                  <div className="text-[10px] text-[#786259]">
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
