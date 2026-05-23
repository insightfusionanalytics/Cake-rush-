import { useSiteSettings } from "@/hooks/use-site-data";
import aboutCake from "@/assets/about-cake.png";
import { Canela, Eyebrow, L, Numeral, Reveal, SANS } from "@/components/luxe/tokens";

// Fallback feature descriptions if `about_feature_descs` setting is unset.
const FEATURE_DESCRIPTIONS_DEFAULT = [
  "Send a reference. We respond with a sketch, by evening.",
  "Amul butter, Madagascar vanilla, Ratnagiri alphonsos in season.",
  "Baked the day before. No freezing. No shortcut. No exceptions.",
];

const AboutSection = () => {
  const { data: settings } = useSiteSettings();
  const aboutImg = settings?.about_image_url ?? aboutCake;
  const aboutSubheading = settings?.about_subheading ?? "Chapter One — Our Story";
  const aboutHeading = settings?.about_heading ?? "Begun quietly, on a Tuesday.";
  const aboutText =
    settings?.about_text ??
    "Cake Rush began as a single red-velvet, iced on a kitchen counter on Carter Road, for a neighbour’s daughter who’d turned seven and wanted something that didn’t come from a box. Four years later, the counter is still there. So is the neighbour.";
  const featuresStr =
    settings?.about_features ?? "Custom Designs,Fresh Ingredients,Made with Love";
  const featureLabels = featuresStr.split(",").map((s) => s.trim()).slice(0, 3);

  // Feature descriptions: stored as "desc1||desc2||desc3" (|| not comma so
  // descriptions themselves can contain commas freely).
  const descsStr = settings?.about_feature_descs;
  const featureDescs =
    descsStr !== undefined && descsStr !== ""
      ? descsStr.split("||").map((s) => s.trim())
      : FEATURE_DESCRIPTIONS_DEFAULT;

  const aboutSecondary =
    settings?.about_secondary_text ??
    "Every cake is made to order — the day before, by hand. Butter from Amul, vanilla from Kerala, cocoa from wherever the recipe deserves it.";
  const aboutCaption =
    settings?.about_caption ??
    "Plate ii — a teddy for Sneha's second, requested by name, eaten without protocol.";

  // Split heading on first comma → italic ink line 1 + italic copper line 2
  const commaIdx = aboutHeading.indexOf(",");
  const headingTop =
    commaIdx === -1 ? aboutHeading : aboutHeading.slice(0, commaIdx + 1);
  const headingBottom =
    commaIdx === -1 ? "" : aboutHeading.slice(commaIdx + 1).trim();

  return (
    <section
      id="about"
      className="lx-about"
      style={{ background: L.ivory }}
    >
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div
          className="lx-about-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "0.9fr 1.1fr",
            alignItems: "flex-start",
          }}
        >
          <Reveal>
            <div style={{ position: "relative", paddingTop: 80 }} className="lx-about-img-col">
              <div
                style={{
                  position: "relative",
                  background: L.white,
                  padding: 12,
                  boxShadow: "0 30px 70px -30px rgba(42,31,23,0.22)",
                }}
              >
                <img
                  src={aboutImg}
                  alt="A cake by Cake Rush"
                  style={{
                    width: "100%",
                    aspectRatio: "4/5",
                    objectFit: "cover",
                    display: "block",
                    filter: "saturate(0.97)",
                  }}
                />
              </div>
              <div style={{ marginTop: 18, maxWidth: 280 }}>
                <Canela size={16} italic style={{ color: L.ink2, lineHeight: 1.5 }}>
                  {aboutCaption}
                </Canela>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <Eyebrow>{aboutSubheading}</Eyebrow>
              <div style={{ marginTop: "clamp(20px, 2.5vw, 28px)" }} className="lx-about-h">
                <Canela
                  size="var(--lx-fs-display)"
                  italic
                  style={{ display: "block", color: L.ink, letterSpacing: "-0.02em" }}
                >
                  {headingTop}
                </Canela>
                {headingBottom && (
                  <Canela
                    size="var(--lx-fs-display)"
                    italic
                    style={{
                      display: "block",
                      color: L.copperDeep,
                      letterSpacing: "-0.02em",
                      marginTop: 4,
                    }}
                  >
                    {headingBottom}
                  </Canela>
                )}
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div style={{ maxWidth: 540, marginTop: "clamp(28px, 4vw, 48px)" }}>
                <p
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontWeight: 400,
                    fontSize: "clamp(18px, 2.1vw, 26px)",
                    lineHeight: 1.7,
                    color: L.ink,
                    margin: 0,
                  }}
                >
                  {aboutText}
                </p>
                <p
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontStyle: "italic",
                    fontWeight: 400,
                    fontSize: "clamp(16px, 1.7vw, 22px)",
                    lineHeight: 1.7,
                    color: L.ink2,
                    marginTop: 28,
                  }}
                >
                  {aboutSecondary}
                </p>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div
                className="lx-about-features"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "clamp(28px, 3.5vw, 48px)",
                  marginTop: "clamp(48px, 6vw, 80px)",
                  paddingTop: "clamp(24px, 3vw, 40px)",
                  borderTop: `1px solid ${L.rule}`,
                }}
              >
                {featureLabels.map((label, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                      <Numeral size={36} color={L.copper}>
                        {String(idx + 1).padStart(2, "0")}
                      </Numeral>
                      <span
                        style={{
                          color: L.copper,
                          fontSize: 18,
                          fontFamily: '"Cormorant Garamond", serif',
                          fontStyle: "italic",
                        }}
                      >
                        —
                      </span>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <Canela size="clamp(18px, 1.7vw, 22px)" style={{ display: "block", letterSpacing: "-0.005em" }}>
                        {label}
                      </Canela>
                      <div
                        style={{
                          fontFamily: SANS,
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: L.ink2,
                          marginTop: 10,
                          fontWeight: 400,
                        }}
                      >
                        {featureDescs[idx] ?? ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
