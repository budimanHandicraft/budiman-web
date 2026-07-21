'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pesanError, setPesanError] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError('');
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const { data: profil } = await supabase
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
      setPesanError(error.message || 'Gagal masuk. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[url('/awan.svg')] bg-cover opacity-5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image src="/logo.svg" alt="Budiman Handicraft" width={200} height={80} className="object-contain" />
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white shadow-lg rounded-sm overflow-hidden border border-gray-100">
          {/* Dark header strip */}
          <div className="bg-[#161616] p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/awan.svg')] bg-cover opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <span className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase">Heritage Since 2016</span>
              <h1 className="font-serif font-bold text-2xl text-white mt-1">Selamat Datang Kembali</h1>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {pesanError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm font-medium">
                {pesanError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Email</label>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Password</label>
              <input
                type="password"
                required
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
              />
            </div>

            <div className="flex justify-end">
              <Link href="/login/reset-password" className="text-xs text-gray-500 hover:text-[#d77723] transition underline">
                Lupa Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3.5 rounded-sm uppercase tracking-widest text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="border-t border-gray-100 px-8 py-5 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link href="/register" className="text-[#d77723] font-bold hover:underline">
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-900 transition underline underline-offset-2">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
