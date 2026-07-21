'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

interface PesananItem {
  id: string;
  order_id: string;
  created_at: string;
  nama_pembeli: string;
  total_belanja: number;
  ongkos_kirim: number;
  status_pembayaran: string;
  status_pengiriman: string;
}

interface DetailItem {
  id: string;
  kuantitas: number;
  harga_satuan: number;
  produk: { nama_produk: string } | null;
}

export default function PesananPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [pesanan, setPesanan] = useState<PesananItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<PesananItem | null>(null);
  const [detailItems, setDetailItems] = useState<DetailItem[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  useEffect(() => {
    const fetchPesanan = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('transaksi')
        .select('id, order_id, created_at, nama_pembeli, total_belanja, ongkos_kirim, status_pembayaran, status_pengiriman')
        .eq('pelanggan_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPesanan(data);
      }

      setIsLoading(false);
    };

    fetchPesanan();
  }, [router, supabase]);

  const bukaDetail = async (order: PesananItem) => {
    const { data: items } = await supabase
      .from('detail_transaksi')
      .select('id, kuantitas, harga_satuan, produk(nama_produk)')
      .eq('transaksi_id', order.id);

    setSelectedOrder(order);
    setDetailItems((items as any) || []);
    setIsDetailOpen(true);
  };

  const getBadgePayment = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'lunas':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Lunas' };
      case 'menunggu_konfirmasi':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Menunggu Konfirmasi' };
      case 'menunggu_pembayaran':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Menunggu Pembayaran' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    }
  };

  const getBadgeShipping = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'selesai':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Selesai' };
      case 'dikirim':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Dikirim' };
      case 'dikemas':
      case 'belum_diproses':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Dikemas' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', label: status };
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#faf9f5] flex items-center justify-center font-sans">
        <span className="text-gray-500 animate-pulse">Memuat riwayat pesanan...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f5] pt-28 pb-20 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="mb-10 text-center">
          <span className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase">Riwayat Belanja</span>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mt-2">Pesanan Saya</h1>
        </div>

        {/* Empty State */}
        {pesanan.length === 0 && (
          <div className="bg-white shadow-md rounded-sm p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum Ada Pesanan</h3>
            <p className="text-sm text-gray-500 mb-6">Anda belum memiliki riwayat pemesanan. Jelajahi katalog kami dan temukan karya artisan yang cocok untuk Anda.</p>
            <Link
              href="/katalog"
              className="inline-block bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3 px-6 rounded-sm uppercase tracking-widest text-sm transition"
            >
              Jelajahi Katalog
            </Link>
          </div>
        )}

        {/* Order Cards */}
        <div className="space-y-4">
          {pesanan.map((order) => {
            const badgePay = getBadgePayment(order.status_pembayaran);
            const badgeShip = getBadgeShipping(order.status_pengiriman);
            const grandTotal = (order.total_belanja || 0) + (order.ongkos_kirim || 0);
            const tanggal = new Date(order.created_at).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'long', year: 'numeric'
            });

            return (
              <div key={order.id} className="bg-white shadow-md rounded-sm border border-gray-100 overflow-hidden">
                {/* Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                    <p className="font-bold text-gray-900 text-sm">{order.order_id}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{tanggal}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-sm ${badgePay.bg} ${badgePay.text}`}>
                      {badgePay.label}
                    </span>
                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold rounded-sm ${badgeShip.bg} ${badgeShip.text}`}>
                      {badgeShip.label}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                    <p className="font-serif font-bold text-xl text-[#d77723]">{formatRupiah(grandTotal)}</p>
                  </div>

                  <div className="flex gap-3">
                    {order.status_pembayaran?.toLowerCase() === 'menunggu_pembayaran' && (
                      <Link
                        href={`/pembayaran/${order.order_id}`}
                        className="px-4 py-2 bg-[#d77723] hover:bg-[#c2662b] text-white font-bold text-xs uppercase tracking-wider rounded-sm transition"
                      >
                        Bayar Sekarang
                      </Link>
                    )}
                    <button
                      onClick={() => bukaDetail(order)}
                      className="px-4 py-2 border border-gray-900 text-gray-900 font-bold text-xs uppercase tracking-wider hover:bg-gray-900 hover:text-white rounded-sm transition cursor-pointer"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-sm shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-serif font-bold text-gray-900 mb-1">Detail Pesanan</h2>
            <p className="text-sm text-gray-500 mb-6">{selectedOrder.order_id}</p>

            <div className="space-y-3 mb-6">
              {detailItems.length === 0 ? (
                <p className="text-sm text-gray-500">Tidak ada detail produk.</p>
              ) : (
                detailItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                    <span className="text-gray-900">
                      {item.produk?.nama_produk || 'Produk'} <span className="text-gray-500">x{item.kuantitas}</span>
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatRupiah(item.harga_satuan * item.kuantitas)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="bg-[#f5f4ef] p-4 rounded-sm space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold text-gray-900">{formatRupiah(selectedOrder.total_belanja || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ongkos Kirim</span>
                <span className="font-bold text-gray-900">{formatRupiah(selectedOrder.ongkos_kirim || 0)}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-serif font-bold text-[#d77723]">
                  {formatRupiah((selectedOrder.total_belanja || 0) + (selectedOrder.ongkos_kirim || 0))}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsDetailOpen(false)}
              className="w-full py-3 bg-gray-900 text-white font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-black transition cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
