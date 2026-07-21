import type { Metadata } from "next";
import MarketPage from "./MarketPage";

export const metadata: Metadata = {
  title: "Keranjang",
  description: "Review pesanan Anda, pilih layanan pengiriman, dan selesaikan pembayaran di Budiman Handicraft.",
};

export default function MarketPageWrapper() {
  return <MarketPage />;
}
