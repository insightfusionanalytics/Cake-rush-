import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import PhilosophyTicker from "@/components/PhilosophyTicker";
import AboutSection from "@/components/AboutSection";
import HouseFavourites from "@/components/HouseFavourites";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <PhilosophyTicker />
      <AboutSection />
      <HouseFavourites />
      <GallerySection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
      <WhatsAppFloat />
    </div>
  );
};

export default Index;
