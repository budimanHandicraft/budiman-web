'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { useToast } from '@/components/ToastProvider';

export default function HalamanPembayaran() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id as string;

  const [transaksi, setTransaksi] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileBukti, setFileBukti] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchTransaksi = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        showToast("Sesi Anda telah habis. Silakan login kembali.", "error");
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .eq('order_id', orderId)
        .eq('pelanggan_id', session.user.id)
        .single();

      if (error || !data) {
        showToast("Pesanan tidak ditemukan atau bukan milik Anda.", "error");
        router.push('/market');
        return;
      }

      setTransaksi(data);
      setIsLoading(false);
    };

    fetchTransaksi();
  }, [orderId, router, supabase]);

  const handleUploadBukti = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileBukti) {
      showToast('Pilih foto bukti transfer terlebih dahulu!', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = fileBukti.name.split('.').pop();
      const fileName = `${orderId}-${Date.now()}.${fileExt}`;
      const filePath = `transfer/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('bukti-pembayaran')
        .upload(filePath, fileBukti);

      if (uploadError) throw uploadError;
      const { data: publicUrlData } = supabase.storage
        .from('bukti-pembayaran')
        .getPublicUrl(filePath);

      const buktiUrl = publicUrlData.publicUrl;
      const { error: updateError } = await supabase
        .from('transaksi')
        .update({ 
          status_pembayaran: 'menunggu_konfirmasi', 
          bukti_bayar_url: buktiUrl 
        })
        .eq('order_id', orderId);

      if (updateError) throw updateError;

      setIsSuccess(true);
      
    } catch (error: any) {
      showToast(`Gagal mengupload bukti pembayaran: ${error.message}`, "error");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#faf9f5] flex items-center justify-center font-sans">Memuat data pesanan...</div>;
  }

  if (transaksi.status_pembayaran !== 'menunggu_pembayaran' || isSuccess) {
    return (
      <main className="min-h-screen bg-[#faf9f5] pt-24 flex flex-col items-center justify-center font-sans p-6">
        <div className="bg-white p-10 rounded-sm shadow-xl max-w-lg w-full text-center border-t-4 border-[#d97736]">
          <div className="w-20 h-20 bg-[#eef5ed] text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Terima Kasih!</h2>
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">Bukti pembayaran untuk pesanan <strong>{orderId}</strong> telah kami terima. Admin kami akan segera memverifikasi pembayaran Anda dan memproses pesanan.</p>
            <button onClick={() => router.push('/pesanan')} className="bg-black text-white px-6 py-3 rounded-sm font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition">Lihat Status Pesanan</button>
        </div>
      </main>
    );
  }

  const grandTotal = transaksi.total_belanja + transaksi.ongkos_kirim;
  return (
    <main className="min-h-screen bg-[#faf9f5] pt-28 px-4 font-sans">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Selesaikan Pembayaran</h1>
        <div className="bg-white shadow-lg rounded-sm overflow-hidden mb-8 border border-gray-100">
          <div className="bg-[#161616] p-6 text-white flex justify-between items-center flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
              <p className="font-bold text-lg">{orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Total Tagihan</p>
              <p className="font-serif font-bold text-2xl text-[#d97736]">Rp {grandTotal.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="flex flex-col items-center border-b md:border-b-0 md:border-r border-gray-200 pb-8 md:pb-0 md:pr-8">
              <h3 className="font-bold text-gray-900 mb-2">Scan QRIS</h3>
              <p className="text-xs text-gray-500 text-center mb-6">Buka aplikasi GoPay, DANA, OVO, atau m-Banking Anda, lalu scan kode QR di bawah ini.</p>
              <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center p-2 relative">
                <Image src="/qris_payment.jpg" alt="QRIS Budiman Handicraft" fill className="object-contain p-2" />
              </div>
              <p className="text-[10px] text-gray-400 mt-4 italic">*Pastikan nama penerima adalah Budiman Handicraft</p>
            </div>

            <form onSubmit={handleUploadBukti} className="flex flex-col">
              <h3 className="font-bold text-gray-900 mb-2">Konfirmasi Pembayaran</h3>
              <p className="text-xs text-gray-500 mb-6">Silakan unggah screenshot atau foto struk bukti transfer Anda di sini.</p>
              <label className="block mb-6">
                <span className="sr-only">Pilih foto</span>
                <input type="file" accept="image/*" required onChange={(e) => setFileBukti(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-sm file:border-0 file:bg-[#f0f0f0] file:text-gray-700
                    file:text-xs file:font-bold file:uppercase file:tracking-wider hover:file:bg-gray-200 file:cursor-pointer cursor-pointer border border-gray-200 p-1 rounded-sm"
                />
              </label>

              <button type="submit" disabled={isUploading}
                className="w-full bg-[#d97736] hover:bg-[#c2662b] text-white font-bold py-4 rounded-sm uppercase tracking-widest text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengunggah...
                  </>
                ) : (
                  'Kirim Bukti Pembayaran'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center">
          <button onClick={() => router.push('/market')} className="text-sm text-gray-500 hover:text-black underline transition cursor-pointer">Kembali ke Market (Pesanan akan hilang)</button>
        </div>
      </div>
    </main>
  );
}