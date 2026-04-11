import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/use-site-data";
import logo from "@/assets/logo.jpeg";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Menu", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number || "919920272566";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = (href: string) => {
    setMobileOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-card/95 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8">
        <button onClick={() => handleClick("#home")} className="flex items-center">
          <img src={logo} alt="Cake Rush" className="h-12 w-auto rounded-full" />
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleClick(l.href)}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {l.label}
            </button>
          ))}
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
            <Button className="bg-whatsapp hover:bg-whatsapp/90 text-white rounded-full px-6 shadow-lg">
              Order Now
            </Button>
          </a>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[72px] bg-card/98 backdrop-blur-md border-t border-border animate-fade-in z-40">
          <div className="flex flex-col items-center gap-6 py-10">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleClick(l.href)}
                className="text-lg font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {l.label}
              </button>
            ))}
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
              <Button className="bg-whatsapp hover:bg-whatsapp/90 text-white rounded-full px-8 shadow-lg">
                Order Now
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
