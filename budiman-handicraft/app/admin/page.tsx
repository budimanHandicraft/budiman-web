'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [rekap, setRekap] = useState({ totalTransaksi: 0, pesananDikemas: 0, totalPendapatan: 0 });
  const [pesananTerbaru, setPesananTerbaru] = useState<any[]>([]);
  const [stokMenipis, setStokMenipis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      const { data: semuaTransaksi } = await supabase
        .from('transaksi')
        .select('total_belanja, status_pengiriman');

      if (semuaTransaksi) {
        const trxSelesai = semuaTransaksi.filter(t => t.status_pengiriman?.toLowerCase() === 'selesai');
        const totalUangMasuk = trxSelesai.reduce((sum, t) => sum + (t.total_belanja || 0), 0);
        const trxDikemas = semuaTransaksi.filter(t => t.status_pengiriman?.toLowerCase() === 'dikemas');

        setRekap({
          totalTransaksi: trxSelesai.length,
          pesananDikemas: trxDikemas.length,
          totalPendapatan: totalUangMasuk
        });
      }

      const { data: terbaru } = await supabase
        .from('transaksi')
        .select(`
          order_id, 
          created_at, 
          total_belanja, 
          ongkos_kirim, 
          status_pengiriman,
          detail_transaksi (
            produk (nama_produk)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (terbaru) {
        const formattedTerbaru = terbaru.map((trx: any) => {
          const namaProduk = trx.detail_transaksi?.[0]?.produk?.nama_produk || 'Produk tidak diketahui';
          const tambahanProduk = trx.detail_transaksi?.length > 1 ? ` (+${trx.detail_transaksi.length - 1} lainnya)` : '';

          return {
            id: trx.order_id,
            tanggal: new Date(trx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
            produk: `${namaProduk}${tambahanProduk}`,
            tagihan: formatRupiah((trx.total_belanja || 0) + (trx.ongkos_kirim || 0)),
            status: trx.status_pengiriman || 'Pending'
          };
        });
        setPesananTerbaru(formattedTerbaru);
      }

      const { data: stok } = await supabase
        .from('produk')
        .select('nama_produk, stok')
        .order('stok', { ascending: true })
        .limit(5);

      if (stok) setStokMenipis(stok);

      setIsLoading(false);
    };

    fetchDashboardData();
  }, [supabase]);

  const handleLogout = async () => {
    const confirmLogout = confirm('Yakin ingin keluar dari halaman Admin?');
    if (confirmLogout) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcfaf5] font-sans overflow-hidden">
      <aside className="w-64 bg-[#141414] text-white flex flex-col relative z-20 shadow-2xl">
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[url('/awan.svg')] bg-cover opacity-80 pointer-events-none"></div>
        
        <div className="p-8 border-b border-gray-800 flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
          <div>
            <p className="text-xs text-gray-400">Selamat datang,</p>
            <p className="text-sm font-bold">Admin Budiman</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-4 relative z-10">
          <Link href="/admin/dashboard" className="flex items-center gap-3 text-[#df9e3d] font-bold text-sm tracking-wider hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
            DASHBOARD
          </Link>
          <Link href="/admin/transaksi" className="flex items-center gap-3 text-gray-400 font-bold text-sm tracking-wider hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path></svg>
            HISTORI TRANSAKSI
          </Link>
          <Link href="/admin/produk" className="flex items-center gap-3 text-gray-400 font-bold text-sm tracking-wider hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd"></path></svg>
            KELOLA PRODUK
          </Link>
        </nav>

        <div className="p-6 relative z-10">
          <button onClick={handleLogout}
            className="flex items-center gap-3 text-gray-300 font-bold text-sm tracking-widest uppercase border border-gray-600 rounded px-4 py-2 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all w-full justify-center"
          >
            <svg className="w-5 h-5 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            LOG OUT
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 md:p-12 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[url('/awan.svg')] bg-cover opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4"></div>
        <div className="relative z-10 max-w-6xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-black mb-8">Rekapitulasi Penjualan</h1>

          {isLoading ? (
            <div className="w-full h-32 flex items-center justify-center font-bold text-[#df9e3d] animate-pulse">Memuat Data Rekapitulasi...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-[#df9e3d] rounded-md p-6 shadow-md text-black">
                  <h3 className="font-bold text-lg mb-2">Total Transaksi Selesai</h3>
                  <p className="text-3xl font-bold text-white"><span className="text-4xl">{rekap.totalTransaksi}</span> <span className="text-xl">Transaksi</span></p>
                </div>
                
                <div className="bg-[#df9e3d] rounded-md p-6 shadow-md text-black">
                  <h3 className="font-bold text-lg mb-2">Pesanan Sedang Dikemas</h3>
                  <p className="text-3xl font-bold text-white"><span className="text-4xl">{rekap.pesananDikemas}</span> <span className="text-xl">Pesanan</span></p>
                </div>
                
                <div className="bg-[#df9e3d] rounded-md p-6 shadow-md text-black overflow-hidden whitespace-nowrap text-ellipsis">
                  <h3 className="font-bold text-lg mb-2">Total Pendapatan</h3>
                  <p className="text-2xl lg:text-3xl font-bold text-white">{formatRupiah(rekap.totalPendapatan)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-serif font-bold text-black">5 Pesanan Terbaru</h3>
                    <Link href="/admin/histori" className="bg-[#df9e3d] text-black text-xs font-bold px-3 py-1 rounded-full hover:bg-opacity-80 transition-opacity">Selengkapnya</Link>
                  </div>
                  
                  <div className="bg-[#fcebaf] rounded-md overflow-hidden shadow-sm border border-[#df9e3d]">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-[#df9e3d] text-black font-bold">
                        <tr>
                          <th className="px-4 py-3">Tanggal</th>
                          <th className="px-4 py-3">Order ID</th>
                          <th className="px-4 py-3">Produk</th>
                          <th className="px-4 py-3">Total Tagihan</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pesananTerbaru.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-4 text-black">Belum ada pesanan</td></tr>
                        ) : pesananTerbaru.map((order, idx) => (
                          <tr key={idx} className="border-b border-[#ebd28a] text-black font-medium hover:bg-[#fae498]">
                            <td className="px-4 py-3">{order.tanggal}</td>
                            <td className="px-4 py-3">{order.id}</td>
                            <td className="px-4 py-3">{order.produk}</td>
                            <td className="px-4 py-3">{order.tagihan}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-sm ${order.status.toLowerCase() === 'selesai' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-serif font-bold text-black">Pendapatan Bulanan</h3>
                    <button className="text-[#df9e3d] hover:text-black font-bold text-xs underline">Bulan Sebelumnya</button>
                  </div>
                  
                  <div className="bg-[#fcebaf] rounded-md p-6 h-[250px] shadow-sm border border-[#df9e3d] flex flex-col justify-end relative">
                    <div className="absolute left-6 top-6 bottom-10 flex flex-col justify-between text-[10px] text-gray-600 font-bold">
                      <span>80</span><span>60</span><span>40</span><span>20</span><span>0</span>
                    </div>
                    <div className="ml-6 h-[80%] flex items-end justify-between gap-2 border-l border-b border-gray-400 pb-1 px-2">
                      <div className="w-full bg-[#4285F4] h-[60%] rounded-t-sm" title="Juli"></div>
                      <div className="w-full bg-[#A87FFB] h-[45%] rounded-t-sm" title="Agustus"></div>
                      <div className="w-full bg-[#1A73E8] h-[80%] rounded-t-sm" title="September"></div>
                      <div className="w-full bg-[#EA4335] h-[30%] rounded-t-sm" title="Oktober"></div>
                    </div>
                    <div className="ml-6 flex justify-between mt-2 text-[10px] text-black font-bold px-2">
                      <span>Jul</span><span>Agu</span><span>Sep</span><span>Okt</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/2">
                <h3 className="text-2xl font-serif font-bold text-black mb-4">Stok Barang Menipis</h3>
                <div className="bg-[#fcebaf] rounded-md p-4 shadow-sm border border-[#df9e3d]">
                  <ul className="divide-y divide-[#ebd28a]">
                    {stokMenipis.map((item, idx) => (
                      <li key={idx} className="py-3 flex justify-between items-center">
                        <span className="font-bold text-black text-sm">{item.nama_produk}</span>
                        <span className={`font-bold text-xs px-2 py-1 rounded-sm ${item.stok === 0 ? 'bg-red-200 text-red-700' : 'bg-orange-100 text-orange-700'}`}>Sisa {item.stok}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}