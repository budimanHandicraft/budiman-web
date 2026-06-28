import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="relative w-full h-[600px] md:h-[1400px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/wayang.png" alt="background wayang"
            fill priority
            className="object-cover object-[center_15%]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-[2px]">
          <svg className="relative block w-full h-[80px] md:h-[500px] transform -scale-x-100" xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,224C960,203,1056,149,1152,133.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </section>

      <section className="pb-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="text-[24px] font-bold text-black mb-3">Craftmanship</h3>
              <p className="text-black text-[16px] leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>

            <div>
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.496 1.508 1.333 1.508 2.316V18" />
                </svg>
              </div>
              <h3 className="text-[24px] font-bold text-black mb-3">Philosophy</h3>
              <p className="text-black text-[16px] leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>

            <div>
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-[24px] font-bold text-black mb-3">Longevity</h3>
              <p className="text-black text-[16px] leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-black relative overflow-hidden">
        <div className="relative z-10 w-full mx-auto px-4 sm:px-6 lg:px-32">
          <div className="mb-8">
            <h4 className="text-[#d97736] font-bold text-[24px] tracking-[0.23m] uppercase mb-2">Curated Selection</h4>
            <h2 className="text-[28px] font-bold text-white mb-4 leading-none">The Artisan Masterpiece</h2>
            <p className="text-white text-[18px] max-w-3xl">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-32">
            <div className="group cursor-pointer">
              <div className="aspect-[4/5] bg-gray-200 mb-4 overfloow-hidden rounded-sm relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Gambar Produk</div>
              </div>
              <h3 className="text-[32px] font-bold text-white mb-1 group-hover:text-[#d97736] transition-colors">Wayang Golek</h3>
              <p className="text-[#d97736] font-bold text-[24px]">Rp. 300.000,00</p>
            </div>
            <div className="group cursor-pointer">
              <div className="aspect-[4/5] bg-gray-200 mb-4 overfloow-hidden rounded-sm relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Gambar Produk</div>
              </div>
              <h3 className="text-[32px] font-bold text-white mb-1 group-hover:text-[#d97736] transition-colors">Busur Panah</h3>
              <p className="text-[#d97736] font-bold text-[24px]">Rp. 300.000,00</p>
            </div>
            <div className="group cursor-pointer">
              <div className="aspect-[4/5] bg-gray-200 mb-4 overfloow-hidden rounded-sm relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">Gambar Produk</div>
              </div>
              <h3 className="text-[32px] font-bold text-white mb-1 group-hover:text-[#d97736] transition-colors">Wayang Golek</h3>
              <p className="text-[#d97736] font-bold text-[24px]">Rp. 300.000,00</p>
            </div>
          </div>
        </div>
      </section>
      
    </main>
  );
}