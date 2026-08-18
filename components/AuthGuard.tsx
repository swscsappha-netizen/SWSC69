'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import LoadingAuthScreen from '@/components/LoadingAuthScreen';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { currentUser } = useApp();

  // If user is not authenticated yet (handshake in progress), show premium Loading Screen
  if (!currentUser.isLoggedIn) {
    return <LoadingAuthScreen />;
  }

  // Once authenticated, render full application with Navbar, Market, and BottomNav
  return <>{children}</>;
}
