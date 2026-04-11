import { Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-card py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="font-heading text-2xl font-bold mb-1">🎂 Cake Rush</h3>
            <p className="text-card/60 text-sm">Baked with love for every celebration</p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://wa.me/919920272566"
              target="_blank"
              rel="noopener noreferrer"
              className="text-card/70 hover:text-whatsapp transition-colors text-sm"
            >
              WhatsApp
            </a>
            <a
              href="https://www.instagram.com/cake___rush/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-card/70 hover:text-instagram-pink transition-colors flex items-center gap-1"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          </div>
        </div>

        <div className="border-t border-card/10 mt-8 pt-6 text-center">
          <p className="text-card/40 text-sm">
            © {new Date().getFullYear()} Cake Rush. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
