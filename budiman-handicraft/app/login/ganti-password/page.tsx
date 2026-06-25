'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function GantiPasswordPage() {
  const [passwordBaru, setPasswordBaru] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pesanError, setPesanError] = useState('');
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const cekSesi = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Tautan tidak valid atau sudah kedaluwarsa.');
        router.push('/login');
      }
    };
    cekSesi();
  }, [router, supabase.auth]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordBaru.length < 6) return setPesanError('Password minimal 6 karakter.');
    
    setIsLoading(true);
    setPesanError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordBaru
      });

      if (error) throw error;

      alert('Password berhasil diperbarui! Silakan login dengan password baru.');
      await supabase.auth.signOut();
      router.push('/login');

    } catch (error: any) {
      setPesanError(error.message || 'Gagal memperbarui password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Buat Password Baru</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Silakan masukkan password baru untuk akun Anda.</p>

        {pesanError && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium border border-red-200">{pesanError}</div>
        )}

        <div className="space-y-4">
          <input type="password" required placeholder="Minimal 6 karakter"  value={passwordBaru} onChange={(e) => setPasswordBaru(e.target.value)}  className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"/>
          <button type="submit" disabled={isLoading}  className={`w-full text-white font-bold py-2 rounded transition ${isLoading ? 'bg-blue-400' : 'bg-green-600 hover:bg-green-700'}`}>{isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}</button>
        </div>
      </form>
    </div>
  );
}