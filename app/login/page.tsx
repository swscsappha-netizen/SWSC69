'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import LoadingAuthScreen from '@/components/LoadingAuthScreen';

export default function LoginPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  useEffect(() => {
    if (currentUser.isLoggedIn) {
      router.replace('/');
    }
  }, [currentUser.isLoggedIn, router]);

  return <LoadingAuthScreen />;
}
