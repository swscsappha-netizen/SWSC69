'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import LoadingAuthScreen from '@/components/LoadingAuthScreen';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser, isAuthReady } = useApp();

  // If user is not authenticated yet or auth sync is in progress (min 1.5s), show Loading Screen
  if (!currentUser.isLoggedIn || !isAuthReady) {
    return <LoadingAuthScreen />;
  }

  // Once authenticated and fully synced, render full application with Navbar and Market
  return <>{children}</>;
}
