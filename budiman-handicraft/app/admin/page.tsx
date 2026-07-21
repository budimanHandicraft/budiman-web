import type { Metadata } from "next";
import AdminDashboardPage from "./AdminDashboardPage";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  description: "Kelola produk, transaksi, dan monitor penjualan Budiman Handicraft.",
  robots: { index: false, follow: false },
};

export default function AdminPageWrapper() {
  return <AdminDashboardPage />;
}
