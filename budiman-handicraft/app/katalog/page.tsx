'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface Produk {
  id: string;
  nama_produk: string;
  harga: number;
  deskripsi: string;
  kategori: string;
  gambar_url: string;
}

export default function KatalogPage() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState('ALL PRODUCT');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const daftarKategori = ['ALL PRODUCT', 'WAYANG GOLEK', 'BUSUR PANAH', 'AKSESORIS'];

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProdukList(data);
    }
    setIsLoading(false);
  };

  const handleKategoriChange = (kategori: string) => {
    setKategoriAktif(kategori);
    setCurrentPage(1);
  };

  const produkTampil = kategoriAktif === 'ALL PRODUCT' ? produkList : produkList.filter(p => p.kategori.toUpperCase() === kategoriAktif);
  const totalPages = Math.ceil(produkTampil.length / itemsPerPage);
  const currentProducts = produkTampil.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const masukkanKeranjang = (produk: Produk) => {
    const keranjangLama = localStorage.getItem('keranjang_umkm');
    let keranjang = keranjangLama ? JSON.parse(keranjangLama) : [];
    
    const indexProduk = keranjang.findIndex((item: any) => item.id === produk.id);
    
    if (indexProduk > -1) {
      keranjang[indexProduk].kuantitas += 1;
    } else {
      keranjang.push({
        id: produk.id,
        nama_produk: produk.nama_produk,
        harga: produk.harga,
        gambar_url: produk.gambar_url,
        kuantitas: 1
      });
    }
    
    localStorage.setItem('keranjang_umkm', JSON.stringify(keranjang));
    alert(`${produk.nama_produk} berhasil ditambahkan ke keranjang!`);
  };

  return (
    <main className="w-full min-h-screen bg-white p-20 mx-auto">
      <div className="pt-12 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-8">
          <div className="max-w-3xl">
            <h4 className="text-[#544f2d] font-bold text-[12px] tracking-[0.2em] uppercase mb-2">Premium Collections</h4>
            <h1 className="text-[48px] font-serif font-bold text-gray-900 mb-4">
              Budiman Handicraft Catalog
            </h1>
            <p className="text-black text-[16px] leading-relaxed max-w-2xl text-justify">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          
          <div className="w-full md:w-auto">
            <button className="flex items-center justify-between w-full md:w-48 px-4 py-3 border border-gray-200 rounded-sm text-sm font-medium text-black hover:bg-gray-50 transition">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Recommended
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[280px] shrink-0 space-y-6">
            <div className="bg-[#141414] rounded-sm p-6 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('/pattern-awan.png')] bg-cover bg-center pointer-events-none"></div>
              
              <h3 className="relative z-10 text-2xl font-serif font-bold text-[#ffdb81] mb-6">Collection</h3>
              
              <ul className="relative z-10 space-y-2">
                {daftarKategori.map((kategori) => (
                  <li key={kategori}>
                    <button
                      onClick={() => setKategoriAktif(kategori)}
                      className={`w-full text-left px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors rounded-sm ${
                        kategoriAktif === kategori 
                          ? 'bg-[#ffdb81] text-black' 
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {kategori}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#f5f4ef] rounded-sm p-6 relative overflow-hidden border border-[#e8e6dd]">
              <div className="absolute inset-0 opacity-20 bg-[url('/pattern-awan.png')] bg-cover bg-center pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">Artisan Authenticity</h3>
                <p className="text-gray-600 text-xs leading-relaxed text-justify mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
                </p>
                <Link href="#" className="text-[#d77723] font-bold text-xs flex items-center gap-1 hover:underline uppercase tracking-wider">
                  Learn more <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-[#141414] rounded-sm p-8 md:p-10 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute inset-0 opacity-20 bg-[url('/pattern-awan.png')] bg-cover bg-center pointer-events-none"></div>
              
              <div className="relative z-10 max-w-lg">
                <h4 className="text-[#ffdb81] font-bold text-xs tracking-[0.2em] uppercase mb-2">Our Heritage Story</h4>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">Preserving Sundanese Soul</h2>
                <p className="text-white text-xs md:text-sm leading-relaxed text-justify">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              </div>

              <div className="relative z-10 shrink-0 w-full md:w-auto">
                <button className="w-full md:w-auto bg-[#d97736] hover:bg-[#c2662b] text-white font-bold py-3 px-6 rounded-sm text-sm uppercase tracking-wider transition-colors">
                  Explore The Studio
                </button>
              </div>
            </div>

            {/* Grid Produk */}
            {isLoading ? (
              <div className="py-20 text-center text-gray-500 font-medium">Memuat katalog produk...</div>
            ) : produkTampil.length === 0 ? (
              <div className="py-20 text-center text-gray-500 font-medium">Kategori ini belum memiliki produk.</div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {produkTampil.map((produk) => (
                    <div key={produk.id} className="flex flex-col group">
                      <div className="aspect-[3/4] bg-gray-100 rounded-sm mb-4 relative overflow-hidden">
                        {produk.gambar_url ? (
                          <Image 
                            src={produk.gambar_url} alt={produk.nama_produk} fill 
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">{produk.nama_produk}</h3>
                      <p className="text-sm font-bold text-gray-800 mb-3">Rp {produk.harga.toLocaleString('id-ID')}</p>
                      
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 text-justify mb-4 flex-1">{produk.deskripsi}</p>
                      
                      <button onClick={() => masukkanKeranjang(produk)}
                        className="w-full py-2.5 border-2 border-gray-900 text-gray-900 font-bold text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-colors rounded-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-100">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-200 rounded-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      &larr; Prev
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-10 h-10 flex items-center justify-center border rounded-sm text-sm font-bold transition-colors ${
                          currentPage === pageNumber ? 'bg-[#d97736] border-[#d97736] text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-200 rounded-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}