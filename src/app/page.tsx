import Hero from "@/components/Hero";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
      <main className="min-h-screen">
        {/* Hero Section */}
        <Hero />



        {/* Footer */}
        <footer
            className="w-full py-16"
            style={{ backgroundColor: "var(--primary-950)" }}
        >
          <div className="max-w-screen-xl mx-auto px-8 lg:px-20">
            <div className="flex flex-col items-center gap-8">
              <div className="flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Image
                      src="/logo_white.png"
                      alt="Car Repair Logo"
                      width={216}
                      height={164}
                      className="w-40 lg:w-54 h-auto"
                  />
                  <p
                      className="text-center text-base leading-6 max-w-sm"
                      style={{ color: "var(--primary-50)" }}
                  >
                    Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et
                    massa mi.
                  </p>
                </div>

                <div className="flex items-center gap-4">

                </div>
              </div>

              <div
                  className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 py-2 border-t border-b"
                  style={{ borderColor: "var(--primary-800)" }}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="#privacy">privacy policy</Link>
                  <Link href="#sitemap">Sitemap</Link>
                  <Link href="#terms">Terms</Link>
                </div>
                <Link href="tel:+48975678978">
                  call us: +48 975 678 978
                </Link>
              </div>

              <p
                  className="text-center font-unbounded text-base font-light uppercase leading-6"
                  style={{ color: "var(--primary-100)" }}
              >
                2025 - all rights reserved
              </p>
            </div>
          </div>
        </footer>
      </main>
  );
}