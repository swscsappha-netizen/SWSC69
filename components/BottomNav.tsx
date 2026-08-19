'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Utensils, Ticket, ShoppingBag, Store, ShieldCheck, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartTotalItems, orders, currentUser } = useApp();

  if (pathname === '/login') return null;

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  ).length;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#e9d5ff] px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        
        {/* Home / Market */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
            pathname === '/' ? 'text-[#6d28d9] font-bold' : 'text-[#6b7280] hover:text-[#1e1b4b]'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">ตลาดโรงอาหาร</span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className={`flex flex-col items-center gap-0.5 p-1 relative transition-colors ${
            pathname === '/cart' ? 'text-[#6d28d9] font-bold' : 'text-[#6b7280] hover:text-[#1e1b4b]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartTotalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#facc15] text-[#4c1d95] text-[10px] font-black flex items-center justify-center shadow-sm">
                {cartTotalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">ตะกร้า</span>
        </Link>

        {/* My Tickets */}
        <Link
          href="/orders"
          className={`flex flex-col items-center gap-0.5 p-1 relative transition-colors ${
            pathname.startsWith('/orders') ? 'text-[#6d28d9] font-bold' : 'text-[#6b7280] hover:text-[#1e1b4b]'
          }`}
        >
          <div className="relative">
            <Ticket className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#facc15] text-[#4c1d95] text-[10px] font-black flex items-center justify-center animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">ตั๋วรับของ</span>
        </Link>

        {/* Role-specific 4th Tab */}
        {currentUser.role === 'MERCHANT' ? (
          <Link
            href="/merchant"
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
              pathname.startsWith('/merchant') ? 'text-[#6d28d9] font-bold' : 'text-[#6b7280] hover:text-[#1e1b4b]'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">หลังบ้านแม่ค้า</span>
          </Link>
        ) : currentUser.role === 'ADMIN' ? (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
              pathname.startsWith('/admin') ? 'text-[#6d28d9] font-bold' : 'text-[#6b7280] hover:text-[#1e1b4b]'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">แอดมิน</span>
          </Link>
        ) : (
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
              pathname === '/profile' ? 'text-[#6d28d9] font-bold' : 'text-[#6b7280] hover:text-[#1e1b4b]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">โปรไฟล์</span>
          </Link>
        )}
      </div>
    </div>
  );
}
