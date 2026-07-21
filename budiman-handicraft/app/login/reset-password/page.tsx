'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [pesanError, setPesanError] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPesanError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login/ganti-password`,
      });

      if (error) throw error;

      setIsSent(true);
    } catch (error: any) {
      setPesanError(error.message || 'Gagal mengirim email reset password.');
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
              <span className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase">Pemulihan Akun</span>
              <h1 className="font-serif font-bold text-2xl text-white mt-1">Pulihkan Akses</h1>
            </div>
          </div>

          <div className="p-8">
            {isSent ? (
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-sm text-green-700 text-sm font-medium">
                  Tautan pemulihan telah dikirim! Silakan periksa kotak masuk (atau folder spam) email <strong>{email}</strong>.
                </div>
                <Link
                  href="/login"
                  className="inline-block w-full bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3 rounded-sm uppercase tracking-widest text-sm transition text-center"
                >
                  Kembali ke Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-5">
                <p className="text-sm text-gray-500 text-center">
                  Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk membuat password baru.
                </p>

                {pesanError && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm font-medium">
                    {pesanError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2 italic">Email Terdaftar</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3.5 rounded-sm uppercase tracking-widest text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                </button>
              </form>
            )}
          </div>

          {!isSent && (
            <div className="border-t border-gray-100 px-8 py-5 text-center">
              <Link href="/login" className="text-sm text-gray-600 hover:text-[#d77723] transition underline">
                Kembali ke Halaman Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
