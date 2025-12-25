import Hero from "@/components/Hero";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/Footer";
import Partnership from "@/components/Partnership";
import WhyChoiceUs from "@/components/WhyChoiceUs";

export default function Home() {
  return (
      <main className="min-h-screen">
        {/* Hero Section */}
        <Hero />
        <Partnership />
        <WhyChoiceUs />

        <Footer />
      </main>
  );
}