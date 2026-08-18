'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import LoginPage from '@/app/login/page';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();
  const pathname = usePathname();

  // /login route explicitly requested
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // If user is not authenticated, render LoginPage in-place with zero URL redirects
  if (!currentUser.isLoggedIn) {
    return <LoginPage />;
  }

  // Authenticated user gets full access to app with Navbar and BottomNav
  return <>{children}</>;
}
