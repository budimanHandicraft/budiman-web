import type { Metadata } from "next";
import LoginPage from "./LoginPage";

export const metadata: Metadata = {
  title: "Masuk",
  description: "Masuk ke akun Budiman Handicraft Anda untuk mulai berbelanja kerajinan tradisional Sunda.",
};

export default function LoginPageWrapper() {
  return <LoginPage />;
}
