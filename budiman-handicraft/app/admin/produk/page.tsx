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
  gambar_url: string[];
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
  const [fileGambar, setFileGambar] = useState<FileList | null>(null);

  const [filterKategori, setFilterKategori] = useState('SEMUA');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Produk | null>(null);
  const [editFileGambar, setEditFileGambar] = useState<FileList | null>(null);

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

  const uploadMultipleImages = async (files: FileList) => {
    const urls: string[] = [];
    const options = { maxSizeMB: 0.1, maxWidthOrHeight: 800, useWebWorker: true, fileType: 'image/webp' };
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], `compressed_${Date.now()}_${i}.webp`, { type: 'image/webp' });
      const namaFileUnik = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      
      const { error: storageError } = await supabase.storage.from('katalog-produk').upload(namaFileUnik, compressedFile);
      if (storageError) throw storageError;
      
      const { data: publicUrlData } = supabase.storage.from('katalog-produk').getPublicUrl(namaFileUnik);
      urls.push(publicUrlData.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileGambar || fileGambar.length === 0) return alert('Pilih gambar dulu ya!');
    
    setIsLoading(true);
    try {
      const urlGambarGabungan = await uploadMultipleImages(fileGambar);

      const { error: dbError } = await supabase
        .from('produk')
        .insert([{
          nama_produk: nama,
          kategori: kategori || 'Umum',
          deskripsi: deskripsi,
          harga: parseInt(harga),
          berat_gram: parseInt(berat),
          stok: parseInt(stok),
          gambar_url: urlGambarGabungan,
        }]);

      if (dbError) throw dbError;
      alert('Produk berhasil ditambahkan!');
      
      setNama(''); setKategori('Umum'); setDeskripsi(''); setHarga(''); setBerat('1000'); setStok(''); setFileGambar(null);
      fetchProduk();
      setActiveTab('daftar');
    } catch (error: any) {
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const bukaModalEdit = (produk: Produk) => {
    setEditData(produk);
    setEditFileGambar(null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    
    setIsLoading(true);
    try {
      let finalImageUrl: string[] = editData.gambar_url;
      if (editFileGambar && editFileGambar.length > 0) {
        finalImageUrl = await uploadMultipleImages(editFileGambar);
      }

      const { error: dbError } = await supabase
        .from('produk')
        .update({
          nama_produk: editData.nama_produk,
          kategori: editData.kategori,
          deskripsi: editData.deskripsi,
          harga: editData.harga,
          berat_gram: editData.berat_gram,
          stok: editData.stok,
          gambar_url: finalImageUrl,
        })
        .eq('id', editData.id);

      if (dbError) throw dbError;
      alert('Produk berhasil diperbarui!');
      
      setIsEditModalOpen(false);
      fetchProduk();
    } catch (error: any) {
      alert(`Gagal mengupdate produk: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, gambarUrl: string[]) => {
    const confirmDelete = confirm('Yakin ingin menghapus produk ini?');
    if (!confirmDelete) return;
    for (const url of gambarUrl) {
      const namaFile = url.split('/').pop();
      if (namaFile) {
        await supabase.storage.from('katalog-produk').remove([namaFile]);
      }
    }

    await supabase.from('produk').delete().eq('id', id);
    alert('Produk berhasil dihapus!');
    fetchProduk();
  };

  const daftarKategoriUnik = ['SEMUA', ...Array.from(new Set(produkList.map(p => p.kategori)))];  
  const produkTampil = filterKategori === 'SEMUA' ? produkList : produkList.filter(p => p.kategori === filterKategori);
  const totalPages = Math.ceil(produkTampil.length / itemsPerPage);
  const currentProducts = produkTampil.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manajemen Produk</h1>
      
      <div className="flex space-x-4 mb-6 border-b pb-2">
        <button onClick={() => setActiveTab('daftar')} className={`px-4 py-2 rounded-t-lg font-semibold cursor-pointer transition-colors ${activeTab === 'daftar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          Daftar Produk
        </button>
        <button onClick={() => setActiveTab('tambah')} className={`px-4 py-2 rounded-t-lg font-semibold cursor-pointer transition-colors ${activeTab === 'tambah' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
          + Tambah Produk Baru
        </button>
      </div>

      {activeTab === 'daftar' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Total: {produkTampil.length} Produk</h2>
            <select value={filterKategori} onChange={(e) => { setFilterKategori(e.target.value); setCurrentPage(1); }} className="text-black border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500">
              {daftarKategoriUnik.map((kat, idx) => (
                <option key={idx} value={kat}>{kat}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="text-black p-3 w-20">Foto</th>
                  <th className="text-black p-3">Nama Produk</th>
                  <th className="text-black p-3">Kategori</th>
                  <th className="text-black p-3">Harga</th>
                  <th className="text-black p-3">Stok</th>
                  <th className="text-black p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-8 text-gray-500">Produk tidak ditemukan.</td></tr>
                ) : (
                  currentProducts.map((produk) => {
                    const gambarUtama = produk.gambar_url?.[0] || '';
                    return (
                      <tr key={produk.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <img src={gambarUtama} alt={produk.nama_produk} className="w-14 h-14 object-cover rounded-md border" />
                        </td>
                        <td className="text-black p-3 font-medium">{produk.nama_produk}</td>
                        <td className="p-3">
                          <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">{produk.kategori}</span>
                        </td>
                        <td className="text-black p-3">Rp {produk.harga.toLocaleString('id-ID')}</td>
                        <td className="text-black p-3">{produk.stok ?? 0}</td>
                        
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => bukaModalEdit(produk)} className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition cursor-pointer text-sm">Edit</button>
                            <button onClick={() => handleDelete(produk.id, produk.gambar_url || [])} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition cursor-pointer text-sm">Hapus</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6 pt-4 border-t">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 text-black cursor-pointer"
              >Prev</button>
              <span className="px-4 py-1 text-sm font-bold text-gray-700">Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 text-black cursor-pointer"
              >Next</button>
            </div>
          )}
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
                <input type="text" required placeholder="Misal: Souvenir, Wayang" value={kategori} onChange={(e) => setKategori(e.target.value)} className="text-black w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="text-black block text-sm font-medium mb-1">Deskripsi</label>
              <textarea rows={3} required value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="text-black w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-black block text-sm font-medium mb-1">Harga (Rp)</label>
                <input type="number" required min="0" value={harga} onChange={(e) => setHarga(e.target.value)} className="text-black w-full border p-2 rounded outline-none" />
              </div>
              <div>
                <label className="text-black block text-sm font-medium mb-1">Stok Barang</label>
                <input type="number" required min="0" value={stok} onChange={(e) => setStok(e.target.value)} className="text-black w-full border p-2 rounded outline-none" />
              </div>
            </div>

            <div>
              <label className="text-black block text-sm font-medium mb-1">Berat Barang (Gram)</label>
              <input type="number" required min="0" value={berat} onChange={(e) => setBerat(e.target.value)} className="text-black w-full border p-2 rounded outline-none" />
            </div>

            <div>
              <label className="text-black block text-sm font-medium mb-1">Upload Foto Produk (Bisa Pilih Banyak)</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setFileGambar(e.target.files)} className="text-black w-full border p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
            </div>

            <button type="submit" disabled={isLoading} className={`mt-4 w-full text-white font-bold py-3 rounded-lg transition cursor-pointer ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
              {isLoading ? 'Menyimpan & Mengompresi Foto...' : 'Simpan Produk Baru'}
            </button>
          </div>
        </form>
      )}

      {isEditModalOpen && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleUpdate} className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Edit Produk</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-black block text-sm font-medium mb-1">Nama</label>
                  <input type="text" required value={editData.nama_produk} onChange={(e) => setEditData({...editData, nama_produk: e.target.value})} className="text-black w-full border p-2 rounded outline-none" />
                </div>
                <div>
                  <label className="text-black block text-sm font-medium mb-1">Kategori</label>
                  <input type="text" required value={editData.kategori} onChange={(e) => setEditData({...editData, kategori: e.target.value})} className="text-black w-full border p-2 rounded outline-none" />
                </div>
              </div>

              <div>
                <label className="text-black block text-sm font-medium mb-1">Deskripsi</label>
                <textarea rows={3} required value={editData.deskripsi} onChange={(e) => setEditData({...editData, deskripsi: e.target.value})} className="text-black w-full border p-2 rounded outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-black block text-sm font-medium mb-1">Harga (Rp)</label>
                  <input type="number" required min="0" value={editData.harga} onChange={(e) => setEditData({...editData, harga: parseInt(e.target.value) || 0})} className="text-black w-full border p-2 rounded outline-none" />
                </div>
                <div>
                  <label className="text-black block text-sm font-medium mb-1">Stok</label>
                  <input type="number" required min="0" value={editData.stok} onChange={(e) => setEditData({...editData, stok: parseInt(e.target.value) || 0})} className="text-black w-full border p-2 rounded outline-none" />
                </div>
                <div>
                  <label className="text-black block text-sm font-medium mb-1">Berat (g)</label>
                  <input type="number" required min="0" value={editData.berat_gram} onChange={(e) => setEditData({...editData, berat_gram: parseInt(e.target.value) || 0})} className="text-black w-full border p-2 rounded outline-none" />
                </div>
              </div>

              <div className="mt-2 border-t pt-4">
                <label className="text-black block text-sm font-medium mb-1">Timpa/Ganti Foto Lama (Opsional)</label>
                <input type="file" multiple accept="image/*" onChange={(e) => setEditFileGambar(e.target.files)} className="text-black w-full border p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer" />
                <p className="text-xs text-gray-400 mt-1 italic">Kosongkan jika tidak ingin mengubah foto. Jika diisi, foto lama akan tertimpa (Bisa Upload Banyak).</p>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 border text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition cursor-pointer">
                  Batal
                </button>
                <button type="submit" disabled={isLoading} className={`flex-1 text-white font-bold py-3 rounded-lg transition cursor-pointer ${isLoading ? 'bg-gray-400' : 'bg-orange-600 hover:bg-orange-700'}`}>
                  {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}