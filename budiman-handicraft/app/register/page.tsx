'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pesanError, setPesanError] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanError('');

    if (password !== konfirmasiPassword) {
      setPesanError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setPesanError('Password minimal harus 6 karakter.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nama_lengkap: namaLengkap,
            nomor_hp: nomorHp,
          }
        }
      });

      if (error) throw error;

      // Also insert into profil_pelanggan table
      if (data.user) {
        await supabase.from('profil_pelanggan').upsert({
          id: data.user.id,
          nama_lengkap: namaLengkap,
          nomor_hp: nomorHp,
          role: 'user'
        }, { onConflict: 'id' });
      }

      alert('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
      router.push('/login');

    } catch (error: any) {
      setPesanError(error.message || 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f5] flex flex-col items-center justify-center px-4 py-12 font-sans relative overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[url('/awan.svg')] bg-cover opacity-5 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg">
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
              <span className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase">Bergabung dengan Budiman</span>
              <h1 className="font-serif font-bold text-2xl text-white mt-1">Daftar Akun Baru</h1>
            </div>
          </div>

          <form onSubmit={handleRegister} className="p-8 space-y-5">
            {pesanError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm font-medium">
                {pesanError}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Sesuai KTP / Penerima"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Nomor WhatsApp / HP</label>
              <input
                type="tel"
                required
                placeholder="0812xxxxxx"
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
              />
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 italic">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 italic">Konfirmasi Password</label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi password"
                  value={konfirmasiPassword}
                  onChange={(e) => setKonfirmasiPassword(e.target.value)}
                  className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3.5 rounded-sm uppercase tracking-widest text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="border-t border-gray-100 px-8 py-5 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-[#d77723] font-bold hover:underline">
                Masuk di sini
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
