import { useSiteSettings } from "@/hooks/use-site-data";
import { Canela, Eyebrow, L, Reveal, TextLink } from "@/components/luxe/tokens";

const HeroSection = () => {
  const { data: settings } = useSiteSettings();
  // Use ?? not || — so the admin can save an explicitly empty value and the
  // public site renders empty, not the default fallback.
  const whatsapp = settings?.whatsapp_number ?? "919920272566";
  const instagram = settings?.instagram_url ?? "https://instagram.com/cakerush.in";
  const heroImg = settings?.hero_image_url ?? "/gallery/cake_strawberry_v2_enhanced.png";
  const heroBadge = settings?.hero_badge ?? "Est. MMXXIV · Bandra · Mumbai";
  const heroTitle = (settings?.hero_title ?? "Cake Rush").trim();
  const heroSubtitle =
    settings?.hero_subtitle ?? "A cake atelier where every slice tells a story.";
  const ctaWa = settings?.hero_cta_whatsapp ?? "Reserve on WhatsApp →";
  const ctaIg = settings?.hero_cta_instagram ?? "View Instagram →";
  const captionLeft = settings?.hero_caption_left ?? "Plate I · Strawberries & Cream";
  const captionRight = settings?.hero_caption_right ?? "№ 001";
  const sticker = settings?.hero_sticker ?? "— for Tara's fourth";
  const heroAlt = settings?.hero_image_alt ?? "Strawberries & cream — the house cake";

  // Split title on first space → italic line 1 + regular line 2 with copper period.
  const firstSpace = heroTitle.indexOf(" ");
  const titleLine1 = firstSpace === -1 ? heroTitle : heroTitle.slice(0, firstSpace);
  const titleLine2 =
    firstSpace === -1 ? "" : heroTitle.slice(firstSpace + 1).replace(/[.!?]+$/, "");

  return (
    <section
      id="home"
      className="lx-hero"
      style={{
        background: L.ivory,
        position: "relative",
      }}
    >
      <div
        className="lx-hero-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 1fr",
          gap: 64,
          alignItems: "center",
          maxWidth: 1440,
          margin: "0 auto",
          position: "relative",
        }}
      >
        <Reveal>
          <Eyebrow>{heroBadge}</Eyebrow>
          <div style={{ marginTop: "clamp(20px, 2.5vw, 32px)" }}>
            <Canela
              size="var(--lx-fs-hero)"
              italic
              className="lx-hero-title-line"
              style={{
                display: "block",
                color: L.ink,
                letterSpacing: "-0.02em",
              }}
            >
              {titleLine1}
            </Canela>
            {titleLine2 && (
              <Canela
                size="var(--lx-fs-hero)"
                className="lx-hero-title-line"
                style={{
                  display: "block",
                  color: L.ink,
                  letterSpacing: "-0.02em",
                  marginTop: "-0.08em",
                }}
              >
                {titleLine2}
                <span style={{ color: L.copper, fontStyle: "italic" }}>.</span>
              </Canela>
            )}
          </div>
          <div style={{ marginTop: "clamp(28px, 3.5vw, 48px)", maxWidth: 440 }}>
            <Canela
              size="var(--lx-fs-lede)"
              italic
              style={{ color: L.ink2, lineHeight: 1.4, fontWeight: 300 }}
            >
              {heroSubtitle}
            </Canela>
          </div>
          <div
            style={{
              display: "flex",
              gap: "clamp(20px, 3vw, 40px)",
              marginTop: "clamp(32px, 4.5vw, 52px)",
              flexWrap: "wrap",
            }}
          >
            <TextLink href={`https://wa.me/${whatsapp}`}>{ctaWa}</TextLink>
            <TextLink href={instagram} color={L.copperDeep}>
              {ctaIg}
            </TextLink>
          </div>
        </Reveal>

        <Reveal delay={240} y={32}>
          <div
            className="lx-hero-img-wrap"
            style={{
              position: "relative",
              transform: "rotate(-2.2deg)",
              transition: "transform 800ms cubic-bezier(.2,.8,.2,1)",
            }}
          >
            <div
              style={{
                position: "relative",
                background: L.white,
                padding: 12,
                boxShadow:
                  "0 40px 80px -30px rgba(42,31,23,0.28), 0 8px 24px -8px rgba(42,31,23,0.12)",
              }}
            >
              <div style={{ position: "relative", overflow: "hidden" }}>
                <img
                  src={heroImg}
                  alt={heroAlt}
                  className="lx-hero-img"
                  style={{
                    width: "100%",
                    objectFit: "cover",
                    display: "block",
                    filter: "saturate(0.95) contrast(1.02)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    pointerEvents: "none",
                    backgroundImage:
                      "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='7'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='220' height='220' filter='url(%23n)' opacity='0.5'/></svg>\")",
                    backgroundSize: "220px 220px",
                    mixBlendMode: "overlay",
                    opacity: 0.28,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "14px 8px 4px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  color: L.ink2,
                  textTransform: "uppercase",
                }}
              >
                <span>{captionLeft}</span>
                <span>{captionRight}</span>
              </div>
            </div>
            {sticker && sticker.trim().length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -28,
                  left: -28,
                  padding: "10px 14px",
                  background: L.ivory,
                }}
              >
                <Canela size={14} italic style={{ color: L.ink2 }}>
                  {sticker}
                </Canela>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default HeroSection;
