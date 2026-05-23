import { Canela, L, SANS } from "@/components/luxe/tokens";
import { useSiteSettings } from "@/hooks/use-site-data";

const Footer = () => {
  const { data: settings } = useSiteSettings();
  const tagline = settings?.footer_tagline ?? "";
  const year = new Date().getFullYear();
  const copyrightTemplate =
    settings?.footer_copyright ?? "© {year} Cake Rush. All rights reserved.";
  const copyrightText = copyrightTemplate.replace(/\{year\}/g, String(year));

  return (
    <footer
      className="lx-foot"
      style={{
        background: L.ivory,
        borderTop: `1px solid ${L.rule}`,
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Canela size="clamp(18px, 1.8vw, 22px)" italic style={{ color: L.ink }}>
            Cake Rush
          </Canela>
          {tagline && (
            <Canela
              size="clamp(12px, 1.1vw, 14px)"
              italic
              style={{ color: L.ink2, fontWeight: 300 }}
            >
              {tagline}
            </Canela>
          )}
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: L.ink2,
          }}
        >
          {copyrightText}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
