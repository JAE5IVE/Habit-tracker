'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';

export default function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = login(email, password);

    if (result.error) {
      setError(result.error);
      return;
    }

    setError(null);
    onSuccess?.();
    router.push('/dashboard');
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
      <h1 className="text-3xl font-bold text-slate-950">Log in</h1>
      <p className="mt-2 text-slate-600">Return to your daily habit list.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-slate-800">
            Email
          </label>
          <input
            id="login-email"
            data-testid="auth-login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-slate-950 shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-slate-800">
            Password
          </label>
          <input
            id="login-password"
            data-testid="auth-login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-slate-950 shadow-sm"
          />
        </div>
        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        <button
          data-testid="auth-login-submit"
          type="submit"
          className="w-full rounded-md bg-emerald-700 px-4 py-3 font-semibold text-white shadow-sm hover:bg-emerald-800"
        >
          Log in
        </button>
      </form>
      <Link href="/signup" className="mt-6 text-sm font-medium text-emerald-800 underline">
        Create an account
      </Link>
    </main>
  );
}
