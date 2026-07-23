'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Image from 'next/image';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    <nav className={`fixed top-0 left-0 w-full z-50 ${pathname === '/' ? 'bg-white/80' : 'bg-white'}`}>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-24">
          {/* <div className="flex items-center gap-32"> */}
            <Link href="/" className="flex justify-center items-center">
              <Image
                src="/logo.svg" alt="logo budiman"
                width={240} height={100}
                className="object-contain"
              />
            </Link>
          {/* </div> */}

            <div className="hidden md:flex gap-16">
              <Link href="/" className={`text-[20px] font-medium transition-colors ${pathname === '/' ? 'text-[#d77723]' : 'text-black hover:text-gray-700'}`}>About Us</Link>
              <Link href="/katalog" className={`text-[20px] font-medium transition-colors ${pathname.startsWith('/katalog') ? 'text-[#d77723]' : 'text-black hover:text-gray-700'}`}>Catalog</Link>
              <Link href="/artisan" className={`text-[20px] font-medium transition-colors ${pathname === '/artisan' ? 'text-[#d77723]' : 'text-black hover:text-gray-700'}`}>Artisans</Link>
              <Link href="/history" className={`text-[20px] font-medium transition-colors ${pathname === '/history' ? 'text-[#d77723]' : 'text-black hover:text-gray-700'}`}>History</Link>
            </div>

          <div className="flex items-center gap-4 md:gap-12">
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-sm hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link href="/market" className={`text-[20px] font-bold transition-colors flex items-center gap-2 ${pathname === '/market' ? 'text-[#d77723]' : 'text-black hover:text-gray-700'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="hidden sm:inline">Cart</span>
            </Link>

            {isLoggedIn ? (
              <div className="relative user-dropdown">
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#d77723] cursor-pointer">
                  <div className="w-7 h-7 bg-[#d77723] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {isAdmin ? 'Ad' : 'Me'}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-sm shadow-xl py-2 border border-gray-100 flex flex-col overflow-hidden">
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2.5 text-sm font-bold text-[#d77723] hover:bg-[#faf9f5] border-b border-gray-50 transition-colors">
                        Dasbor Admin
                      </Link>
                    )}

                    <Link href="/profil" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2.5 text-sm text-gray-700 hover:bg-[#faf9f5] hover:text-[#d77723] transition-colors">
                      Pengaturan Profil
                    </Link>
                    <Link href="/pesanan" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2.5 text-sm text-gray-700 hover:bg-[#faf9f5] hover:text-[#d77723] transition-colors">
                      Pesanan Saya
                    </Link>
                    <Link href="/contact" onClick={() => setIsDropdownOpen(false)} className="px-4 py-2.5 text-sm text-gray-700 hover:bg-[#faf9f5] hover:text-[#d77723] transition-colors">
                      Kontak Kami
                    </Link>

                    <button onClick={handleLogout} className="text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium border-t border-gray-50 mt-1 transition-colors cursor-pointer">
                      Keluar (Logout)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="bg-[#d77723] hover:bg-[#c2662b] text-white px-5 py-2 rounded-sm text-[16px] font-bold transition-colors">
                Login
              </Link>
            )}

          </div>
        </div>
      </div>
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              <Link 
                href="/" 
                className={`block py-3 px-4 text-lg font-medium rounded-sm transition-colors ${pathname === '/' ? 'text-[#d77723] bg-[#faf9f5]' : 'text-black hover:bg-gray-50'}`}
              >
                About Us
              </Link>
              <Link 
                href="/katalog" 
                className={`block py-3 px-4 text-lg font-medium rounded-sm transition-colors ${pathname.startsWith('/katalog') ? 'text-[#d77723] bg-[#faf9f5]' : 'text-black hover:bg-gray-50'}`}
              >
                Catalog
              </Link>
              <Link 
                href="/artisan" 
                className={`block py-3 px-4 text-lg font-medium rounded-sm transition-colors ${pathname === '/artisan' ? 'text-[#d77723] bg-[#faf9f5]' : 'text-black hover:bg-gray-50'}`}
              >
                Artisans
              </Link>
              <Link 
                href="/history" 
                className={`block py-3 px-4 text-lg font-medium rounded-sm transition-colors ${pathname === '/history' ? 'text-[#d77723] bg-[#faf9f5]' : 'text-black hover:bg-gray-50'}`}
              >
                History
              </Link>
              
              {isLoggedIn && (
                <>
                  <div className="border-t border-gray-100 pt-2 mt-2">
                    <Link 
                      href="/profil" 
                      className="block py-3 px-4 text-lg font-medium text-gray-700 hover:bg-[#faf9f5] rounded-sm transition-colors"
                    >
                      Profil Saya
                    </Link>
                    <Link 
                      href="/pesanan" 
                      className="block py-3 px-4 text-lg font-medium text-gray-700 hover:bg-[#faf9f5] rounded-sm transition-colors"
                    >
                      Pesanan Saya
                    </Link>
                    {isAdmin && (
                      <Link 
                        href="/admin" 
                        className="block py-3 px-4 text-lg font-medium text-[#d77723] hover:bg-[#faf9f5] rounded-sm transition-colors"
                      >
                        Dasbor Admin
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left py-3 px-4 text-lg font-medium text-red-600 hover:bg-red-50 rounded-sm transition-colors cursor-pointer"
                    >
                      Keluar (Logout)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
    </nav>
  );
}