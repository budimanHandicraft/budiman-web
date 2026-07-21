'use client';

import { useState, useEffect, use } from 'react';
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
}

export default function DetailProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const idProduk = resolvedParams.id;

  const [produk, setProduk] = useState<Produk | null>(null);
  const [produkLain, setProdukLain] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [gambarUtama, setGambarUtama] = useState('');
  const [activeTab, setActiveTab] = useState('Deskripsi');

  const [varianList, setVarianList] = useState<Varian[]>([]);
  const [selectedVarian, setSelectedVarian] = useState<Varian | null>(null);
  const [kuantitas, setKuantitas] = useState(1);

  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!idProduk) return;
    const fetchDetailProduk = async () => {
      const { data: produkData } = await supabase
        .from('produk')
        .select('*')
        .eq('id', idProduk)
        .single();

      if (produkData) {
        setProduk(produkData);
        setGambarUtama(produkData.gambar_url?.[0] || '');

        const { data: varianData } = await supabase
          .from('produk_varian')
          .select('*')
          .eq('produk_id', produkData.id);

        if (varianData) setVarianList(varianData);

        // Related: same kategori, different id
        const { data: rekomendasi } = await supabase
          .from('produk')
          .select('*')
          .eq('kategori', produkData.kategori)
          .neq('id', idProduk)
          .limit(3);

        if (rekomendasi && rekomendasi.length > 0) {
          setProdukLain(rekomendasi);
        } else {
          // Fallback: any other product
          const { data: fallback } = await supabase
            .from('produk')
            .select('*')
            .neq('id', idProduk)
            .limit(3);
          if (fallback) setProdukLain(fallback);
        }
      }

      setIsLoading(false);
    };

    fetchDetailProduk();
  }, [idProduk, supabase]);

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
    const cartItemId = selectedVarian ? selectedVarian.id : produk.id;
    const indexProduk = keranjang.findIndex((item: any) => item.id === cartItemId);

    if (indexProduk > -1) {
      keranjang[indexProduk].kuantitas += kuantitas;
    } else {
      keranjang.push({
        id: cartItemId,
        nama_produk: produk.nama_produk,
        varian_nama: selectedVarian ? `${selectedVarian.nilai_varian_1 || ''} ${selectedVarian.nilai_varian_2 || ''}`.trim() : null,
        harga: hargaTampil,
        gambar_url: produk.gambar_url,
        kuantitas: kuantitas
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#faf9f5] flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#d77723] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium animate-pulse">Memuat detail produk...</p>
        </div>
      </main>
    );
  }

  if (!produk) {
    return (
      <main className="min-h-screen bg-[#faf9f5] flex items-center justify-center font-sans px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h2>
          <p className="text-sm text-gray-500 mb-6">Produk yang Anda cari mungkin sudah tidak tersedia atau telah dihapus.</p>
          <Link href="/katalog" className="inline-block bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3 px-6 rounded-sm uppercase tracking-widest text-sm transition">
            Kembali ke Katalog
          </Link>
        </div>
      </main>
    );
  }

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
          <div className="lg:col-span-5 flex gap-4">
            <div className="flex flex-col gap-4 w-20 shrink-0 max-h-[500px] overflow-y-auto no-scrollbar">
              {galeriAsli.map((img, idx) => (
                <button key={idx} onClick={() => setGambarUtama(img)}
                  className={`aspect-[3/4] relative rounded-sm overflow-hidden border-2 transition-all ${gambarUtama === img ? 'border-[#d97736]' : 'border-transparent hover:border-gray-300'}`}
                >
                  <Image src={img} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 aspect-[4/5] relative bg-[#e3e8de] rounded-sm overflow-hidden">
              {gambarUtama ? (
                <Image src={gambarUtama} alt={produk.nama_produk} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No Image</div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <span className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase mb-2">{produk.kategori || 'Handicraft'}</span>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{produk.nama_produk}</h1>
            <div className="flex items-center text-[#d97736] mb-4 text-sm gap-1">★★★★★ <span className="text-gray-400 text-xs ml-1">(Artisan Verified)</span></div>

            <p className="text-xl font-bold text-[#d77723] mb-1">Rp {hargaTampil.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-500 font-medium tracking-wide mb-6">
              Sisa Stok: <span className={`font-bold ${stokTampil === 0 ? 'text-red-600' : 'text-gray-900'}`}>{stokTampil}</span>
            </p>
            <p className="text-sm text-gray-600 leading-relaxed text-justify mb-8">{produk.deskripsi}</p>

            {varianList.length > 0 && (
              <div className="mb-6">
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

            <div className="flex items-center justify-between mb-8 border-t border-gray-100 pt-6">
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

            <div className="flex flex-col gap-3 mb-8">
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

            <div className="flex justify-between items-center text-center border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
                <span className="text-[10px] uppercase font-bold">Craftmanship</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" /></svg>
                <span className="text-[10px] uppercase font-bold">Philosophy</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[10px] uppercase font-bold">Longevity</span>
              </div>
            </div>
          </div>

          {/* Story Panel */}
          <div className="lg:col-span-4 flex items-start">
            <div className="border border-gray-200 p-6 rounded-sm w-full bg-[#faf9f5]">
              <h3 className="font-serif font-bold text-lg text-black mb-4">Cerita di Balik Karya Ini</h3>
              <div className="flex gap-4 mb-4">
                <div className="w-24 h-24 bg-[#e3e8de] rounded-sm shrink-0 relative overflow-hidden">
                   {produk.gambar_url?.[0] && (
                     <Image src={produk.gambar_url[0]} alt="Story" fill className="object-cover" />
                   )}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed text-justify">
                  Setiap produk Budiman Handicraft lahir dari tangan para seniman lokal Sunda. 
                  Teknik pewarisan turun-temurun digabung dengan standar kualitas modern, 
                  menjadikan setiap karya bukan sekadar hiasan, melainkan warisan hidup yang membawa nilai filosofi budaya.
                </p>
              </div>
              <Link href="/history" className="text-[#d77723] font-bold text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1 transition-colors">
                Jelajahi Cerita Kami <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-4">
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

      {/* Related Products */}
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
                  <div className="aspect-[4/3] bg-[#e3e8de] rounded-sm mb-4 relative overflow-hidden">
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
