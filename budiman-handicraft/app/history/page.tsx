import type { Metadata } from "next";
import Image from 'next/image';

export const metadata: Metadata = {
  title: "Sejarah",
  description: "Perjalanan Budiman Handicraft dalam melestarikan budaya Sunda melalui karya tangan para seniman lokal sejak 2016.",
};

export default function HistoryPage() {
  return (
    <main className="w-full bg-white font-sans">
      <section className="relative w-full min-h-screen py-32 px-6 flex flex-col items-center justify-center text-center bg-[#fcfaf5] overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-[url('/batik.svg')] bg-[0%_66%] scale-130 opacity-70 pointer-events-none"></div>
        <div className="relative z-10 max-w-5xl flex flex-col items-center mt-10">
          <span className="text-[#df9e3d] text-[20px] font-bold tracking-widest uppercase mb-2">Legacy Since 2016</span>
          <h1 className="text-[52px] md:text-[56px] lg:text-[60px] font-serif font-semibold tracking-widest text-black mb-4 leading-tight">Melestarikan Budaya Sunda<br />Melalui Karya Tangan</h1>
          <p className="text-black opacity-60 text-[12px] md:text-[16px] leading-relaxed max-w-2xl font-medium">Sebuah perjalanan yang berawal dari stik es krim, kini menjelma menjadi ruang pelestarian warisan budaya yang kita cintai.</p>
        </div>
      </section>

      <section className="w-full py-20 md:py-24 px-6 md:px-12 lg:px-24 max-w-8xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[50%_40%] gap-12 lg:gap-20 items-center">
          <div className="order-2 md:order-1 flex flex-col justify-center">
            <h2 className="text-[32px] md:text-[40px] font-serif font-bold text-black mb-4">Awal Mula Sebuah Keyakinan</h2>
            <div className="text-black text-[16px] md:text-[20px] leading-relaxed text-justify space-y-4">
              <p>Budiman Handicraft lahir pada tahun 2016 dari sebuah keyakinan bahwa sebuah usaha dapat menjadi lebih dari sekadar tempat mencari nafkah. Berawal dari keputusan pendiri kami untuk meninggalkan pekerjaannya sebagai seorang pegawai, kami memulai perjalanan ini dengan harapan dapat membangun usaha yang tidak hanya memberikan nilai ekonomi, tetapi juga membawa manfaat bagi budaya yang kami cintai.</p>
              <p>Perjalanan kami dimulai dari kerajinan berbahan stik es krim yang kami pasarkan melalui marketplace. Dari langkah sederhana tersebut, Budiman Handicraft tumbuh berkat kepercayaan para pelanggan dan semangat untuk terus berinovasi.</p>
            </div>
          </div>
          
          <div className="order-1 md:order-2 relative aspect-[4/3] md:aspect-square w-full">
            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)]">
              <Image src="/rumahStik.png" alt="Kerajinan Stik Es Krim" fill className="object-cover"/>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full pb-20 px-6 md:px-12 lg:px-24 max-w-8xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[40%_50%] gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/3] md:aspect-square w-full">
            <div className="relative w-full h-full rounded-xl overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.2)]">
              <Image src="/wayang2.png" alt="Wayang Golek" fill className="object-cover" />
            </div>
          </div>

          <div className="flex flex-col justify-center md:text-right">
            <h2 className="text-[32px] md:text-[40px] font-serif font-bold text-black mb-4">Panggilan Budaya Sunda</h2>
            <div className="text-black text-[16px] md:text-[20px] leading-relaxed text-justify space-y-4">
              <p>Seiring berjalannya waktu, kami menyadari bahwa kami ingin menghadirkan sesuatu yang lebih bermakna. Berbekal kecintaan terhadap seni yang telah tumbuh dalam keluarga kami, lahirlah keinginan untuk menjadikan Budiman Handicraft sebagai ruang untuk memperkenalkan sekaligus melestarikan budaya Sunda.</p>
              <p>Dari situlah kami mulai menghadirkan berbagai produk yang mengangkat identitas budaya Sunda, mulai dari wayang golek, kerajinan bambu, hingga berbagai karya yang menghadirkan sentuhan budaya Sunda dalam bentuk yang dekat dengan kehidupan sehari-hari.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 px-6 flex flex-col items-center justify-center text-center">
        <div className="max-w-4xl flex flex-col items-center">
          <svg className="w-12 h-12 text-[#d77723] mb-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-xl md:text-2xl lg:text-3xl font-serif italic text-gray-900 leading-relaxed mb-8 px-4">"Bagi kami, setiap produk bukan sekadar hasil kerajinan, melainkan sebuah cerita yang membawa nilai, tradisi, dan kebanggaan terhadap budaya lokal."</p>
          <div className="w-40 h-1.5 bg-[#d77723] rounded-full"></div>
        </div>
      </section>

      <section className="relative w-full py-24 md:py-32 px-6 flex flex-col items-center justify-center text-center bg-[#141414] overflow-hidden mt-12">
        <div className="absolute inset-0 bg-[url('/awan.svg')] bg-cover opacity-80 pointer-events-none"></div>
        <div className="relative z-10 max-w-6xl flex flex-col items-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-10">Menghidupkan Budaya di Keseharian</h2>
          
          <div className="text-white text-[12px] md:text-[20px] leading-relaxed space-y-6 font-light tracking-widest">
            <p>Kami percaya bahwa pelestarian budaya tidak harus selalu dilakukan melalui panggung pertunjukan atau ruang-ruang budaya. Budaya juga dapat hidup melalui karya yang digunakan dalam kehidupan sehari-hari, dikenakan dengan bangga, diberikan sebagai buah tangan, hingga dipajang sebagai pengingat akan kekayaan warisan yang kita miliki.</p>
            <p>Melalui Budiman Handicraft, kami ingin memperkenalkan budaya Sunda kepada lebih banyak orang. Mulai dari generasi muda, masyarakat di berbagai daerah Indonesia, hingga pasar mancanegara. Karena kami percaya, budaya akan terus hidup ketika ada yang mengenalnya, mencintainya, dan memilih untuk melestarikannya.</p>
          </div>
          
          <p className="text-[#d77723] font-serif italic text-[16px] md:text-[24px] mt-12">"Bagi kami, pelestarian budaya selalu dimulai dari diri sendiri. Sebab, jika bukan kita, siapa lagi?"</p>
        </div>
      </section>

    </main>
  );
}