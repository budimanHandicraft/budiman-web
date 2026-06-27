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
          <svg className="relative block w-full h-[80px] md:h-[600px] transform -scale-x-100" xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,224C960,203,1056,149,1152,133.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              className="fill-white"
            ></path>
          </svg>
        </div>
      </section>

      <section>
        
      </section>
      
    </main>
  );
}