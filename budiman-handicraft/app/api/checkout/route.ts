import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_pembeli, kontak_pembeli, alamat_pengiriman, item_keranjang, total_harga } = body;
    const timestamp = Date.now();
    const orderId = `INV-${timestamp}`;
    const { data: transaksiBaru, error: errorTransaksi } = await supabase
      .from('transaksi')
      .insert([
        {
          order_id: orderId,
          nama_pembeli,
          kontak_pembeli,
          alamat_pengiriman,
          total_harga,
          status_pembayaran: 'PENDING',
          status_pengiriman: 'DIKEMAS'
        }
      ])
      .select()
      .single();

    if (errorTransaksi) {
        return NextResponse.json({ error: 'Gagal membuat riwayat transaksi di Supabase' }, { status: 500 });
    }

    const detailItems = item_keranjang.map((item: any) => ({
      transaksi_id: transaksiBaru.id,
      produk_id: item.id,
      jumlah_beli: item.quantity,
      harga_satuan: item.harga
    }));

    const { error: errorDetail } = await supabase
      .from('detail_transaksi')
      .insert(detailItems);

    if (errorDetail) {
        return NextResponse.json({ error: 'Gagal mencatat detail item keranjang' }, { status: 500 });
    }

    // TEMPLATE PREPARASI XENDIT (BELUM DIAKTIFKAN)
    /*
    const xenditPayload = {
        external_id: orderId,
        amount: total_harga,
        payer_email: kontak_pembeli, // Asumsi jika input berupa email
        description: `Pembayaran pesanan ${orderId}`,
        invoice_duration: 86400, // Masa berlaku invoice (1 hari)
        success_redirect_url: 'https://websitemu.com/checkout/success',
    };

    // Nanti di sini tempat panggil API / SDK Xendit
    // const xenditResponse = await xenditInvoiceInstance.createInvoice({ data: xenditPayload });
    // const paymentUrl = xenditResponse.invoice_url;
    
    // Setelah dapat id dari xendit, update tabel transaksi:
    // await supabase.from('transaksi').update({ xendit_invoice_id: xenditResponse.id }).eq('id', transaksiBaru.id);
    */
    // ==========================================

    // KARENA XENDIT BELUM AKTIF:
    // Kita simulasikan draf link pembayaran tiruan dulu untuk keperluan testing frontend
    // const mockPaymentUrl = `/checkout/mock-payment-page?order=${orderId}`;

    return NextResponse.json({
      success: true,
      message: 'Transaksi berhasil dicatat lokal di Supabase!',
      order_id: orderId,
    //   checkout_url: mockPaymentUrl
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}