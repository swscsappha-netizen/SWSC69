'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Utensils, Ticket, ShoppingBag, Store, ShieldCheck, Settings } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartTotalItems, orders, currentUser } = useApp();

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  ).length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        
        {/* Home / Market */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
            pathname === '/' ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px]">ตลาดโรงอาหาร</span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className={`flex flex-col items-center gap-1 p-1.5 relative transition-colors ${
            pathname === '/cart' ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartTotalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cartTotalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">ตะกร้า</span>
        </Link>

        {/* My Tickets */}
        <Link
          href="/orders"
          className={`flex flex-col items-center gap-1 p-1.5 relative transition-colors ${
            pathname.startsWith('/orders') ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <Ticket className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">ตั๋วรับของ</span>
        </Link>

        {/* Role-specific 4th Tab */}
        {currentUser.role === 'MERCHANT' ? (
          <Link
            href="/merchant"
            className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
              pathname.startsWith('/merchant') ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-emerald-700'
            }`}
          >
            <Store className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] text-emerald-600 font-medium">หลังบ้านแม่ค้า</span>
          </Link>
        ) : currentUser.role === 'ADMIN' ? (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
              pathname.startsWith('/admin') ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-blue-700'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span className="text-[10px] text-blue-600 font-medium">แอดมิน</span>
          </Link>
        ) : (
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-1 p-1.5 transition-colors ${
              pathname === '/profile' ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px]">ตั้งค่า</span>
          </Link>
        )}
      </div>
    </div>
  );
}
