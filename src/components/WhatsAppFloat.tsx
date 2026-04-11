import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-data";

const WhatsAppFloat = () => {
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number || "919920272566";

  return (
    <a
      href={`https://wa.me/${whatsapp}?text=Hi!%20I'd%20like%20to%20order%20a%20cake`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-whatsapp text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-float"
      aria-label="Order on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppFloat;
