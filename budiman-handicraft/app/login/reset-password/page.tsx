import type { Metadata } from "next";
import ResetPasswordPage from "./ResetPasswordPage";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Pulihkan akses akun Budiman Handicraft Anda dengan tautan reset password.",
};

export default function ResetPasswordPageWrapper() {
  return <ResetPasswordPage />;
}
