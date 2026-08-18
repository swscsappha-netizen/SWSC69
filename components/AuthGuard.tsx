'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // Instant check: if user is already logged in or on /login, authorize immediately
  const isImmediatelyAuthorized =
    pathname === '/login' ||
    currentUser.isLoggedIn ||
    (typeof window !== 'undefined' &&
      localStorage.getItem('sappha_is_logged_in') === 'true' &&
      !!localStorage.getItem('sappha_auth_user'));

  const [isAuthorized, setIsAuthorized] = useState(isImmediatelyAuthorized);

  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    if (pathname === '/login') {
      setIsAuthorized(true);
      return;
    }

    // Check auth status
    let savedAuth: any = null;
    try {
      const savedLoggedIn = localStorage.getItem('sappha_is_logged_in') === 'true';
      const savedAuthRaw = localStorage.getItem('sappha_auth_user');
      if (savedLoggedIn && savedAuthRaw) {
        savedAuth = JSON.parse(savedAuthRaw);
      }
    } catch (e) {}

    const loggedIn = currentUser.isLoggedIn || !!savedAuth;

    if (loggedIn) {
      setIsAuthorized(true);
    } else {
      // Short 100ms grace period to allow client hydration to settle before redirecting
      const timer = setTimeout(() => {
        let finalSaved: any = null;
        try {
          if (localStorage.getItem('sappha_is_logged_in') === 'true') {
            const raw = localStorage.getItem('sappha_auth_user');
            if (raw) finalSaved = JSON.parse(raw);
          }
        } catch (e) {}

        if (!currentUser.isLoggedIn && !finalSaved) {
          setIsAuthorized(false);
          routerRef.current.replace('/login');
        } else {
          setIsAuthorized(true);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [currentUser.isLoggedIn, pathname]);

  // /login page is always open and accessible
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Show clean loading state only if unverified on protected route
  if (!isAuthorized) {
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
