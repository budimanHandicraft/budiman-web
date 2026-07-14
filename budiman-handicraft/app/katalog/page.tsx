'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface Produk {
  id: string;
  nama_produk: string;
  harga: number;
  stok: number;
  deskripsi: string;
  kategori: string;
  gambar_url: string[];
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

export default function KatalogPage() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kategoriAktif, setKategoriAktif] = useState('ALL PRODUCT');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produk | null>(null);
  const [varianList, setVarianList] = useState<Varian[]>([]);
  const [isFetchingVarian, setIsFetchingVarian] = useState(false);
  const [selectedVarian, setSelectedVarian] = useState<Varian | null>(null);
  const [kuantitas, setKuantitas] = useState(1);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const daftarKategori = [
    { nama: 'ALL PRODUCT', subKategori: [] },
    { nama: 'WAYANG GOLEK', subKategori: ['WG ORDINARY QUALITY', 'WG MEDIUM QUALITY', 'WG MINI & TABUNG', 'WG KARAKTER BINATANG']},
    { nama: 'ALAT MUSIK TRADISIONAL & MAINAN ANAK', subKategori: [] },
    { nama: 'BAHAN HANDICRAFT', subKategori: [] },
    { nama: 'BAMBOO PRODUCT', subKategori: [] },
    { nama: 'HIASAN DEKORASI RUMAH', subKategori: [] },
    { nama: 'MAHARDIKA CULTURAL HERITAGE T-SHIRT', subKategori: [] },
    { nama: 'PANAHAN', subKategori: [] },
    { nama: 'PIPA ROKOK TULANG SAPI', subKategori: [] },
    { nama: 'SOUVENIR & AKSESORIS', subKategori: [] },
    { nama: 'TOPENG', subKategori: [] }
  ];
  const [menuTerbuka, setMenuTerbuka] = useState<string | null>(null);

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

  const produkTampil = kategoriAktif === 'ALL PRODUCT' ? produkList : produkList.filter(p => {
        const kategoriInduk = daftarKategori.find(k => k.nama === kategoriAktif);
        if (kategoriInduk && kategoriInduk.subKategori.length > 0) {
          return p.kategori.toUpperCase() === kategoriAktif || 
                 kategoriInduk.subKategori.includes(p.kategori.toUpperCase());
        }
        return p.kategori.toUpperCase() === kategoriAktif;
      });

  const totalPages = Math.ceil(produkTampil.length / itemsPerPage);
  const currentProducts = produkTampil.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getVisiblePages = () => {
    const batasTampil = 10;
    const lompatan = 4;
    if (totalPages <= batasTampil) {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const kelompokSekarang = Math.floor((currentPage - 1) / lompatan);
    let startPage = (kelompokSekarang * lompatan) + 1;
    let endPage = startPage + batasTampil - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = endPage - batasTampil + 1;
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const bukaModalKeranjang = async (produk: Produk) => {
    setSelectedProduct(produk);
    setKuantitas(1);
    setSelectedVarian(null);
    setIsModalOpen(true);
    setIsFetchingVarian(true);

    const { data, error } = await supabase
      .from('produk_varian')
      .select('*')
      .eq('produk_id', produk.id);

    if (!error && data) {
      setVarianList(data);
    } else {
      setVarianList([]);
    }
    setIsFetchingVarian(false);
  };

  const hargaTampil = selectedVarian?.harga ?? selectedProduct?.harga ?? 0;
  const stokTampil = selectedVarian?.stok ?? selectedProduct?.stok ?? 0;

  const handleKuantitas = (type: 'plus' | 'min') => {
    if (type === 'plus' && kuantitas < stokTampil) setKuantitas(prev => prev + 1);
    if (type === 'min' && kuantitas > 1) setKuantitas(prev => prev - 1);
  };

  const konfirmasiKeranjang = () => {
    if (!selectedProduct) return;
    if (varianList.length > 0 && !selectedVarian) {
      alert('Silakan pilih varian produk terlebih dahulu.');
      return;
    }

    const keranjangLama = localStorage.getItem('keranjang_umkm');
    let keranjang = keranjangLama ? JSON.parse(keranjangLama) : [];
    
    const cartItemId = selectedVarian ? selectedVarian.id : selectedProduct.id;
    const indexProduk = keranjang.findIndex((item: any) => item.id === cartItemId);
    
    if (indexProduk > -1) {
      keranjang[indexProduk].kuantitas += kuantitas;
    } else {
      keranjang.push({
        id: cartItemId, 
        nama_produk: selectedProduct.nama_produk,
        varian_nama: selectedVarian ? `${selectedVarian.nilai_varian_1 || ''} ${selectedVarian.nilai_varian_2 || ''}`.trim() : null,
        harga: hargaTampil,
        gambar_url: selectedProduct.gambar_url,
        kuantitas: kuantitas
      });
    }
    
    localStorage.setItem('keranjang_umkm', JSON.stringify(keranjang));
    alert(`${selectedProduct.nama_produk} berhasil ditambahkan ke keranjang!`);
    setIsModalOpen(false);
  };

  return (
    <main className="w-full min-h-screen bg-white p-20 mx-auto relative">
      <div className="pt-12 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-gray-100 pb-8">
          <div className="max-w-3xl">
            <h4 className="text-[#544f2d] font-bold text-[12px] tracking-[0.2em] uppercase mb-2">Premium Collections</h4>
            <h1 className="text-[48px] font-serif font-bold text-gray-900 mb-4">Budiman Handicraft Catalog</h1>
            <p className="text-black text-[16px] leading-relaxed max-w-2xl text-justify">Jelajahi kurasi eksklusif mahakarya kami. Setiap goresan ukiran dan detail presisi merupakan dedikasi terhadap kelestarian seni budaya Sunda</p>
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
              <div className="absolute inset-0 bg-[url('/awan.svg')] bg-cover bg-[0%_50%] pointer-events-none"></div>
              
              <h3 className="relative z-10 text-2xl font-serif font-bold text-[#ffdb81] mb-6">Collection</h3>
              
              <ul className="relative z-10 space-y-2">
                {daftarKategori.map((item) => {
                  const isAktif = kategoriAktif === item.nama;
                  const hasSub = item.subKategori.length > 0;
                  const isOpen = menuTerbuka === item.nama;

                  return (
                    <li key={item.nama} className="flex flex-col">
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            setKategoriAktif(item.nama);
                            setCurrentPage(1);
                            if (hasSub) {
                              setMenuTerbuka(isOpen ? null : item.nama);
                            } else {
                              setMenuTerbuka(null);
                            }
                          }}
                          className={`flex-1 flex items-center justify-between text-left px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors rounded-sm cursor-pointer ${
                            isAktif ? 'bg-[#ffdb81] text-black' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                        >
                          <span>{item.nama}</span>
                          
                          {hasSub && (
                            <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </button>
                      </div>

                      <div 
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen ? 'grid-rows-[1fr] opacity-100 mt-1' : 'grid-rows-[0fr] opacity-0 pointer-events-none'}`}
                      >
                        <div className="overflow-hidden">
                          <ul className="pl-4 space-y-1 pb-1">
                            {item.subKategori.map((sub) => {
                              const isSubAktif = kategoriAktif === sub;
                              return (
                                <li key={sub}>
                                  <button
                                    onClick={() => {
                                      setKategoriAktif(sub);
                                      setCurrentPage(1);
                                    }}
                                    className={`w-full flex items-center gap-2 text-left px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors rounded-sm cursor-pointer ${
                                      isSubAktif ? 'text-[#ffdb81]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                  >
                                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                    {sub}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-[#f5f4ef] rounded-sm p-6 relative overflow-hidden border border-[#e8e6dd]">
              <div className="absolute inset-0 scale-140 bg-[url('/awan_cream.svg')] bg-cover bg-[0%_50%] pointer-events-none"></div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">Artisan Authenticity</h3>
                <p className="text-gray-600 text-xs leading-relaxed text-justify mb-4">Bukan sekadar barang produksi massal. Setiap karya kami ukir oleh seniman lokal, menjadikannya unik, otentik, dan bernilai tinggi</p>
                <Link href="/artisan" className="text-[#d77723] font-bold text-xs flex items-center gap-1 hover:underline uppercase tracking-wider">Learn more <span>&rarr;</span></Link>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-[#141414] rounded-sm p-8 md:p-10 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="absolute inset-0 bg-[center_10%] bg-[url('/awan.svg')] bg-cover pointer-events-none"></div>
              
              <div className="relative z-10 max-w-lg">
                <h4 className="text-[#ffdb81] font-bold text-xs tracking-[0.2em] uppercase mb-2">Our Heritage Story</h4>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">Preserving Sundanese Soul</h2>
                <p className="text-white text-xs md:text-sm leading-relaxed text-justify">Kami tidak sekadar memahat material alam, kami merawat memori epik Nusantara. Rasakan kedalaman filosofi budi pekerti Sunda dalam setiap mahakarya yang lahir dari dedikasi dan tangan para artisan kebanggaan kami.</p>
              </div>

              <div className="relative z-10 shrink-0 w-full md:w-auto">
                <button className="w-full md:w-auto bg-[#d97736] hover:bg-[#c2662b] text-white font-bold py-3 px-6 rounded-sm text-sm uppercase tracking-wider transition-colors">Explore The Studio</button>
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
                  {currentProducts.map((produk) => (
                    <div key={produk.id} className="flex flex-col group">
                      <Link href={`/katalog/${produk.id}`} className="group-hover:cursor-pointer block">
                        <div className="aspect-square bg-gray-100 rounded-sm mb-4 relative overflow-hidden">
                          {produk.gambar_url ? (
                            <Image src={produk.gambar_url[0]} alt={produk.nama_produk} fill className="object-cover group-hover:scale-105 transition-transform duration-500"/>
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-serif font-bold text-gray-900 mb-1">{produk.nama_produk}</h3>
                        <p className="text-sm font-bold text-gray-800 mb-3">Rp {produk.harga.toLocaleString('id-ID')}</p>
                      </Link>
                      
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 text-justify mb-4 flex-1">{produk.deskripsi}</p>
                      <button onClick={() => bukaModalKeranjang(produk)}
                        className="w-full py-2.5 border-2 border-gray-900 text-gray-900 font-bold text-xs uppercase tracking-widest hover:bg-[#d97736] hover:border-[#d97736] hover:text-white transition-colors rounded-sm cursor-pointer"
                      >Add to Cart
                      </button>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12 pt-8 border-t border-gray-100">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-200 text-black rounded-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >&larr; Prev
                    </button>

                    {getVisiblePages().map((pageNumber) => (
                      <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)}
                        className={`w-10 h-10 flex items-center justify-center border rounded-sm text-sm font-bold transition-colors cursor-pointer ${
                          currentPage === pageNumber ? 'bg-[#d97736] border-[#d97736] text-white' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                      >{pageNumber}
                      </button>
                    ))}

                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-200 text-black rounded-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 cursor-pointer"
                    >Next &rarr;
                    </button>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>

      {/*POP-UP MODAL (VARIANT SELECTION)*/}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col items-center gap-2 mb-4">
                <div className="w-60 h-60 bg-gray-100 rounded-sm flex items-center justify-center shrink-0 relative overflow-hidden border border-gray-200">
                  {selectedProduct.gambar_url?.[0] ? (
                    <Image src={selectedProduct.gambar_url[0]} alt={selectedProduct.nama_produk} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[10px]">No Image</div>
                  )}
                </div>
                <h3 className="font-serif font-bold text-gray-900 text-[16px] leading-tight mt-2">{selectedProduct.nama_produk}</h3>
                <div className="w-full flex flex-row items-center justify-between">
                  <p className="text-[#d97736] font-bold text-[18px]">
                    Rp {hargaTampil.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-gray-500 font-medium tracking-wide">
                    Sisa Stok: <span className="text-gray-900">{stokTampil}</span>
                  </p>
                </div>
              </div>

              {/* Tampilkan Loading atau Varian */}
              {isFetchingVarian ? (
                <div className="py-8 text-center text-sm text-gray-500 font-medium">Memuat spesifikasi...</div>
              ) : varianList.length > 0 ? (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Pilih Varian</p>
                  <div className="flex flex-wrap gap-2 max-h-[160px] overflow-y-auto pr-1 pb-2">
                    {varianList.map((varian) => (
                      <button
                        key={varian.id}
                        onClick={() => {
                          setSelectedVarian(varian);
                          setKuantitas(1);
                        }}
                        className={`px-4 py-2 border rounded-sm text-xs font-bold uppercase transition-all ${
                          selectedVarian?.id === varian.id 
                            ? 'bg-gray-900 border-gray-900 text-white shadow-md scale-95' 
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-900'
                        }`}
                      >
                        {varian.nilai_varian_1} {varian.nilai_varian_2 ? `- ${varian.nilai_varian_2}` : ''}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Pengaturan Kuantitas */}
              <div className="flex items-center justify-between mb-8 border-t border-gray-100 pt-4">
                <span className="text-xs font-bold text-gray-900 uppercase tracking-widest">Kuantitas</span>
                <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
                  <button 
                    onClick={() => handleKuantitas('min')} 
                    disabled={kuantitas <= 1}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <div className="w-12 h-10 flex items-center justify-center font-bold text-sm text-black bg-white border-x border-gray-300">
                    {kuantitas}
                  </div>
                  <button 
                    onClick={() => handleKuantitas('plus')} 
                    disabled={kuantitas >= stokTampil}
                    className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tombol Eksekusi */}
              <button 
                onClick={konfirmasiKeranjang}
                disabled={stokTampil === 0 || (varianList.length > 0 && !selectedVarian)}
                className="w-full bg-[#d97736] hover:bg-[#c2662b] text-white font-bold py-3.5 px-4 rounded-sm text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
              >
                {stokTampil === 0 ? 'Stok Habis' : 'Konfirmasi Keranjang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}