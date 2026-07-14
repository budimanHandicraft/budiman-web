'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    const confirmLogout = confirm('Yakin ingin keluar dari halaman Admin?');
    if (confirmLogout) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  const getMenuClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 font-bold text-sm tracking-wider transition-colors ${
      isActive ? 'text-[#df9e3d]' : 'text-gray-400 hover:text-white'
    }`;
  };

  return (
    <aside className="w-64 bg-[#141414] text-white flex flex-col relative z-20 shadow-2xl overflow-hidden shrink-0">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/awan.svg')] bg-[length:100%_auto] bg-top bg-repeat-y opacity-80 mix-blend-screen pointer-events-none"></div>
      
      <div className="p-8 flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>
        <div>
          <p className="text-xs text-gray-400">Selamat datang,</p>
          <p className="text-sm font-bold">Admin Budiman</p>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-4 relative z-10">
        <Link href="/admin/dashboard" className={getMenuClass('/admin/dashboard')}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
          DASHBOARD
        </Link>
        <Link href="/admin/transaksi" className={getMenuClass('/admin/transaksi')}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
          HISTORI TRANSAKSI
        </Link>
        <Link href="/admin/produk" className={getMenuClass('/admin/produk')}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd"></path></svg>
          KELOLA PRODUK
        </Link>
      </nav>

      <div className="p-6 relative z-10">
        <button onClick={handleLogout}
          className="flex items-center gap-3 text-gray-300 font-bold text-sm tracking-widest uppercase border border-gray-600 rounded px-4 py-2 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all w-full justify-center"
        >
          <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          LOG OUT
        </button>
      </div>
    </aside>
  );
}