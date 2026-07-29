import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Canela, Eyebrow, L, SANS } from "@/components/luxe/tokens";
import { useSubmitReview } from "@/hooks/use-site-data";

type Props = {
  open: boolean;
  onClose: () => void;
};

const labelStyle: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 11,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: L.ink2,
  fontWeight: 500,
  display: "block",
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: `1px solid ${L.rule}`,
  background: L.white,
  fontFamily: SANS,
  fontSize: 15,
  color: L.ink,
  borderRadius: 0,
  outline: "none",
  boxSizing: "border-box",
};

export default function ReviewModal({ open, onClose }: Props) {
  const submit = useSubmitReview();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverStar, setHoverStar] = useState(0);
  const [text, setText] = useState("");

  // Reset every time the modal is opened (fresh form each visit).
  useEffect(() => {
    if (!open) {
      setName("");
      setLocation("");
      setRating(5);
      setHoverStar(0);
      setText("");
    }
  }, [open]);

  // Close on Esc + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const trimmedName = name.trim();
  const trimmedText = text.trim();
  const canSubmit =
    trimmedName.length > 0 && trimmedText.length >= 10 && rating >= 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submit.isPending) return;
    try {
      await submit.mutateAsync({
        client_name: trimmedName,
        rating,
        review_text: trimmedText,
        location: location.trim() || undefined,
      });
      toast.success("Thank you — your bouquet just landed in the reviews.");
      onClose();
    } catch (err) {
      toast.error((err as Error).message || "Could not submit your review");
    }
  };

  return (
    <div
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(42, 31, 23, 0.72)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "lxFade 260ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: L.paper,
          border: `1px solid ${L.rule}`,
          padding: "clamp(28px, 4vw, 44px)",
          maxWidth: 560,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 40px 100px -20px rgba(0,0,0,0.5)",
          position: "relative",
          animation: "lxFade 340ms ease",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: L.ink2,
            padding: 6,
            lineHeight: 0,
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          >
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>

        <Eyebrow color={L.copperDeep} style={{ fontSize: 10 }}>
          Send a bouquet
        </Eyebrow>
        <Canela
          size="clamp(28px, 4vw, 40px)"
          italic
          style={{
            display: "block",
            marginTop: 8,
            color: L.ink,
            letterSpacing: "-0.015em",
            lineHeight: 1.15,
          }}
        >
          Tell us how it went.
        </Canela>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13,
            color: L.ink2,
            marginTop: 8,
            lineHeight: 1.5,
          }}
        >
          Your bouquet joins the counter of notes below.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 24,
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div>
            <label htmlFor="rv-rating" style={labelStyle}>
              Rating
            </label>
            <div
              id="rv-rating"
              style={{ display: "flex", gap: 4 }}
              onMouseLeave={() => setHoverStar(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = (hoverStar || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverStar(n)}
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 30,
                      color: filled ? L.copperDeep : L.ink3,
                      padding: "0 4px",
                      lineHeight: 1,
                      transition: "color 160ms ease, transform 160ms ease",
                      transform: filled ? "scale(1.02)" : "scale(1)",
                    }}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="rv-name" style={labelStyle}>
              Your name
            </label>
            <input
              id="rv-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              autoComplete="name"
              placeholder="e.g. Sneha M."
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="rv-loc" style={labelStyle}>
              Where you're writing from{" "}
              <span
                style={{
                  textTransform: "none",
                  letterSpacing: 0,
                  color: L.ink3,
                  fontWeight: 400,
                }}
              >
                (optional)
              </span>
            </label>
            <input
              id="rv-loc"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={80}
              placeholder="e.g. Bandra West"
              style={inputStyle}
            />
          </div>

          <div>
            <label htmlFor="rv-text" style={labelStyle}>
              Your note
            </label>
            <textarea
              id="rv-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              maxLength={800}
              placeholder="Tell us about the cake, the moment, whatever comes to mind."
              style={{
                ...inputStyle,
                resize: "vertical",
                lineHeight: 1.55,
                fontFamily: SANS,
              }}
            />
            <div
              style={{
                fontFamily: SANS,
                fontSize: 11,
                color: L.ink3,
                marginTop: 6,
                textAlign: "right",
              }}
            >
              {trimmedText.length}/800 · min 10 characters
            </div>
          </div>

          <div
            style={{
              marginTop: 6,
              display: "flex",
              gap: 12,
              justifyContent: "flex-end",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={submit.isPending}
              style={{
                background: "transparent",
                border: `1px solid ${L.rule}`,
                color: L.ink2,
                padding: "12px 22px",
                fontFamily: SANS,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 500,
                cursor: submit.isPending ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit || submit.isPending}
              style={{
                background: canSubmit && !submit.isPending ? L.ink : L.ink3,
                border: `1px solid ${canSubmit && !submit.isPending ? L.ink : L.ink3}`,
                color: L.ivory,
                padding: "12px 26px",
                fontFamily: SANS,
                fontSize: 11,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 500,
                cursor:
                  !canSubmit || submit.isPending ? "not-allowed" : "pointer",
                transition: "background 200ms ease",
              }}
            >
              {submit.isPending ? "Sending…" : "Send bouquet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
