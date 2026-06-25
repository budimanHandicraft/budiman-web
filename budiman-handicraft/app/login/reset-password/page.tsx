'use client';

import { useState } from 'react';
import Link from 'next/link';
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
        redirectTo: `${window.location.origin}/ganti-password`,
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Pulihkan Akun</h1>
        
        {isSent ? (
          <div className="text-center">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 text-sm">
              Tautan pemulihan telah dikirim! Silakan periksa kotak masuk (atau folder spam) email <b>{email}</b>.
            </div>
            <Link href="/login" className="text-blue-600 font-bold hover:underline">
              Kembali ke Halaman Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset}>
            <p className="text-sm text-gray-500 text-center mb-6">
              Masukkan email yang terdaftar. Kami akan mengirimkan tautan untuk membuat password baru.
            </p>

            {pesanError && (
              <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-medium border border-red-200">
                {pesanError}
              </div>
            )}

            <div className="space-y-4">
              <input 
                type="email" required placeholder="nama@email.com" 
                value={email} onChange={(e) => setEmail(e.target.value)} 
                className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="submit" disabled={isLoading} 
                className={`w-full text-white font-bold py-2 rounded transition ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isLoading ? 'Mengirim...' : 'Kirim Tautan Reset'}
              </button>
            </div>
            
            <div className="mt-6 text-center text-sm">
              <Link href="/login" className="text-gray-500 hover:text-gray-800 font-medium">
                Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}