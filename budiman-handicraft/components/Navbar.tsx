'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    cekStatusLogin();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        cekRole(session.user.id);
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const cekStatusLogin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setIsLoggedIn(true);
      cekRole(user.id);
    }
  };

  const cekRole = async (userId: string) => {
    const { data: profil } = await supabase
      .from('profil_pelanggan')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
    
    if (profil?.role === 'admin') setIsAdmin(true);
  };

  const handleLogout = async () => {
    localStorage.removeItem('keranjang_umkm');
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-extrabold text-xl text-blue-600 tracking-tight">
              Budiman
              <span className="text-gray-900">Handicraft</span>
            </Link>

            <div className="hidden md:flex space-x-6">
              <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Beranda</Link>
              <Link href="/katalog" className={`text-sm font-medium transition-colors ${pathname === '/katalog' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>Katalog</Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/market" className={`text-sm font-medium transition-colors flex items-center gap-1 ${pathname === '/market' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="hidden sm:inline">Keranjang</span>
            </Link>

            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">Me</div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 flex flex-col">
                    {isAdmin && (
                      <Link href="/admin"  onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 border-b border-gray-50">Masuk ke Dasbor Admin</Link>
                    )}

                    <Link href="/profil"  onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Pengaturan Profil</Link>
                    <Link href="/pesanan"  onClick={() => setIsDropdownOpen(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Pesanan Saya</Link>
                    
                    <button onClick={handleLogout} className="text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-gray-50 mt-1">Keluar (Logout)</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"  className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">Masuk</Link>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}