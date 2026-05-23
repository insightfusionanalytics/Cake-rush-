import { useEffect, useMemo, useState } from "react";
import { useSiteSettings, useTestimonials } from "@/hooks/use-site-data";
import { Canela, Eyebrow, L } from "@/components/luxe/tokens";

type Testimonial = {
  id: string;
  client_name: string;
  review_text: string;
  rating: number;
  location?: string | null;
};

const TestimonialsSection = () => {
  const { data: testimonials } = useTestimonials();
  const { data: settings } = useSiteSettings();
  const list = useMemo<Testimonial[]>(
    () => ((testimonials as Testimonial[]) || []).filter(Boolean),
    [testimonials],
  );
  const [i, setI] = useState(0);

  useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => {
      setI((n) => (n + 1) % list.length);
    }, 6500);
    return () => clearInterval(id);
  }, [list.length]);

  if (list.length === 0) {
    return (
      <section
        id="reviews"
        className="lx-quote"
        style={{ background: L.ink, color: L.ivory }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Eyebrow color={L.copper}>{settings?.correspondence_eyebrow ?? "Chapter Four — Correspondence"}</Eyebrow>
        </div>
      </section>
    );
  }

  const q = list[Math.min(i, list.length - 1)];

  return (
    <section
      id="reviews"
      className="lx-quote"
      style={{
        background: L.ink,
        color: L.ivory,
        overflow: "hidden",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Eyebrow color={L.copper}>{settings?.correspondence_eyebrow ?? "Chapter Four — Correspondence"}</Eyebrow>
        <div style={{ marginTop: "clamp(36px, 5vw, 64px)", minHeight: "clamp(220px, 28vw, 340px)", position: "relative" }}>
          <div key={q.id} style={{ animation: "lxFade 700ms ease" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
              {Array.from({ length: q.rating || 5 }).map((_, s) => (
                <span
                  key={s}
                  style={{ color: L.copper, fontSize: 20, letterSpacing: 4 }}
                >
                  ★
                </span>
              ))}
            </div>
            <Canela
              size="var(--lx-fs-quote)"
              italic
              className="lx-quote-text"
              style={{
                color: L.ivory,
                lineHeight: 1.3,
                display: "block",
                maxWidth: 1060,
                fontWeight: 300,
              }}
            >
              “{q.review_text}”
            </Canela>
            <div
              style={{
                marginTop: 48,
                display: "flex",
                gap: 32,
                alignItems: "baseline",
                flexWrap: "wrap",
              }}
            >
              <Eyebrow color={L.rose} style={{ fontSize: 11 }}>
                — {q.client_name}
              </Eyebrow>
              {q.location && (
                <Eyebrow color={"rgba(245,240,232,0.45)"} style={{ fontSize: 10 }}>
                  {q.location}
                </Eyebrow>
              )}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: "clamp(28px, 4vw, 48px)" }}>
          {list.map((_, n) => (
            <button
              key={n}
              onClick={() => setI(n)}
              aria-label={`Quote ${n + 1}`}
              style={{
                width: 32,
                height: 1,
                background: n === i ? L.copper : "rgba(245,240,232,0.25)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "background 400ms",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
