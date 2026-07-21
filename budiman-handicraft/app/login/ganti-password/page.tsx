import type { Metadata } from "next";
import GantiPasswordPage from "./GantiPasswordPage";

export const metadata: Metadata = {
  title: "Ganti Password",
  description: "Perbarui password akun Budiman Handicraft Anda untuk keamanan yang lebih baik.",
};

export default function GantiPasswordPageWrapper() {
  return <GantiPasswordPage />;
}
