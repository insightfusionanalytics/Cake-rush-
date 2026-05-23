import { useSiteSettings } from "@/hooks/use-site-data";
import { Canela, Eyebrow, L, Reveal, SANS } from "@/components/luxe/tokens";

const humanize = (url: string) => {
  try {
    return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  } catch {
    return url;
  }
};

const ContactSection = () => {
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number ?? "919920272566";
  const instagram = settings?.instagram_url ?? "https://instagram.com/cakerush.in";
  const waLink = `https://wa.me/${whatsapp}`;
  const waHuman = `wa.me/${whatsapp}`;
  const igHuman = humanize(instagram).replace(/^instagram\.com\//, "@");
  const contactEyebrow = settings?.contact_eyebrow ?? "Chapter Five — Reserve";
  const contactHeading = settings?.contact_heading ?? "Let us bake, your moment.";
  const contactText = settings?.contact_text ?? "Replies, usually within the hour.";
  const contactAddress =
    settings?.contact_address ?? "Carter Road, Bandra West · Mumbai 400050.";
  const instagramCaption =
    settings?.instagram_caption ?? "Every bake, photographed in natural light.";
  const deliveryNote =
    settings?.delivery_note ?? "Delivery — All of Mumbai · 24 hr minimum";

  // Split contact heading on first comma
  const ci = contactHeading.indexOf(",");
  const headingTop = ci === -1 ? contactHeading : contactHeading.slice(0, ci).trim();
  const headingBottom = ci === -1 ? "" : contactHeading.slice(ci + 1).trim();

  return (
    <section
      id="contact"
      className="lx-contact"
      style={{ background: L.ivory }}
    >
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <Reveal>
          <Eyebrow>{contactEyebrow}</Eyebrow>
          <div style={{ marginTop: "clamp(20px, 2.5vw, 32px)" }}>
            <Canela
              size="var(--lx-fs-mega)"
              className="lx-contact-h"
              style={{ display: "block", letterSpacing: "-0.02em" }}
            >
              {headingTop}
            </Canela>
            {headingBottom && (
              <Canela
                size="var(--lx-fs-mega)"
                italic
                className="lx-contact-h"
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
        </Reveal>

        <Reveal delay={180}>
          <div
            className="lx-contact-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              marginTop: "clamp(56px, 8vw, 100px)",
              paddingTop: "clamp(32px, 4.5vw, 56px)",
              borderTop: `1px solid ${L.rule}`,
            }}
          >
            <div>
              <Eyebrow style={{ fontSize: 10 }}>Reserve</Eyebrow>
              <div style={{ marginTop: 22 }}>
                <Canela size="clamp(24px, 2.7vw, 32px)" italic style={{ color: L.ink, display: "block" }}>
                  WhatsApp
                </Canela>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: "clamp(17px, 1.7vw, 22px)",
                    color: L.ink,
                    textDecoration: "none",
                    borderBottom: `1px solid ${L.copperDeep}`,
                    paddingBottom: 3,
                  }}
                >
                  {waHuman} →
                </a>
              </div>
              <div
                style={{
                  marginTop: 28,
                  fontFamily: SANS,
                  fontSize: 12,
                  color: L.ink2,
                  lineHeight: 1.6,
                  letterSpacing: "0.02em",
                }}
              >
                {contactText}
              </div>
            </div>

            <div>
              <Eyebrow style={{ fontSize: 10 }}>Follow</Eyebrow>
              <div style={{ marginTop: 22 }}>
                <Canela size="clamp(24px, 2.7vw, 32px)" italic style={{ color: L.ink, display: "block" }}>
                  Instagram
                </Canela>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: "clamp(17px, 1.7vw, 22px)",
                    color: L.ink,
                    textDecoration: "none",
                    borderBottom: `1px solid ${L.copperDeep}`,
                    paddingBottom: 3,
                  }}
                >
                  {igHuman} →
                </a>
              </div>
              <div
                style={{
                  marginTop: 28,
                  fontFamily: SANS,
                  fontSize: 12,
                  color: L.ink2,
                  lineHeight: 1.6,
                  letterSpacing: "0.02em",
                }}
              >
                {instagramCaption}
              </div>
            </div>

            <div>
              <Eyebrow style={{ fontSize: 10 }}>Visit</Eyebrow>
              <div style={{ marginTop: 22 }}>
                <Canela
                  size="clamp(17px, 1.7vw, 22px)"
                  italic
                  style={{ color: L.ink, display: "block", lineHeight: 1.4 }}
                >
                  {contactAddress.split(",").map((part, i, arr) => (
                    <span key={i}>
                      {part.trim()}{i < arr.length - 1 ? "," : ""}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </Canela>
              </div>
              <div style={{ marginTop: 28 }}>
                <Eyebrow style={{ fontSize: 9 }}>{deliveryNote}</Eyebrow>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSection;
