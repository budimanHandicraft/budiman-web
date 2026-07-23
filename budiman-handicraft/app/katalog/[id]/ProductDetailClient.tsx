'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface Produk {
  id: string;
  nama_produk: string;
  deskripsi: string;
  harga: number;
  berat_gram: number;
  stok: number;
  gambar_url: string[];
  kategori: string;
}

interface Varian {
  id: string;
  tipe_varian_1: string | null;
  nilai_varian_1: string | null;
  tipe_varian_2: string | null;
  nilai_varian_2: string | null;
  harga: number | null;
  stok: number | null;
  berat_gram: number | null;
}

interface ProductDetailClientProps {
  produk: Produk;
  produkLain: Produk[];
  varianList: Varian[];
}

export default function ProductDetailClient({ produk, produkLain, varianList }: ProductDetailClientProps) {
  const [gambarUtama, setGambarUtama] = useState(produk.gambar_url?.[0] || '');
  const [activeTab, setActiveTab] = useState('Deskripsi');
  const [selectedVarian, setSelectedVarian] = useState<Varian | null>(null);
  const [kuantitas, setKuantitas] = useState(1);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const hargaTampil = selectedVarian?.harga ?? produk?.harga ?? 0;
  const stokTampil = selectedVarian?.stok ?? produk?.stok ?? 0;

  const handleKuantitas = (type: 'plus' | 'min') => {
    if (type === 'plus' && kuantitas < stokTampil) setKuantitas(prev => prev + 1);
    if (type === 'min' && kuantitas > 1) setKuantitas(prev => prev - 1);
  };

  const tambahKeKeranjang = (langsungCheckout = false) => {
    if (!produk) return;
    if (varianList.length > 0 && !selectedVarian) {
      setToast({show: true, message: 'Silakan pilih varian produk terlebih dahulu.'});
      setTimeout(() => setToast({show: false, message: ''}), 3000);
      return;
    }

    const keranjangLama = localStorage.getItem('keranjang_umkm');
    let keranjang = keranjangLama ? JSON.parse(keranjangLama) : [];
    const currentVarianId = selectedVarian ? selectedVarian.id : null;
    const indexProduk = keranjang.findIndex((item: any) => 
      item.id === produk.id && item.varian_id === currentVarianId
    );

    if (indexProduk > -1) {
      keranjang[indexProduk].kuantitas += kuantitas;
    } else {
      keranjang.push({
        id: produk.id,
        varian_id: currentVarianId,
        nama_varian: selectedVarian ? `${selectedVarian.nilai_varian_1 || ''} ${selectedVarian.nilai_varian_2 || ''}`.trim() : null,
        nama_produk: produk.nama_produk,
        harga: hargaTampil,
        gambar_url: produk.gambar_url,
        kuantitas: kuantitas,
        berat_gram: selectedVarian?.berat_gram ?? produk.berat_gram
      });
    }

    localStorage.setItem('keranjang_umkm', JSON.stringify(keranjang));

    if (langsungCheckout) {
      router.push('/market');
    } else {
      setToast({show: true, message: `${produk.nama_produk} berhasil ditambahkan ke keranjang!`});
      setTimeout(() => setToast({show: false, message: ''}), 3000);
    }
  };

  const galeriAsli = produk.gambar_url || [];

  return (
    <main className="min-h-screen bg-white pt-16 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#161616] text-white px-6 py-3 rounded-sm shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 text-[#df9e3d] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-[#faf9f5] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#d77723] transition">Beranda</Link>
            <span>/</span>
            <Link href="/katalog" className="hover:text-[#d77723] transition">Katalog</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{produk.nama_produk}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
          {/* Gallery */}
          <div className="lg:col-span-7 flex gap-4">
            <div className="flex flex-col gap-4 w-20 shrink-0 max-h-[500px] overflow-y-auto no-scrollbar">
              {galeriAsli.map((img, idx) => (
                <button key={idx} onClick={() => setGambarUtama(img)}
                  className={`aspect-[3/4] relative rounded-sm overflow-hidden border-2 cursor-pointer transition-all ${gambarUtama === img ? 'border-[#d97736]' : 'border-transparent hover:border-gray-300'}`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 aspect-square relative bg-[#e3e8de] rounded-sm overflow-hidden">
              {gambarUtama ? (
                <Image src={gambarUtama} alt={produk.nama_produk} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No Image</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase mb-2">{produk.kategori || 'Handicraft'}</span>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{produk.nama_produk}</h1>
            <div className="flex items-center text-[#d97736] mb-4 text-sm gap-1">★★★★★ <span className="text-gray-400 text-xs ml-1">(Artisan Verified)</span></div>

            <p className="text-xl font-bold text-[#d77723] mb-1">Rp {hargaTampil.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-500 font-medium tracking-wide mb-4">
              Sisa Stok: <span className={`font-bold ${stokTampil === 0 ? 'text-red-600' : 'text-gray-900'}`}>{stokTampil}</span>
            </p>
            <p className="text-sm text-gray-700 text-justify mb-4 line-clamp-12">{produk.deskripsi}</p>

            {varianList.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Pilih Varian</p>
                <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1 pb-2">
                  {varianList.map((varian) => (
                    <button
                      key={varian.id}
                      onClick={() => {
                        setSelectedVarian(varian);
                        setKuantitas(1);
                      }}
                      className={`px-4 py-2 border rounded-sm text-xs font-bold uppercase transition-all ${
                        selectedVarian?.id === varian.id ? 'bg-gray-900 border-gray-900 text-white shadow-md scale-95' : 'bg-white border-gray-300 text-gray-700 hover:border-gray-900'
                      }`}>
                      {varian.nilai_varian_1} {varian.nilai_varian_2 ? `- ${varian.nilai_varian_2}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-4 border-t border-gray-100 pt-4">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Kuantitas</span>
              <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
                <button
                  onClick={() => handleKuantitas('min')}
                  disabled={kuantitas <= 1}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 text-black hover:bg-gray-200 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  -
                </button>
                <div className="w-12 h-10 flex items-center justify-center font-bold text-sm text-black bg-white border-x border-gray-300">
                  {kuantitas}
                </div>
                <button
                  onClick={() => handleKuantitas('plus')}
                  disabled={kuantitas >= stokTampil}
                  className="w-10 h-10 flex items-center justify-center bg-gray-50 text-black hover:bg-gray-200 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => tambahKeKeranjang(false)}
                disabled={stokTampil === 0 || (varianList.length > 0 && !selectedVarian)}
                className="w-full bg-[#f0f0f0] hover:bg-gray-200 text-gray-900 font-bold py-3.5 px-4 rounded-sm text-xs flex items-center justify-center gap-2 uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {stokTampil === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
              </button>
              <button
                onClick={() => tambahKeKeranjang(true)}
                disabled={stokTampil === 0 || (varianList.length > 0 && !selectedVarian)}
                className="w-full bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3.5 px-4 rounded-sm text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stokTampil === 0 ? 'Stok Habis' : 'Beli Sekarang'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-12">
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="bg-[#faf9f5] border border-[#e8e6dd] p-6 rounded-sm">
              <h3 className="font-serif font-bold text-lg text-black mb-6">Detail Produk</h3>
              <div className="grid grid-cols-2 gap-y-4 text-xs">
                <span className="text-gray-500">Kategori</span>
                <span className="font-medium text-gray-900">{produk.kategori || 'Handicraft'}</span>

                <span className="text-gray-500">Berat</span>
                <span className="font-medium text-gray-900">{produk.berat_gram || '850'} gram</span>

                <span className="text-gray-500">Ketersediaan</span>
                <span className={`font-medium ${stokTampil > 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {stokTampil > 0 ? `Stok Tersedia (${stokTampil})` : 'Stok Habis'}
                </span>

                <span className="text-gray-500">Asal</span>
                <span className="font-medium text-gray-900">Jawa Barat, Indonesia</span>

                <span className="text-gray-500">Garansi</span>
                <span className="font-medium text-gray-900">100% Handmade</span>
              </div>
            </div>

            <div className="lg:col-span-4 flex items-start">
              <div className="border border-gray-200 p-6 rounded-sm w-full bg-[#faf9f5]">
                <h3 className="font-serif font-bold text-lg text-black mb-4">Cerita di Balik Karya</h3>
                <p className="text-xs text-gray-600 leading-relaxed text-justify mb-4">
                  Setiap produk Budiman Handicraft lahir dari tangan para seniman lokal Sunda. 
                  Teknik pewarisan turun-temurun digabung dengan standar kualitas modern, 
                  menjadikan setiap karya bukan sekadar hiasan, melainkan warisan hidup yang membawa nilai filosofi budaya.
                </p>
                <Link href="/history" className="text-[#d77723] font-bold text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 transition-colors">
                  Jelajahi Cerita Kami <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex gap-8 border-b border-gray-200 mb-6">
              {['Deskripsi', 'Perawatan'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === tab ? 'text-black border-b-2 border-[#d77736]' : 'text-gray-400 hover:text-gray-700'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-600 leading-relaxed text-justify">
              {activeTab === 'Deskripsi' && (
                <div className="space-y-4">
                  <p>{produk.deskripsi}</p>
                  <p>
                    Produk ini merupakan hasil karya tangan para pengrajin lokal Sunda yang telah berpengalaman puluhan tahun. 
                    Setiap detail dikerjakan dengan teliti, mulai dari pemilihan bahan baku kayu berkualitas hingga 
                    tahap finishing akhir yang memastikan daya tahan dan keindahan produk.
                  </p>
                  <div className="bg-[#faf9f5] border-l-4 border-[#d77723] p-4 mt-4">
                    <p className="text-xs text-gray-500 italic">
                      "Setiap produk yang kami hasilkan bukan sekadar barang, melainkan sebuah cerita yang membawa nilai, tradisi, dan kebanggaan terhadap budaya lokal."
                    </p>
                    <p className="text-xs text-[#d77723] font-bold mt-2">— Budiman Handicraft</p>
                  </div>
                </div>
              )}

              {activeTab === 'Perawatan' && (
                <div className="space-y-4">
                  <p className="font-bold text-gray-900 mb-2">Panduan Perawatan Produk:</p>
                  <ul className="space-y-3">
                    {[
                      'Bersihkan secara rutin dengan kain lap kering yang lembut untuk menghilangkan debu.',
                      'Hindari paparan sinar matahari langsung dalam jangka waktu lama agar warna tetap awet.',
                      'Jauhkan dari area lembap untuk mencegah kerusakan pada material kayu.',
                      'Gunakan lap basah hangat (peras hingga kering) untuk noda ringan, lalu keringkan segera.',
                      'Jangan gunakan cairan pembersih kimia keras atau alkohol yang dapat merusak finishing.'
                    ].map((tip, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="w-5 h-5 bg-[#d77723] text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#141414] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/awan.svg')] bg-[20%_0%] bg-cover bg-center pointer-events-none opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase">Curated Selection</span>
              <h2 className="text-3xl font-serif font-bold text-white mt-1">Produk Serupa</h2>
            </div>
            <Link href="/katalog" className="text-[#d77723] font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-1 transition-colors">
              Lihat Semua <span>&rarr;</span>
            </Link>
          </div>

          {produkLain.length === 0 ? (
            <p className="text-gray-400 text-sm">Belum ada produk serupa.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {produkLain.map((item) => (
                <Link href={`/katalog/${item.id}`} key={item.id} className="group">
                  <div className="aspect-square bg-[#e3e8de] rounded-sm mb-4 relative overflow-hidden">
                    {item.gambar_url?.[0] ? (
                      <Image src={item.gambar_url[0]} alt={item.nama_produk} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="text-white font-bold uppercase tracking-wider mb-1 group-hover:text-[#d77736] transition-colors">{item.nama_produk}</h3>
                    <p className="text-[#df9e3d] font-serif">Rp {item.harga.toLocaleString('id-ID')}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
