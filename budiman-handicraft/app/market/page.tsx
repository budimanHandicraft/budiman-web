'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface CartItem {
  id: string;
  nama_produk: string;
  harga: number;
  gambar_url: string;
  kuantitas: number;
}

export default function MarketPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [shippingCost, setShippingCost] = useState(0);

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
    fetchProvinces();
    setIsLoading(false);
  }, [supabase]);

  const fetchProvinces = async () => {
    try {
      const res = await fetch('/api/ongkir?type=province');
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setProvinces(data);
      } else {
        console.error("API gagal mengembalikan daftar provinsi:", data);
        setProvinces([]);
      }
    } catch (error) {
      console.error("Gagal memuat provinsi", error);
      setProvinces([]);
    }
  };

  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      setSelectedCity('');
      setShippingCost(0);
      return;
    }

    const fetchCities = async () => {
    try {
      const res = await fetch(`/api/ongkir?type=city&province=${selectedProvince}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCities(data);
      } else {
        console.error("API gagal mengembalikan daftar kota:", data);
        setCities([]); 
      }
    } catch (error) {
      console.error("Gagal memuat kota", error);
      setCities([]);
    }
  };
    fetchCities();
  }, [selectedProvince]);

  useEffect(() => {
    if (!selectedCity) {
      setShippingCost(0);
      return;
    }

    const fetchCost = async () => {
      try {
        const res = await fetch(`/api/ongkir`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin: '22', 
            destination: selectedCity,
            weight: 1000,
            courier: 'jne'
          })
        });
        const data = await res.json();
        
        if (data && data.length > 0) {
          setShippingCost(data[0].cost[0].value);
        }
      } catch (error) {
        console.error("Gagal memuat ongkir", error);
      }
    };
    fetchCost();
  }, [selectedCity]);

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
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@gmail.com" className="w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+62 812..." className="w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition" />
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
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Udin" className="w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Street Address</label>
              <textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Building name, street, and unit number" className="w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition resize-none"></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 italic">Province</label>
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className="w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition appearance-none">
                  <option value="">Select Province</option>
                  {provinces?.map(prov => (
                    <option key={prov.province_id} value={prov.province_id}>{prov.province}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 italic">City</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedProvince} className="w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition appearance-none disabled:opacity-50">
                  <option value="">Select City</option>
                  {cities?.map(city => (
                    <option key={city.city_id} value={city.city_id}>{city.type} {city.city_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 italic">Postcode</label>
                <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="40123" className="w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition" />
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
                <div key={idx} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-[#e3e8de] rounded-sm relative overflow-hidden shrink-0">
                    {item.gambar_url ? (
                      <Image src={item.gambar_url} alt={item.nama_produk} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">No Img</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#d97736] font-bold text-sm mb-1">{item.nama_produk}</h3>
                    <p className="text-white text-xs">Quantity: {item.kuantitas}</p>
                  </div>
                  <div className="text-[#d97736] font-bold text-sm italic">
                    Rp {(item.harga * item.kuantitas).toLocaleString('id-ID')}
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

          <button 
            disabled={cartItems.length === 0 || !selectedCity}
            className="w-full bg-[#d9dbd0] hover:bg-white text-gray-900 font-bold py-4 px-6 rounded-sm flex items-center justify-center gap-3 uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Complete Purchase
          </button>
        </div>
      </section>
    </main>
  );
}