'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profil, error: profilError } = await supabase
        .from('profil_pelanggan')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profil?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }

    } catch (error: any) {
      alert(`Gagal masuk: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="bg-white text-black p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Masuk</h1>
        <div className="space-y-4">
          <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"/>
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"/>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-2 rounded">{isLoading ? 'Memproses...' : 'Masuk'}</button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">Daftar sekarang</Link>
        </div>
      </form>
    </div>
  );
}