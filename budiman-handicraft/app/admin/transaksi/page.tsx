'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const BULAN_LIST = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const tahunSekarang = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: 7 }, (_, i) => (tahunSekarang - 2 + i).toString());
const STATUS_LIST = ['Semua', 'menunggu_konfirmasi', 'dikemas', 'dikirim', 'retur', 'selesai'];

export default function HistoriTransaksi() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedBulan, setSelectedBulan] = useState(new Date().getMonth());
  const [selectedTahun, setSelectedTahun] = useState(new Date().getFullYear().toString());
  const [isBulanOpen, setIsBulanOpen] = useState(false);
  const [isTahunOpen, setIsTahunOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailItems, setDetailItems] = useState<any[]>([]);
  
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  useEffect(() => {
    const fetchTransaksi = async () => {
      setIsLoading(true);
      let dataToDisplay = [];
      let totalItems = 0;
      const startDate = new Date(parseInt(selectedTahun), selectedBulan, 1).toISOString();
      const endDate = new Date(parseInt(selectedTahun), selectedBulan + 1, 1).toISOString();

      if (statusFilter === 'Semua') {
        const { data: belumSelesai } = await supabase
          .from('vw_histori_transaksi')
          .select('*')
          .neq('status_pengiriman', 'selesai')
          .gte('created_at', startDate)
          .lt('created_at', endDate);
          
        const { data: sudahSelesai } = await supabase
          .from('vw_histori_transaksi')
          .select('*')
          .eq('status_pengiriman', 'selesai')
          .gte('created_at', startDate)
          .lt('created_at', endDate)
          .order('created_at', { ascending: false })
          .limit(10);
          
        let combined = [...(belumSelesai || []), ...(sudahSelesai || [])];
        combined.sort((a, b) => {
          if (a.prioritas_status !== b.prioritas_status) return a.prioritas_status - b.prioritas_status;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        totalItems = combined.length;
        setTotalPages(Math.ceil(totalItems / 15) || 1);
        
        const startIdx = (currentPage - 1) * 15;
        dataToDisplay = combined.slice(startIdx, startIdx + 15);

      } else {
        const ITEMS_PER_PAGE = 10;
        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + (ITEMS_PER_PAGE - 1);
        
        const { data, count } = await supabase
          .from('vw_histori_transaksi')
          .select('*', { count: 'exact' })
          .eq('status_pengiriman', statusFilter)
          .gte('created_at', startDate)
          .lt('created_at', endDate)
          .order('created_at', { ascending: false })
          .range(from, to);
          
        dataToDisplay = data || [];
        const maxData = Math.min(count || 0, 50);
        setTotalPages(Math.ceil(maxData / ITEMS_PER_PAGE) || 1);
      }

      const formatted = dataToDisplay.map((trx: any) => {
        const tambahan = trx.sisa_produk > 0 ? ` (+${trx.sisa_produk} lainnya)` : '';
        return {
          id: trx.order_id,
          tanggal: new Date(trx.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
          produk: `${trx.produk_utama || 'Produk dihapus'}${tambahan}`,
          tagihan: formatRupiah((trx.total_belanja || 0) + (trx.ongkos_kirim || 0)),
          status: trx.status_pengiriman || 'menunggu_konfirmasi',
          status_pembayaran: trx.status_pembayaran
        };
      });

      setTransaksi(formatted);
      setIsLoading(false);
    };

    fetchTransaksi();
  }, [supabase, statusFilter, currentPage, selectedBulan, selectedTahun]);

  const MINIMUM_ROWS = statusFilter === 'Semua' ? 15 : 10;
  const emptyRows = Math.max(0, MINIMUM_ROWS - transaksi.length);

  const bukaDetail = async (orderId: string) => {
    const { data: order } = await supabase.from('transaksi').select('*').eq('order_id', orderId).single();
    const { data: items } = await supabase.from('detail_transaksi').select('*, produk(* )').eq('transaksi_id', order.id);
    
    setSelectedOrder(order);
    setDetailItems(items || []);
    setIsDetailOpen(true);
  };

  const konfirmasiPesanan = async (orderId: string) => {
    if (!confirm("Apakah yakin ingin mengonfirmasi pembayaran pesanan ini?")) return;
    
    const { error } = await supabase
      .from('transaksi')
      .update({ status_pembayaran: 'lunas', status_pengiriman: 'dikemas' })
      .eq('order_id', orderId);
      
    if (!error) {
      alert("Pesanan berhasil dikonfirmasi!");
      setIsDetailOpen(false);
      window.location.reload();
    }
  };

  return (
    <div className="w-full mt-18 p-8 md:p-12 relative min-h-screen">
      <div className="absolute top-6 right-20 w-[400px] h-[250px] bg-[url('/awanKuning.svg')] bg-cover opacity-50 pointer-events-none transform"></div>
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h1 className="text-4xl font-serif font-bold text-black tracking-wide">Histori Transaksi</h1>
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="relative flex items-center">
              <div className="bg-[#df9e3d] text-black font-bold text-sm px-6 py-2 rounded-l-full shadow-sm z-10">Bulan</div>
              <div onClick={() => setIsBulanOpen(!isBulanOpen)}
                className="bg-white border border-gray-200 text-black text-sm px-4 py-2 rounded-r-full shadow-sm cursor-pointer min-w-[120px] flex justify-between items-center -ml-2 pl-4"
              >
                {BULAN_LIST[selectedBulan]}
                <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] ml-2 font-bold">&#8594;</span>
              </div>
              
              {isBulanOpen && (
                <div className="absolute top-full right-0 mt-2 bg-[#fcebaf] border-2 border-[#df9e3d] shadow-xl rounded-md overflow-hidden z-50 w-32">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col">
                    {BULAN_LIST.map((bln, idx) => (
                      <div key={bln} onClick={() => { setSelectedBulan(idx); setCurrentPage(1); setIsBulanOpen(false); }}
                        className={`px-4 py-2 text-sm cursor-pointer transition-colors ${selectedBulan === idx ? 'bg-[#d99738] text-white font-bold' : 'text-black hover:bg-[#fae498]'}`}
                      >
                        {bln}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex items-center">
              <div className="bg-[#df9e3d] text-black font-bold text-sm px-6 py-2 rounded-l-full shadow-sm z-10">Tahun</div>
              <div onClick={() => setIsTahunOpen(!isTahunOpen)}
                className="bg-white border border-gray-200 text-black text-sm px-4 py-2 rounded-r-full shadow-sm cursor-pointer min-w-[100px] flex justify-between items-center -ml-2 pl-4"
              >
                {selectedTahun}
                <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] ml-2 font-bold">&#8594;</span>
              </div>
              
              {isTahunOpen && (
                <div className="absolute top-full right-0 mt-2 bg-[#fcebaf] border-2 border-[#df9e3d] shadow-xl rounded-md overflow-hidden z-50 w-32">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col">
                    {TAHUN_LIST.map((thn) => (
                      <div key={thn} onClick={() => { setSelectedTahun(thn); setCurrentPage(1); setIsTahunOpen(false); }}
                        className={`px-4 py-2 text-sm cursor-pointer transition-colors ${selectedTahun === thn ? 'bg-[#d99738] text-white font-bold' : 'text-black hover:bg-[#fae498]'}`}
                      >
                        {thn}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex items-center">
              <div className="bg-[#df9e3d] text-black font-bold text-sm px-6 py-2 rounded-l-full shadow-sm z-10">Status</div>
              <div onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="bg-white border border-gray-200 text-black text-sm px-4 py-2 rounded-r-full shadow-sm cursor-pointer min-w-[120px] flex justify-between items-center -ml-2 pl-4 capitalize"
              >
                {statusFilter}
                <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] ml-2 font-bold">&#8594;</span>
              </div>
              
              {isStatusOpen && (
                <div className="absolute top-full right-0 mt-2 bg-[#fcebaf] border-2 border-[#df9e3d] shadow-xl rounded-md overflow-hidden z-50 w-32">
                  <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col">
                    {STATUS_LIST.map((stat) => (
                      <div key={stat} onClick={() => { setStatusFilter(stat); setCurrentPage(1); setIsStatusOpen(false); }}
                        className={`px-4 py-2 text-sm cursor-pointer transition-colors capitalize ${statusFilter === stat ? 'bg-[#d99738] text-white font-bold' : 'text-black hover:bg-[#fae498]'}`}
                      >
                        {stat}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 bg-[#fcebaf] rounded-lg shadow-xl overflow-hidden border border-[#df9e3d]">
          <table className="w-full text-sm text-center">
            <thead className="bg-[#d99738] text-black font-bold">
              <tr>
                <th className="px-4 py-4 w-1/6">Tanggal</th>
                <th className="px-4 py-4 w-1/6">Order ID</th>
                <th className="px-4 py-4 w-2/6">Produk</th>
                <th className="px-4 py-4 w-1/6">Total Tagihan</th>
                <th className="px-4 py-4 w-1/6">Status</th>
                <th className="px-4 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 font-bold text-[#df9e3d] animate-pulse">Memuat data transaksi...</td></tr>
              ) : (
                <>
                  {transaksi.map((order, idx) => (
                    <tr key={idx} className="border-b border-[#ebd28a] text-black hover:bg-[#fae498]">
                      <td className="px-4">{order.tanggal}</td>
                      <td className="px-4">{order.id}</td>
                      <td className="px-4">{order.tagihan}</td>
                      <td className="px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm ${
                            order.status_pembayaran === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {order.status_pembayaran}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm bg-yellow-100 text-yellow-700">
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4">
                        <button onClick={() => bukaDetail(order.id)} className="bg-black text-white text-[10px] px-3 py-1 rounded-full uppercase">Detail</button>
                      </td>
                    </tr>
                  ))}

                  {[...Array(emptyRows)].map((_, idx) => (
                    <tr key={`empty-${idx}`} className="border-b border-[#ebd28a] h-12">
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-4 py-2 bg-[#d99738] hover:bg-[#df9e3d] text-black rounded-md text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              SEBELUMNYA
            </button>
            <span className="text-black font-bold text-sm border-b-2 border-[#d99738] pb-1">Halaman {currentPage} dari {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#d99738] hover:bg-[#df9e3d] text-black rounded-md text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              SELANJUTNYA
            </button>
          </div>
        )}
      </div>

      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Detail Pesanan: {selectedOrder.order_id}</h2>
  
            {selectedOrder.bukti_bayar_url && (
              <div className="mb-6">
                <p className="font-bold text-sm mb-2">Bukti Pembayaran:</p>
                <img src={selectedOrder.bukti_bayar_url} className="w-48 h-48 object-cover border" />
              </div>
            )}

            <div className="mb-6">
              {detailItems.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b">
                  <span>{item.produk?.nama_produk || 'Produk'} x {item.kuantitas}</span>
                  <span>{formatRupiah(item.harga_satuan * item.kuantitas)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              {selectedOrder.status_pembayaran === 'menunggu_konfirmasi' && (
                <button onClick={() => konfirmasiPesanan(selectedOrder.order_id)} className="bg-green-600 text-white px-6 py-2 rounded">Konfirmasi Lunas</button>
              )}
              <button onClick={() => setIsDetailOpen(false)} className="bg-gray-300 px-6 py-2 rounded">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}