import type { Metadata } from "next";
import RegisterPage from "./RegisterPage";

export const metadata: Metadata = {
  title: "Daftar",
  description: "Daftar akun baru Budiman Handicraft untuk mulai berbelanja kerajinan tradisional Sunda.",
};

export default function RegisterPageWrapper() {
  return <RegisterPage />;
}
