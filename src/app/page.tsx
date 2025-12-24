import Hero from "@/components/Hero";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Partnership from "@/components/Partnership";

export default function Home() {
  return (
      <main className="min-h-screen">
        {/* Hero Section */}
        <Hero />
        <Partnership />


        <Footer />
      </main>
  );
}