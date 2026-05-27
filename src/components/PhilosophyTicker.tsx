import { L, SERIF } from "@/components/luxe/tokens";
import { useSiteSettings } from "@/hooks/use-site-data";

const PhilosophyTicker = () => {
  const { data: settings } = useSiteSettings();
  const raw = (
    settings?.philosophy_ticker ??
    "Hand-crafted  ·  Small-batch  ·  Eggless options  ·  Same-day delivery across Mumbai"
  ).trim();
  // Empty → hide the section entirely (no border bar, no padding).
  if (!raw) return null;
  // Append a separator so the line loops cleanly when repeated.
  const line = `${raw}  ·  `;
  const repeated = line.repeat(6);
  return (
    <section
      className="lx-philo"
      style={{
        background: L.ivory,
        borderTop: `1px solid ${L.rule}`,
        borderBottom: `1px solid ${L.rule}`,
        padding: "28px 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div className="lx-marquee-track">
        <div style={{ display: "flex" }}>
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(20px, 2.6vw, 32px)",
              color: L.ink,
            }}
          >
            {repeated}
          </span>
          <span
            style={{
              fontFamily: SERIF,
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: "clamp(20px, 2.6vw, 32px)",
              color: L.ink,
            }}
          >
            {repeated}
          </span>
        </div>
      </div>
    </section>
  );
};

export default PhilosophyTicker;
