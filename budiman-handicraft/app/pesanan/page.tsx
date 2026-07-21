import type { Metadata } from "next";
import PesananPage from "./PesananPage";

export const metadata: Metadata = {
  title: "Pesanan Saya",
  description: "Lihat riwayat pesanan dan status pembelian Anda di Budiman Handicraft.",
};

export default function PesananPageWrapper() {
  return <PesananPage />;
}
