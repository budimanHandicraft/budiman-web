'use client';

import { useState, useEffect, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const BULAN_LIST = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const tahunSekarang = new Date().getFullYear();
const TAHUN_LIST = Array.from({ length: 7 }, (_, i) => (tahunSekarang - 2 + i).toString());
const STATUS_LIST = ['Semua', 'belum_diproses', 'dikemas', 'dikirim', 'retur', 'selesai'];

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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [resiInput, setResiInput] = useState('');
  const [isSubmittingResi, setIsSubmittingResi] = useState(false);
  
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
          status: trx.status_pengiriman || 'belum_diproses',
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
    const { data: items } = await supabase.from('detail_transaksi').select('*, produk(*), produk_varian(*)').eq('transaksi_id', order.id);
    
    setSelectedOrder(order);
    setDetailItems(items || []);
    setResiInput(order.nomor_resi || '');
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

  const bukaModalHapus = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
  };

  const eksekusiHapus = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    
    try {
      const { data: trxData } = await supabase
        .from('transaksi')
        .select('id')
        .eq('order_id', orderToDelete)
        .single();

      if (trxData) {
        await supabase.from('detail_transaksi').delete().eq('transaksi_id', trxData.id);
        await supabase.from('transaksi').delete().eq('order_id', orderToDelete);
      }

      alert("Transaksi berhasil dihapus!");
      setIsDeleteModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Gagal menghapus:", error);
      alert("Gagal menghapus transaksi. Periksa koneksi atau hak akses.");
    } finally {
      setIsDeleting(false);
    }
  };

  const simpanResi = async (orderId: string, currentStatus: string) => {
    if (!resiInput.trim()) return;    
    setIsSubmittingResi(true);
    let payloadUpdate: any = { nomor_resi: resiInput };
    if (currentStatus === 'dikemas') {
      payloadUpdate.status_pengiriman = 'dikirim';
    }

    const { error } = await supabase
      .from('transaksi')
      .update(payloadUpdate)
      .eq('order_id', orderId);
      
    setIsSubmittingResi(false);

    if (!error) {
      alert("Nomor resi berhasil disimpan!");
      setIsDetailOpen(false);
      window.location.reload();
    } else {
      alert("Gagal menyimpan nomor resi.");
      console.error(error);
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
                <th className="py-4 w-1/6">Order ID</th>
                <th className="px-4 py-4 w-2/6">Produk</th>
                <th className="px-4 py-4 w-1/6">Total Tagihan</th>
                <th className="px-4 py-4 w-1/6">Status</th>
                <th className="px-4 py-4 w-1/6">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 font-bold text-[#df9e3d] animate-pulse">Memuat data transaksi...</td></tr>
              ) : (
                <>
                  {transaksi.map((order, idx) => (
                    <tr key={idx} className="border-b border-[#ebd28a] text-black hover:bg-[#fae498]">
                      <td className="px-4 py-4">{order.tanggal}</td>
                      <td className="py-4">{order.id}</td>
                      <td className="px-4 py-4 font-medium">{order.produk}</td>
                      <td className="px-4 py-4">{order.tagihan}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm ${
                            order.status_pembayaran === 'lunas' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {order.status_pembayaran}
                          </span>
                          {/* <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-sm ${badgeShip.bg} ${badgeShip.text}`}> */}
                          <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm bg-yellow-100 text-yellow-700">
                            {order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-2 items-center justify-center">
                          <button onClick={() => bukaDetail(order.id)} className="w-full max-w-[80px] bg-black text-white text-[10px] px-3 py-1.5 rounded-sm uppercase cursor-pointer hover:bg-gray-800 transition-colors font-bold">
                            Detail
                          </button>
                          <button onClick={() => bukaModalHapus(order.id)} className="w-full max-w-[80px] border border-red-500 text-red-500 text-[10px] px-3 py-1.5 rounded-sm uppercase cursor-pointer hover:bg-red-500 hover:text-white transition-colors font-bold">
                            Hapus
                          </button>
                        </div>
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
            <h2 className="text-xl font-bold mb-4 text-black">Detail Pesanan: {selectedOrder.order_id}</h2>
            <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200 text-black">
              <div className="grid grid-cols-1 text-sm">
                <p><span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block">Layanan Ekspedisi:</span> 
                  <span className="font-bold text-[#d97736]">{selectedOrder.layanan_pengiriman || 'Belum ada data'}</span>
                </p>
                <p><span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block mt-2">Alamat Pengiriman:</span> 
                  {selectedOrder.alamat_lengkap || 'Alamat tidak ditemukan'}
                </p>
                <p><span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block mt-2">Kontak Pembeli:</span> 
                  {selectedOrder.kontak_pembeli}
                </p>
              </div>
            </div>
  
            {selectedOrder.bukti_bayar_url && (
              <div className="mb-6 text-black">
                <p className="font-bold text-sm mb-2">Bukti Pembayaran:</p>
                <img src={selectedOrder.bukti_bayar_url} className="w-48 h-48 object-cover" />
              </div>
            )}

            <div className="mb-8 text-black">
              <h3 className="font-bold text-sm mb-3 uppercase tracking-widest text-gray-500 border-b pb-2">Daftar Produk</h3>
              {detailItems.map((item: any) => {
                const namaVarian = item.produk_varian ? `${item.produk_varian.nilai_varian_1 || ''} ${item.produk_varian.nilai_varian_2 || ''}`.trim() : '';
                return (
                  <div key={item.id} className="flex justify-between items-start text-sm py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col pr-4">
                      <span className="font-bold text-gray-900">{item.produk?.nama_produk || 'Produk Tidak Diketahui'} <span className="text-[#d97736]">x {item.kuantitas}</span></span>
                      {namaVarian && (
                        <span className="text-xs text-gray-600 mt-1 inline-block bg-gray-200 px-2 py-0.5 rounded-sm w-fit font-medium">
                          Varian: {namaVarian}
                        </span>
                      )}
                    
                      {item.catatan && (
                        <span className="text-[11px] text-gray-500 italic mt-1 bg-yellow-50 p-1 border-l-2 border-yellow-400">
                          Note: "{item.catatan}"
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-gray-900 whitespace-nowrap">{formatRupiah(item.harga_satuan * item.kuantitas)}</span>
                  </div>
                );
              })}
            </div>

            {selectedOrder.status_pembayaran === 'lunas' && (
              <div className="mb-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                <label className="block text-sm font-bold text-gray-900 mb-2">Nomor Resi Pengiriman</label>
                <div className="flex gap-2">
                  <input type="text" value={resiInput} onChange={(e) => setResiInput(e.target.value)} placeholder="nomor resi belum ada"
                    className="flex-1 border border-gray-300 p-2 rounded-sm text-sm text-black outline-none focus:border-[#d97736]"
                  />
                  <button onClick={() => simpanResi(selectedOrder.order_id, selectedOrder.status_pengiriman)} disabled={!resiInput.trim() || isSubmittingResi}
                    className="bg-[#d97736] hover:bg-[#c2662b] text-white px-4 py-2 rounded-sm text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {selectedOrder.status_pengiriman === 'dikemas' ? 'Input Nomor Resi' : 'Edit Resi'}
                  </button>
                </div>

                {selectedOrder.status_pengiriman === 'dikemas' && (
                  <p className="text-[10px] text-gray-500 mt-2 italic">*Menginput resi akan otomatis mengubah status pesanan menjadi <b>DIKIRIM</b>.</p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              {selectedOrder.status_pembayaran === 'menunggu_konfirmasi' && (
                <button onClick={() => konfirmasiPesanan(selectedOrder.order_id)} className="border border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-2 rounded font-bold transition-colors cursor-pointer">Konfirmasi Lunas</button>
              )}
              <button onClick={() => setIsDetailOpen(false)} className="border border-red-500 text-red-500 hover:bg-red-500 px-6 py-2 rounded font-bold hover:text-white transition-colors cursor-pointer">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && orderToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full shadow-2xl text-center transform transition-all">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-5">
              <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Transaksi?</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Apakah Anda yakin ingin menghapus pesanan <span className="font-bold text-black">{orderToDelete}</span>? Data yang dihapus tidak dapat dikembalikan.
            </p>
            
            <div className="flex gap-3 justify-center w-full">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                disabled={isDeleting}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-bold text-xs uppercase rounded-sm hover:bg-gray-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={eksekusiHapus} 
                disabled={isDeleting}
                className="flex-1 py-3 bg-red-600 text-white font-bold text-xs uppercase rounded-sm hover:bg-red-700 transition flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}