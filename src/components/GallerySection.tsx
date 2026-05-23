import { useEffect, useState } from "react";
import { useGalleryImages, useSiteSettings } from "@/hooks/use-site-data";
import { Canela, Eyebrow, L, Reveal } from "@/components/luxe/tokens";

type GalleryImg = { id: string; image_url: string; alt_text?: string | null };

const GallerySection = () => {
  const { data: images } = useGalleryImages();
  const { data: settings } = useSiteSettings();
  const [open, setOpen] = useState<GalleryImg | null>(null);

  const eyebrow = settings?.lookbook_eyebrow ?? "Chapter Three — Lookbook";
  const heading = settings?.lookbook_heading ?? "Every cake, a small portrait.";
  const subtitle =
    settings?.lookbook_subtitle ??
    "A selection from four years. Hover to name, press to open.";
  const ci = heading.indexOf(",");
  const headingTop = ci === -1 ? heading : heading.slice(0, ci).trim() + (heading[ci] === "," ? "," : "");
  const headingBottom = ci === -1 ? "" : heading.slice(ci + 1).trim();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const list = ((images as GalleryImg[]) || []).slice(0, 12);

  return (
    <section
      id="gallery"
      className="lx-look"
      style={{ background: L.ivory }}
    >
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <Reveal>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "clamp(24px, 3vw, 40px)",
              flexWrap: "wrap",
              marginBottom: "clamp(40px, 6vw, 80px)",
            }}
          >
            <div>
              <Eyebrow>{eyebrow}</Eyebrow>
              <div style={{ marginTop: "clamp(16px, 2vw, 24px)" }}>
                <Canela
                  size="var(--lx-fs-display)"
                  className="lx-look-h"
                  style={{ display: "block", letterSpacing: "-0.02em" }}
                >
                  {headingTop}
                </Canela>
                {headingBottom && (
                  <Canela
                    size="var(--lx-fs-display)"
                    italic
                    className="lx-look-h"
                    style={{
                      display: "block",
                      letterSpacing: "-0.02em",
                      color: L.copperDeep,
                    }}
                  >
                    {headingBottom}
                  </Canela>
                )}
              </div>
            </div>
            <Canela
              size="clamp(14px, 1.4vw, 18px)"
              italic
              style={{
                color: L.ink2,
                maxWidth: 260,
                fontWeight: 300,
                lineHeight: 1.5,
              }}
            >
              {subtitle}
            </Canela>
          </div>
        </Reveal>

        <div className="lx-look-grid">
          {list.map((im, i) => (
            <Reveal key={im.id} delay={(i % 3) * 80}>
              <button
                onClick={() => setOpen(im)}
                className="lx-look-item"
                style={{
                  border: "none",
                  padding: 0,
                  background: "none",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  display: "block",
                  width: "100%",
                  height: "100%",
                }}
              >
                <img
                  src={im.image_url}
                  alt={im.alt_text || ""}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 900ms cubic-bezier(.2,.8,.2,1)",
                  }}
                  loading="lazy"
                />
                <div
                  className="lx-look-ov"
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    transition: "opacity 400ms",
                    background:
                      "linear-gradient(0deg, rgba(42,31,23,0.55), transparent 65%)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: 22,
                  }}
                >
                  <div>
                    <Eyebrow color={L.rose} style={{ fontSize: 9 }}>
                      № {String(i + 1).padStart(3, "0")}
                    </Eyebrow>
                    <Canela
                      size={22}
                      italic
                      style={{ color: L.ivory, display: "block", marginTop: 6 }}
                    >
                      {im.alt_text}
                    </Canela>
                  </div>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {open && (
        <div
          onClick={() => setOpen(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(42,31,23,0.9)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            cursor: "pointer",
            animation: "lxFade 380ms ease",
          }}
        >
          <div style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
            <img
              src={open.image_url}
              alt={open.alt_text || ""}
              style={{
                maxWidth: "100%",
                maxHeight: "84vh",
                objectFit: "contain",
                boxShadow: "0 30px 100px rgba(0,0,0,0.5)",
                display: "block",
              }}
            />
            {open.alt_text && (
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <Canela size="clamp(16px, 1.6vw, 20px)" italic style={{ color: L.ivory }}>
                  {open.alt_text}
                </Canela>
              </div>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              top: 28,
              right: 32,
              color: L.ivory,
              fontSize: 10,
              letterSpacing: "0.28em",
              fontFamily: "Inter, sans-serif",
              textTransform: "uppercase",
            }}
          >
            Esc to close
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
