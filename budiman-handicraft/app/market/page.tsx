'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';

interface CartItem {
  id: string;
  nama_produk: string;
  harga: number;
  gambar_url: string;
  kuantitas: number;
  catatan?: string;
}

export default function MarketPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState<any[]>([]);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [shippingCost, setShippingCost] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState<{id: string, kuantitas: number | string, catatan: string} | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const savedCart = localStorage.getItem('keranjang_umkm');
    if (savedCart) setCartItems(JSON.parse(savedCart));
    
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setEmail(session.user.email || '');
        const { data: profil } = await supabase
          .from('profil_pelanggan')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profil) {
          setFullName(profil.nama_lengkap || '');
          setPhone(profil.nomor_hp || '');
          setAddress(profil.alamat_default || '');
        }
      }
    };
    fetchUserData();
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        try {
          const res = await fetch(`/api/ongkir?search=${searchQuery}`);
          const data = await res.json();
          if (Array.isArray(data)) setDestinations(data);
        } catch (error) {
          console.error("Gagal mencari alamat:", error);
        }
      } else {
        setDestinations([]);
      }
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (!selectedDestination) {
      setShippingCost(0);
      return;
    }
    const fetchCost = async () => {
      try {
        const res = await fetch(`/api/ongkir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin: "4816", destination: selectedDestination, weight: "1000", courier: "jne" })
        });
        const data = await res.json();
        if (data?.data && data.data.length > 0) {
          setShippingCost(data.data[0].cost + 5000);
        }
      } catch (error) {
        console.error("Gagal memuat ongkir", error);
      }
    };
    fetchCost();
  }, [selectedDestination]);

  const hapusItem = (id: string) => {
    const konfirmasi = window.confirm("Apakah kamu yakin ingin menghapus produk ini dari keranjang?");
    if (!konfirmasi) return;
    
    const keranjangBaru = cartItems.filter(item => item.id !== id);
    setCartItems(keranjangBaru);
    localStorage.setItem('keranjang_umkm', JSON.stringify(keranjangBaru));
  };

  const bukaModalEdit = (item: CartItem) => {
    setEditData({ id: item.id, kuantitas: item.kuantitas, catatan: item.catatan || '' });
    setIsModalOpen(true);
  };

  const simpanEdit = () => {
    if (!editData) return;
    let finalKuantitas = typeof editData.kuantitas === 'string' ? parseInt(editData.kuantitas) : editData.kuantitas;
    if (isNaN(finalKuantitas) || finalKuantitas < 1) {
      finalKuantitas = 1;
    }
    const keranjangBaru = cartItems.map(item => 
      item.id === editData.id ? { ...item, kuantitas: finalKuantitas, catatan: editData.catatan } : item
    );
    
    setCartItems(keranjangBaru);
    localStorage.setItem('keranjang_umkm', JSON.stringify(keranjangBaru));
    setIsModalOpen(false);
  };

  const handleCheckout = () => {
    alert("Proses Checkout Berhasil! Data pesanan diproses (Simulasi).");
    
    localStorage.removeItem('keranjang_umkm');
    setCartItems([]);
    setShippingCost(0);
    setSelectedDestination('');
    setSearchQuery('');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.harga * item.kuantitas), 0);
  const grandTotal = subtotal + shippingCost;
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <main className="min-h-screen bg-[#faf9f5] flex flex-col font-sans">
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-12">Your Details</h1>
        
        <div className="mb-10">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-3 mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@gmail.com" className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 812..." className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition" />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-3 mb-6">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3v13h2a3 3 0 006 0h6a3 3 0 006 0h2v-5l-3-4zM9 18a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm10 0a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm-1.5-6H17V9h1.5l1.5 2h-1.5z"/></svg>
            Shipping Details
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Recipient Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Udin" className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Street Address</label>
              <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Building name, street, and unit number" className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition resize-none"></textarea>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 italic">Cari Kecamatan / Kota (Ketik minimal 3 huruf)</label>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Contoh: Bandung, Antapani, atau Lembang..." className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition" />
              </div>
              
              {destinations.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2 italic">Pilih Alamat Spesifik</label>
                  <select value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)} className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition appearance-none">
                    <option value="">-- Pilih dari hasil pencarian --</option>
                    {destinations.map(dest => (
                      <option key={dest.id} value={dest.id}>{dest.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 italic">Postcode (Kodepos)</label>
                <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="40123" className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
            Payment Method
          </h2>
          <p className="text-xs text-gray-500 mt-2 ml-8">Pembayaran akan diproses dengan aman setelah Anda menekan tombol di bawah.</p>
        </div>

        <div className="bg-[#f0f0f0] p-6 rounded-sm">
          <h3 className="font-bold text-gray-900 mb-2 italic">The Budiman Promise</h3>
          <p className="text-xs text-gray-600 leading-relaxed text-justify">
            Every piece is meticulously handcrafted by master artisans in West Java. We guarantee 100% cultural authenticity and support for local artisan communities with every purchase.
          </p>
        </div>
      </section>

      <section className="w-full bg-[#161616] mt-auto relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/pattern-awan.png')] bg-cover bg-center pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <h2 className="text-2xl font-serif font-bold text-white mb-8">Order Summary</h2>
          
          <div className="space-y-6 mb-8">
            {cartItems.length === 0 ? (
              <p className="text-gray-400 text-sm">Keranjang Anda masih kosong.</p>
            ) : (
              cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-16 h-16 bg-[#e3e8de] rounded-sm relative overflow-hidden shrink-0 mt-1">
                    {item.gambar_url ? (
                      <Image src={item.gambar_url} alt={item.nama_produk} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-[#d97736] font-bold text-sm mb-1">{item.nama_produk}</h3>
                    <p className="text-white text-xs mb-1">Quantity: {item.kuantitas}</p>
                    {item.catatan && (
                      <p className="text-gray-400 text-[11px] italic line-clamp-2">Catatan: "{item.catatan}"</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-[#d97736] font-bold text-sm italic">
                      Rp {(item.harga * item.kuantitas).toLocaleString('id-ID')}
                    </div>
                    
                    <div className="flex gap-3 mt-1">
                      <button onClick={() => bukaModalEdit(item)} className="text-gray-400 hover:text-white transition-colors cursor-pointer" title="Edit Item">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button onClick={() => hapusItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer" title="Hapus Item">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <hr className="border-gray-600 mb-6" />

          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white font-bold">Subtotal</span>
              <span className="text-white font-bold">RP {subtotal.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white font-bold">Express Shipping</span>
              <span className="text-white font-bold">
                {shippingCost > 0 ? `RP ${Math.round(shippingCost).toLocaleString('id-ID')}` : '-'}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-10">
            <span className="text-3xl font-serif font-bold text-white italic">Grand Total</span>
            <span className="text-2xl font-serif font-bold text-white italic">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>

          <button disabled={cartItems.length === 0 || !selectedDestination} onClick={handleCheckout}
            className="w-full bg-[#d9dbd0] hover:bg-white text-gray-900 font-bold py-4 px-6 rounded-sm flex items-center justify-center gap-3 uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Complete Purchase
          </button>
        </div>
      </section>

      {isModalOpen && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-sm shadow-xl p-6 relative">
            <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Ubah Pesanan</h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Kuantitas</label>
                <input type="number" min="1" value={editData.kuantitas}
                  onChange={(e) => { const val = e.target.value; setEditData({...editData, kuantitas: val === '' ? '' : parseInt(val)});}}
                  className="w-full bg-[#f5f5f5] text-black p-3 rounded-sm border border-transparent focus:border-[#d97736] outline-none transition"/>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Catatan untuk Penjual</label>
                <textarea rows={3} value={editData.catatan} onChange={(e) => setEditData({...editData, catatan: e.target.value})}
                  placeholder="Contoh: Tolong dibungkus rapi, warna bajunya disamakan..." className="w-full bg-[#f5f5f5] text-black p-3 rounded-sm border border-transparent focus:border-[#d97736] outline-none transition resize-none"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider hover:bg-gray-50 rounded-sm transition cursor-pointer">
                Batal
              </button>
              <button onClick={simpanEdit} className="flex-1 py-3 bg-[#d97736] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#c2662b] rounded-sm transition cursor-pointer">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}