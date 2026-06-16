'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaksi {
  id: string;
  created_at: string;
  total_belanja: number;
  status_pembayaran: string;
  status_pengiriman: string;
  nama_pembeli: string;
}

interface Produk {
  id: string;
  nama_produk: string;
  stok: number;
  gambar_url: string;
}

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ pendapatan: 0, totalPesanan: 0, perluDikemas: 0, produkAktif: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<Produk[]>([]);
  const [recentOrders, setRecentOrders] = useState<Transaksi[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      const [transaksiRes, produkRes] = await Promise.all([
        supabase.from('transaksi').select('*').order('created_at', { ascending: false }),
        supabase.from('produk').select('*').eq('is_active', true)
      ]);

      const semuaTransaksi = transaksiRes.data as Transaksi[] || [];
      const semuaProduk = produkRes.data as Produk[] || [];
      let totalPendapatan = 0;
      let perluDikemas = 0;
      
      semuaTransaksi.forEach(tx => {
        if (tx.status_pembayaran === 'PAID') {
          totalPendapatan += Number(tx.total_belanja);
        }
        if (tx.status_pembayaran === 'PAID' && tx.status_pengiriman === 'DIKEMAS') {
          perluDikemas += 1;
        }
      });

      setStats({
        pendapatan: totalPendapatan,
        totalPesanan: semuaTransaksi.length,
        perluDikemas: perluDikemas,
        produkAktif: semuaProduk.length
      });

      const groupedData: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        groupedData[dateString] = 0;
      }

      semuaTransaksi.forEach(tx => {
        if (tx.status_pembayaran === 'PAID') {
          const txDate = new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          if (groupedData[txDate] !== undefined) {
            groupedData[txDate] += Number(tx.total_belanja);
          }
        }
      });

      const finalChartData = Object.keys(groupedData).map(key => ({
        tanggal: key,
        pendapatan: groupedData[key]
      }));
      setChartData(finalChartData);

      const produkKritis = semuaProduk.filter(p => p.stok < 5).sort((a, b) => a.stok - b.stok);
      setLowStock(produkKritis);
      setRecentOrders(semuaTransaksi.slice(0, 5));

    } catch (error) {
      console.error("Gagal memuat data dasbor", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Memuat Dasbor...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Beranda Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Pendapatan (Lunas)</div>
          <div className="text-2xl font-bold text-green-600">
            Rp {stats.pendapatan.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Pesanan</div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalPesanan} Pesanan</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
          <div className="text-sm font-medium text-red-500 mb-1">Perlu Dikemas</div>
          <div className="text-2xl font-bold text-gray-800">{stats.perluDikemas} Paket</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-sm font-medium text-gray-500 mb-1">Katalog Aktif</div>
          <div className="text-2xl font-bold text-blue-600">{stats.produkAktif} Produk</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Grafik Pendapatan (7 Hari Terakhir)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="tanggal" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(val) => `Rp${val/1000}k`} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString('id-ID')}`} />
                <Bar dataKey="pendapatan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 text-gray-800 flex justify-between items-center">
            Stok Kritis
            <span className="text-xs bg-red-100 text-red-600 py-1 px-2 rounded-full font-bold">
              {lowStock.length} Item
            </span>
          </h2>
          {lowStock.length === 0 ? (
            <div className="text-center text-gray-500 py-8 text-sm">Semua stok produk aman!</div>
          ) : (
            <div className="space-y-4">
              {lowStock.map(produk => (
                <div key={produk.id} className="flex items-center space-x-3 border-b pb-3 last:border-0 last:pb-0">
                  <img src={produk.gambar_url} alt={produk.nama_produk} className="w-12 h-12 rounded object-cover border" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm line-clamp-1">{produk.nama_produk}</div>
                    <div className="text-xs text-red-500 font-bold mt-1">Sisa {produk.stok} pcs di gudang</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4 text-gray-800">5 Pesanan Terbaru</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-sm text-gray-500">
                <th className="p-3">Tanggal</th>
                <th className="p-3">Pembeli</th>
                <th className="p-3">Total Tagihan</th>
                <th className="p-3">Status Bayar</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={4} className="text-center p-4 text-sm text-gray-500">Belum ada transaksi.</td></tr>
              ) : (
                recentOrders.map(tx => (
                  <tr key={tx.id} className="border-b last:border-0 hover:bg-gray-50 text-sm">
                    <td className="p-3">{new Date(tx.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="p-3 font-medium">{tx.nama_pembeli}</td>
                    <td className="p-3">Rp {tx.total_belanja.toLocaleString('id-ID')}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        tx.status_pembayaran === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {tx.status_pembayaran}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}