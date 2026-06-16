'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DetailTransaksi {
  kuantitas: number;
  produk: {
    nama_produk: string;
  };
}

interface Transaksi {
  id: string;
  order_id: string;
  nama_pembeli: string;
  kontak_pembeli: string;
  alamat_lengkap: string;
  total_belanja: number;
  ongkos_kirim: number;
  status_pembayaran: string;
  status_pengiriman: string;
  nomor_resi: string | null;
  created_at: string;
  detail_transaksi: DetailTransaksi[];
}

export default function AdminTransaksi() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaksi | null>(null);
  const [inputResi, setInputResi] = useState('');
  const [inputStatus, setInputStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('transaksi')
      .select(`
        *,
        detail_transaksi (
          kuantitas,
          produk ( nama_produk )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data:', error);
    } else {
      setTransaksiList(data as any);
    }
    setIsLoading(false);
  };

  const bukaModalUpdate = (tx: Transaksi) => {
    setSelectedTx(tx);
    setInputResi(tx.nomor_resi || '');
    setInputStatus(tx.status_pengiriman);
  };

  const handleUpdatePengiriman = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from('transaksi')
      .update({
        nomor_resi: inputResi,
        status_pengiriman: inputStatus
      })
      .eq('id', selectedTx.id);

    setIsUpdating(false);

    if (error) {
      alert('Gagal memperbarui status pengiriman!');
    } else {
      alert('Status pengiriman berhasil diperbarui!');
      setSelectedTx(null);
      fetchTransaksi();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Pesanan Masuk</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-100 border-b text-sm text-gray-600">
              <th className="p-4">Order ID & Waktu</th>
              <th className="p-4">Pembeli & Alamat</th>
              <th className="p-4">Pesanan (Isi Paket)</th>
              <th className="p-4">Total + Ongkir</th>
              <th className="p-4">Pembayaran</th>
              <th className="p-4">Pengiriman</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center p-8">Memuat data...</td></tr>
            ) : transaksiList.length === 0 ? (
              <tr><td colSpan={7} className="text-center p-8 text-gray-500">Belum ada pesanan masuk.</td></tr>
            ) : (
              transaksiList.map((tx) => (
                <tr key={tx.id} className="border-b hover:bg-gray-50 align-top">
                  
                  <td className="p-4">
                    <div className="font-semibold text-blue-600">{tx.order_id}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>

                  <td className="p-4 max-w-[200px]">
                    <div className="font-medium text-gray-800">{tx.nama_pembeli}</div>
                    <div className="text-xs text-gray-500 mt-1">{tx.kontak_pembeli}</div>
                    <div className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded line-clamp-3">
                      {tx.alamat_lengkap}
                    </div>
                  </td>

                  <td className="p-4">
                    <ul className="list-disc pl-4 text-sm text-gray-700">
                      {tx.detail_transaksi.map((item, index) => (
                        <li key={index}>
                          {item.kuantitas}x {item.produk?.nama_produk || 'Produk Dihapus'}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="p-4 text-sm">
                    <div>Barang: Rp {tx.total_belanja.toLocaleString('id-ID')}</div>
                    <div className="text-gray-500">Ongkir: Rp {tx.ongkos_kirim?.toLocaleString('id-ID') || 0}</div>
                    <div className="font-bold mt-1 text-gray-800">
                      Total: Rp {(Number(tx.total_belanja) + Number(tx.ongkos_kirim || 0)).toLocaleString('id-ID')}
                    </div>
                  </td>

                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tx.status_pembayaran === 'PAID' ? 'bg-green-100 text-green-700' : 
                      tx.status_pembayaran === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.status_pembayaran}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="font-medium text-sm text-gray-800">{tx.status_pengiriman}</div>
                    {tx.nomor_resi && (
                      <div className="text-xs mt-1 text-blue-600 font-mono bg-blue-50 p-1 rounded inline-block">
                        Resi: {tx.nomor_resi}
                      </div>
                    )}
                  </td>

                  <td className="p-4">
                    <button onClick={() => bukaModalUpdate(tx)} className="bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition">Update Resi</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Update Pengiriman</h2>
            <p className="text-sm text-gray-600 mb-6">Order: <span className="font-bold">{selectedTx.order_id}</span></p>
            <form onSubmit={handleUpdatePengiriman}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Status Pengiriman</label>
                <select value={inputStatus} onChange={(e) => setInputStatus(e.target.value)} className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="DIKEMAS">Sedang Dikemas</option>
                  <option value="DIKIRIM">Sudang Dikirim (Input Resi)</option>
                  <option value="SELESAI">Selesai (Diterima Pembeli)</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Nomor Resi Kurir</label>
                <input type="text" value={inputResi} onChange={(e) => setInputResi(e.target.value)} placeholder="Misal: J&T123456789" className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
                <p className="text-xs text-gray-500 mt-1">Biarkan kosong jika belum dikirim ke kurir.</p>
              </div>

              <div className="flex space-x-3">
                <button type="button" onClick={() => setSelectedTx(null)} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300">Batal</button>
                <button type="submit" disabled={isUpdating} className={`flex-1 text-white py-2 rounded-lg font-bold transition ${isUpdating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}