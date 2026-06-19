import { useEffect, useState } from "react";
import { Canela, Eyebrow, L, SERIF } from "@/components/luxe/tokens";
import { useSiteSettings } from "@/hooks/use-site-data";

const TOTAL_MS = 3000;
const FADE_OUT_MS = 620;

export default function SplashScreen() {
  const { data: settings } = useSiteSettings();
  const wordmark = (settings?.brand_wordmark ?? "Cake Rush").trim();
  const eyebrowText = (settings?.nav_eyebrow ?? "Est. MMXX · Bandra West").trim();
  const tagline = (settings?.footer_tagline ?? "A cake atelier — Bandra West · Mumbai")
    .split("—")[0]
    .trim() || "A cake atelier";

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [mounted, setMounted] = useState(!reduced);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const t1 = window.setTimeout(() => setFading(true), TOTAL_MS - FADE_OUT_MS);
    const t2 = window.setTimeout(() => setMounted(false), TOTAL_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  if (!mounted) return null;

  // Split wordmark on last space — "Cake Rush" → first="Cake", last="Rush"
  // Last word gets the copper period after it.
  const tokens = wordmark.split(/\s+/);
  const first = tokens.slice(0, -1).join(" ");
  const last = tokens[tokens.length - 1] ?? "";

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: L.ivory,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        opacity: fading ? 0 : 1,
        transform: fading ? "translateY(-10px)" : "translateY(0)",
        transition: `opacity ${FADE_OUT_MS}ms cubic-bezier(.4,0,.2,1), transform ${FADE_OUT_MS}ms cubic-bezier(.4,0,.2,1)`,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Soft radial halo behind the wordmark */}
      <div
        style={{
          position: "absolute",
          width: "min(720px, 80vw)",
          height: "min(720px, 80vw)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at center, rgba(143,107,78,0.10) 0%, rgba(143,107,78,0.04) 35%, transparent 60%)",
          opacity: 0,
          transform: "scale(0.92)",
          animation: "lxSplashHalo 1600ms 300ms cubic-bezier(.4,0,.2,1) forwards",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          textAlign: "center",
          position: "relative",
          padding: "0 clamp(16px, 4vw, 32px)",
          maxWidth: "100%",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            opacity: 0,
            animation: "lxSplashFadeUp 700ms 120ms cubic-bezier(.4,0,.2,1) forwards",
          }}
        >
          <Eyebrow color={L.ink3} style={{ fontSize: 11 }}>
            {eyebrowText}
          </Eyebrow>
        </div>

        {/* Wordmark — italic first word + roman last + copper period.
            inline-flex with nowrap so the period never drops to a new line.
            Font uses clamp() to shrink on small screens. */}
        <div
          style={{
            marginTop: "clamp(14px, 2.2vw, 22px)",
            display: "inline-flex",
            alignItems: "baseline",
            justifyContent: "center",
            gap: "clamp(8px, 1.4vw, 18px)",
            lineHeight: 1,
            flexWrap: "nowrap",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
        >
          {first && (
            <span
              style={{
                opacity: 0,
                display: "inline-block",
                animation:
                  "lxSplashWordRise 820ms 360ms cubic-bezier(.2,.8,.2,1) forwards",
              }}
            >
              <Canela
                size="clamp(44px, 11vw, 124px)"
                italic
                style={{ color: L.ink, letterSpacing: "-0.028em" }}
              >
                {first}
              </Canela>
            </span>
          )}
          <span
            style={{
              opacity: 0,
              display: "inline-block",
              animation:
                "lxSplashWordRise 820ms 530ms cubic-bezier(.2,.8,.2,1) forwards",
            }}
          >
            <Canela
              size="clamp(44px, 11vw, 124px)"
              style={{ color: L.ink, letterSpacing: "-0.028em" }}
            >
              {last}
            </Canela>
          </span>
          <span
            style={{
              opacity: 0,
              display: "inline-block",
              transform: "translateY(-26px) scale(0.55)",
              animation:
                "lxSplashPeriodDrop 720ms 860ms cubic-bezier(.34,1.56,.64,1) forwards",
            }}
          >
            <Canela
              size="clamp(44px, 11vw, 124px)"
              style={{ color: L.copperDeep, letterSpacing: "-0.028em" }}
            >
              .
            </Canela>
          </span>
        </div>

        {/* Thin copper line drawing outward from center */}
        <div
          style={{
            position: "relative",
            marginTop: "clamp(22px, 3vw, 32px)",
            height: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              width: "clamp(140px, 18vw, 220px)",
              height: 1,
              background: L.copperDeep,
              transformOrigin: "center",
              transform: "translateX(-50%) scaleX(0)",
              animation:
                "lxSplashLineDraw 900ms 1060ms cubic-bezier(.65,0,.35,1) forwards",
            }}
          />
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: "clamp(18px, 2.4vw, 26px)",
            opacity: 0,
            animation: "lxSplashFadeUp 700ms 1260ms cubic-bezier(.4,0,.2,1) forwards",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "clamp(13px, 1.5vw, 16px)",
            color: L.ink2,
            letterSpacing: "0.02em",
          }}
        >
          {tagline}
        </div>
      </div>
    </div>
  );
}
