'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check localStorage auth state
    const savedLoggedIn = localStorage.getItem('sappha_is_logged_in') === 'true';
    const isUserLoggedIn = currentUser.isLoggedIn || savedLoggedIn;

    if (!isUserLoggedIn && pathname !== '/login') {
      router.replace('/login');
    } else if (isUserLoggedIn && pathname === '/login') {
      router.replace('/');
    } else {
      setIsChecking(false);
    }
  }, [currentUser.isLoggedIn, pathname, router]);

  // If not logged in and on a protected page, show minimal smooth loader
  if (isChecking && pathname !== '/login') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center font-black text-xl shadow-lg animate-pulse">
          SW
        </div>
        <div className="text-xs font-bold text-slate-500 animate-pulse">
          กำลังตรวจสอบสถานะการเข้าสู่ระบบ...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
