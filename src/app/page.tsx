import Hero from "@/modules/home/ui/Hero";
import Footer from "@/modules/layout/Footer";
import Partnership from "@/modules/home/ui/Partnership";
import WhyChoiceUs from "@/modules/home/ui/WhyChoiceUs";
import OurServices from "@/modules/home/ui/OurServices";
import LatestPhotos from "@/modules/home/ui/LatestPhotos";
import {SimpleRepairProcess} from "@/modules/home/ui/SimpleRepairProcess";
import {RedCarSection} from "@/modules/home/ui/RedCarSection";
import {Team} from "@/modules/home/ui/Team";
import LocationTabs from "@/modules/home/ui/LocationTabs";
import ContactForm from "@/modules/home/ui/ContactForm";
import Header from "@/modules/layout/Header";

export default function Home() {
  return (
      <main className="min-h-screen">
          <Header />
          {/* Hero Section */}
          <Hero />
          <Partnership />
          <WhyChoiceUs />
          <OurServices />
          <LatestPhotos  />
          <SimpleRepairProcess />
          <RedCarSection />
          <Team />
          <LocationTabs />
          <ContactForm />
          <Footer />
      </main>
  );
}