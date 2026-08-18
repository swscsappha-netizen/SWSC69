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
    // Always allow /login to render — LIFF handles the auth there
    if (pathname === '/login') {
      setIsChecking(false);
      return;
    }

    // Check localStorage auth state (persistent session)
    let savedAuth: any = null;
    try {
      const savedLoggedIn = localStorage.getItem('sappha_is_logged_in') === 'true';
      const savedAuthRaw = localStorage.getItem('sappha_auth_user');
      if (savedLoggedIn && savedAuthRaw) {
        savedAuth = JSON.parse(savedAuthRaw);
      }
    } catch (e) {}

    const isUserLoggedIn = currentUser.isLoggedIn || !!savedAuth;

    if (!isUserLoggedIn) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [currentUser.isLoggedIn, pathname, router]);

  // Allow /login page to always render without blocking
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show loader while checking auth on protected pages
  if (isChecking) {
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
