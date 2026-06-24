import { useState, useEffect } from "react";
import { useSiteSettings } from "@/hooks/use-site-data";
import { Canela, Eyebrow, L, Numeral, SANS, TextLink } from "@/components/luxe/tokens";

// Default labels in order — mapped to these 4 section anchors.
const NAV_ANCHORS = ["about", "menu", "gallery", "contact"] as const;
const DEFAULT_NAV_LABELS = ["Story", "Menu", "Lookbook", "Contact"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number ?? "919920272566";
  const instagram = settings?.instagram_url ?? "https://instagram.com/cakerush.in";
  const wordmark = settings?.brand_wordmark ?? "Cake Rush";
  const navEyebrow = settings?.nav_eyebrow ?? "Est. MMXXIV · Bandra West";
  const ctaWa = settings?.hero_cta_whatsapp ?? "Reserve on WhatsApp →";
  const ctaIg = settings?.hero_cta_instagram ?? "View Instagram →";
  const menuAria = settings?.nav_menu_aria ?? "Menu";
  const closeAria = settings?.nav_close_aria ?? "Close";

  // Parse "Story,Menu,Lookbook,Contact" → 4 [label, anchor] tuples.
  const rawLinks = (settings?.nav_links ?? DEFAULT_NAV_LABELS.join(",")).trim();
  const labels = rawLinks
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  const links: Array<[string, string]> = NAV_ANCHORS.map(
    (anchor, i) => [labels[i] ?? DEFAULT_NAV_LABELS[i], anchor],
  );
  const mobileLinks = links;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <>
      <nav
        className="lx-nav"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: scrolled ? "rgba(245,240,232,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? `1px solid ${L.rule}` : "1px solid transparent",
          transition: "background 400ms ease, border-color 400ms ease",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "clamp(20px, 2.5vw, 32px)",
            maxWidth: 1440,
            margin: "0 auto",
          }}
          className="lx-nav-inner"
        >
          <div className="lx-nav-meta hidden lg:block">
            <Eyebrow color={L.ink2} style={{ fontSize: 10 }}>
              {navEyebrow}
            </Eyebrow>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label={wordmark}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              gridColumn: 2,
              justifySelf: "center",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              src="/logo.png"
              alt={wordmark}
              style={{
                height: "clamp(40px, 5vw, 56px)",
                width: "auto",
                display: "block",
              }}
            />
          </button>
          <div
            className="lx-nav-links"
            style={{
              display: "flex",
              gap: 36,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <div className="hidden lg:flex" style={{ gap: 36 }}>
              {links.map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: L.ink,
                    fontSize: 12,
                    padding: 0,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    fontFamily: SANS,
                    fontWeight: 500,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className="lx-nav-burger lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label={menuAria}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: L.ink,
                padding: 6,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <line x1="4" y1="8" x2="20" y2="8" />
                <line x1="4" y1="16" x2="20" y2="16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="lx-mobile-menu"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            background: L.ivory,
            animation: "lxFade 320ms ease",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px 24px",
              borderBottom: `1px solid ${L.rule}`,
            }}
          >
            <img
              src="/logo.png"
              alt={wordmark}
              style={{ height: 44, width: "auto", display: "block" }}
            />
            <button
              onClick={() => setMobileOpen(false)}
              aria-label={closeAria}
              style={{ background: "none", border: "none", cursor: "pointer", color: L.ink }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>
          <div style={{ padding: 24, flex: 1 }}>
            {mobileLinks.map(([label, id], i) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  width: "100%",
                  padding: "20px 0",
                  borderBottom: `1px solid ${L.ruleSoft}`,
                  background: "none",
                  border: "none",
                  borderBottomWidth: 1,
                  borderBottomStyle: "solid",
                  borderBottomColor: L.ruleSoft,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <Numeral size={18} color={L.copper}>
                  0{i + 1}
                </Numeral>
                <Canela size="clamp(24px, 7vw, 32px)">{label}</Canela>
              </button>
            ))}
          </div>
          <div
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              borderTop: `1px solid ${L.rule}`,
            }}
          >
            <TextLink href={`https://wa.me/${whatsapp}`}>{ctaWa}</TextLink>
            <TextLink href={instagram}>{ctaIg}</TextLink>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
