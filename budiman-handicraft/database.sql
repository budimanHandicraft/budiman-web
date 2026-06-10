-- 1. TABEL PRODUK (Katalog)
CREATE TABLE produk (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_produk TEXT NOT NULL,
    deskripsi TEXT,
    harga NUMERIC NOT NULL,
    stok INTEGER DEFAULT 0,
    gambar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transaksi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id TEXT UNIQUE NOT NULL,
    nama_pembeli TEXT NOT NULL,
    kontak_pembeli TEXT NOT NULL,
    alamat_pengiriman TEXT NOT NULL,
    total_harga NUMERIC NOT NULL,
    currency TEXT DEFAULT 'IDR',
    xendit_invoice_id TEXT, -- Diisi nanti saat Xendit aktif
    status_pembayaran TEXT DEFAULT 'PENDING', -- PENDING, PAID, EXPIRED
    status_pengiriman TEXT DEFAULT 'DIKEMAS',  -- DIKEMAS, DIKIRIM, SELESAI
    nomor_resi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE detail_transaksi (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    transaksi_id UUID REFERENCES transaksi(id) ON DELETE CASCADE,
    produk_id UUID REFERENCES produk(id) ON DELETE SET NULL,
    jumlah_beli INTEGER NOT NULL,
    harga_satuan NUMERIC NOT NULL
);