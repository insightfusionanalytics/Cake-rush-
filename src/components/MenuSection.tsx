import { useMemo, useState } from "react";
import {
  useMenuCategories,
  useMenuItems,
  useAllMenuItemPrices,
  useSiteSettings,
} from "@/hooks/use-site-data";
import { Canela, Eyebrow, L, Numeral, Reveal, TextLink } from "@/components/luxe/tokens";

type MenuItem = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  category_id?: string | null;
  is_active?: boolean | null;
  is_custom_only?: boolean | null;
  price?: string | null;
};
type Price = { id: string; menu_item_id: string; weight_label: string; price: string; sort_order: number };

const CollectionRow = ({
  item,
  index,
  flip,
  prices,
  whatsapp,
  reserveLabel,
  quoteOnlyLabel,
  messageTemplate,
}: {
  item: MenuItem;
  index: number;
  flip: boolean;
  prices: Price[];
  whatsapp: string;
  reserveLabel: string;
  quoteOnlyLabel: string;
  messageTemplate: string;
}) => {
  const half = prices[0]?.price;
  const full = prices[1]?.price;
  return (
    <Reveal y={40}>
      <article
        className="lx-coll-row"
        style={{
          display: "grid",
          gridTemplateColumns: flip ? "1fr 1.4fr" : "1.4fr 1fr",
          alignItems: "center",
          borderBottom: `1px solid ${L.rule}`,
        }}
      >
        <div style={{ order: flip ? 2 : 1 }}>
          <div
            style={{
              background: L.white,
              padding: 14,
              boxShadow: "0 30px 70px -36px rgba(42,31,23,0.22)",
            }}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.name}
                style={{
                  width: "100%",
                  aspectRatio: "5/4",
                  objectFit: "cover",
                  display: "block",
                  filter: "saturate(0.97)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  aspectRatio: "5/4",
                  background: L.paper,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Canela size={48} italic style={{ color: L.ink3 }}>
                  {item.name.charAt(0)}
                </Canela>
              </div>
            )}
          </div>
        </div>
        <div style={{ order: flip ? 1 : 2, paddingLeft: flip ? 0 : 20 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <Numeral size={28} color={L.copper}>
              {String(index + 1).padStart(2, "0")}
            </Numeral>
          </div>
          <Canela
            size="var(--lx-fs-title)"
            className="lx-coll-title"
            style={{ display: "block", marginTop: 16, letterSpacing: "-0.012em" }}
          >
            {item.name}
          </Canela>
          {item.description && (
            <Canela
              size="clamp(16px, 1.6vw, 20px)"
              italic
              style={{
                display: "block",
                color: L.ink2,
                marginTop: 16,
                lineHeight: 1.5,
                fontWeight: 300,
              }}
            >
              {item.description}
            </Canela>
          )}
          {item.is_custom_only ? (
            <div style={{ marginTop: 36 }}>
              <Eyebrow color={L.ink3} style={{ fontSize: 10 }}>
                {quoteOnlyLabel}
              </Eyebrow>
            </div>
          ) : prices.length > 0 ? (
            <div
              style={{
                marginTop: 36,
                borderTop: `1px solid ${L.rule}`,
                paddingTop: 24,
                maxWidth: 360,
              }}
            >
              {prices.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "8px 0",
                    borderTop: i === 0 ? "none" : `1px solid ${L.ruleSoft}`,
                  }}
                >
                  <Eyebrow color={L.ink3} style={{ fontSize: 10 }}>
                    {p.weight_label}
                  </Eyebrow>
                  <Canela size="clamp(18px, 1.7vw, 22px)" style={{ color: L.ink }}>
                    {p.price}
                  </Canela>
                </div>
              ))}
              {prices.length === 0 && half && (
                <Canela size={22} style={{ color: L.ink }}>
                  {half}
                </Canela>
              )}
            </div>
          ) : item.price ? (
            <div style={{ marginTop: 36 }}>
              <Canela size="clamp(18px, 1.7vw, 22px)" style={{ color: L.ink }}>
                {item.price}
              </Canela>
            </div>
          ) : null}
          <div style={{ marginTop: 32 }}>
            <TextLink
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                messageTemplate.replace(/\{item\}/g, item.name),
              )}`}
              color={L.copperDeep}
            >
              {reserveLabel}
            </TextLink>
          </div>
        </div>
      </article>
    </Reveal>
  );
};

const MenuSection = () => {
  const { data: categories } = useMenuCategories();
  const { data: items } = useMenuItems();
  const { data: allPrices } = useAllMenuItemPrices();
  const { data: settings } = useSiteSettings();
  const whatsapp = settings?.whatsapp_number || "919920272566";
  const [tab, setTab] = useState<string | null>(null);

  const activeCategory = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    return tab ?? categories[0].id;
  }, [categories, tab]);

  const filteredItems: MenuItem[] = useMemo(() => {
    if (!items) return [];
    return (items as MenuItem[]).filter(
      (i) => i.is_active !== false && (!activeCategory || i.category_id === activeCategory),
    );
  }, [items, activeCategory]);

  const getPrices = (itemId: string): Price[] =>
    ((allPrices as Price[]) || [])
      .filter((p) => p.menu_item_id === itemId)
      .sort((a, b) => a.sort_order - b.sort_order);

  const totalCount = items?.filter((i: any) => i.is_active !== false).length || 0;

  const reserveLabel = settings?.menu_reserve_label ?? "Reserve this cake →";
  const quoteOnlyLabel = settings?.menu_quote_only_label ?? "Bespoke — by quote";
  const messageTemplate =
    settings?.menu_whatsapp_template ?? "Hi, I'd like to reserve the {item}.";
  const collEyebrow = settings?.collection_eyebrow ?? "Chapter Two — The Collection";
  const collHeading = settings?.collection_heading ?? "A catalog, of small delights.";
  const collSubtitle =
    settings?.collection_subtitle ??
    "Sixteen bakes across our chapters. Eggless on request, no extra charge. Twenty-four hours' notice, always.";
  // Split heading on first comma → ink line 1 + italic copper line 2
  const ci = collHeading.indexOf(",");
  const collTop = ci === -1 ? collHeading : collHeading.slice(0, ci).trim();
  const collBottom = ci === -1 ? "" : collHeading.slice(ci + 1).trim();

  return (
    <section
      id="menu"
      className="lx-coll"
      style={{ background: L.paper }}
    >
      <div style={{ maxWidth: 1360, margin: "0 auto" }}>
        <Reveal>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: "clamp(24px, 3vw, 40px)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <Eyebrow>{collEyebrow}</Eyebrow>
              <div style={{ marginTop: "clamp(16px, 2vw, 24px)" }}>
                <Canela
                  size="var(--lx-fs-display)"
                  className="lx-coll-h"
                  style={{ display: "block", letterSpacing: "-0.02em" }}
                >
                  {collTop}
                </Canela>
                {collBottom && (
                  <Canela
                    size="var(--lx-fs-display)"
                    italic
                    className="lx-coll-h"
                    style={{
                      display: "block",
                      letterSpacing: "-0.02em",
                      color: L.copperDeep,
                    }}
                  >
                    {collBottom}
                  </Canela>
                )}
              </div>
            </div>
            <Canela
              size="clamp(15px, 1.5vw, 20px)"
              italic
              style={{
                color: L.ink2,
                maxWidth: 320,
                lineHeight: 1.5,
                fontWeight: 300,
              }}
            >
              {totalCount} bakes. {collSubtitle}
            </Canela>
          </div>
        </Reveal>

        {categories && categories.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "clamp(28px, 3.5vw, 48px)",
              marginTop: "clamp(40px, 5vw, 64px)",
              borderBottom: `1px solid ${L.rule}`,
              paddingBottom: 0,
              flexWrap: "wrap",
            }}
          >
            {categories.map((cat: any) => {
              const active = activeCategory === cat.id;
              const count =
                items?.filter(
                  (i: any) => i.category_id === cat.id && i.is_active !== false,
                ).length || 0;
              return (
                <button
                  key={cat.id}
                  onClick={() => setTab(cat.id)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0 0 18px",
                    cursor: "pointer",
                    position: "relative",
                    marginBottom: -1,
                    borderBottom: `1px solid ${active ? L.ink : "transparent"}`,
                  }}
                >
                  <Canela
                    size="clamp(20px, 2.2vw, 28px)"
                    italic={active}
                    style={{
                      color: active ? L.ink : L.ink3,
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {cat.name}
                  </Canela>
                  <span
                    style={{
                      marginLeft: 10,
                      fontFamily: "Inter, sans-serif",
                      fontSize: 10,
                      letterSpacing: "0.22em",
                      color: active ? L.copperDeep : L.ink3,
                      verticalAlign: "super",
                    }}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div>
          {filteredItems.map((item, i) => (
            <CollectionRow
              key={item.id}
              item={item}
              index={i}
              flip={i % 2 === 1}
              prices={getPrices(item.id)}
              whatsapp={whatsapp}
              reserveLabel={reserveLabel}
              quoteOnlyLabel={quoteOnlyLabel}
              messageTemplate={messageTemplate}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;
