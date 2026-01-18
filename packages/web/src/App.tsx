import Navigation from "@/components/share/header";
import HeroSection from "@/components/home/hero-section";
import Features from "@/components/home/features";
import FAQ from "@/components/home/faq";
import Reference from "@/components/home/reference";
import Footer from "@/components/share/footer";

export default function App() {
  return (
    <div className="min-h-screen text-foreground selection:bg-primary/20">
      <Navigation />
      <HeroSection />
      <Features />
      <FAQ />
      <Reference />
      <Footer />
    </div>
  );
}
