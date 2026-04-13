import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-data";

const HeroSection = () => {
  const { data: settings } = useSiteSettings();
  const title = settings?.hero_title || "Baked with Love";
  const subtitle = settings?.hero_subtitle || "";
  const badge = settings?.hero_badge || "100% Fresh & Eggless Options";
  const whatsapp = settings?.whatsapp_number || "919920272566";
  const instagram = settings?.instagram_url || "#";

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--cream)) 0%, hsl(var(--soft-pink)) 40%, hsl(var(--lavender)) 100%)",
      }}
    >
      {/* Animated decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-peach/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-lavender/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-soft-pink/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "0.8s" }} />

      <div className="container mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-12 relative z-10">
        {/* Text */}
        <div className="flex-1 text-center lg:text-left">
          <p className="text-primary font-medium tracking-widest uppercase text-sm mb-4 animate-fade-in">
            Freshly Baked • Made with Love
          </p>
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
            {title.includes("Love") ? (
              <>
                {title.split("Love")[0]}
                <span className="text-primary italic">Love</span>
                {title.split("Love")[1]}
              </>
            ) : (
              title
            )}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white rounded-full px-8 py-6 text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                <MessageCircle className="mr-2 h-5 w-5" />
                {settings?.hero_cta_whatsapp || "Order on WhatsApp"}
              </Button>
            </a>
            <a href={instagram} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-base border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
              >
                {settings?.hero_cta_instagram || "View on Instagram"}
              </Button>
            </a>
          </div>
        </div>

        {/* Hero image */}
        <div className="flex-1 flex justify-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative">
            <div className="w-80 h-80 md:w-[26rem] md:h-[26rem] rounded-full bg-card shadow-2xl overflow-hidden border-4 border-white/60 animate-float">
              <img
                src="/gallery/cake_strawberry_v2_enhanced.png"
                alt="Beautiful custom cake by Cake Rush"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded-full px-6 py-2.5 shadow-lg border border-border">
              <span className="text-sm font-medium text-foreground">✨ {badge}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
