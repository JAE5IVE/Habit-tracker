'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import type { Session } from '@/types/auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    const activeSession = getSession();
    setSession(activeSession);

    if (!activeSession) {
      router.replace('/login');
    }
  }, [router]);

  if (session === undefined) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-slate-700">
        <p>Loading...</p>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
