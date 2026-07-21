import Link from "next/link";
import Image from "next/image";

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#141414] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Atmospheric background */}
      <div className="absolute inset-0 bg-[url('/awan.svg')] bg-cover opacity-10 pointer-events-none" />
      
      <div className="relative z-10 text-center max-w-lg">
        {/* Logo */}
        <div className="mb-8">
          <Image 
            src="/logo.svg" 
            alt="Budiman Handicraft" 
            width={180} 
            height={72} 
            className="object-contain brightness-0 invert mx-auto"
          />
        </div>

        {/* 404 Number */}
        <div className="mb-6">
          <span className="text-[120px] md:text-[160px] font-serif font-bold text-[#df9e3d] leading-none opacity-20 select-none">
            404
          </span>
        </div>

        {/* Content */}
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
          Halaman Tidak Ditemukan
        </h1>
        <p className="text-gray-400 text-sm md:text-base mb-8 leading-relaxed">
          Seperti karya seni yang hilang dalam waktu, halaman yang Anda cari mungkin telah dipindahkan atau tidak lagi tersedia.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/" 
            className="bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3 px-6 rounded-sm uppercase tracking-widest text-sm transition-colors"
          >
            Kembali ke Beranda
          </Link>
          <Link 
            href="/katalog" 
            className="border-2 border-[#d77723] text-[#d77723] hover:bg-[#d77723] hover:text-white font-bold py-3 px-6 rounded-sm uppercase tracking-widest text-sm transition-colors"
          >
            Jelajahi Katalog
          </Link>
        </div>

        {/* Decorative element */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="w-12 h-[1px] bg-[#df9e3d]" />
          <span className="text-[#df9e3d] text-xs uppercase tracking-widest">Heritage Since 2016</span>
          <div className="w-12 h-[1px] bg-[#df9e3d]" />
        </div>
      </div>
    </main>
  );
}
