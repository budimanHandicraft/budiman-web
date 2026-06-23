'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface Produk {
  id: string;
  nama_produk: string;
  deskripsi: string;
  harga: number;
  gambar_url: string;
  kategori: string;
  stok: number;
}

export default function KatalogPage() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [kategoriAktif, setKategoriAktif] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchKatalog();
  }, []);

  const fetchKatalog = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProdukList(data);
    }
    setIsLoading(false);
  };

  const daftarKategori = ['Semua', ...Array.from(new Set(produkList.map((p) => p.kategori || 'Umum')))];
  const produkTampil = kategoriAktif === 'Semua' ? produkList : produkList.filter((p) => p.kategori === kategoriAktif);

  const handleTambahKeranjang = (produk: Produk) => {
    if (produk.stok < 1) {
      alert('Maaf, stok produk ini sedang habis.');
      return;
    }
    alert(`Berhasil menambahkan ${produk.nama_produk} ke keranjang!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Katalog Kerajinan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Temukan koleksi kerajinan tangan terbaik kami, mulai dari wayang tradisional hingga suvenir modern.</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {daftarKategori.map((kategori, index) => (
            <button
              key={index} onClick={() => setKategoriAktif(kategori)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                kategoriAktif === kategori ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}>
              {kategori}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-gray-500 font-medium">Memuat katalog...</div>
        ) : produkTampil.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
            Belum ada produk di kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produkTampil.map((produk) => (
              <div key={produk.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img src={produk.gambar_url} alt={produk.nama_produk} className="w-full h-full object-cover"/>
                  {produk.stok < 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold px-3 py-1 bg-red-500 rounded-full text-sm">Habis</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-xs text-blue-600 font-bold mb-1 uppercase tracking-wider">{produk.kategori}</div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{produk.nama_produk}</h3>
                  <div className="font-extrabold text-gray-800 mb-4">
                    Rp {produk.harga.toLocaleString('id-ID')}
                  </div>
                  
                  <div className="flex-grow"></div>

                  <button 
                    onClick={() => handleTambahKeranjang(produk)} disabled={produk.stok < 1}
                    className={`w-full py-2.5 rounded-xl font-bold transition-colors ${
                      produk.stok < 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
                    }`}>
                    + Keranjang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}