import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://budiman-web-jade.vercel.app"),
  title: {
    template: "%s | Budiman Handicraft",
    default: "Budiman Handicraft — Sundanese Handicrafts",
  },
  description: "Melestarikan budaya Sunda melalui karya tangan para seniman lokal berpengalaman sejak 2016. Temukan koleksi wayang golek, kerajinan bambu, dan karya seni tradisional Indonesia.",
  keywords: ["handicraft", "Sunda", "budaya", "seni", "wayang", "kerajinan", "Indonesia", "artisan"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Budiman Handicraft",
    images: [{
      url: "/logo.svg",
      width: 800,
      height: 600,
      alt: "Budiman Handicraft Logo",
    }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@budimanhandicraft",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://lvajhqwpmwghoqyeiyya.supabase.co" />
        <link rel="dns-prefetch" href="https://rajaongkir.komerce.id" />
        <link rel="dns-prefetch" href="https://lh3.googleusercontent.com" />
      </head>
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <Navbar/>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
