'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Input, Label } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { LogoMark } from '@/components/ui/Logo';

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Incorrect username or password.');
      return;
    }
    router.push(params.get('callbackUrl') || '/admin');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 py-12">
      <div className="flex flex-col items-center">
        <LogoMark className="h-14 w-14 text-2xl" />
        <h1 className="mt-5 font-serif text-3xl font-semibold text-ink">Admin sign in</h1>
        <p className="mt-1 text-ink-muted">advice4docs &middot; Content Portal</p>
      </div>

      <form
        onSubmit={submit}
        className="mt-8 w-full max-w-sm rounded-card border border-border bg-white p-6 shadow-card"
      >
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="mt-3 text-sm text-[#B23B3B]">{error}</p>}
        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Log in'}
        </Button>
      </form>

      <p className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-muted">
        <Lock size={14} /> Private — authorized access only
      </p>
    </div>
  );
}
