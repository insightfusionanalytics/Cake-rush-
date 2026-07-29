import { useState, useEffect, useRef } from "react";
import { useSiteSettings, useHouseFavourites } from "@/hooks/use-site-data";
import { Canela, Eyebrow, L, Numeral, SANS, TextLink } from "@/components/luxe/tokens";

// Default labels in order — mapped to these 5 section anchors.
const NAV_ANCHORS = ["about", "menu", "gallery", "reviews", "contact"] as const;
const DEFAULT_NAV_LABELS = ["Story", "Menu", "Lookbook", "Bouquets", "Contact"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  const { data: categories } = useHouseFavourites();
  const [menuHoverOpen, setMenuHoverOpen] = useState(false);
  const [mobileMenuExpanded, setMobileMenuExpanded] = useState(false);
  // Grace-period timer so the cursor can travel from the Menu button
  // down into the dropdown without the dropdown closing mid-move.
  const menuCloseTimerRef = useRef<number | null>(null);
  const openMenuNow = () => {
    if (menuCloseTimerRef.current) {
      window.clearTimeout(menuCloseTimerRef.current);
      menuCloseTimerRef.current = null;
    }
    setMenuHoverOpen(true);
  };
  const closeMenuSoon = () => {
    if (menuCloseTimerRef.current) window.clearTimeout(menuCloseTimerRef.current);
    menuCloseTimerRef.current = window.setTimeout(() => {
      setMenuHoverOpen(false);
      menuCloseTimerRef.current = null;
    }, 220);
  };
  // Same treatment for the mobile drawer's Menu row so hovering
  // (on a laptop viewing the drawer) opens the sub-list too.
  const mobileMenuCloseTimerRef = useRef<number | null>(null);
  const openMobileMenuNow = () => {
    if (mobileMenuCloseTimerRef.current) {
      window.clearTimeout(mobileMenuCloseTimerRef.current);
      mobileMenuCloseTimerRef.current = null;
    }
    setMobileMenuExpanded(true);
  };
  const closeMobileMenuSoon = () => {
    if (mobileMenuCloseTimerRef.current)
      window.clearTimeout(mobileMenuCloseTimerRef.current);
    mobileMenuCloseTimerRef.current = window.setTimeout(() => {
      setMobileMenuExpanded(false);
      mobileMenuCloseTimerRef.current = null;
    }, 220);
  };
  useEffect(() => {
    return () => {
      if (menuCloseTimerRef.current)
        window.clearTimeout(menuCloseTimerRef.current);
      if (mobileMenuCloseTimerRef.current)
        window.clearTimeout(mobileMenuCloseTimerRef.current);
    };
  }, []);
  const whatsapp = settings?.whatsapp_number ?? "919920272566";
  const instagram = settings?.instagram_url ?? "https://instagram.com/cakerush.in";
  const wordmark = settings?.brand_wordmark ?? "Cake Rush";
  const navEyebrow = settings?.nav_eyebrow ?? "Est. MMXXIV · Bandra West";
  const ctaWa = settings?.hero_cta_whatsapp ?? "Reserve on WhatsApp →";
  const ctaIg = settings?.hero_cta_instagram ?? "View Instagram →";
  const menuAria = settings?.nav_menu_aria ?? "Menu";
  const closeAria = settings?.nav_close_aria ?? "Close";

  // Parse "Story,Menu,Lookbook,Notes,Contact" → up to 5 [label, anchor] tuples.
  const rawLinks = (settings?.nav_links ?? DEFAULT_NAV_LABELS.join(",")).trim();
  const labels = rawLinks
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, NAV_ANCHORS.length);
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
    setMenuHoverOpen(false);
    setMobileMenuExpanded(false);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  // Jump to a specific House Favourites category. Fires a custom event so
  // HouseFavourites can flip its active tab, then scrolls to the section.
  const jumpToCategory = (categoryId: string) => {
    setMobileOpen(false);
    setMenuHoverOpen(false);
    setMobileMenuExpanded(false);
    window.dispatchEvent(
      new CustomEvent("cakerush:selectHouseCategory", {
        detail: { id: categoryId },
      }),
    );
    // Defer scroll so the tab-change re-render lands first (avoids a
    // scroll-into-flicker if the layout jumps as the tab content mounts).
    setTimeout(() => {
      const el = document.getElementById("menu");
      if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
    }, 40);
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
              {links.map(([label, id]) => {
                const isMenu = id === "menu";
                const linkBtnStyle = {
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: L.ink,
                  fontSize: 12,
                  padding: 0,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase" as const,
                  fontFamily: SANS,
                  fontWeight: 500,
                };
                if (!isMenu) {
                  return (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      style={linkBtnStyle}
                    >
                      {label}
                    </button>
                  );
                }
                // Menu: click still scrolls; hover reveals category dropdown.
                return (
                  <div
                    key={id}
                    style={{ position: "relative" }}
                    onMouseEnter={openMenuNow}
                    onMouseLeave={closeMenuSoon}
                  >
                    <button
                      onClick={() => scrollTo(id)}
                      onFocus={openMenuNow}
                      onBlur={closeMenuSoon}
                      style={{
                        ...linkBtnStyle,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      aria-haspopup="menu"
                      aria-expanded={menuHoverOpen}
                    >
                      {label}
                      <svg
                        width="8"
                        height="8"
                        viewBox="0 0 8 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        style={{
                          transition: "transform 220ms ease",
                          transform: menuHoverOpen ? "rotate(180deg)" : "rotate(0)",
                        }}
                      >
                        <path d="M1.5 3 L4 5.5 L6.5 3" />
                      </svg>
                    </button>
                    {menuHoverOpen && categories.length > 0 && (
                      <div
                        role="menu"
                        onMouseEnter={openMenuNow}
                        onMouseLeave={closeMenuSoon}
                        style={{
                          position: "absolute",
                          // Butt directly against the button — no visible
                          // gap the cursor would have to cross. A tall
                          // padding-top on the container fills the space.
                          top: "100%",
                          right: 0,
                          minWidth: 220,
                          background: L.white,
                          border: `1px solid ${L.rule}`,
                          boxShadow: "0 24px 60px -20px rgba(42,31,23,0.28)",
                          padding: "10px 0",
                          marginTop: 10,
                          animation: "lxFade 220ms ease",
                          zIndex: 60,
                        }}
                      >
                        {categories.map((c) => (
                          <button
                            key={c.id}
                            role="menuitem"
                            onClick={() => jumpToCategory(c.id)}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background =
                                L.paper;
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background =
                                "transparent";
                            }}
                            style={{
                              display: "block",
                              width: "100%",
                              padding: "10px 20px",
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              textAlign: "left",
                              fontFamily:
                                '"Cormorant Garamond", "Tiempos Headline", Georgia, serif',
                              fontStyle: "italic",
                              fontSize: 17,
                              color: L.ink,
                              letterSpacing: "-0.005em",
                              transition: "background 180ms ease",
                            }}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
          <div style={{ padding: 24, flex: 1, overflowY: "auto" }}>
            {mobileLinks.map(([label, id], i) => {
              const isMenu = id === "menu";
              if (!isMenu) {
                return (
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
                );
              }
              // Mobile Menu row: tap toggles the category sub-list.
              // Hover also opens it (with grace period) so laptop
              // users viewing the drawer see the sub-list without
              // needing to click first. Sub-list is hidden by default.
              return (
                <div
                  key={id}
                  onMouseEnter={openMobileMenuNow}
                  onMouseLeave={closeMobileMenuSoon}
                  style={{
                    borderBottom: `1px solid ${L.ruleSoft}`,
                  }}
                >
                  <button
                    onClick={() => setMobileMenuExpanded((v) => !v)}
                    aria-expanded={mobileMenuExpanded}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 16,
                      width: "100%",
                      padding: "20px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <Numeral size={18} color={L.copper}>
                      0{i + 1}
                    </Numeral>
                    <Canela size="clamp(24px, 7vw, 32px)">{label}</Canela>
                  </button>
                  {mobileMenuExpanded && categories.length > 0 && (
                    <div
                      style={{
                        paddingLeft: 42,
                        paddingBottom: 18,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        animation: "lxFade 260ms ease",
                      }}
                    >
                      {categories.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => jumpToCategory(c.id)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "8px 0",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          <Canela
                            size="clamp(17px, 4.2vw, 20px)"
                            italic
                            style={{ color: L.copperDeep }}
                          >
                            {c.label}
                          </Canela>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
