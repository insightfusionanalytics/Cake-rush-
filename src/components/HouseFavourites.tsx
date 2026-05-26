import { useEffect, useMemo, useState } from "react";
import { useHouseFavourites, useSiteSettings } from "@/hooks/use-site-data";
import { Canela, Eyebrow, L, Reveal, SANS } from "@/components/luxe/tokens";

const HouseFavourites = () => {
  const { data: settings } = useSiteSettings();
  const { data: categories } = useHouseFavourites();
  const whatsapp = settings?.whatsapp_number ?? "919920272566";
  const requestQuoteLabel = settings?.house_request_quote_label ?? "Request a quote →";
  const quoteTemplate =
    settings?.house_quote_template ?? "Hi, I'd like a quote for {item}.";
  const tabNumberPrefix = settings?.house_tab_number_prefix ?? "№";

  const [activeId, setActiveId] = useState<string | null>(null);

  // When the data loads (or admin reorders categories), default to the first one.
  useEffect(() => {
    if (!activeId && categories.length > 0) {
      setActiveId(categories[0].id);
    }
    if (activeId && !categories.some((c) => c.id === activeId) && categories.length > 0) {
      setActiveId(categories[0].id);
    }
  }, [activeId, categories]);

  const cat = useMemo(
    () => categories.find((c) => c.id === activeId) ?? categories[0] ?? null,
    [categories, activeId],
  );

  const total = useMemo(
    () => categories.reduce((sum, c) => sum + c.items.length, 0),
    [categories],
  );

  // Headline copy. The default has "house" italic + copper between "The" and "favourites.".
  // To preserve that visual split, we look for the word "house" (case-insensitive) and
  // render it in copper italic; everything else stays ink.
  const heading = settings?.house_heading ?? "The house favourites.";
  const eyebrow = settings?.house_eyebrow ?? "La Carte";
  const subtitle =
    settings?.house_subtitle ??
    "Sorted four ways. All eggless on request, no extra charge, same-day never.";

  // Split heading on the first " <word> " whose word is to be highlighted.
  // Convention: highlight the *italicized* word; we default to the first word
  // surrounded by spaces. For "The house favourites." → before="The ", mid="house", after=" favourites."
  // We highlight the word at index 1 (the second word) when the heading has ≥ 3 words.
  const headingParts = (() => {
    const words = heading.split(/\s+/);
    if (words.length < 3) return { before: heading, mid: "", after: "" };
    const before = words[0] + " ";
    const mid = words[1];
    const after = " " + words.slice(2).join(" ");
    return { before, mid, after };
  })();

  if (categories.length === 0) {
    // Nothing to show — keep the section out of the DOM rather than render an empty block.
    return null;
  }

  return (
    <section className="lx-house" style={{ background: L.paper }}>
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <Reveal>
          <div
            className="lx-house-head"
            style={{
              display: "grid",
              gridTemplateColumns: "1.6fr 1fr",
              alignItems: "flex-end",
            }}
          >
            <div>
              <Eyebrow>{eyebrow}</Eyebrow>
              <div style={{ marginTop: "clamp(16px, 2vw, 24px)" }}>
                <Canela
                  size="var(--lx-fs-display)"
                  className="lx-house-h"
                  style={{ display: "inline", letterSpacing: "-0.02em", color: L.ink }}
                >
                  {headingParts.before}
                </Canela>
                {headingParts.mid && (
                  <Canela
                    size="var(--lx-fs-display)"
                    italic
                    className="lx-house-h"
                    style={{
                      display: "inline",
                      letterSpacing: "-0.02em",
                      color: L.copperDeep,
                    }}
                  >
                    {headingParts.mid}
                  </Canela>
                )}
                <Canela
                  size="var(--lx-fs-display)"
                  className="lx-house-h"
                  style={{ display: "inline", letterSpacing: "-0.02em", color: L.ink }}
                >
                  {headingParts.after}
                </Canela>
              </div>
            </div>
            <Canela
              size="clamp(15px, 1.5vw, 20px)"
              italic
              className="lx-house-sub"
              style={{
                color: L.ink2,
                lineHeight: 1.5,
                fontWeight: 300,
                textAlign: "right",
              }}
            >
              {total} cakes. {subtitle}
            </Canela>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div
            className="lx-house-tabs"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
              borderTop: `1px solid ${L.rule}`,
              borderBottom: `1px solid ${L.rule}`,
              marginTop: "clamp(40px, 5vw, 64px)",
            }}
          >
            {categories.map((c, idx) => {
              const isActive = c.id === (cat?.id ?? "");
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  style={{
                    background: isActive ? L.ink : "transparent",
                    color: isActive ? L.ivory : L.ink,
                    border: "none",
                    cursor: "pointer",
                    padding:
                      "clamp(18px, 2vw, 28px) clamp(16px, 2vw, 28px) clamp(20px, 2.2vw, 30px)",
                    textAlign: "left",
                    transition: "background 320ms ease, color 320ms ease",
                    borderRight: `1px solid ${L.rule}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: SANS,
                      fontSize: 11,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      fontWeight: 500,
                      color: isActive ? L.ivory : L.ink3,
                      opacity: isActive ? 0.85 : 1,
                    }}
                  >
                    {tabNumberPrefix} {String(idx + 1).padStart(2, "0")}
                  </div>
                  <Canela
                    size="clamp(18px, 1.9vw, 24px)"
                    italic
                    style={{
                      display: "block",
                      marginTop: 10,
                      color: isActive ? L.ivory : L.ink,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {c.label}
                  </Canela>
                </button>
              );
            })}
          </div>
        </Reveal>

        {cat && (
          <div
            key={cat.id}
            className="lx-house-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              marginTop: "clamp(40px, 5vw, 72px)",
              animation: "lxFade 600ms ease",
            }}
          >
            {cat.items.map((item, i) => {
              const hasBlurb = !!(item.blurb && item.blurb.trim());
              const hasQuote = !!(item.quote && item.quote.trim());
              return (
                <Reveal key={item.id} delay={(i % 4) * 60}>
                  <article>
                    <div style={{ overflow: "hidden", background: L.ivoryDeep }}>
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          style={{
                            width: "100%",
                            aspectRatio: "1/1",
                            objectFit: "cover",
                            display: "block",
                            filter: "saturate(0.97)",
                            transition: "transform 900ms cubic-bezier(.2,.8,.2,1)",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLImageElement).style.transform =
                              "scale(1.03)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLImageElement).style.transform =
                              "scale(1)";
                          }}
                        />
                      )}
                    </div>
                    <Canela
                      size="clamp(18px, 2vw, 26px)"
                      style={{
                        display: "block",
                        marginTop: "clamp(14px, 1.6vw, 22px)",
                        color: L.ink,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.name}
                    </Canela>
                    {hasBlurb && (
                      <Canela
                        size="clamp(13px, 1.3vw, 16px)"
                        italic
                        style={{
                          display: "block",
                          marginTop: 10,
                          color: L.ink2,
                          lineHeight: 1.5,
                          fontWeight: 300,
                        }}
                      >
                        {item.blurb}
                      </Canela>
                    )}
                    {hasQuote && (
                      <div
                        style={{
                          marginTop: 24,
                          paddingTop: 18,
                          borderTop: `1px solid ${L.ruleSoft}`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "baseline",
                        }}
                      >
                        <Eyebrow color={L.ink3} style={{ fontSize: 10 }}>
                          quote
                        </Eyebrow>
                        <Canela
                          size="clamp(15px, 1.5vw, 18px)"
                          italic
                          style={{
                            color: L.copperDeep,
                            letterSpacing: "-0.005em",
                          }}
                        >
                          {item.quote}
                        </Canela>
                      </div>
                    )}
                    {hasQuote && (
                      <a
                        href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                          quoteTemplate.replace(/\{item\}/g, item.name),
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-block",
                          marginTop: 18,
                          fontFamily: SANS,
                          fontSize: 11,
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          fontWeight: 500,
                          color: L.copperDeep,
                          textDecoration: "none",
                          borderBottom: `1px solid ${L.copperDeep}`,
                          paddingBottom: 4,
                        }}
                      >
                        {requestQuoteLabel}
                      </a>
                    )}
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default HouseFavourites;
