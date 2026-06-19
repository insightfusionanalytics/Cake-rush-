import { Canela, Eyebrow, L, SANS, SERIF } from "@/components/luxe/tokens";

const cardOuter: React.CSSProperties = {
  background: L.paper,
  border: `1px solid ${L.rule}`,
  padding: 18,
  marginTop: 8,
};

const previewLabel: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: L.ink3,
  fontFamily: SANS,
  marginBottom: 12,
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const dot: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: 9999,
  background: L.copperDeep,
  display: "inline-block",
};

const innerCanvas: React.CSSProperties = {
  background: L.ivory,
  padding: 18,
  border: `1px solid ${L.ruleSoft}`,
};

type Get = (key: string) => string;

// ─── Hero preview ───
export function HeroPreview({ get }: { get: Get }) {
  const title = get("hero_title") || "Cake Rush.";
  const subtitle = get("hero_subtitle");
  const badge = get("hero_badge");
  const image = get("hero_image_url");
  const captionLeft = get("hero_caption_left");
  const captionRight = get("hero_caption_right");
  const sticker = get("hero_sticker");
  const ctaWa = get("hero_cta_whatsapp");
  const ctaIg = get("hero_cta_instagram");

  const words = title.trim().split(/\s+/);
  const first = words[0] ?? "";
  const rest = words.slice(1).join(" ");

  return (
    <div style={cardOuter}>
      <div style={previewLabel}>
        <span style={dot} /> Live preview · Hero
      </div>
      <div style={innerCanvas}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: 18,
            alignItems: "flex-start",
          }}
        >
          <div>
            {badge && (
              <Eyebrow style={{ fontSize: 9 }}>{badge}</Eyebrow>
            )}
            <div style={{ marginTop: 10, lineHeight: 1.05 }}>
              <Canela
                size={28}
                italic
                style={{ color: L.ink, letterSpacing: "-0.02em" }}
              >
                {first}
              </Canela>
              {rest && (
                <Canela size={28} style={{ color: L.ink, letterSpacing: "-0.02em" }}>
                  {" "}
                  {rest}
                </Canela>
              )}
            </div>
            {subtitle && (
              <p
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 13,
                  color: L.ink2,
                  marginTop: 10,
                  lineHeight: 1.5,
                }}
              >
                {subtitle}
              </p>
            )}
            {(ctaWa || ctaIg) && (
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                {ctaWa && (
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: L.copperDeep,
                      borderBottom: `1px solid ${L.copperDeep}`,
                      paddingBottom: 3,
                      fontWeight: 500,
                    }}
                  >
                    {ctaWa}
                  </span>
                )}
                {ctaIg && (
                  <span
                    style={{
                      fontFamily: SANS,
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: L.ink2,
                      borderBottom: `1px solid ${L.ink2}`,
                      paddingBottom: 3,
                      fontWeight: 500,
                    }}
                  >
                    {ctaIg}
                  </span>
                )}
              </div>
            )}
            {(captionLeft || captionRight) && (
              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  fontFamily: SANS,
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: L.ink3,
                }}
              >
                {captionLeft && <span>{captionLeft}</span>}
                {captionRight && <span>{captionRight}</span>}
              </div>
            )}
          </div>
          <div style={{ position: "relative" }}>
            <div
              style={{
                aspectRatio: "3/4",
                background: L.ivoryDeep,
                overflow: "hidden",
                boxShadow: "0 10px 30px -12px rgba(42,31,23,0.18)",
              }}
            >
              {image && (
                <img
                  src={image}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
            </div>
            {sticker && (
              <div
                style={{
                  position: "absolute",
                  top: -10,
                  left: -10,
                  background: L.white,
                  padding: "6px 10px",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 10,
                  color: L.ink,
                  transform: "rotate(-6deg)",
                  boxShadow: "0 4px 10px -4px rgba(42,31,23,0.18)",
                  border: `1px solid ${L.ruleSoft}`,
                }}
              >
                {sticker}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── About preview ───
export function AboutPreview({ get }: { get: Get }) {
  const eyebrow = get("about_subheading");
  const heading = get("about_heading") || "Begun quietly, on a Tuesday.";
  const text = get("about_text");
  const secondary = get("about_secondary_text");
  const image = get("about_image_url");
  const caption = get("about_caption");
  const featuresStr = get("about_features");
  const descsStr = get("about_feature_descs");

  const commaIdx = heading.indexOf(",");
  const headingTop =
    commaIdx === -1 ? heading : heading.slice(0, commaIdx + 1);
  const headingBottom =
    commaIdx === -1 ? "" : heading.slice(commaIdx + 1).trim();

  const labels = featuresStr
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);
  const descs = descsStr
    ? descsStr.split("||").map((s) => s.trim())
    : [];

  return (
    <div style={cardOuter}>
      <div style={previewLabel}>
        <span style={dot} /> Live preview · About
      </div>
      <div style={innerCanvas}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.8fr 1.2fr",
            gap: 18,
            alignItems: "flex-start",
          }}
        >
          <div>
            <div
              style={{
                aspectRatio: "4/5",
                background: L.ivoryDeep,
                overflow: "hidden",
                padding: 6,
                boxShadow: "0 10px 30px -14px rgba(42,31,23,0.2)",
              }}
            >
              {image && (
                <img
                  src={image}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              )}
            </div>
            {caption && (
              <div
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 11,
                  color: L.ink2,
                  marginTop: 8,
                  lineHeight: 1.5,
                }}
              >
                {caption}
              </div>
            )}
          </div>
          <div>
            {eyebrow && <Eyebrow style={{ fontSize: 9 }}>{eyebrow}</Eyebrow>}
            <div style={{ marginTop: 10, lineHeight: 1.1 }}>
              <Canela size={24} italic style={{ color: L.ink, display: "block", letterSpacing: "-0.02em" }}>
                {headingTop}
              </Canela>
              {headingBottom && (
                <Canela
                  size={24}
                  italic
                  style={{
                    color: L.copperDeep,
                    display: "block",
                    letterSpacing: "-0.02em",
                    marginTop: 2,
                  }}
                >
                  {headingBottom}
                </Canela>
              )}
            </div>
            {text && (
              <p
                style={{
                  fontFamily: SERIF,
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: L.ink,
                  marginTop: 12,
                }}
              >
                {text.length > 220 ? text.slice(0, 220) + "…" : text}
              </p>
            )}
            {secondary && (
              <p
                style={{
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: L.ink2,
                  marginTop: 10,
                }}
              >
                {secondary.length > 160 ? secondary.slice(0, 160) + "…" : secondary}
              </p>
            )}
            {labels.length > 0 && (
              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: `1px solid ${L.rule}`,
                  display: "grid",
                  gridTemplateColumns: `repeat(${labels.length}, 1fr)`,
                  gap: 12,
                }}
              >
                {labels.map((label, i) => (
                  <div key={i}>
                    <div
                      style={{
                        fontFamily: SANS,
                        fontSize: 10,
                        color: L.copper,
                        marginBottom: 4,
                      }}
                    >
                      0{i + 1} —
                    </div>
                    <Canela size={13} style={{ color: L.ink, letterSpacing: "-0.005em" }}>
                      {label}
                    </Canela>
                    {descs[i] && (
                      <div
                        style={{
                          fontFamily: SANS,
                          fontSize: 10,
                          color: L.ink2,
                          marginTop: 4,
                          lineHeight: 1.4,
                        }}
                      >
                        {descs[i].length > 70 ? descs[i].slice(0, 70) + "…" : descs[i]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── House item preview ───
type HouseItemDraft = {
  name?: string;
  image_url?: string;
  description?: string;
  prices?: Array<{ weight_label: string; price: string }>;
  blurb?: string;
  quote?: string;
};

export function HouseItemPreview({
  item,
  reserveLabel,
  requestQuoteLabel,
}: {
  item: HouseItemDraft;
  reserveLabel: string;
  requestQuoteLabel: string;
}) {
  const name = item.name || "Item name";
  const description = item.description?.trim();
  const visiblePrices = (item.prices ?? []).filter(
    (p) =>
      (p.weight_label && p.weight_label.trim()) ||
      (p.price && p.price.trim()),
  );
  const hasPrices = visiblePrices.length > 0;
  const blurb = item.blurb?.trim();
  const quote = item.quote?.trim();
  const hasQuote = !!quote;

  return (
    <div style={cardOuter}>
      <div style={previewLabel}>
        <span style={dot} /> Live preview · This card on the public site
      </div>
      <div style={innerCanvas}>
        <div style={{ maxWidth: 260 }}>
          <div
            style={{
              aspectRatio: "1/1",
              background: L.ivoryDeep,
              overflow: "hidden",
            }}
          >
            {item.image_url && (
              <img
                src={item.image_url}
                alt={name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  filter: "saturate(0.97)",
                }}
              />
            )}
          </div>
          <Canela
            size={20}
            style={{
              display: "block",
              marginTop: 14,
              color: L.ink,
              letterSpacing: "-0.01em",
            }}
          >
            {name}
          </Canela>
          {description && (
            <Canela
              size={13}
              italic
              style={{
                display: "block",
                marginTop: 8,
                color: L.ink2,
                lineHeight: 1.5,
                fontWeight: 300,
              }}
            >
              {description}
            </Canela>
          )}
          {hasPrices && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 10,
                borderTop: `1px solid ${L.ruleSoft}`,
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {visiblePrices.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <Eyebrow color={L.ink3} style={{ fontSize: 9 }}>
                    {p.weight_label}
                  </Eyebrow>
                  <Canela size={14} style={{ color: L.copperDeep, letterSpacing: "-0.005em" }}>
                    {p.price}
                  </Canela>
                </div>
              ))}
            </div>
          )}
          {hasPrices && (
            <div
              style={{
                display: "inline-block",
                marginTop: 14,
                fontFamily: SANS,
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: L.copperDeep,
                borderBottom: `1px solid ${L.copperDeep}`,
                paddingBottom: 3,
              }}
            >
              {reserveLabel}
            </div>
          )}
          {blurb && (
            <Canela
              size={13}
              italic
              style={{
                display: "block",
                marginTop: 8,
                color: L.ink2,
                lineHeight: 1.5,
                fontWeight: 300,
              }}
            >
              {blurb}
            </Canela>
          )}
          {hasQuote && (
            <div
              style={{
                marginTop: 16,
                paddingTop: 10,
                borderTop: `1px solid ${L.ruleSoft}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <Eyebrow color={L.ink3} style={{ fontSize: 9 }}>
                quote
              </Eyebrow>
              <Canela size={14} italic style={{ color: L.copperDeep }}>
                {quote}
              </Canela>
            </div>
          )}
          {hasQuote && (
            <div
              style={{
                display: "inline-block",
                marginTop: 12,
                fontFamily: SANS,
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: L.copperDeep,
                borderBottom: `1px solid ${L.copperDeep}`,
                paddingBottom: 3,
              }}
            >
              {requestQuoteLabel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
