'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

interface Produk {
  id: string;
  nama_produk: string;
  deskripsi: string;
  harga: number;
  berat_gram: number;
  stok: number;
  gambar_url: string;
  is_active: boolean;
  kategori: string;
}

export default function AdminProduk() {
  const [activeTab, setActiveTab] = useState<'daftar' | 'tambah'>('daftar');
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Umum');
  const [deskripsi, setDeskripsi] = useState('');
  const [harga, setHarga] = useState('');
  const [berat, setBerat] = useState('1000');
  const [stok, setStok] = useState('');
  const [fileGambar, setFileGambar] = useState<File | null>(null);

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setProdukList(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileGambar) return alert('Pilih gambar dulu ya!');
    
    setIsLoading(true);

    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/webp'
      };
      
      const compressedBlob = await imageCompression(fileGambar, options);
      const compressedFile = new File([compressedBlob], `compressed_${Date.now()}.webp`, {
        type: 'image/webp',
      });

      const namaFileUnik = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('katalog-produk')
        .upload(namaFileUnik, compressedFile);

      if (storageError) throw storageError;

      const { data: publicUrlData } = supabase
        .storage
        .from('katalog-produk')
        .getPublicUrl(namaFileUnik);

      const { error: dbError } = await supabase
        .from('produk')
        .insert([{
          nama_produk: nama,
          kategori: kategori || 'Umum',
          deskripsi: deskripsi,
          harga: parseInt(harga),
          berat_gram: parseInt(berat),
          stok: parseInt(stok),
          gambar_url: publicUrlData.publicUrl,
        }]);

      if (dbError) throw dbError;
      alert('Produk berhasil ditambahkan dan gambar sukses dikompresi!');
      
      setNama(''); setKategori('Umum'); setDeskripsi(''); setHarga(''); setBerat('1000'); setStok(''); setFileGambar(null);
      fetchProduk();
      setActiveTab('daftar');

    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, gambarUrl: string) => {
    const confirmDelete = confirm('Yakin ingin menghapus produk ini?');
    if (!confirmDelete) return;

    const namaFile = gambarUrl.split('/').pop();

    if (namaFile) {
        await supabase.storage.from('katalog-produk').remove([namaFile]);
    }

    await supabase.from('produk').delete().eq('id', id);
    
    alert('Produk berhasil dihapus!');
    fetchProduk();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Produk</h1>
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button onClick={() => setActiveTab('daftar')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'daftar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Daftar Produk
        </button>
        <button onClick={() => setActiveTab('tambah')} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === 'tambah' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          + Tambah Produk Baru
        </button>
      </div>

      {activeTab === 'daftar' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="text-black p-3">Foto</th>
                <th className="text-black p-3">Nama Produk</th>
                <th className="text-black p-3">Kategori</th>
                <th className="text-black p-3">Harga</th>
                <th className="text-black p-3">Stok</th>
                <th className="text-black p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produkList.length === 0 ? (
                <tr><td colSpan={6} className="text-center p-4 text-gray-500">Belum ada produk.</td></tr>
              ) : (
                produkList.map((produk) => (
                  <tr key={produk.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <img src={produk.gambar_url} alt={produk.nama_produk} className="w-16 h-16 object-cover rounded-md border" />
                    </td>
                    <td className="text-black p-3 font-medium">{produk.nama_produk}</td>
                    <td className="p-3">
                      <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{produk.kategori || 'Umum'}</span>
                    </td>
                    <td className="text-black p-3">Rp {produk.harga.toLocaleString('id-ID')}</td>
                    <td className="text-black p-3">{produk.stok}</td>
                    <td className="text-black p-3">
                      <button onClick={() => handleDelete(produk.id, produk.gambar_url)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition cursor-pointer">Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'tambah' && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border max-w-2xl">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium mb-1">Nama Kerajinan</label>
                <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} className="text-black w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-black block text-sm font-medium mb-1">Kategori</label>
                <input type="text" required placeholder="Misal: Souvenir, Wayang, Pakaian" value={kategori} onChange={(e) => setKategori(e.target.value)} className="text-black w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="text-black block text-sm font-medium mb-1">Deskripsi</label>
              <textarea rows={3} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="text-black w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium mb-1">Harga (Rp)</label>
                <input type="number" required value={harga} onChange={(e) => setHarga(e.target.value)} className="text-black w-full border p-2 rounded outline-none" />
              </div>
              <div>
                <label className="text-black block text-sm font-medium mb-1">Stok Barang</label>
                <input type="number" required value={stok} onChange={(e) => setStok(e.target.value)} className="text-black w-full border p-2 rounded outline-none" />
              </div>
            </div>

            <div>
              <label className="text-black block text-sm font-medium mb-1">Berat Barang (Gram) <span className="text-gray-400 font-normal">- Default 1000g (1kg)</span></label>
              <input type="number" required value={berat} onChange={(e) => setBerat(e.target.value)} className="text-black w-full border p-2 rounded outline-none" />
            </div>

            <div>
              <label className="text-black block text-sm font-medium mb-1">Upload Foto Produk</label>
              <input type="file" accept="image/*" onChange={(e) => setFileGambar(e.target.files?.[0] || null)} className="text-black w-full border p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              <p className="text-xs text-gray-400 mt-1 italic">Note: Sistem otomatis memperkecil ukuran foto (WebP - Max 100KB) agar website tetap cepat.</p>
            </div>

            <button type="submit" disabled={isLoading} className={`mt-4 w-full text-white font-bold py-3 rounded-lg transition cursor-pointer ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
              {isLoading ? 'Mengompresi & Menyimpan...' : 'Simpan Produk Baru'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}