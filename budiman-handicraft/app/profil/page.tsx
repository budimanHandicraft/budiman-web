import type { Metadata } from "next";
import ProfilPage from "./ProfilPage";

export const metadata: Metadata = {
  title: "Profil",
  description: "Kelola informasi profil dan alamat pengiriman Anda di Budiman Handicraft.",
};

export default function ProfilPageWrapper() {
  return <ProfilPage />;
}
