// Data layer — JSON-file backed via /content.json (read) and /api/save-content
// (write, which commits to GitHub → Vercel auto-deploys). No Supabase.
//
// Public hooks preserve the API the admin and section components already use,
// so individual components don't need to change.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Types ─────────────────────────────────────────────────────────────
export type Settings = Record<string, string>;

export interface MenuCategory {
  id: string;
  name: string;
  sort_order: number;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  icon?: string | null;
  is_active: boolean;
  is_custom_only: boolean;
  price?: string | null;
  sort_order: number;
}

export interface MenuItemPrice {
  id: string;
  menu_item_id: string;
  weight_label: string;
  price: string;
  sort_order: number;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  alt_text?: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Testimonial {
  id: string;
  client_name: string;
  review_text: string;
  rating: number;
  location?: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface HousePrice {
  weight_label: string;
  price: string;
}

export interface HouseItem {
  id: string;
  name: string;
  image_url?: string | null;
  description?: string;
  prices?: HousePrice[];
  blurb?: string;
  quote?: string;
}

export interface HouseCategory {
  id: string;
  label: string;
  sort_order: number;
  items: HouseItem[];
}

export interface Content {
  settings: Settings;
  menu_categories: MenuCategory[];
  menu_items: MenuItem[];
  menu_item_prices: MenuItemPrice[];
  gallery_images: GalleryImage[];
  testimonials: Testimonial[];
  house_favourites: HouseCategory[];
}

const EMPTY_CONTENT: Content = {
  settings: {},
  menu_categories: [],
  menu_items: [],
  menu_item_prices: [],
  gallery_images: [],
  testimonials: [],
  house_favourites: [],
};

// ─── Core fetch + save ─────────────────────────────────────────────────
async function fetchContent(): Promise<Content> {
  // Cache-bust so the freshest content.json is read after a deploy.
  const res = await fetch(`/content.json?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`content.json fetch failed: ${res.status}`);
  const data = await res.json();
  return { ...EMPTY_CONTENT, ...data };
}

async function saveContent(next: Content): Promise<void> {
  const res = await fetch("/api/save-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(next),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`save-content failed: ${res.status} ${text}`);
  }
}

const FRESH = {
  staleTime: 0,
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: true,
};

function useContent() {
  return useQuery({
    queryKey: ["content"],
    queryFn: fetchContent,
    ...FRESH,
  });
}

function nextId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function useMutateContent() {
  const qc = useQueryClient();
  return async (updater: (prev: Content) => Content) => {
    const previous = qc.getQueryData<Content>(["content"]) ?? (await fetchContent());
    const next = updater(previous);
    // Optimistic: paint the UI with the new state immediately so the
    // admin sees their change without waiting for the GitHub round-trip.
    qc.setQueryData(["content"], next);
    try {
      await saveContent(next);
      // Intentionally NO invalidateQueries here — Vercel's CDN may still
      // be serving the OLD public/content.json for ~30s after the commit
      // lands, so a refetch would briefly overwrite our good cache with
      // stale data. Trust the optimistic cache; the next natural fetch
      // (page reload / window-focus refetch in the FRESH config) picks
      // up the canonical version once the CDN catches up.
    } catch (err) {
      // Roll back on failure so the admin doesn't see a phantom edit.
      qc.setQueryData(["content"], previous);
      throw err;
    }
  };
}

// ─── Site settings ─────────────────────────────────────────────────────
export function useSiteSettings() {
  const q = useContent();
  return { ...q, data: q.data?.settings as Settings | undefined };
}

export function useUpdateSetting() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      await mutate((prev) => ({
        ...prev,
        settings: { ...prev.settings, [key]: value },
      }));
    },
  });
}

// Batched: write many settings keys in a single GitHub commit.
export function useUpdateSettingsBatch() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (changes: Record<string, string>) => {
      await mutate((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...changes },
      }));
    },
  });
}

// ─── Menu categories ───────────────────────────────────────────────────
export function useMenuCategories() {
  const q = useContent();
  const data = [...(q.data?.menu_categories ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return { ...q, data };
}

// ─── Menu items ────────────────────────────────────────────────────────
export function useMenuItems() {
  const q = useContent();
  const data = [...(q.data?.menu_items ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return { ...q, data };
}

export function useUpsertMenuItem() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (item: Partial<MenuItem> & { id?: string }) => {
      await mutate((prev) => {
        const items = [...prev.menu_items];
        if (item.id && items.some((i) => i.id === item.id)) {
          const idx = items.findIndex((i) => i.id === item.id);
          items[idx] = { ...items[idx], ...item } as MenuItem;
        } else {
          const id = item.id ?? nextId("mi");
          items.push({
            id,
            category_id: item.category_id ?? "",
            name: item.name ?? "",
            description: item.description ?? "",
            image_url: item.image_url ?? null,
            icon: item.icon ?? "🎂",
            is_active: item.is_active ?? true,
            is_custom_only: item.is_custom_only ?? false,
            price: item.price ?? "",
            sort_order: item.sort_order ?? items.length + 1,
          });
        }
        return { ...prev, menu_items: items };
      });
    },
  });
}

export function useDeleteMenuItem() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (id: string) => {
      await mutate((prev) => ({
        ...prev,
        menu_items: prev.menu_items.filter((i) => i.id !== id),
        // Cascade — drop any price variants pointing at this item
        menu_item_prices: prev.menu_item_prices.filter(
          (p) => p.menu_item_id !== id,
        ),
      }));
    },
  });
}

// ─── Menu item prices ──────────────────────────────────────────────────
export function useMenuItemPrices(menuItemId?: string) {
  const q = useContent();
  const all = q.data?.menu_item_prices ?? [];
  const data = (menuItemId ? all.filter((p) => p.menu_item_id === menuItemId) : all)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  return { ...q, data };
}

export function useAllMenuItemPrices() {
  const q = useContent();
  const data = [...(q.data?.menu_item_prices ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return { ...q, data };
}

export function useUpsertMenuItemPrice() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (price: Partial<MenuItemPrice> & { id?: string }) => {
      await mutate((prev) => {
        const prices = [...prev.menu_item_prices];
        if (price.id && prices.some((p) => p.id === price.id)) {
          const idx = prices.findIndex((p) => p.id === price.id);
          prices[idx] = { ...prices[idx], ...price } as MenuItemPrice;
        } else {
          const id = price.id ?? nextId("p");
          prices.push({
            id,
            menu_item_id: price.menu_item_id ?? "",
            weight_label: price.weight_label ?? "",
            price: price.price ?? "",
            sort_order: price.sort_order ?? prices.length + 1,
          });
        }
        return { ...prev, menu_item_prices: prices };
      });
    },
  });
}

export function useDeleteMenuItemPrice() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (id: string) => {
      await mutate((prev) => ({
        ...prev,
        menu_item_prices: prev.menu_item_prices.filter((p) => p.id !== id),
      }));
    },
  });
}

// ─── Gallery ───────────────────────────────────────────────────────────
export function useGalleryImages() {
  const q = useContent();
  const data = (q.data?.gallery_images ?? [])
    .filter((g) => g.is_active)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  return { ...q, data };
}

export function useAllGalleryImages() {
  const q = useContent();
  const data = [...(q.data?.gallery_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return { ...q, data };
}

export function useUpsertGalleryImage() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (img: Partial<GalleryImage> & { id?: string }) => {
      await mutate((prev) => {
        const images = [...prev.gallery_images];
        if (img.id && images.some((i) => i.id === img.id)) {
          const idx = images.findIndex((i) => i.id === img.id);
          images[idx] = { ...images[idx], ...img } as GalleryImage;
        } else {
          const id = img.id ?? nextId("g");
          images.push({
            id,
            image_url: img.image_url ?? "",
            alt_text: img.alt_text ?? "",
            is_active: img.is_active ?? true,
            sort_order: img.sort_order ?? images.length + 1,
          });
        }
        return { ...prev, gallery_images: images };
      });
    },
  });
}

export function useDeleteGalleryImage() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (id: string) => {
      await mutate((prev) => ({
        ...prev,
        gallery_images: prev.gallery_images.filter((g) => g.id !== id),
      }));
    },
  });
}

// ─── Testimonials ──────────────────────────────────────────────────────
export function useTestimonials() {
  const q = useContent();
  const data = (q.data?.testimonials ?? [])
    .filter((t) => t.is_active)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  return { ...q, data };
}

export function useAllTestimonials() {
  const q = useContent();
  const data = [...(q.data?.testimonials ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return { ...q, data };
}

export function useUpsertTestimonial() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (t: Partial<Testimonial> & { id?: string }) => {
      await mutate((prev) => {
        const arr = [...prev.testimonials];
        if (t.id && arr.some((x) => x.id === t.id)) {
          const idx = arr.findIndex((x) => x.id === t.id);
          arr[idx] = { ...arr[idx], ...t } as Testimonial;
        } else {
          const id = t.id ?? nextId("t");
          arr.push({
            id,
            client_name: t.client_name ?? "",
            review_text: t.review_text ?? "",
            rating: t.rating ?? 5,
            location: t.location ?? "",
            is_active: t.is_active ?? true,
            sort_order: t.sort_order ?? arr.length + 1,
          });
        }
        return { ...prev, testimonials: arr };
      });
    },
  });
}

export function useDeleteTestimonial() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (id: string) => {
      await mutate((prev) => ({
        ...prev,
        testimonials: prev.testimonials.filter((t) => t.id !== id),
      }));
    },
  });
}

// Public "Send a bouquet" review submission — posts to /api/submit-review
// which validates + appends to content.json on GitHub. On success we
// prepend the new testimonial to the local React Query cache so it
// shows in the reviews section instantly (no wait for Vercel redeploy).
export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      client_name: string;
      rating: number;
      review_text: string;
      location?: string;
    }) => {
      const res = await fetch("/api/submit-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        testimonial?: Testimonial;
        error?: string;
      };
      if (!res.ok || !payload.testimonial) {
        throw new Error(payload.error || `Submit failed (${res.status})`);
      }
      const t = payload.testimonial;
      const cur = qc.getQueryData<Content>(["content"]);
      if (cur) {
        qc.setQueryData(["content"], {
          ...cur,
          testimonials: [t, ...(cur.testimonials ?? [])],
        });
      }
      return t;
    },
  });
}

// ─── House Favourites ──────────────────────────────────────────────────
export function useHouseFavourites() {
  const q = useContent();
  const data = [...(q.data?.house_favourites ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return { ...q, data };
}

export function useUpsertHouseCategory() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (cat: Partial<HouseCategory> & { id?: string }) => {
      await mutate((prev) => {
        const cats = [...(prev.house_favourites ?? [])];
        if (cat.id && cats.some((c) => c.id === cat.id)) {
          const idx = cats.findIndex((c) => c.id === cat.id);
          cats[idx] = { ...cats[idx], ...cat } as HouseCategory;
        } else {
          cats.push({
            id: cat.id ?? nextId("hc"),
            label: cat.label ?? "",
            sort_order: cat.sort_order ?? cats.length + 1,
            items: cat.items ?? [],
          });
        }
        return { ...prev, house_favourites: cats };
      });
    },
  });
}

export function useDeleteHouseCategory() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async (id: string) => {
      await mutate((prev) => ({
        ...prev,
        house_favourites: (prev.house_favourites ?? []).filter((c) => c.id !== id),
      }));
    },
  });
}

export function useUpsertHouseItem() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async ({
      category_id,
      item,
    }: {
      category_id: string;
      item: Partial<HouseItem> & { id?: string };
    }) => {
      await mutate((prev) => {
        const cats = (prev.house_favourites ?? []).map((c) => {
          if (c.id !== category_id) return c;
          const items = [...c.items];
          if (item.id && items.some((i) => i.id === item.id)) {
            const idx = items.findIndex((i) => i.id === item.id);
            items[idx] = { ...items[idx], ...item } as HouseItem;
          } else {
            items.push({
              id: item.id ?? nextId("hi"),
              name: item.name ?? "",
              image_url: item.image_url ?? "",
              description: item.description ?? "",
              prices: item.prices ?? [],
              blurb: item.blurb ?? "",
              quote: item.quote ?? "",
            });
          }
          return { ...c, items };
        });
        return { ...prev, house_favourites: cats };
      });
    },
  });
}

export function useDeleteHouseItem() {
  const mutate = useMutateContent();
  return useMutation({
    mutationFn: async ({
      category_id,
      item_id,
    }: {
      category_id: string;
      item_id: string;
    }) => {
      await mutate((prev) => ({
        ...prev,
        house_favourites: (prev.house_favourites ?? []).map((c) =>
          c.id === category_id
            ? { ...c, items: c.items.filter((i) => i.id !== item_id) }
            : c,
        ),
      }));
    },
  });
}
