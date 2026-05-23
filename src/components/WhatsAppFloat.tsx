import { useSiteSettings } from "@/hooks/use-site-data";
import { L, SANS } from "@/components/luxe/tokens";

const WhatsAppFloat = () => {
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number || "919920272566";

  return (
    <a
      href={`https://wa.me/${whatsapp}?text=${encodeURIComponent("Hi, I’d like to reserve a cake.")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="lx-floatpill"
      aria-label="Order on WhatsApp"
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 40,
        background: L.ink,
        color: L.ivory,
        padding: "14px 22px",
        borderRadius: 999,
        fontFamily: SANS,
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        textDecoration: "none",
        fontWeight: 500,
        boxShadow: "0 18px 40px -12px rgba(42,31,23,0.45)",
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        transition: "transform 300ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: L.copper,
        }}
      />
      Order Now
    </a>
  );
};

export default WhatsAppFloat;
