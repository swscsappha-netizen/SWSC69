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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#d9d9d9] px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        
        {/* Home / Market */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
            pathname === '/' ? 'text-[#10789f] font-bold' : 'text-[#858585] hover:text-[#333333]'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">ตลาดโรงอาหาร</span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className={`flex flex-col items-center gap-0.5 p-1 relative transition-colors ${
            pathname === '/cart' ? 'text-[#10789f] font-bold' : 'text-[#858585] hover:text-[#333333]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartTotalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#e3193b] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
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
            pathname.startsWith('/orders') ? 'text-[#10789f] font-bold' : 'text-[#858585] hover:text-[#333333]'
          }`}
        >
          <div className="relative">
            <Ticket className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#e3193b] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
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
              pathname.startsWith('/merchant') ? 'text-[#e3193b] font-bold' : 'text-[#858585] hover:text-[#333333]'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">หลังบ้านแม่ค้า</span>
          </Link>
        ) : currentUser.role === 'ADMIN' ? (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
              pathname.startsWith('/admin') ? 'text-[#10789f] font-bold' : 'text-[#858585] hover:text-[#333333]'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">แอดมิน</span>
          </Link>
        ) : (
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${
              pathname === '/profile' ? 'text-[#10789f] font-bold' : 'text-[#858585] hover:text-[#333333]'
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
