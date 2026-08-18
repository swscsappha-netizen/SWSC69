'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

/**
 * Routes that do not require authentication:
 * - / (Home / Food Market Catalog)
 * - /login (Login & Onboarding)
 * - /shop/* (Shop Details & Menus)
 */
function checkIsPublicRoute(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname === '/login' ||
    pathname.startsWith('/shop')
  );
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = checkIsPublicRoute(pathname);

  // Synchronously check if session exists in localStorage or state
  const isImmediatelyAuthorized =
    isPublic ||
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
    // Public routes are always authorized immediately with zero redirect
    if (checkIsPublicRoute(pathname)) {
      setIsAuthorized(true);
      return;
    }

    // Check auth status for protected routes (/checkout, /orders, /profile, /merchant, /admin)
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

  // If public route, render immediately with 0ms delay and zero blocking
  if (isPublic) {
    return <>{children}</>;
  }

  // Show clean loading indicator only when accessing protected routes while unauthorized
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
