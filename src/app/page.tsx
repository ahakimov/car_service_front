import Hero from "@/modules/home/ui/Hero";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/modules/layout/Footer";
import Partnership from "@/modules/home/ui/Partnership";
import WhyChoiceUs from "@/modules/home/ui/WhyChoiceUs";
import OurServices from "@/modules/home/ui/OurServices";
import LatestPhotos from "@/modules/home/ui/LatestPhotos";

export default function Home() {
  return (
      <main className="min-h-screen">
        {/* Hero Section */}
        <Hero />
        <Partnership />
        <WhyChoiceUs />
        <OurServices />
          <LatestPhotos  />
        <Footer />
      </main>
  );
}