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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#451400] px-4 py-2 shadow-md">
      <div className="flex items-center justify-around">
        
        {/* Home / Market */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-0.5 p-1 rounded-xs transition-colors ${
            pathname === '/' ? 'text-[#451400] font-black' : 'text-[#786259] hover:text-[#451400]'
          }`}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">เมนูอาหาร</span>
        </Link>

        {/* Cart */}
        <Link
          href="/cart"
          className={`flex flex-col items-center gap-0.5 p-1 relative rounded-xs transition-colors ${
            pathname === '/cart' ? 'text-[#451400] font-black' : 'text-[#786259] hover:text-[#451400]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartTotalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-xs bg-[#b68207] text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {cartTotalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">ตะกร้า</span>
        </Link>

        {/* My Tickets */}
        <Link
          href="/orders"
          className={`flex flex-col items-center gap-0.5 p-1 relative rounded-xs transition-colors ${
            pathname.startsWith('/orders') ? 'text-[#451400] font-black' : 'text-[#786259] hover:text-[#451400]'
          }`}
        >
          <div className="relative">
            <Ticket className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-xs bg-[#ad2118] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider">ตั๋วรับของ</span>
        </Link>

        {/* Role-specific 4th Tab */}
        {currentUser.role === 'MERCHANT' ? (
          <Link
            href="/merchant"
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xs transition-colors ${
              pathname.startsWith('/merchant') ? 'text-[#451400] font-black' : 'text-[#786259] hover:text-[#451400]'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">หลังบ้าน</span>
          </Link>
        ) : currentUser.role === 'ADMIN' ? (
          <Link
            href="/admin"
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xs transition-colors ${
              pathname.startsWith('/admin') ? 'text-[#b68207] font-black' : 'text-[#786259] hover:text-[#451400]'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">แอดมิน</span>
          </Link>
        ) : (
          <Link
            href="/profile"
            className={`flex flex-col items-center gap-0.5 p-1 rounded-xs transition-colors ${
              pathname === '/profile' ? 'text-[#451400] font-black' : 'text-[#786259] hover:text-[#451400]'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">โปรไฟล์</span>
          </Link>
        )}
      </div>
    </div>
  );
}
