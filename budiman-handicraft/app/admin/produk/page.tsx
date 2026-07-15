'use client';

import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { createBrowserClient } from '@supabase/ssr';

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

interface Varian {
  id: string;
  produk_id: string;
  tipe_varian_1: string | null;
  nilai_varian_1: string | null;
  tipe_varian_2: string | null;
  nilai_varian_2: string | null;
  harga: number | string | null;
  stok: number | string | null;
  isNew?: boolean;
}

export default function AdminProduk() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
  const [isKategoriOpen, setIsKategoriOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState<Produk | null>(null);
  const [editFileGambar, setEditFileGambar] = useState<FileList | null>(null);

  const [varianList, setVarianList] = useState<Varian[]>([]);
  const [isLoadingVarian, setIsLoadingVarian] = useState(false);

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
      const namaFileUnik = `produk/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const { error: storageError } = await supabase.storage.from('katalog-produk').upload(namaFileUnik, compressedFile);
      if (storageError) throw storageError;
      
      const { data } = supabase.storage.from('katalog-produk').getPublicUrl(namaFileUnik);
      if (data?.publicUrl) {
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileGambar || fileGambar.length === 0) return alert('Pilih gambar dulu ya!');
    
    setIsLoading(true);
    try {
      const urlGambarGabungan = await uploadMultipleImages(fileGambar);
      const payloadData = {
        nama_produk: nama,
        kategori: kategori || 'Umum',
        deskripsi: deskripsi,
        harga: parseInt(harga),
        berat_gram: parseInt(berat),
        stok: parseInt(stok),
        gambar_url: urlGambarGabungan,
      };

      const { error: dbError } = await supabase
        .from('produk')
        .insert([payloadData]);

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

  const bukaModalEdit = async (produk: Produk) => {
    setEditData(produk);
    setEditFileGambar(null);
    setVarianList([]);
    setIsEditModalOpen(true);
    
    setIsLoadingVarian(true);
    const { data } = await supabase
      .from('produk_varian')
      .select('*')
      .eq('produk_id', produk.id)
      .order('created_at', { ascending: true });
      
    if (data) setVarianList(data);
    setIsLoadingVarian(false);
  };

  const tambahVarianKosong = () => {
    if (!editData) return;
    setVarianList([...varianList, {
      id: `temp-${Date.now()}`,
      produk_id: editData.id,
      tipe_varian_1: '',
      nilai_varian_1: '',
      tipe_varian_2: null,
      nilai_varian_2: null,
      harga: '',
      stok: '',
      isNew: true
    }]);
  };

  const updateLocalVarian = (index: number, field: keyof Varian, value: string) => {
    const newList = [...varianList];
    newList[index] = { ...newList[index], [field]: value };
    setVarianList(newList);
  };

  const hapusLocalVarian = async (index: number, id: string, isNew?: boolean) => {
    const konfirmasi = confirm('Yakin hapus varian ini?');
    if (!konfirmasi) return;
    if (!isNew) {
      await supabase.from('produk_varian').delete().eq('id', id);
    }
    
    const newList = [...varianList];
    newList.splice(index, 1);
    setVarianList(newList);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    
    setIsLoading(true);
    try {
      let finalImageUrl: string[] = editData.gambar_url || []; 
      if (editFileGambar && editFileGambar.length > 0) {
        finalImageUrl = await uploadMultipleImages(editFileGambar);
      }

      const payloadUpdate = {
        nama_produk: editData.nama_produk,
        kategori: editData.kategori,
        deskripsi: editData.deskripsi,
        harga: editData.harga,
        berat_gram: editData.berat_gram,
        stok: editData.stok,
        gambar_url: finalImageUrl,
      };

      const { error: dbError } = await supabase
        .from('produk')
        .update(payloadUpdate)
        .eq('id', editData.id);

      if (dbError) throw dbError;
      if (varianList.length > 0) {
        const variantsToSave = varianList.map(v => {
          const payload: any = { ...v };
          if (payload.isNew) {
             delete payload.id;
             delete payload.isNew;
          }
          
          payload.harga = (payload.harga === '' || payload.harga === null || isNaN(Number(payload.harga))) ? null : parseInt(payload.harga);
          payload.stok = (payload.stok === '' || payload.stok === null || isNaN(Number(payload.stok))) ? null : parseInt(payload.stok);
          payload.tipe_varian_1 = payload.tipe_varian_1 === '' ? null : payload.tipe_varian_1;
          payload.nilai_varian_1 = payload.nilai_varian_1 === '' ? null : payload.nilai_varian_1;

          return payload;
        });

        const { error: varianError } = await supabase.from('produk_varian').upsert(variantsToSave);
        if (varianError) throw varianError;
      }

      alert('Produk & Varian berhasil diperbarui!');
      setIsEditModalOpen(false);
      fetchProduk();
    } catch (error: any) {
      alert(`Gagal mengupdate produk: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, gambarUrl: string[]) => {
    const confirmDelete = confirm('Yakin ingin menghapus produk ini beserta seluruh variannya?');
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
  const totalPages = Math.ceil(produkTampil.length / itemsPerPage) || 1;
  const currentProducts = produkTampil.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full mt-22 p-8 relative min-h-screen flex flex-col">
      <div className="absolute top-6 right-20 w-[300px] h-[240px] bg-[url('/awanKuning.svg')] bg-cover opacity-50 pointer-events-none transform"></div>
      <div className="relative z-10 max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <h1 className="text-4xl font-serif font-bold text-black tracking-wide mb-4">Kelola Produk</h1>
        <div className="flex space-x-2 mb-4 border-b-2 border-[#df9e3d]">
          <button onClick={() => setActiveTab('daftar')} 
            className={`px-6 py-2.5 rounded-t-sm font-bold text-sm tracking-widest uppercase transition-colors ${activeTab === 'daftar' ? 'bg-[#df9e3d] text-black shadow-md' : 'bg-transparent text-gray-500 hover:text-black hover:bg-[#fcebaf]'}`}
          >
            Daftar Produk
          </button>
          <button onClick={() => setActiveTab('tambah')} 
            className={`px-6 py-2.5 rounded-t-sm font-bold text-sm tracking-widest uppercase transition-colors ${activeTab === 'tambah' ? 'bg-[#df9e3d] text-black shadow-md' : 'bg-transparent text-gray-500 hover:text-black hover:bg-[#fcebaf]'}`}
          >
            + Tambah Produk Baru
          </button>
        </div>

        {activeTab === 'daftar' && (
          <div className="flex flex-col flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-lg font-bold text-black uppercase tracking-wider">Total: {produkTampil.length} Produk</h2>
              <div className="relative flex items-center">
                <div className="bg-[#df9e3d] text-black font-bold text-sm px-6 py-2 rounded-l-full shadow-sm z-10">Kategori</div>
                <div onClick={() => setIsKategoriOpen(!isKategoriOpen)}
                  className="bg-white border border-gray-200 text-black text-sm px-4 py-2 rounded-r-full shadow-sm cursor-pointer min-w-[140px] flex justify-between items-center -ml-2 pl-4"
                >
                  {filterKategori}
                  <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] ml-2 font-bold">&#8595;</span>
                </div>
                
                {isKategoriOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-[#fcebaf] border-2 border-[#df9e3d] shadow-xl rounded-md overflow-hidden z-50 min-w-[140px]">
                    <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col">
                      {daftarKategoriUnik.map((kat, idx) => (
                        <div key={idx} onClick={() => { setFilterKategori(kat); setCurrentPage(1); setIsKategoriOpen(false); }}
                          className={`px-4 py-2 text-sm cursor-pointer transition-colors ${filterKategori === kat ? 'bg-[#d99738] text-white font-bold' : 'text-black hover:bg-[#fae498]'}`}
                        >
                          {kat}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#fcebaf] rounded-lg shadow-xl overflow-hidden border border-[#df9e3d] flex-1">
              <table className="w-full text-left text-md">
                <thead className="bg-[#d99738] text-black font-bold">
                  <tr>
                    <th className="px-4 py-4 border-b-2 border-[#b57a26] w-20 text-center">Foto</th>
                    <th className="px-4 py-4 border-b-2 border-[#b57a26]">Nama Produk</th>
                    <th className="px-4 py-4 border-b-2 border-[#b57a26] text-center">Kategori</th>
                    <th className="px-4 py-4 border-b-2 border-[#b57a26] text-center">Harga Dasar</th>
                    <th className="px-4 py-4 border-b-2 border-[#b57a26] text-center">Stok Induk</th>
                    <th className="px-4 py-4 border-b-2 border-[#b57a26] text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-black font-medium">Produk tidak ditemukan.</td></tr>
                  ) : (
                    currentProducts.map((produk) => {
                      const gambarUtama = produk.gambar_url?.[0];
                      return (
                        <tr key={produk.id} className="border-b border-[#ebd28a] text-black font-medium hover:bg-[#fae498] transition-colors h-14">
                          <td className="px-4 py-2 flex justify-center">
                            {gambarUtama ? (
                              <img src={gambarUtama} alt={produk.nama_produk} className="w-10 h-10 object-cover rounded-sm border border-[#d99738]" />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 border border-[#d99738] rounded-sm flex items-center justify-center text-[10px] text-gray-500">No Img</div>
                            )}
                          </td>
                          <td className="px-4 py-2">{produk.nama_produk}</td>
                          <td className="px-4 py-2 text-center">
                            <span className="inline-block text-center leading-relaxed bg-white border border-[#df9e3d] text-black px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider">
                              {produk.kategori}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">Rp {produk.harga.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-2 text-center">{produk.stok ?? 0}</td>
                          <td className="px-4 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => bukaModalEdit(produk)} className="bg-black text-[#df9e3d] px-3 py-1.5 rounded-sm hover:bg-gray-800 hover:text-white transition cursor-pointer text-[11px] font-bold uppercase tracking-wider">Edit / Varian</button>
                              <button onClick={() => handleDelete(produk.id, produk.gambar_url || [])} className="bg-red-700 text-white px-3 py-1.5 rounded-sm hover:bg-red-800 transition cursor-pointer text-[11px] font-bold uppercase tracking-wider">Hapus</button>
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
              <div className="flex justify-center items-center gap-4 mt-8">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#d99738] hover:bg-[#df9e3d] text-black rounded-md text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  SEBELUMNYA
                </button>
                <span className="text-black font-bold text-sm border-b-2 border-[#d99738] pb-1">Halaman {currentPage} dari {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#d99738] hover:bg-[#df9e3d] text-black rounded-md text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  SELANJUTNYA
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tambah' && (
          <form onSubmit={handleSubmit} className="bg-[#fcebaf] p-8 md:p-10 rounded-lg shadow-xl border border-[#df9e3d] max-w-3xl">
            <h3 className="text-2xl font-serif font-bold text-black mb-6 border-b border-[#df9e3d] pb-2">Informasi Produk Induk</h3>
            <div className="grid grid-cols-1 gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-black block text-xs font-bold uppercase tracking-wider mb-2">Nama Kerajinan</label>
                  <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} className="w-full bg-white border border-[#d99738] p-3 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-black block text-xs font-bold uppercase tracking-wider mb-2">Kategori</label>
                  <input type="text" required placeholder="Misal: Souvenir, Wayang" value={kategori} onChange={(e) => setKategori(e.target.value)} className="w-full bg-white border border-[#d99738] p-3 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                </div>
              </div>

              <div>
                <label className="text-black block text-xs font-bold uppercase tracking-wider mb-2">Deskripsi</label>
                <textarea rows={4} required value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="w-full bg-white border border-[#d99738] p-3 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-black block text-xs font-bold uppercase tracking-wider mb-2">Harga Dasar (Rp)</label>
                  <input type="number" required min="0" value={harga} onChange={(e) => setHarga(e.target.value)} className="w-full bg-white border border-[#d99738] p-3 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-black block text-xs font-bold uppercase tracking-wider mb-2">Stok Induk</label>
                  <input type="number" required min="0" value={stok} onChange={(e) => setStok(e.target.value)} className="w-full bg-white border border-[#d99738] p-3 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-black block text-xs font-bold uppercase tracking-wider mb-2">Berat (Gram)</label>
                  <input type="number" required min="0" value={berat} onChange={(e) => setBerat(e.target.value)} className="w-full bg-white border border-[#d99738] p-3 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                </div>
              </div>

              <div className="mt-2">
                <label className="text-black block text-xs font-bold uppercase tracking-wider mb-2">Upload Foto (Bisa Pilih Banyak)</label>
                <div className="bg-white border border-[#d99738] p-2 rounded-sm flex items-center">
                  <input type="file" multiple accept="image/*" onChange={(e) => setFileGambar(e.target.files)} className="text-black w-full file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-black file:text-[#df9e3d] hover:file:bg-gray-800 cursor-pointer text-sm" />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className={`mt-6 w-full font-bold uppercase tracking-widest py-4 rounded-sm transition-colors cursor-pointer ${isLoading ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-black text-[#df9e3d] hover:bg-gray-800 hover:text-white'}`}>
                {isLoading ? 'Memproses Data...' : 'Simpan Produk Baru'}
              </button>
              <p className="text-[11px] text-gray-600 text-center italic">Catatan: Untuk menambahkan varian (warna, ukuran, dll), silakan simpan produk ini lalu klik tombol "Edit / Varian" di tab Daftar Produk.</p>
            </div>
          </form>
        )}

        {isEditModalOpen && editData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pl-64 pt-28 bg-black/60 backdrop-blur-sm">
            <form onSubmit={handleUpdate} className="bg-[#fcfaf5] border-2 border-[#df9e3d] w-full max-w-5xl rounded-lg shadow-2xl p-8 relative max-h-[80vh] overflow-y-auto custom-scrollbar">
              <h3 className="text-2xl font-serif font-bold text-black mb-8 border-b-2 border-[#df9e3d] pb-4">Edit Data Induk & Manajemen Varian</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-5">
                  <h4 className="text-sm font-bold text-black uppercase tracking-widest bg-[#fcebaf] border border-[#df9e3d] px-4 py-2 rounded-sm text-center">Detail Produk Induk</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-black block text-[10px] font-bold uppercase tracking-wider mb-1">Nama Produk</label>
                      <input type="text" required value={editData.nama_produk} onChange={(e) => setEditData({...editData, nama_produk: e.target.value})} className="w-full bg-white border border-[#d99738] p-2 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-black block text-[10px] font-bold uppercase tracking-wider mb-1">Kategori</label>
                      <input type="text" required value={editData.kategori} onChange={(e) => setEditData({...editData, kategori: e.target.value})} className="w-full bg-white border border-[#d99738] p-2 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                    </div>
                  </div>

                  <div>
                    <label className="text-black block text-[10px] font-bold uppercase tracking-wider mb-1">Deskripsi</label>
                    <textarea rows={4} required value={editData.deskripsi} onChange={(e) => setEditData({...editData, deskripsi: e.target.value})} className="w-full bg-white border border-[#d99738] p-2 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-black block text-[10px] font-bold uppercase tracking-wider mb-1">Harga Dasar</label>
                      <input type="number" required min="0" value={editData.harga} onChange={(e) => setEditData({...editData, harga: parseInt(e.target.value) || 0})} className="w-full bg-white border border-[#d99738] p-2 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-black block text-[10px] font-bold uppercase tracking-wider mb-1">Stok Total</label>
                      <input type="number" required min="0" value={editData.stok} onChange={(e) => setEditData({...editData, stok: parseInt(e.target.value) || 0})} className="w-full bg-white border border-[#d99738] p-2 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-black block text-[10px] font-bold uppercase tracking-wider mb-1">Berat (g)</label>
                      <input type="number" required min="0" value={editData.berat_gram} onChange={(e) => setEditData({...editData, berat_gram: parseInt(e.target.value) || 0})} className="w-full bg-white border border-[#d99738] p-2 text-sm text-black rounded-sm focus:border-black outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="mt-4 border-t border-gray-300 pt-5">
                    <label className="text-black block text-[10px] font-bold uppercase tracking-wider mb-2">Timpa Foto Lama (Opsional)</label>
                    <div className="bg-white border border-[#d99738] p-1.5 rounded-sm flex items-center">
                      <input type="file" multiple accept="image/*" onChange={(e) => setEditFileGambar(e.target.files)} className="text-black w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-wider file:bg-[#d99738] file:text-black hover:file:bg-[#b57a26] hover:file:text-white cursor-pointer text-xs" />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1.5 italic">Kosongkan jika tidak ingin mengubah foto. Jika diisi, foto lama akan tertimpa permanen.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t md:border-t-0 md:border-l border-gray-300 pt-8 md:pt-0 pl-0 md:pl-10">
                  <h4 className="text-sm font-bold text-black uppercase tracking-widest bg-[#fcebaf] border border-[#df9e3d] px-4 py-2 rounded-sm flex justify-between items-center">
                    Daftar Varian
                    {isLoadingVarian && <span className="text-[10px] text-gray-500 lowercase normal-case italic">Memuat data...</span>}
                  </h4>
                  
                  <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {varianList.map((v, idx) => (
                      <div key={v.id} className="text-black flex flex-wrap gap-3 items-end bg-[#fcebaf] p-4 rounded-sm border border-[#df9e3d] shadow-sm relative">
                        <div className="flex-1 min-w-[100px]">
                          <label className="text-[9px] font-bold uppercase mb-1 block tracking-wider">Tipe (Msl: Warna)</label>
                          <input type="text" placeholder="Kosong = Hapus" value={v.tipe_varian_1 || ''} onChange={(e) => updateLocalVarian(idx, 'tipe_varian_1', e.target.value)} className="w-full bg-white border border-[#d99738] p-1.5 text-xs rounded-sm outline-none focus:border-black" />
                        </div>
                        <div className="flex-1 min-w-[100px]">
                          <label className="text-[9px] font-bold uppercase mb-1 block tracking-wider">Nilai (Msl: Emas)</label>
                          <input type="text" value={v.nilai_varian_1 || ''} onChange={(e) => updateLocalVarian(idx, 'nilai_varian_1', e.target.value)} className="w-full bg-white border border-[#d99738] p-1.5 text-xs rounded-sm outline-none focus:border-black" />
                        </div>
                        <div className="flex-1 min-w-[90px]">
                          <label className="text-[9px] font-bold uppercase mb-1 block tracking-wider">Harga Khusus</label>
                          <input type="number" placeholder="Ikut Induk" value={v.harga || ''} onChange={(e) => updateLocalVarian(idx, 'harga', e.target.value)} className="w-full bg-white border border-[#d99738] p-1.5 text-xs rounded-sm outline-none focus:border-black" />
                        </div>
                        <div className="flex-1 min-w-[70px]">
                          <label className="text-[9px] font-bold uppercase mb-1 block tracking-wider">Stok Varian</label>
                          <input type="number" placeholder="Gabung" value={v.stok || ''} onChange={(e) => updateLocalVarian(idx, 'stok', e.target.value)} className="w-full bg-white border border-[#d99738] p-1.5 text-xs rounded-sm outline-none focus:border-black" />
                        </div>
                        
                        <button type="button" onClick={() => hapusLocalVarian(idx, v.id, v.isNew)} className="bg-red-700 hover:bg-red-800 text-white px-2.5 py-1.5 rounded-sm transition-colors text-xs font-bold mb-[2px] cursor-pointer" title="Hapus Varian">X</button>
                      </div>
                    ))}

                    <button type="button" onClick={tambahVarianKosong} className="w-full py-3 border-2 border-dashed border-[#d99738] text-[#b57a26] rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-[#fcebaf] hover:text-black transition-colors cursor-pointer mt-2">+ Tambah Baris Varian</button>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 italic text-justify leading-relaxed mt-2">*Kosongkan kolom Harga jika harganya sama dengan harga induk. Kosongkan kolom Stok jika stoknya tidak dipisah per varian.</p>
                </div>
              </div>

              <div className="flex gap-4 mt-10 pt-6 border-t-2 border-[#df9e3d]">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 bg-white border-2 border-black text-black font-bold uppercase tracking-widest rounded-sm hover:bg-gray-100 transition-colors cursor-pointer text-sm">Batal</button>
                <button type="submit" disabled={isLoading} className={`flex-[2] text-white font-bold uppercase tracking-widest py-4 rounded-sm transition-colors cursor-pointer text-sm ${isLoading ? 'bg-gray-400' : 'bg-black text-[#df9e3d] hover:bg-gray-800 hover:text-white'}`}>
                  {isLoading ? 'Menyimpan ke Database...' : 'Simpan Semua Perubahan'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}