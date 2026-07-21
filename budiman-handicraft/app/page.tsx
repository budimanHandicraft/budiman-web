'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const cekStatusLogin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsLoggedIn(true);
        
        const { data: profil } = await supabase
          .from('profil_pelanggan')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profil?.role === 'admin') {
          setIsAdmin(true);
        }
      }
      
      setIsCheckingAuth(false);
    };

    cekStatusLogin();
  }, [supabase]);

  const handleLogout = async () => {
    const konfirmasi = confirm('Apakah Anda yakin ingin keluar?');
    if (!konfirmasi) return;

    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.refresh(); 
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="-mt-12 relative w-full h-[600px] md:h-[1000px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#081318]">
          <Image
            src="/wayang.png" alt="background wayang"
            fill priority
            className="object-cover scale-90 object-[center_20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
        </div>

        <div className="relative z-20 w-full pl-16">
          <div className="flex items-center gap-4">
            <div className="w-28 h-0.5 bg-[#d77723]"></div>
            <h1 className="text-[48px] text-[#df9e3d] font-bold">Legacy since 2016</h1>
          </div>

          <p className="my-4 max-w-md text-[28px] text-white font-bold">Melestarikan Budaya Sunda <span className="text-[#df9e3d]">Melalui</span> <span className="italic">Karya Tangan</span></p>
          <p className="max-w-xl text-white text-[16px]">Dari tangan para seniman, koleksi kami dirancang untuk mereka yang menghargai perjalanan di balik setiap guratan pahat. Temukan wayang serta kerajinan tradisional yang melampaui sekadar dekorasi, menjadi warisan yang abadi.</p>

          <Link href="/katalog" className="inline-block relative mt-8 px-6 py-3 bg-[#d77723] hover:bg-[#c2662b] rounded-lg text-white font-semibold cursor-pointer">Explore Collections</Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-[2px] pointer-events-none">
          <svg className="relative block w-full h-[80px] md:h-[400px] transform -scale-x-100" xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,224C960,203,1056,149,1152,133.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="text-[24px] font-bold text-black mb-3">Craftmanship</h3>
              <p className="text-black text-[16px] leading-relaxed text-justify">Dikerjakan secara manual dengan teliti. Setiap detail ukiran, perakitan, hingga pengecatan diperhatikan dengan saksama oleh pengrajin kami.</p>
            </div>

            <div>
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
                </svg>
              </div>
              <h3 className="text-[24px] font-bold text-black mb-3">Philosophy</h3>
              <p className="text-black text-[16px] leading-relaxed text-justify">Bukan sekadar hiasan biasa. Desain karya kami terinspirasi dari karakter pewayangan dan kearifan lokal Nusantara yang sarat makna.</p>
            </div>

            <div>
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-16 h-16 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[24px] font-bold text-black mb-3">Longevity</h3>
              <p className="text-black text-[16px] leading-relaxed text-justify">Dibuat menggunakan bahan baku kayu dan material berkualitas tinggi agar produk tetap kokoh, awet, dan tidak mudah rusak dimakan waktu.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/awan.svg" alt="background awan"
            fill priority
            className="object-cover object-[center_10%]"
          />
        </div>
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-24">
          <div className="mb-8">
            <h4 className="text-[#df9e3d] font-bold text-[24px] tracking-[0.23m] uppercase mb-2">Curated Selection</h4>
            <h2 className="text-[28px] font-bold text-white mb-4 leading-none">The Artisan Masterpiece</h2>
            <p className="text-white text-[18px] max-w-3xl">Koleksi yang menjadi standar kualitas pilihan pelanggan kami. Inilah karya-karya maestro yang memiliki kedudukan tersendiri dalam ruang, mencerminkan apresiasi tinggi terhadap tradisi yang tidak lekang oleh waktu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-32 px-24">
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] bg-gray-200 mb-4 overflow-hidden rounded-sm relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Gambar Produk</div>
              </div>
              <h3 className="text-[32px] font-bold text-white mb-1 group-hover:text-[#d97736] transition-colors">Wayang Golek</h3>
              <p className="text-[#df9e3d] font-bold text-[24px]">Rp. 300.000,00</p>
            </div>
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] bg-gray-200 mb-4 overflow-hidden rounded-sm relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Gambar Produk</div>
              </div>
              <h3 className="text-[32px] font-bold text-white mb-1 group-hover:text-[#d97736] transition-colors">Busur Panah</h3>
              <p className="text-[#df9e3d] font-bold text-[24px]">Rp. 300.000,00</p>
            </div>
            <div className="group cursor-pointer">
              <div className="aspect-[3/4] bg-gray-200 mb-4 overflow-hidden rounded-sm relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Gambar Produk</div>
              </div>
              <h3 className="text-[32px] font-bold text-white mb-1 group-hover:text-[#d97736] transition-colors">Wayang Golek</h3>
              <p className="text-[#df9e3d] font-bold text-[24px]">Rp. 300.000,00</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-24">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="w-full lg:w-1/2 relative min-h-[450px]">
              <div className="absolute top-8 left-8 w-3/4 h-[350px] bg-gray-900 rounded-sm"></div>
              <div className="absolute top-0 left-0 w-3/4 h-[350px] bg-gray-200 rounded-sm border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                <span className="text-black">Foto Utama</span>
              </div>
              <div className="absolute bottom-0 right-8 w-[220px] h-[220px] bg-black text-white p-8 flex items-center justify-center border-8 border-white shadow-xl z-10">
                <p className="font-bold text-xl italic text-center">Kata kata kang Ikhsan</p>
              </div>
            </div>

            <div className="w-full lg:w-1/2">
              <h4 className="text-[#df9e3d] font-bold text-[28px] tracking-[0.2em] uppercase mb-3">Legacy Since 2016</h4>
              <h2 className="text-[52px] font-bold text-black">Dedikasi di Balik Guratan</h2>
              <div className="space-y-6 text-black text-[24px] leading-tight mb-10 text-justify">
                <p>Dimulai pada tahun 2016, Budiman Handicraft lahir dari keinginan sederhana untuk menjaga keterampilan kerajinan tangan lokal tetap eksis. Kami bekerja sama dengan seniman dan pengrajin lokal berpengalaman untuk menciptakan karya yang bisa dibanggakan.</p>
                <p>Setiap produk yang kami hasilkan menggabungkan teknik pertukangan tradisional dengan standar kualitas masa kini. Mulai dari pemilihan kayu hingga tahap penyelesaian, kami memastikan setiap pesanan layak untuk menjadi koleksi pribadi Anda.</p>
              </div>
              <hr className="border-gray-400 mb-8"></hr>
              <div className="flex justify-center gap-32 mb-8 text-center lg:text-left">
                <div>
                  <div className="text-[52px] text-black mb-1">10<span className="text-2xl">+</span></div>
                  <div className="text-[20px] font-bold text-[#df9e3d] uppercase tracking-wider">Years</div>
                </div>
                <div>
                  <div className="text-[52px] text-black mb-1">200<span className="text-2xl">+</span></div>
                  <div className="text-[20px] font-bold text-[#df9e3d] uppercase tracking-wider">Works</div>
                </div>
              </div>

              <Link href="/artisan" className="text-[#d97736] font-bold text-[20px] uppercase tracking-wider hover:underline flex items-center gap-1">
                Meet Our Artisans <span>&rarr;</span>
               </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#010202] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/awan.svg" alt="background awan"
            fill priority
            className="object-cover object-[0%_20%]"
          />
        </div>
        <div className="relative z-10 w-full mx-auto px-4 text-center">
          <h2 className="text-[52px] font-serif font-bold text-white mb-4">Join The Heritage Circle</h2>
          <p className="text-white text-[20px] mb-10 max-w-xl mx-auto">Terhubunglah dengan perjalanan kami. Bergabunglah dalam ruang apresiasi seni, di mana setiap kabar terbaru mengenai karya baru dan proses kreatif di balik setiap guratan karya kami akan menjadi bagian dari percakapan seni Anda.</p>

          {/* <button type="submit" className="bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-4 px-8 uppercase tracking-widest text-[24px] transition-colors rounded-md">Login</button> */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-center">
        {isCheckingAuth ? (
          <div className="bg-gray-300 text-gray-400 font-bold py-4 px-8 uppercase tracking-widest text-[24px] rounded-md inline-block animate-pulse">
            Memeriksa...
          </div>
        ) : isLoggedIn ? (
          <>
            {isAdmin ? (
              <Link href="/admin" className="bg-transparent hover:bg-[#d77723] border-2 border-[#d77723] text-[#d77723] hover:text-white font-bold py-4 px-8 uppercase tracking-widest text-[24px] transition-colors rounded-md inline-block text-center shadow-lg">
                Dashboard Admin
              </Link>
            ) : (
              <Link href="/profil" className="bg-transparent hover:bg-[#d77723] border-2 border-[#d77723] text-[#d77723] hover:text-white font-bold py-4 px-8 uppercase tracking-widest text-[24px] transition-colors rounded-md inline-block text-center shadow-lg">
                Profil Saya
              </Link>
            )}
            <button onClick={handleLogout} className="bg-transparent border-2 border-red-500 hover:bg-red-500 text-red-500 hover:text-white font-bold py-3.5 px-8 uppercase tracking-widest text-[24px] transition-colors rounded-md inline-block text-center shadow-lg cursor-pointer">
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-4 px-8 uppercase tracking-widest text-[24px] transition-colors rounded-md inline-block text-center shadow-lg">
            Login
          </Link>
        )}
      </div>
        </div>
      </section>
      
    </main>
  );
}