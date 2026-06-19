import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Upload, Image, Pencil, Check, X as XIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Canela, Eyebrow, L } from "@/components/luxe/tokens";
import { HeroPreview, AboutPreview, HouseItemPreview } from "@/components/admin/AdminPreviews";
import {
  useSiteSettings, useUpdateSettingsBatch,
  useMenuCategories, useMenuItems, useUpsertMenuItem, useDeleteMenuItem,
  useAllMenuItemPrices, useUpsertMenuItemPrice, useDeleteMenuItemPrice,
  useAllGalleryImages, useUpsertGalleryImage, useDeleteGalleryImage,
  useAllTestimonials, useUpsertTestimonial, useDeleteTestimonial,
  useHouseFavourites, useUpsertHouseItem, useDeleteHouseItem,
  useUpsertHouseCategory,
} from "@/hooks/use-site-data";

async function uploadImage(file: File, folder: string): Promise<string> {
  // Convert file → base64, POST to /api/upload-image, get back a /uploads/... URL.
  const dataB64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the "data:image/...;base64," prefix.
      const idx = result.indexOf(",");
      resolve(idx === -1 ? result : result.slice(idx + 1));
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
  const res = await fetch("/api/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, folder, data_base64: dataB64 }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Upload failed (${res.status}): ${body.slice(0, 200)}`);
  }
  const { url } = (await res.json()) as { url: string };
  return url;
}

// ─── Site Settings Tab ───
function SettingsTab() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateBatch = useUpdateSettingsBatch();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  const handleImageFieldUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
    folder: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingKey(key);
    try {
      const url = await uploadImage(file, folder);
      setEdits((p) => ({ ...p, [key]: url }));
      toast.success("Image uploaded. Click Save to commit.");
    } catch (err) {
      toast.error((err as Error).message || "Upload failed");
    }
    setUploadingKey(null);
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  const val = (key: string) => edits[key] ?? settings?.[key] ?? "";
  const set = (key: string, value: string) => setEdits((p) => ({ ...p, [key]: value }));

  const save = async () => {
    if (Object.keys(edits).length === 0) return;
    try {
      await updateBatch.mutateAsync(edits);
      setEdits({});
      toast.success("Saved. Public site updates in ~30–60s.");
    } catch (err) {
      toast.error((err as Error).message || "Failed to save");
    }
  };

  type Field =
    | { kind: "section"; label: string; hint?: string }
    | { kind: "input"; key: string; label: string; hint?: string }
    | { kind: "textarea"; key: string; label: string; hint?: string }
    | { kind: "image"; key: string; label: string; hint?: string; folder: string };

  const fields: Field[] = [
    { kind: "section", label: "SEO & Social Sharing" },
    { kind: "input", key: "seo_title", label: "Browser tab title (also shown in Google results)",
      hint: "Applied at build time — takes ~60s after Save to show in social shares." },
    { kind: "textarea", key: "seo_description", label: "Search result description" },
    { kind: "input", key: "seo_author", label: "Author meta tag" },
    { kind: "input", key: "seo_og_title", label: "Social share title (WhatsApp / Facebook preview)" },
    { kind: "textarea", key: "seo_og_description", label: "Social share description" },
    { kind: "input", key: "seo_og_image_url", label: "Social share image (full URL, 1200×630 ideal)",
      hint: "Used when someone pastes your link in WhatsApp, Facebook, Twitter, etc." },
    { kind: "input", key: "seo_og_site_name", label: "Site name (used in social previews)" },
    { kind: "input", key: "seo_og_url", label: "Canonical site URL (your custom domain)" },

    { kind: "section", label: "Branding" },
    { kind: "input", key: "brand_wordmark", label: "Brand wordmark",
      hint: "Shown in the navbar centre, the mobile menu header, and the footer left." },

    { kind: "section", label: "Navigation" },
    { kind: "input", key: "nav_eyebrow", label: "Navbar eyebrow (small text top-left, desktop only)" },
    { kind: "input", key: "nav_links", label: "Nav links (comma-separated, 4 labels)",
      hint: "These map in order to: Story → about, Collection → menu, Lookbook → gallery, Contact → contact." },
    { kind: "input", key: "nav_menu_aria", label: "Hamburger menu accessibility label (screen-reader only)" },
    { kind: "input", key: "nav_close_aria", label: "Mobile drawer close-button accessibility label" },

    { kind: "section", label: "Hero" },
    { kind: "input", key: "hero_title", label: "Hero Title",
      hint: "Split on first space — first word goes italic, the rest gets a copper period." },
    { kind: "textarea", key: "hero_subtitle", label: "Hero Subtitle" },
    { kind: "input", key: "hero_badge", label: "Hero Badge Text (eyebrow above the lockup)" },
    { kind: "image", key: "hero_image_url", label: "Hero image", folder: "hero",
      hint: "Upload a square cake portrait. Replaces the strawberry shot." },
    { kind: "input", key: "hero_image_alt", label: "Hero image alt text (a11y / SEO)" },
    { kind: "input", key: "hero_caption_left", label: "Hero caption — left side (Plate / dish name)" },
    { kind: "input", key: "hero_caption_right", label: "Hero caption — right side (№ / number)" },
    { kind: "input", key: "hero_sticker", label: "Hero sticker (rotated note on top-left of image)" },
    { kind: "input", key: "hero_cta_whatsapp", label: "WhatsApp Button Text" },
    { kind: "input", key: "hero_cta_instagram", label: "Instagram Button Text" },

    { kind: "section", label: "Philosophy ticker" },
    { kind: "input", key: "philosophy_ticker", label: "Ticker line (repeats automatically)" },

    { kind: "section", label: "About — Chapter One" },
    { kind: "input", key: "about_subheading", label: "Eyebrow (e.g. \"Chapter One — Our Story\")" },
    { kind: "input", key: "about_heading", label: "Heading",
      hint: "Comma splits into two lines — second line renders in italic copper." },
    { kind: "image", key: "about_image_url", label: "About image", folder: "about" },
    { kind: "input", key: "about_image_alt", label: "About image alt text (a11y / SEO)" },
    { kind: "input", key: "about_caption", label: "About image caption (italic line below the photo)" },
    { kind: "textarea", key: "about_text", label: "About paragraph (primary)" },
    { kind: "textarea", key: "about_secondary_text", label: "About paragraph (secondary, italic)" },
    { kind: "input", key: "about_features", label: "Three feature labels (comma-separated)" },
    { kind: "textarea", key: "about_feature_descs", label: "Three feature descriptions (separate with ||)",
      hint: "Use \"||\" between descriptions so they can contain commas freely." },

    { kind: "section", label: "House Favourites — La Carte" },
    { kind: "input", key: "house_eyebrow", label: "Eyebrow (e.g. \"La Carte\")" },
    { kind: "input", key: "house_heading", label: "Heading",
      hint: "The second word renders italic copper (e.g. \"The house favourites.\")" },
    { kind: "input", key: "house_subtitle", label: "Subtitle (right side, italic)" },
    { kind: "input", key: "house_request_quote_label", label: "\"Request a quote\" button label",
      hint: "Shown only on House items that have a quote/price filled in (Bespoke-style)." },
    { kind: "input", key: "house_quote_template", label: "WhatsApp message template for House quotes",
      hint: "Use {item} as a placeholder — replaced with the item name." },
    { kind: "input", key: "house_tab_number_prefix", label: "Tab number prefix",
      hint: "Decorative character before each category number (e.g. \"№\" before \"01\")." },

    { kind: "section", label: "Collection — Chapter Two" },
    { kind: "input", key: "collection_eyebrow", label: "Eyebrow" },
    { kind: "input", key: "collection_heading", label: "Heading (comma splits into two lines)" },
    { kind: "textarea", key: "collection_subtitle", label: "Subtitle" },
    { kind: "input", key: "menu_reserve_label", label: "Per-cake \"Reserve\" button label" },
    { kind: "input", key: "menu_quote_only_label", label: "Label shown on quote-only items" },
    { kind: "input", key: "menu_whatsapp_template", label: "WhatsApp message template for Reserve",
      hint: "Use {item} as a placeholder — replaced with the cake name." },

    { kind: "section", label: "Lookbook — Chapter Three" },
    { kind: "input", key: "lookbook_eyebrow", label: "Eyebrow" },
    { kind: "input", key: "lookbook_heading", label: "Heading (comma splits into two lines)" },
    { kind: "input", key: "lookbook_subtitle", label: "Subtitle" },
    { kind: "input", key: "lightbox_hint", label: "Lightbox close-hint (small text on opened image)" },
    { kind: "input", key: "lookbook_number_prefix", label: "Image number prefix (hover overlay)",
      hint: "Decorative character before the auto-generated tile number (e.g. \"№\" before \"001\")." },

    { kind: "section", label: "Correspondence — Chapter Four" },
    { kind: "input", key: "correspondence_eyebrow", label: "Eyebrow" },
    { kind: "input", key: "testimonial_star_char", label: "Star character used for ratings",
      hint: "Repeated N times for each testimonial's rating (1–5)." },

    { kind: "section", label: "Contact — Chapter Five" },
    { kind: "input", key: "contact_eyebrow", label: "Eyebrow" },
    { kind: "input", key: "contact_heading", label: "Heading (comma splits into two lines)" },
    { kind: "input", key: "contact_col_reserve_label", label: "Reserve column eyebrow" },
    { kind: "input", key: "contact_col_whatsapp_title", label: "Reserve column title (italic)" },
    { kind: "textarea", key: "contact_text", label: "Reply-time line under WhatsApp" },
    { kind: "input", key: "contact_col_follow_label", label: "Follow column eyebrow" },
    { kind: "input", key: "contact_col_instagram_title", label: "Follow column title (italic)" },
    { kind: "input", key: "instagram_caption", label: "Caption under Instagram" },
    { kind: "input", key: "contact_col_visit_label", label: "Visit column eyebrow" },
    { kind: "input", key: "contact_address", label: "Address",
      hint: "Use commas to break the address into multiple lines." },
    { kind: "input", key: "delivery_note", label: "Delivery note (small print)" },
    { kind: "input", key: "whatsapp_number", label: "WhatsApp Number (with country code)" },
    { kind: "input", key: "instagram_url", label: "Instagram URL" },

    { kind: "section", label: "Floating Order Now pill" },
    { kind: "input", key: "floating_pill_label", label: "Pill button label" },
    { kind: "input", key: "floating_pill_message", label: "WhatsApp prefilled message",
      hint: "What the WhatsApp chat opens with when someone taps the bottom-right pill." },

    { kind: "section", label: "Footer" },
    { kind: "input", key: "footer_tagline", label: "Footer Tagline" },
    { kind: "input", key: "footer_copyright", label: "Footer Copyright",
      hint: "Use {year} as a placeholder — it'll be replaced with the current year automatically." },
  ];

  return (
    <div className="space-y-6">
      {fields.map((f, idx) => {
        if (f.kind === "section") {
          const isHero = f.label === "Hero";
          const isAbout = f.label.startsWith("About");
          return (
            <div
              key={`sec-${idx}`}
              className="pt-6"
              style={{ borderTop: idx === 0 ? "none" : `1px solid ${L.rule}` }}
            >
              <Eyebrow style={{ fontSize: 11 }}>{f.label}</Eyebrow>
              {isHero && <HeroPreview get={val} />}
              {isAbout && <AboutPreview get={val} />}
            </div>
          );
        }
        if (f.kind === "image") {
          const currentUrl = val(f.key);
          return (
            <div key={f.key}>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {f.label}
              </label>
              <div className="flex items-start gap-4">
                <div
                  className="w-28 h-28 overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ border: `1px dashed ${L.ink3}`, background: L.white }}
                >
                  {currentUrl ? (
                    <img src={currentUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer block">
                    <Button asChild size="sm" variant="outline" disabled={uploadingKey === f.key}>
                      <span>
                        <Upload className="mr-1 h-3 w-3" />
                        {uploadingKey === f.key ? "Uploading…" : "Upload Image"}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFieldUpload(e, f.key, f.folder)}
                    />
                  </label>
                  <Input
                    value={currentUrl}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder="/uploads/your-image.png or external URL"
                  />
                </div>
              </div>
              {f.hint && (
                <p className="text-xs mt-1.5" style={{ color: L.ink3, fontFamily: "Inter, sans-serif" }}>
                  {f.hint}
                </p>
              )}
            </div>
          );
        }
        return (
          <div key={f.key}>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {f.label}
            </label>
            {f.kind === "textarea" ? (
              <Textarea
                value={val(f.key)}
                onChange={(e) => set(f.key, e.target.value)}
                rows={3}
              />
            ) : (
              <Input
                value={val(f.key)}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
            {f.hint && (
              <p className="text-xs mt-1.5" style={{ color: L.ink3, fontFamily: "Inter, sans-serif" }}>
                {f.hint}
              </p>
            )}
          </div>
        );
      })}
      <Button onClick={save} disabled={Object.keys(edits).length === 0} className="bg-primary">
        <Save className="mr-2 h-4 w-4" /> Save Settings
      </Button>
    </div>
  );
}

// ─── Price Variants Editor (inline within Menu Tab) ───
function PriceVariantsEditor({ menuItemId }: { menuItemId: string }) {
  const { data: allPrices } = useAllMenuItemPrices();
  const upsertPrice = useUpsertMenuItemPrice();
  const deletePrice = useDeleteMenuItemPrice();
  const [newLabel, setNewLabel] = useState("");
  const [newPrice, setNewPrice] = useState("");
  // Track which price is being edited (by id), and its draft values
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const prices = allPrices?.filter((p) => p.menu_item_id === menuItemId) || [];

  const addPrice = async () => {
    if (!newLabel.trim() || !newPrice.trim()) {
      toast.error("Both weight and price are required");
      return;
    }
    try {
      await upsertPrice.mutateAsync({
        menu_item_id: menuItemId,
        weight_label: newLabel.trim(),
        price: newPrice.trim(),
        sort_order: prices.length + 1,
      });
      setNewLabel("");
      setNewPrice("");
      toast.success("Price added!");
    } catch {
      toast.error("Failed to add price");
    }
  };

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditLabel(p.weight_label);
    setEditPrice(p.price);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditPrice("");
  };

  const saveEdit = async (p: any) => {
    if (!editLabel.trim() || !editPrice.trim()) {
      toast.error("Both weight and price are required");
      return;
    }
    try {
      await upsertPrice.mutateAsync({
        ...p,
        weight_label: editLabel.trim(),
        price: editPrice.trim(),
      });
      setEditingId(null);
      toast.success("Price updated!");
    } catch {
      toast.error("Failed to update price");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium block">Price Variants</label>
      {prices.map((p) => (
        <div key={p.id} className="flex items-center gap-2">
          {editingId === p.id ? (
            <>
              <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="flex-1 h-8 text-sm" />
              <Input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="flex-1 h-8 text-sm" />
              <Button variant="ghost" size="sm" className="text-green-600 h-8 w-8 p-0" onClick={() => saveEdit(p)}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground h-8 w-8 p-0" onClick={cancelEdit}>
                <XIcon className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm px-3 py-1.5 flex-1" style={{ background: L.white, border: `1px solid ${L.rule}` }}>{p.weight_label}</span>
              <span className="text-sm font-medium px-3 py-1.5 flex-1" style={{ background: L.white, border: `1px solid ${L.rule}`, color: L.copperDeep }}>{p.price}</span>
              <Button variant="ghost" size="sm" className="text-muted-foreground h-8 w-8 p-0" onClick={() => startEdit(p)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive h-8 w-8 p-0" onClick={async () => { await deletePrice.mutateAsync(p.id); toast.success("Removed"); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. ½ Kg, 1 Kg, 2.5 Kg" className="flex-1 h-8 text-sm" />
        <Input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g. ₹499" className="flex-1 h-8 text-sm" />
        <Button size="sm" variant="outline" onClick={addPrice} className="h-8">
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">Click ✏️ to edit a price, or add new ones below</p>
    </div>
  );
}

// ─── Menu Tab ───
function MenuTab() {
  const { data: categories } = useMenuCategories();
  const { data: items, isLoading } = useMenuItems();
  const { data: allPrices } = useAllMenuItemPrices();
  const upsert = useUpsertMenuItem();
  const remove = useDeleteMenuItem();
  const [editItem, setEditItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editItem) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "menu");
      setEditItem({ ...editItem, image_url: url });
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  const saveItem = async () => {
    if (!editItem?.name || !editItem?.category_id) {
      toast.error("Name and category are required");
      return;
    }
    try {
      // Ensure price field is included (required by database)
      const itemToSave = { ...editItem, price: editItem.price ?? "" };
      await upsert.mutateAsync(itemToSave);
      setEditItem(null);
      toast.success("Menu item saved!");
    } catch (err: any) {
      console.error("Save failed:", err);
      toast.error(err?.message || "Failed to save");
    }
  };

  const getPricePreview = (itemId: string) => {
    const prices = allPrices?.filter((p) => p.menu_item_id === itemId) || [];
    if (prices.length === 0) return null;
    return prices.map((p) => `${p.weight_label}: ${p.price}`).join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Canela size={32} italic style={{ color: L.ink, letterSpacing: "-0.01em" }}>Menu Items</Canela>
        <Button onClick={() => setEditItem({ name: "", description: "", price: "", icon: "🎂", is_custom_only: false, image_url: null, category_id: categories?.[0]?.id, sort_order: (items?.length || 0) + 1, is_active: true })} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add Item
        </Button>
      </div>

      {editItem && (
        <div className="p-5 space-y-3" style={{ background: L.paper, border: `1px solid ${L.rule}` }}>
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 overflow-hidden flex items-center justify-center flex-shrink-0" style={{ border: `1px dashed ${L.ink3}`, background: L.white }}>
              {editItem.image_url ? (
                <img src={editItem.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Image className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium">Product Image</label>
              <label className="cursor-pointer block">
                <Button asChild size="sm" variant="outline" disabled={uploading}>
                  <span><Upload className="mr-1 h-3 w-3" /> {uploading ? "Uploading…" : "Upload Image"}</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {editItem.image_url && (
                <button className="text-xs text-destructive hover:underline" onClick={() => setEditItem({ ...editItem, image_url: null })}>
                  Remove image
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Name</label>
              <Input value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Icon (fallback emoji)</label>
              <Input value={editItem.icon} onChange={(e) => setEditItem({ ...editItem, icon: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Description</label>
            <Input value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} />
          </div>

          {/* Price variants - only show for saved items */}
          {editItem.id ? (
            <PriceVariantsEditor menuItemId={editItem.id} />
          ) : (
            <p className="text-xs text-muted-foreground italic">Save the item first, then add price variants</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Category</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editItem.category_id} onChange={(e) => setEditItem({ ...editItem, category_id: e.target.value })}>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Sort Order</label>
              <Input type="number" value={editItem.sort_order} onChange={(e) => setEditItem({ ...editItem, sort_order: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={editItem.is_active} onCheckedChange={(v) => setEditItem({ ...editItem, is_active: v })} />
              <span className="text-sm">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editItem.is_custom_only} onCheckedChange={(v) => setEditItem({ ...editItem, is_custom_only: v })} />
              <span className="text-sm">Custom Quote Only</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveItem} size="sm"><Save className="mr-1 h-3 w-3" /> Save</Button>
            <Button variant="outline" onClick={() => setEditItem(null)} size="sm">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {categories?.map((cat) => (
          <div key={cat.id}>
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-2">{cat.name}</h4>
            {items?.filter((i) => i.category_id === cat.id).map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5 mb-1" style={{ background: L.white, border: `1px solid ${L.rule}` }}>
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-12 h-12 object-cover" />
                  ) : (
                    <span className="text-xl">{item.icon}</span>
                  )}
                  <div>
                    <span className="text-sm font-medium">{item.name}</span>
                    {!item.is_active && <span className="ml-2 text-xs text-muted-foreground">(hidden)</span>}
                    {item.is_custom_only && <span className="ml-2 text-xs text-amber-600">(quote only)</span>}
                    {getPricePreview(item.id) && (
                      <p className="text-xs text-muted-foreground">{getPricePreview(item.id)}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditItem({ ...item })}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => { await remove.mutateAsync(item.id); toast.success("Deleted"); }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gallery Tab ───
function GalleryTab() {
  const { data: images, isLoading } = useAllGalleryImages();
  const upsert = useUpsertGalleryImage();
  const remove = useDeleteGalleryImage();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const publicUrl = await uploadImage(file, "gallery");
      await upsert.mutateAsync({
        image_url: publicUrl,
        alt_text: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
        sort_order: (images?.length || 0) + 1,
        is_active: true,
      });
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed");
    }
    setUploading(false);
  };

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Canela size={32} italic style={{ color: L.ink, letterSpacing: "-0.01em" }}>Gallery ({images?.length || 0} images)</Canela>
        <label className="cursor-pointer">
          <Button asChild size="sm" disabled={uploading}>
            <span><Plus className="mr-1 h-4 w-4" /> {uploading ? "Uploading…" : "Upload Image"}</span>
          </Button>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images?.map((img) => (
          <div key={img.id} className="relative group overflow-hidden aspect-square" style={{ border: `1px solid ${L.rule}` }}>
            <img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover" />
            {!img.is_active && (
              <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
                <span className="text-white text-xs font-medium">Hidden</span>
              </div>
            )}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <Button size="sm" variant="secondary" onClick={async () => { await upsert.mutateAsync({ ...img, is_active: !img.is_active }); toast.success(img.is_active ? "Hidden" : "Shown"); }}>
                {img.is_active ? "Hide" : "Show"}
              </Button>
              <Button size="sm" variant="destructive" onClick={async () => { await remove.mutateAsync(img.id); toast.success("Deleted"); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Testimonials Tab ───
function TestimonialsTab() {
  const { data: testimonials, isLoading } = useAllTestimonials();
  const upsert = useUpsertTestimonial();
  const remove = useDeleteTestimonial();
  const [editItem, setEditItem] = useState<any>(null);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  const saveItem = async () => {
    if (!editItem?.client_name || !editItem?.review_text) {
      toast.error("Name and review are required");
      return;
    }
    try {
      await upsert.mutateAsync(editItem);
      setEditItem(null);
      toast.success("Testimonial saved!");
    } catch {
      toast.error("Failed to save");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Canela size={32} italic style={{ color: L.ink, letterSpacing: "-0.01em" }}>Testimonials</Canela>
        <Button onClick={() => setEditItem({ client_name: "", review_text: "", rating: 5, sort_order: (testimonials?.length || 0) + 1, is_active: true })} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add Review
        </Button>
      </div>

      {editItem && (
        <div className="p-5 space-y-3" style={{ background: L.paper, border: `1px solid ${L.rule}` }}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium">Client Name</label>
              <Input value={editItem.client_name} onChange={(e) => setEditItem({ ...editItem, client_name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium">Rating (1-5)</label>
              <Input type="number" min={1} max={5} value={editItem.rating} onChange={(e) => setEditItem({ ...editItem, rating: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium">Review</label>
            <Textarea value={editItem.review_text} onChange={(e) => setEditItem({ ...editItem, review_text: e.target.value })} rows={3} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={editItem.is_active} onCheckedChange={(v) => setEditItem({ ...editItem, is_active: v })} />
            <span className="text-sm">Active</span>
          </div>
          <div className="flex gap-2">
            <Button onClick={saveItem} size="sm"><Save className="mr-1 h-3 w-3" /> Save</Button>
            <Button variant="outline" onClick={() => setEditItem(null)} size="sm">Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {testimonials?.map((t) => (
          <div key={t.id} className="flex items-start justify-between px-4 py-3" style={{ background: L.white, border: `1px solid ${L.rule}` }}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{t.client_name}</span>
                <span className="text-primary text-xs">{"★".repeat(t.rating)}</span>
                {!t.is_active && <span className="text-xs text-muted-foreground">(hidden)</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{t.review_text}</p>
            </div>
            <div className="flex gap-1 ml-3">
              <Button variant="ghost" size="sm" onClick={() => setEditItem({ ...t })}>Edit</Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={async () => { await remove.mutateAsync(t.id); toast.success("Deleted"); }}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── House Favourites Tab ───
function HouseTab() {
  const { data: categories, isLoading } = useHouseFavourites();
  const { data: settings } = useSiteSettings();
  const upsertItem = useUpsertHouseItem();
  const deleteItem = useDeleteHouseItem();
  const upsertCat = useUpsertHouseCategory();
  const reserveLabel = settings?.menu_reserve_label ?? "Reserve this cake →";
  const requestQuoteLabel = settings?.house_request_quote_label ?? "Request a quote →";
  const [editing, setEditing] = useState<
    | { category_id: string; item: any }
    | { category_id: string; item: null }
    | null
  >(null);
  const [uploading, setUploading] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catDraft, setCatDraft] = useState("");

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, "house");
      setEditing({ ...editing, item: { ...(editing.item ?? {}), image_url: url } } as any);
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error((err as Error).message || "Upload failed");
    }
    setUploading(false);
  };

  const saveItem = async () => {
    if (!editing) return;
    const item = editing.item ?? {};
    if (!item.name) {
      toast.error("Name is required");
      return;
    }
    try {
      await upsertItem.mutateAsync({ category_id: editing.category_id, item });
      setEditing(null);
      toast.success("Saved. Public site updates in ~30–60s.");
    } catch (err) {
      toast.error((err as Error).message || "Failed to save");
    }
  };

  const saveCat = async (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat || !catDraft.trim()) {
      setEditingCatId(null);
      return;
    }
    try {
      await upsertCat.mutateAsync({ ...cat, label: catDraft.trim() });
      setEditingCatId(null);
      toast.success("Category renamed.");
    } catch (err) {
      toast.error((err as Error).message || "Failed to rename");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <Canela size={32} italic style={{ color: L.ink, letterSpacing: "-0.01em" }}>
          House Favourites
        </Canela>
        <p className="text-xs" style={{ color: L.ink3 }}>
          {categories.length} categories · {categories.reduce((n, c) => n + c.items.length, 0)} items
        </p>
      </div>

      {categories.map((cat) => (
        <div key={cat.id} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            {editingCatId === cat.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Input
                  value={catDraft}
                  onChange={(e) => setCatDraft(e.target.value)}
                  className="max-w-xs"
                />
                <Button size="sm" variant="ghost" className="text-green-600 h-8" onClick={() => saveCat(cat.id)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground h-8" onClick={() => setEditingCatId(null)}>
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <button
                className="flex items-center gap-2 group"
                onClick={() => { setEditingCatId(cat.id); setCatDraft(cat.label); }}
              >
                <Canela size={22} italic style={{ color: L.ink }}>
                  {cat.label}
                </Canela>
                <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: L.ink3 }} />
              </button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing({ category_id: cat.id, item: { name: "", image_url: "", description: "", prices: [], blurb: "", quote: "" } })}
            >
              <Plus className="mr-1 h-3 w-3" /> Add Item
            </Button>
          </div>

          {editing && editing.category_id === cat.id && (
            <div className="p-5 space-y-3" style={{ background: L.paper, border: `1px solid ${L.rule}` }}>
              <HouseItemPreview
                item={editing.item ?? {}}
                reserveLabel={reserveLabel}
                requestQuoteLabel={requestQuoteLabel}
              />
              <div className="flex items-start gap-4">
                <div
                  className="w-24 h-24 overflow-hidden flex items-center justify-center flex-shrink-0"
                  style={{ border: `1px dashed ${L.ink3}`, background: L.white }}
                >
                  {editing.item?.image_url ? (
                    <img src={editing.item.image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Image className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium">Image</label>
                  <label className="cursor-pointer block">
                    <Button asChild size="sm" variant="outline" disabled={uploading}>
                      <span><Upload className="mr-1 h-3 w-3" /> {uploading ? "Uploading…" : "Upload Image"}</span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  {editing.item?.image_url && (
                    <button
                      className="text-xs text-destructive hover:underline"
                      onClick={() => setEditing({ ...editing, item: { ...editing.item, image_url: "" } } as any)}
                    >
                      Remove image
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium">Name</label>
                <Input
                  value={editing.item?.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, name: e.target.value } } as any)}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Description (optional — shown above prices)</label>
                <Textarea
                  rows={2}
                  value={editing.item?.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, description: e.target.value } } as any)}
                  placeholder="e.g. Layers of dark chocolate; a crumb that could hold a candle upright."
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium">Price variants (optional)</label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7"
                    onClick={() => {
                      const next = [...((editing.item?.prices as Array<{ weight_label: string; price: string }> | undefined) ?? []), { weight_label: "", price: "" }];
                      setEditing({ ...editing, item: { ...editing.item, prices: next } } as any);
                    }}
                  >
                    <Plus className="mr-1 h-3 w-3" /> Add row
                  </Button>
                </div>
                {((editing.item?.prices as Array<{ weight_label: string; price: string }> | undefined) ?? []).length === 0 && (
                  <p className="text-xs" style={{ color: L.ink3 }}>
                    Add at least one weight/price row to show the "Reserve this cake" button.
                  </p>
                )}
                <div className="space-y-2">
                  {((editing.item?.prices as Array<{ weight_label: string; price: string }> | undefined) ?? []).map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="½ Kg"
                        value={row.weight_label}
                        onChange={(e) => {
                          const prices = [...(editing.item?.prices ?? [])];
                          prices[idx] = { ...prices[idx], weight_label: e.target.value };
                          setEditing({ ...editing, item: { ...editing.item, prices } } as any);
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="₹499"
                        value={row.price}
                        onChange={(e) => {
                          const prices = [...(editing.item?.prices ?? [])];
                          prices[idx] = { ...prices[idx], price: e.target.value };
                          setEditing({ ...editing, item: { ...editing.item, prices } } as any);
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive h-8 w-8 p-0"
                        onClick={() => {
                          const prices = [...(editing.item?.prices ?? [])];
                          prices.splice(idx, 1);
                          setEditing({ ...editing, item: { ...editing.item, prices } } as any);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium">Blurb (optional — shown for Bespoke-style items)</label>
                <Textarea
                  rows={2}
                  value={editing.item?.blurb ?? ""}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, blurb: e.target.value } } as any)}
                />
              </div>
              <div>
                <label className="text-xs font-medium">Quote / starting price (optional)</label>
                <Input
                  value={editing.item?.quote ?? ""}
                  onChange={(e) => setEditing({ ...editing, item: { ...editing.item, quote: e.target.value } } as any)}
                  placeholder="e.g. ₹2,800 upwards"
                />
                <p className="text-xs mt-1.5" style={{ color: L.ink3 }}>
                  If filled in, the item shows a "Request a quote" button (Bespoke-style layout).
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={saveItem} size="sm"><Save className="mr-1 h-3 w-3" /> Save</Button>
                <Button variant="outline" onClick={() => setEditing(null)} size="sm">Cancel</Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {cat.items.map((item) => (
              <div
                key={item.id}
                className="relative group overflow-hidden"
                style={{ border: `1px solid ${L.rule}`, background: L.white }}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full aspect-square object-cover" />
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center" style={{ background: L.paper }}>
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="px-3 py-2">
                  <div className="text-sm font-medium truncate" style={{ color: L.ink }}>{item.name}</div>
                  {item.prices && item.prices.length > 0 && (
                    <div className="text-xs truncate" style={{ color: L.copperDeep }}>
                      {item.prices
                        .filter((p) => (p.weight_label && p.weight_label.trim()) || (p.price && p.price.trim()))
                        .map((p) => `${p.weight_label} ${p.price}`.trim())
                        .join(" · ")}
                    </div>
                  )}
                  {item.quote && (
                    <div className="text-xs truncate" style={{ color: L.copperDeep }}>{item.quote}</div>
                  )}
                </div>
                <div
                  className="absolute inset-0 flex items-end justify-end gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "linear-gradient(0deg, rgba(42,31,23,0.55), transparent 40%)" }}
                >
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 px-2 text-xs"
                    onClick={() => setEditing({ category_id: cat.id, item })}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0"
                    onClick={async () => {
                      await deleteItem.mutateAsync({ category_id: cat.id, item_id: item.id });
                      toast.success("Removed.");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Admin Page ───
const AdminPage = () => {
  return (
    <div className="min-h-screen" style={{ background: L.ivory }}>
      <div className="mx-auto max-w-5xl" style={{ padding: "clamp(40px, 6vw, 80px) clamp(20px, 5vw, 56px) 64px" }}>
        <div className="flex items-start justify-between gap-6 mb-12 flex-wrap" style={{ borderBottom: `1px solid ${L.rule}`, paddingBottom: 32 }}>
          <div>
            <Eyebrow>Cake Rush — Admin</Eyebrow>
            <div className="mt-3">
              <Canela size="clamp(40px, 6vw, 64px)" italic style={{ display: "block", color: L.ink, letterSpacing: "-0.015em" }}>
                The atelier desk.
              </Canela>
            </div>
            <p className="text-sm mt-3" style={{ color: L.ink2, fontFamily: "Inter, sans-serif" }}>
              Manage everything visible on the public site — text, menu, gallery, reviews.
            </p>
          </div>
          <Link to="/" className="shrink-0">
            <Button
              variant="outline"
              size="sm"
              style={{
                borderRadius: 0,
                borderColor: L.ink,
                color: L.ink,
                background: "transparent",
              }}
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Site
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList
            className="w-full mb-10 h-auto p-0 bg-transparent gap-0 grid grid-cols-4 lx-admin-tabs"
            style={{ borderBottom: `1px solid ${L.rule}` }}
          >
            {[
              ["settings", "Settings"],
              ["house", "Menu"],
              ["gallery", "Gallery"],
              ["testimonials", "Reviews"],
            ].map(([v, label]) => (
              <TabsTrigger
                key={v}
                value={v}
                className="lx-admin-tab rounded-none bg-transparent px-2 pb-4 pt-3 text-xs tracking-[0.18em] uppercase font-medium data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="settings"><SettingsTab /></TabsContent>
          <TabsContent value="house"><HouseTab /></TabsContent>
          <TabsContent value="gallery"><GalleryTab /></TabsContent>
          <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
