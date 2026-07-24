'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function ContactPage() {
  const waNumber = "6282246877727";
  const waMessage = encodeURIComponent("Halo Budiman Handicraft, saya tertarik dengan produk seni kriya Anda dan ingin bertanya lebih lanjut.");
  const igUsername = "budiman_handicraft";
  const gmapsLink = "https://maps.app.goo.gl/zGEyjdaXuKJnSfkP6";

  return (
    <main className="min-h-screen bg-[#faf9f5] font-sans py-20">
      <section className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-[#161616]">
        <div className="absolute inset-0 z-0 opacity-60">
          <Image src="/awan.svg"  alt="background awan" fill priority className="object-cover object-[center_30%]"/>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#161616]/90 z-10"></div>
        
        <div className="relative z-20 text-center px-4 max-w-3xl mx-auto -mt-12">
          <h4 className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase mb-4">Get In Touch</h4>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6">Hubungi Kami</h1>
          <p className="text-gray-300 text-sm md:text-base leading-relaxed">
            Punya pertanyaan seputar produk, pesanan kustom, atau ingin berdiskusi tentang seni kriya Sunda? 
            Silakan hubungi kami. Pintu studio kami selalu terbuka untuk Anda.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 -mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href={`https://wa.me/${waNumber}?text=${waMessage}`} target="_blank" rel="noopener noreferrer" 
            className="bg-white p-8 border border-gray-200 rounded-sm shadow-lg hover:border-[#d97736] hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-[#f0f0f0] group-hover:bg-[#fcebaf] rounded-full flex items-center justify-center mb-6 transition-colors">
              <svg className="w-8 h-8 text-[#d97736]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.461-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zM20.056 3.945C17.915 1.801 15.067.62 12.025.621 5.795.621.727 5.694.723 11.933c0 1.996.521 3.945 1.511 5.666L.621 23.38l5.938-1.559c1.656.899 3.535 1.373 5.461 1.374h.004c6.229 0 11.296-5.073 11.301-11.314.002-3.023-1.171-5.864-3.315-8.006l.046.07z"/>
              </svg>
            </div>
            <h3 className="font-serif font-bold text-xl text-gray-900 mb-2">WhatsApp</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">Chat langsung dengan admin kami untuk respon yang cepat dan personal.</p>
            <span className="text-[#d97736] text-xs font-bold uppercase tracking-wider group-hover:underline">Kirim Pesan &rarr;</span>
          </a>

          <a href={`https://instagram.com/${igUsername}`} target="_blank" rel="noopener noreferrer"
            className="bg-white p-8 border border-gray-200 rounded-sm shadow-lg hover:border-[#d97736] hover:-translate-y-1 transition-all duration-300 group flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-16 h-16 bg-[#f0f0f0] group-hover:bg-[#fcebaf] rounded-full flex items-center justify-center mb-6 transition-colors">
              <svg className="w-8 h-8 text-[#d97736]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </div>
            <h3 className="font-serif font-bold text-xl text-gray-900 mb-2">Instagram</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">Ikuti keseharian kami di studio dan jadilah yang pertama melihat rilis karya terbaru.</p>
            <span className="text-[#d97736] text-xs font-bold uppercase tracking-wider group-hover:underline">@budiman_handicraft &rarr;</span>
          </a>

          <div className="bg-white p-8 border border-gray-200 rounded-sm shadow-lg group flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-[#d97736]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-serif font-bold text-xl text-gray-900 mb-2">Workshop Kami</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">Buka Setiap Hari<br/>09.00 - 17.00 WIB</p>
            <span className="text-[#d97736] text-xs font-bold uppercase tracking-wider">Jawa Barat, Indonesia</span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="bg-white border border-[#e8e6dd] p-4 md:p-8 rounded-sm shadow-sm flex flex-col lg:flex-row gap-8 items-center">
          
          <div className="w-full lg:w-1/3 flex flex-col justify-center">
            <h4 className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase mb-2">Visit Our Studio</h4>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Lokasi Kami</h2>
            <p className="text-gray-600 text-sm leading-relaxed text-justify mb-8">
              Saksikan langsung bagaimana sepotong kayu diubah menjadi karya seni bernilai tinggi. 
              Kunjungi studio kami untuk melihat proses pembuatan, berbelanja langsung, atau sekadar berbincang tentang seni kriya.
            </p>
            
            <a href={gmapsLink} target="_blank" rel="noopener noreferrer" 
              className="bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-sm text-xs flex items-center justify-center gap-3 uppercase tracking-widest transition-colors cursor-pointer w-fit"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Buka di Google Maps
            </a>
          </div>

          <div className="w-full lg:w-2/3 h-[400px] bg-gray-200 rounded-sm overflow-hidden relative border border-gray-200">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.5284551377918!2d107.7548137755557!3d-6.94681606800847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68c3de8237ce33%3A0x43d0b6232cc9fac8!2sBudiman%20Handicraft!5e0!3m2!1sid!2sid!4v1784786328574!5m2!1sid!2sid" 
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade" title="Lokasi Budiman Handicraft"
            ></iframe>
          </div>
          
        </div>
      </section>
    </main>
  );
}