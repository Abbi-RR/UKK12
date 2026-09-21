import React from "react";
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import SpaceCatalogSection from "@/components/home/SpaceCatalogSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import FaqSection from "@/components/home/FaqSection";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/home/Footer";
import { getCurrentUser } from "@/lib/auth-session";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9ff] font-sans">
      {/* 1. Header / Navbar */}
      <Navbar user={user} />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* 2. Hero Section */}
        <HeroSection />

        {/* 3. How It Works Section (Alur Reservasi) */}
        <HowItWorksSection />

        {/* 4. Space Catalog Section (Tipe Space) */}
        <SpaceCatalogSection />

        {/* 5. Features Section (Kenapa Memilih Kami) */}
        <FeaturesSection />

        {/* 6. FAQ Section */}
        <FaqSection />

        {/* 7. Bottom CTA Banner */}
        <CtaBanner />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
