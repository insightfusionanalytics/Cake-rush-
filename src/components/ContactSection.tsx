import { Button } from "@/components/ui/button";
import { MessageCircle, Instagram, Truck, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-data";

const ContactSection = () => {
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number || "919920272566";
  const instagram = settings?.instagram_url || "#";

  return (
    <section
      id="contact"
      className="py-24"
      style={{
        background: "linear-gradient(135deg, hsl(var(--lavender)) 0%, hsl(var(--soft-pink)) 50%, hsl(var(--peach)) 100%)",
      }}
    >
      <div className="container mx-auto px-4 md:px-8 text-center animate-fade-in">
        <p className="text-primary font-medium tracking-widest uppercase text-sm mb-3">Ready to Order?</p>
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
          {settings?.contact_heading || "Ready to Order Your Dream Cake?"}
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
          {settings?.contact_text || "Get in touch with us on WhatsApp for custom orders and delivery details. We would love to make your celebration special!"}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <a href={`https://wa.me/${whatsapp}?text=Hi!%20I'd%20like%20to%20order%20a%20custom%20cake`} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white rounded-full px-10 py-6 text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              <MessageCircle className="mr-2 h-5 w-5" />
              Order on WhatsApp
            </Button>
          </a>
          <a href={instagram} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="bg-instagram-pink hover:bg-instagram-pink/90 text-white rounded-full px-10 py-6 text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105"
            >
              <Instagram className="mr-2 h-5 w-5" />
              Follow on Instagram
            </Button>
          </a>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md border border-border/50">
            <Truck className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">🚚 Delivery Available</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-md border border-border/50">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">📍 Carter Road, Bandra West, Mumbai</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
