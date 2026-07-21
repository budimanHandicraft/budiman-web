import type { Metadata } from "next";
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Artisans",
  description: "Kenali para seniman lokal Budiman Handicraft — tangan-tangan terampil di balik setiap karya kerajinan tradisional Sunda.",
};

export default function ArtisansPage() {
  return (
    <main className="w-full bg-white font-sans">
      <section className="relative min-h-screen w-full py-32 px-6 flex flex-col items-center justify-center text-center bg-[#141414] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/awan.svg')] bg-cover bg-[0%_-40%] opacity-70 pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl flex flex-col items-center mt-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-[1px] bg-[#df9e3d]"></div>
            <span className="text-[#df9e3d] text-[12px] sm:text-[16px] font-bold tracking-[0.2em] uppercase">The Hands Behind The Craft</span>
            <div className="w-16 h-[1px] bg-[#df9e3d]"></div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">Meet Our <span className="text-[#d77723] italic">Artisans</span></h1>
          <p className="text-gray-300 text-sm md:text-[20px] leading-relaxed max-w-3xl font-light">Karya seni tidak tercipta dengan sendirinya. Di balik setiap detail pahatan dan anyaman, terdapat tangan-tangan terampil yang mendedikasikan hidupnya untuk merawat tradisi.</p>
        </div>
      </section>

      <section className="w-full py-20 px-6 md:px-12 lg:px-20 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-16 items-center justify-center">
          <div className="flex flex-col items-start order-2 md:order-1">
            <span className="bg-[#d77723] text-white text-[16px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm mb-6">Master Crafter & Founder</span>
            <h2 className="text-5xl md:text-[64px] font-serif font-bold text-black mb-2 leading-none">Kang</h2>
            <h2 className="text-5xl md:text-[64px] font-serif font-bold text-[#d77723] italic mb-6 leading-none">Ikhsan</h2>
            <p className="text-black text-sm md:text-[20px] leading-relaxed text-justify">Berangkat dari keberanian meninggalkan zona nyaman sebagai pegawai, ia membawa visi besar untuk Budiman Handicraft. Mengubah material sederhana menjadi jembatan pelestarian warisan budaya Sunda.</p>
          </div>
          
          <div className="relative w-full max-w-2xl mx-auto order-1 md:order-2 flex items-center justify-center">
            <div className="relative aspect-[4/3] w-full flex items-center justify-center rounded-xl shadow-[8px_8px_0_#ffdb81] md:shadow-[15px_15px_0_#ffdb81] overflow-hidden transition-all duration-300">
              <Image src="/logo2.svg" alt="Kang Ikhsan - Founder Budiman Handicraft" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 md:px-12 lg:px-24 bg-[#f6f5f0]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 md:gap-20">
          <div>
            <h3 className="text-[40px] font-serif font-bold text-black leading-tight mb-2">Awal Mula<br/>Perjalanan</h3>
            <p className="text-gray-500 text-[20px] font-bold uppercase tracking-widest">Sejak 2016</p>
          </div>
          
          <div className="flex flex-col gap-6 text-black text-[16px] md:text-[20px] leading-relaxed text-justify">
            <p>Keputusan untuk meninggalkan pekerjaan kantoran bukanlah hal yang mudah. Namun, panggilan untuk melestarikan budaya dan ketertarikan mendalam terhadap seni kriya mendorong Kang Ikhsan untuk mendirikan Budiman Handicraft.</p>
            <p>Bermula dari eksperimen menggunakan stik es krim sederhana, beliau berhasil menciptakan teknik perakitan yang presisi. Pendekatan ini tidak hanya menghasilkan karya yang estetis, tetapi juga memiliki durabilitas tinggi. Setiap potongan dan lengkungan dirancang untuk bercerita tentang filosofi kehidupan masyarakat Sunda.</p>
            <div className="bg-[#d77723] p-8 md:p-10 rounded-sm shadow-md">
              <p className="text-white text-[16px] md:text-[20px] font-serif font-bold italic text-center leading-relaxed">"Saya tidak hanya sedang membuat produk, saya sedang memahat identitas dan merajut kembali memori tentang kebanggaan menjadi orang Sunda."</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative w-full py-32 px-6 flex flex-col items-center justify-center text-center bg-[#141414] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/awan.svg')] bg-cover bg-[0%_15%] opacity-70 pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl flex flex-col items-center">
          <h2 className="text-[36px] md:text-[40px] font-serif font-bold text-white mb-4">Dukung Para Seniman Lokal</h2>
          <p className="text-gray-400 text-[16px] md:text-[20px] leading-relaxed mb-10 font-medium tracking-wide">Setiap karya yang Anda beli dari Budiman Handicraft berkontribusi langsung pada kesejahteraan pengrajin kami dan upaya pelestarian budaya Sunda.</p>
          <Link href="/katalog" className="bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-5 px-8 rounded-md text-[12px] uppercase tracking-widest transition-colors">Explore The Studio</Link>
        </div>
      </section>
    </main>
  );
}