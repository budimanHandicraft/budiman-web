'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

interface CartItem {
  id: string;
  nama_produk: string;
  harga: number;
  gambar_url: string;
  kuantitas: number;
}

export default function MarketPage() {
  const [keranjang, setKeranjang] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckout, setIsCheckout] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [namaPenerima, setNamaPenerima] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [alamatLengkap, setAlamatLengkap] = useState('');

  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const savedCart = localStorage.getItem('keranjang_umkm');
    if (savedCart) {
      setKeranjang(JSON.parse(savedCart));
    }

    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      setIsLoggedIn(true);
      const { data: profil } = await supabase
        .from('profil_pelanggan')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profil) {
        setNamaPenerima(profil.nama_lengkap || '');
        setNomorHp(profil.nomor_hp || '');
        setAlamatLengkap(profil.alamat_default || '');
      }
    } else {
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  const hitungTotal = () => {
    return keranjang.reduce((total, item) => total + (item.harga * item.kuantitas), 0);
  };

  const hapusItem = (id: string) => {
    const keranjangBaru = keranjang.filter(item => item.id !== id);
    setKeranjang(keranjangBaru);
    localStorage.setItem('keranjang_umkm', JSON.stringify(keranjangBaru));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!isLoggedIn){
      alert('Silakan masuk (login) terlebih dahulu untuk melanjutkan pembayaran.');
      router.push('/login');
      return;
    }

    if (keranjang.length === 0) return alert('Keranjang masih kosong!');
    if (!alamatLengkap) return alert('Alamat pengiriman wajib diisi!');

    setIsCheckout(true);

    try {
      console.log("Data yang akan dikirim ke Xendit & Supabase:", {
        nama: namaPenerima,
        hp: nomorHp,
        alamat: alamatLengkap,
        items: keranjang,
        total: hitungTotal()
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Simulasi Checkout Berhasil! Nanti ini akan redirect ke halaman Xendit.');
      
      localStorage.removeItem('keranjang_umkm');
      setKeranjang([]);
    } catch (error) {
      alert('Terjadi kesalahan saat memproses pembayaran.');
    } finally {
      setIsCheckout(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Memuat data pesanan...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Keranjang Belanja</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold border-b pb-4 mb-4">Pesanan Anda</h2>
            {keranjang.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Keranjang masih kosong. Yuk belanja dulu di katalog!
                <button onClick={() => router.push('/katalog')} className="block mx-auto mt-4 text-blue-600 font-bold hover:underline">Ke Katalog</button>
              </div>
            ) : (
              <div className="space-y-4">
                {keranjang.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                    <img src={item.gambar_url} alt={item.nama_produk} className="w-20 h-20 object-cover rounded-lg border" />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{item.nama_produk}</h3>
                      <div className="text-sm text-gray-500">{item.kuantitas} x Rp {item.harga.toLocaleString('id-ID')}</div>
                      <div className="font-bold text-blue-600 mt-1">Rp {(item.harga * item.kuantitas).toLocaleString('id-ID')}</div>
                    </div>
                    <button onClick={() => hapusItem(item.id)} className="text-red-500 text-sm font-bold hover:text-red-700 p-2">Hapus</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-[400px]">
            <form onSubmit={handleCheckout} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-10">
              <h2 className="text-lg font-bold border-b pb-4 mb-4">Informasi Pengiriman</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Penerima</label>
                  <input type="text" required value={namaPenerima} onChange={(e) => setNamaPenerima(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nomor WhatsApp</label>
                  <input type="text" required value={nomorHp} onChange={(e) => setNomorHp(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                  <textarea rows={3} required placeholder="Jalan, RT/RW, Desa, Kecamatan, Kota" value={alamatLengkap} onChange={(e) => setAlamatLengkap(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Belanja</span>
                  <span className="font-bold text-gray-800">Rp {hitungTotal().toLocaleString('id-ID')}</span>
                </div>
                <div className="text-xs text-gray-500 mb-4">*Ongkos kirim akan dihitung selanjutnya</div>
              </div>

              <button 
                type="submit" 
                disabled={isCheckout || keranjang.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
                  isCheckout || keranjang.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isCheckout ? 'Memproses Pesanan...' : 'Bayar Sekarang'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}