'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';

export default function GantiPasswordPage() {
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pesanError, setPesanError] = useState('');
  const [pesanSukses, setPesanSukses] = useState('');

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const cekSesi = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      }
    };
    cekSesi();
  }, [router, supabase]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError('');
    setPesanSukses('');

    if (passwordBaru.length < 6) {
      setPesanError('Password minimal harus 6 karakter.');
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setPesanError('Password dan konfirmasi tidak cocok.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordBaru
      });

      if (error) throw error;

      setPesanSukses('Password berhasil diperbarui! Anda akan dialihkan ke halaman login.');
      await supabase.auth.signOut();
      setTimeout(() => router.push('/login'), 2000);

    } catch (error: any) {
      setPesanError(error.message || 'Gagal memperbarui password.');
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
              <span className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase">Keamanan Akun</span>
              <h1 className="font-serif font-bold text-2xl text-white mt-1">Buat Password Baru</h1>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="p-8 space-y-5">
            {pesanSukses && (
              <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-sm text-green-700 text-sm font-medium">
                {pesanSukses}
              </div>
            )}
            {pesanError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm font-medium">
                {pesanError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Password Baru</label>
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
                className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Konfirmasi Password Baru</label>
              <input
                type="password"
                required
                placeholder="Ulangi password baru"
                value={konfirmasiPassword}
                onChange={(e) => setKonfirmasiPassword(e.target.value)}
                className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3.5 rounded-sm uppercase tracking-widest text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>

          <div className="border-t border-gray-100 px-8 py-5 text-center">
            <Link href="/login" className="text-sm text-gray-600 hover:text-[#d77723] transition underline">
              Kembali ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
