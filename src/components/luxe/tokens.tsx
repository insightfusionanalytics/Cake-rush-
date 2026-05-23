import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

export const L = {
  ivory: "#F5F0E8",
  ivoryDeep: "#EFE7D8",
  paper: "#FAF5ED",
  white: "#FFFDF9",
  ink: "#2A1F17",
  ink2: "#6A5A48",
  ink3: "#9C8872",
  copper: "#B08968",
  copperDeep: "#8F6B4E",
  rose: "#D4A5A0",
  rule: "rgba(42,31,23,0.14)",
  ruleSoft: "rgba(42,31,23,0.07)",
};

export const SERIF = '"Cormorant Garamond", "Tiempos Headline", Georgia, serif';
export const SANS = '"Inter", system-ui, sans-serif';

type EyebrowProps = { children: ReactNode; color?: string; style?: CSSProperties };
export const Eyebrow = ({ children, color = L.copperDeep, style }: EyebrowProps) => (
  <div
    style={{
      fontSize: 11,
      letterSpacing: "0.25em",
      textTransform: "uppercase",
      color,
      fontFamily: SANS,
      fontWeight: 500,
      ...style,
    }}
  >
    {children}
  </div>
);

type CanelaProps = {
  size?: number | string;
  italic?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
};
export const Canela = ({
  size = 64,
  italic = false,
  children,
  style,
  as = "span",
  className,
}: CanelaProps) => {
  const Tag = as as any;
  // For numeric sizes >80px we tighten letter-spacing. For clamp()/string sizes
  // we approximate "large display" by checking for a 'clamp' substring.
  const isDisplay =
    typeof size === "number" ? size > 80 : /clamp|vw|rem/i.test(String(size));
  return (
    <Tag
      className={className}
      style={{
        fontFamily: SERIF,
        fontWeight: 400,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: isDisplay ? "-0.015em" : "-0.008em",
        color: L.ink,
        fontStyle: italic ? "italic" : "normal",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

type TextLinkProps = {
  href: string;
  children: ReactNode;
  color?: string;
  external?: boolean;
  onClick?: () => void;
};
export const TextLink = ({ href, children, color, external = true, onClick }: TextLinkProps) => (
  <a
    href={href}
    onClick={onClick}
    target={external ? "_blank" : undefined}
    rel={external ? "noopener noreferrer" : undefined}
    style={{
      color: color || L.ink,
      textDecoration: "none",
      fontFamily: SANS,
      fontSize: 13,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      fontWeight: 500,
      borderBottom: `1px solid ${color || L.ink}`,
      paddingBottom: 4,
      transition: "color 260ms ease, border-color 260ms ease, letter-spacing 260ms ease",
      display: "inline-block",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLAnchorElement).style.letterSpacing = "0.22em";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLAnchorElement).style.letterSpacing = "0.14em";
    }}
  >
    {children}
  </a>
);

type NumeralProps = { children: ReactNode; color?: string; size?: number };
export const Numeral = ({ children, color = L.copper, size = 72 }: NumeralProps) => (
  <span
    style={{
      fontFamily: SERIF,
      fontStyle: "italic",
      fontWeight: 300,
      fontSize: size,
      color,
      lineHeight: 1,
      letterSpacing: "-0.02em",
    }}
  >
    {children}
  </span>
);

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
};
export function Reveal({ children, delay = 0, y = 24, className, style }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `opacity 900ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms, transform 900ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
