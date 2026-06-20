'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';

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
      setPesanError('Password dan Konfirmasi Password tidak cocok!');
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

      alert('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
      router.push('/login');

    } catch (error: any) {
      setPesanError(error.message || 'Terjadi kesalahan saat mendaftar.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-800">Daftar Akun Baru</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Lengkapi data di bawah untuk mulai berbelanja.</p>
        {pesanError && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium border border-red-200">{pesanError}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nama Lengkap</label>
            <input type="text" required placeholder="Sesuai KTP/Penerima" value={namaLengkap} onChange={(e) => setNamaLengkap(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Nomor WhatsApp / HP</label>
            <input type="tel" required placeholder="0812xxxxxx" value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input type="email" required placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
              <input type="password" required placeholder="Minimal 6 karakter" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Ulangi Password</label>
              <input type="password" required placeholder="Ulangi password" value={konfirmasiPassword} onChange={(e) => setKonfirmasiPassword(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className={`w-full text-white font-bold py-3 rounded-lg transition mt-2 ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
            {isLoading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun? <Link href="/login" className="text-blue-600 font-bold hover:underline">Masuk di sini</Link>
        </div>
      </form>
    </div>
  );
}