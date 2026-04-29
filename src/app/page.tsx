'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SplashScreen from '@/components/shared/SplashScreen';
import { getSession } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.replace(getSession() ? '/dashboard' : '/login');
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
