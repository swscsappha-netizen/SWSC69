'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // /login is always allowed without blocking
  const isLoginPage = pathname === '/login';

  // Synchronously check if session exists in localStorage or state
  const isUserAuthenticated =
    currentUser.isLoggedIn ||
    (typeof window !== 'undefined' &&
      localStorage.getItem('sappha_is_logged_in') === 'true' &&
      !!localStorage.getItem('sappha_auth_user'));

  const [isAuthorized, setIsAuthorized] = useState(isLoginPage || isUserAuthenticated);

  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    // /login is always accessible
    if (pathname === '/login') {
      setIsAuthorized(true);
      return;
    }

    // Check auth status for all other pages
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
      setIsAuthorized(false);
      routerRef.current.replace('/login');
    }
  }, [currentUser.isLoggedIn, pathname]);

  // /login page is always open and accessible
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show clean loading state while unauthenticated on protected route
  if (!isAuthorized) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-amber-400 text-white flex items-center justify-center font-black text-xl shadow-lg animate-pulse">
          SW
        </div>
        <div className="text-xs font-bold text-slate-500 animate-pulse">
          กำลังเข้าสู่ระบบ...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
