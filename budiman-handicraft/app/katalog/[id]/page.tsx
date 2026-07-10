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
  const [activeTab, setActiveTab] = useState('Description');

  const [varianList, setVarianList] = useState<Varian[]>([]);
  const [selectedVarian, setSelectedVarian] = useState<Varian | null>(null);
  const [kuantitas, setKuantitas] = useState(1);
  
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
      }

      const { data: rekomendasi } = await supabase
        .from('produk')
        .select('*')
        .neq('id', idProduk)
        .limit(3);
        
      if (rekomendasi) setProdukLain(rekomendasi);

      setIsLoading(false);
    };

    fetchDetailProduk();
  }, [idProduk]);

  const hargaTampil = selectedVarian?.harga ?? produk?.harga ?? 0;
  const stokTampil = selectedVarian?.stok ?? produk?.stok ?? 0;
  const handleKuantitas = (type: 'plus' | 'min') => {
    if (type === 'plus' && kuantitas < stokTampil) setKuantitas(prev => prev + 1);
    if (type === 'min' && kuantitas > 1) setKuantitas(prev => prev - 1);
  };

  const tambahKeKeranjang = (langsungCheckout = false) => {
    if (!produk) return;
    if (varianList.length > 0 && !selectedVarian) {
      alert('Silakan pilih varian produk terlebih dahulu.');
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
      alert(`${produk.nama_produk} berhasil ditambahkan ke keranjang!`);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold">Memuat detail produk...</div>;
  if (!produk) return <div className="min-h-screen flex items-center justify-center font-bold">Produk tidak ditemukan.</div>;
  
  const galeriAsli = produk.gambar_url || [];

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
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
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-center">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{produk.nama_produk}</h1>
            <div className="flex items-center text-[#d97736] mb-4 text-sm gap-1">★★★★★</div>

            <p className="text-xl font-bold text-[#d97736] mb-1">Rp {hargaTampil.toLocaleString('id-ID')}</p>
            <p className="text-xs text-gray-500 font-medium tracking-wide mb-6">
              Sisa Stok: <span className="text-gray-900">{stokTampil}</span>
            </p>
            <p className="text-xs text-black leading-relaxed text-justify mb-8 line-clamp-4">{produk.deskripsi}</p>

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
                className="w-full bg-[#f0f0f0] hover:bg-gray-300 text-gray-900 font-bold py-3 px-4 rounded-sm text-xs flex items-center justify-center gap-2 uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {stokTampil === 0 ? 'Stok Habis' : 'Add to Cart'}
              </button>
              <button 
                onClick={() => tambahKeKeranjang(true)}
                disabled={stokTampil === 0 || (varianList.length > 0 && !selectedVarian)}
                className="w-full border-2 hover:border-[#d97736] hover:bg-[#d97736] text-black hover:text-white font-bold py-3 px-4 rounded-sm text-xs uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stokTampil === 0 ? 'Stok Habis' : 'Buy Now'}
              </button>
            </div>

            <div className="flex justify-between items-center text-center border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
                <span className="text-[10px] uppercase font-bold">Craftmanship</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" /></svg>
                <span className="text-[10px] uppercase font-bold">Philosophy</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[10px] uppercase font-bold">Longevity</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-start">
            <div className="border border-gray-200 p-6 rounded-sm w-full">
              <h3 className="font-serif font-bold text-lg text-black mb-4">The Story Behind This Piece</h3>
              <div className="flex gap-4 mb-4">
                <div className="w-24 h-24 bg-[#e3e8de] rounded-sm shrink-0 relative overflow-hidden">
                   {produk.gambar_url?.[0] && (
                     <Image src={produk.gambar_url[0]} alt="Story" fill className="object-cover" />
                   )}
                </div>
                <p className="text-[10px] text-black leading-relaxed text-justify">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
              </div>
              <Link href="/history" className="text-[#d97736] font-bold text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">Discover Our Story <span>&rarr;</span></Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-4">
            <div className="bg-[#faf9f5] border border-[#e8e6dd] p-6 rounded-sm">
              <h3 className="font-serif font-bold text-lg text-black mb-6">Product Details</h3>
              <div className="grid grid-cols-2 gap-y-4 text-xs">
                <span className="text-gray-500">Material</span>
                <span className="font-medium text-gray-900">Premium Teak Wood</span>
                
                <span className="text-gray-500">Dimensions</span>
                <span className="font-medium text-gray-900">15 x 10 x 30 cm</span>
                
                <span className="text-gray-500">Weight</span>
                <span className="font-medium text-gray-900">{produk.berat_gram || '850'} gram</span>
                
                <span className="text-gray-500">Finish</span>
                <span className="font-medium text-gray-900">Natural Wax</span>
                
                <span className="text-gray-500">Origin</span>
                <span className="font-medium text-gray-900">West Java, Indonesia</span>
                
                <span className="text-gray-500">Production Time</span>
                <span className="font-medium text-gray-900">Ready Stock</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="flex gap-12 border-b border-gray-200 mb-6">
              {['Description', 'Reviews', 'Care Guide'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === tab ? 'text-black border-b-2 border-[#d97736]' : 'text-gray-400 hover:text-gray-700'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="text-sm text-gray-600 leading-relaxed text-justify">
              {activeTab === 'Description' && (
                <div>
                  <p className="mb-4">{produk.deskripsi}</p>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                </div>
              )}
              
              {activeTab === 'Reviews' && (
                <div>
                  <div className="border border-gray-200 rounded-sm p-6 flex flex-col md:flex-row gap-8 mb-6">
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <span className="text-5xl font-serif font-bold text-gray-900 mb-1">4.9</span>
                      <span className="text-[#d97736] text-sm tracking-widest mb-1">★★★★★</span>
                      <span className="text-[10px] text-gray-500">Based on 240 reviews</span>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex gap-3">
                          <div className="w-12 h-12 bg-gray-100 shrink-0 rounded-sm"></div>
                          <div>
                            <div className="text-[#d97736] text-[10px] mb-1">★★★★★</div>
                            <p className="text-[10px] text-gray-500 line-clamp-3 mb-1">"Kualitas kayunya sangat bagus, ukirannya presisi."</p>
                            <span className="text-[9px] font-bold text-gray-900">Nama Buyer</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs">Ulasan lebih lengkap akan segera hadir dari integrasi sistem rating nyata.</p>
                </div>
              )}

              {activeTab === 'Care Guide' && (
                <ul className="list-disc pl-5 space-y-2">
                  <li>Bersihkan dengan kain lap kering yang lembut dan bersih.</li>
                  <li>Hindari paparan sinar matahari langsung dalam waktu yang sangat lama.</li>
                  <li>Jangan gunakan cairan pembersih kimia keras.</li>
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="bg-[#141414] py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/awan.svg')] bg-[20%_0%] bg-cover bg-center pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-serif font-bold text-white">You May Also Like</h2>
            <Link href="/katalog" className="text-[#d97736] font-bold text-xs uppercase tracking-widest hover:underline flex items-center gap-1">
              View All <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {produkLain.map((item) => (
              <Link href={`/katalog/${item.id}`} key={item.id} className="group">
                <div className="aspect-[4/3] bg-[#e3e8de] rounded-sm mb-4 relative overflow-hidden">
                  {item.gambar_url?.[0] ? (
                    <Image src={item.gambar_url[0]} alt={item.nama_produk} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  
                </div>
                <div className="text-center">
                  <h3 className="text-white font-bold uppercase tracking-wider mb-1 group-hover:text-[#d97736] transition-colors">{item.nama_produk}</h3>
                  <p className="text-white font-serif">Rp {item.harga.toLocaleString('id-ID')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}