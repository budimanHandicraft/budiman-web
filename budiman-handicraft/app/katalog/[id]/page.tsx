import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ProductDetailClient from "./ProductDetailClient";

interface Produk {
  id: string;
  nama_produk: string;
  deskripsi: string;
  harga: number;
  berat_gram: number;
  stok: number;
  gambar_url: string[];
  kategori: string;
}

interface Varian {
  id: string;
  tipe_varian_1: string | null;
  nilai_varian_1: string | null;
  tipe_varian_2: string | null;
  nilai_varian_2: string | null;
  harga: number | null;
  stok: number | null;
  berat_gram: number | null;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const idProduk = resolvedParams.id;

  const { data: produk } = await supabase
    .from("produk")
    .select("nama_produk, deskripsi, gambar_url, kategori")
    .eq("id", idProduk)
    .single();

  if (!produk) {
    return {
      title: "Produk Tidak Ditemukan",
      description: "Produk yang Anda cari tidak tersedia di Budiman Handicraft.",
    };
  }

  const title = `${produk.nama_produk} | Budiman Handicraft`;
  const description = produk.deskripsi?.substring(0, 160) || `Beli ${produk.nama_produk} handmade dari para seniman Sunda.`;
  const imageUrl = produk.gambar_url?.[0] || "/logo.svg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 800, height: 600, alt: produk.nama_produk }],
      locale: "id_ID",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/katalog/${idProduk}`,
    },
    keywords: [produk.nama_produk, produk.kategori, "handicraft", "Sunda", "budaya", "seni", "Indonesia"],
  };
}

export default async function DetailProdukPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const idProduk = resolvedParams.id;
  const { data: produkData } = await supabase
    .from("produk")
    .select("*")
    .eq("id", idProduk)
    .single();

  if (!produkData) {
    return null;
  }

  const produk = produkData as Produk;
  const { data: varianData } = await supabase
    .from("produk_varian")
    .select("*")
    .eq("produk_id", idProduk);

  const varianList = (varianData || []) as Varian[];
  const { data: rekomendasi } = await supabase
    .from("produk")
    .select("*")
    .eq("kategori", produk.kategori)
    .neq("id", idProduk)
    .limit(3);

  let produkLain: Produk[] = [];
  if (rekomendasi && rekomendasi.length > 0) {
    produkLain = rekomendasi as Produk[];
  } else {
    const { data: fallback } = await supabase
      .from("produk")
      .select("*")
      .neq("id", idProduk)
      .limit(3);
    if (fallback) produkLain = fallback as Produk[];
  }

  return <ProductDetailClient produk={produk} produkLain={produkLain} varianList={varianList} />;
}
