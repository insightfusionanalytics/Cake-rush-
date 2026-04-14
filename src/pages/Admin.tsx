import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save, Upload, Image, Pencil, Check, X as XIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  useSiteSettings, useUpdateSetting,
  useMenuCategories, useMenuItems, useUpsertMenuItem, useDeleteMenuItem,
  useAllMenuItemPrices, useUpsertMenuItemPrice, useDeleteMenuItemPrice,
  useAllGalleryImages, useUpsertGalleryImage, useDeleteGalleryImage,
  useAllTestimonials, useUpsertTestimonial, useDeleteTestimonial,
} from "@/hooks/use-site-data";

async function uploadImage(file: File, folder: string): Promise<string> {
  const path = `${folder}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from("images").upload(path, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(path);
  return publicUrl;
}

// ─── Site Settings Tab ───
function SettingsTab() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();
  const [edits, setEdits] = useState<Record<string, string>>({});

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;

  const val = (key: string) => edits[key] ?? settings?.[key] ?? "";
  const set = (key: string, value: string) => setEdits((p) => ({ ...p, [key]: value }));

  const save = async () => {
    try {
      for (const [key, value] of Object.entries(edits)) {
        await updateSetting.mutateAsync({ key, value });
      }
      setEdits({});
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save");
    }
  };

  const fields = [
    { key: "hero_title", label: "Hero Title", type: "input" },
    { key: "hero_subtitle", label: "Hero Subtitle", type: "textarea" },
    { key: "hero_badge", label: "Hero Badge Text", type: "input" },
    { key: "hero_cta_whatsapp", label: "WhatsApp Button Text", type: "input" },
    { key: "hero_cta_instagram", label: "Instagram Button Text", type: "input" },
    { key: "about_subheading", label: "About Subheading", type: "input" },
    { key: "about_heading", label: "About Heading", type: "input" },
    { key: "about_text", label: "About Text", type: "textarea" },
    { key: "about_features", label: "About Features (comma-separated)", type: "input" },
    { key: "contact_heading", label: "Contact Heading", type: "input" },
    { key: "contact_text", label: "Contact Text", type: "textarea" },
    { key: "whatsapp_number", label: "WhatsApp Number (with country code)", type: "input" },
    { key: "instagram_url", label: "Instagram URL", type: "input" },
    { key: "footer_tagline", label: "Footer Tagline", type: "input" },
  ];

  return (
    <div className="space-y-6">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-sm font-medium text-foreground mb-1.5 block">{f.label}</label>
          {f.type === "textarea" ? (
            <Textarea value={val(f.key)} onChange={(e) => set(f.key, e.target.value)} rows={3} />
          ) : (
            <Input value={val(f.key)} onChange={(e) => set(f.key, e.target.value)} />
          )}
        </div>
      ))}
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
              <span className="text-sm bg-background border border-border rounded-md px-3 py-1.5 flex-1">{p.weight_label}</span>
              <span className="text-sm font-semibold text-primary bg-background border border-border rounded-md px-3 py-1.5 flex-1">{p.price}</span>
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
        <h3 className="font-heading text-xl font-semibold">Menu Items</h3>
        <Button onClick={() => setEditItem({ name: "", description: "", price: "", icon: "🎂", is_custom_only: false, image_url: null, category_id: categories?.[0]?.id, sort_order: (items?.length || 0) + 1, is_active: true })} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add Item
        </Button>
      </div>

      {editItem && (
        <div className="bg-secondary/50 rounded-xl p-4 space-y-3 border border-border">
          <div className="flex items-start gap-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-border bg-background flex items-center justify-center flex-shrink-0">
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
              <div key={item.id} className="flex items-center justify-between bg-card rounded-lg px-4 py-2.5 mb-1 border border-border/50">
                <div className="flex items-center gap-3">
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
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
        <h3 className="font-heading text-xl font-semibold">Gallery ({images?.length || 0} images)</h3>
        <label className="cursor-pointer">
          <Button asChild size="sm" disabled={uploading}>
            <span><Plus className="mr-1 h-4 w-4" /> {uploading ? "Uploading…" : "Upload Image"}</span>
          </Button>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {images?.map((img) => (
          <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-border/50">
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
        <h3 className="font-heading text-xl font-semibold">Testimonials</h3>
        <Button onClick={() => setEditItem({ client_name: "", review_text: "", rating: 5, sort_order: (testimonials?.length || 0) + 1, is_active: true })} size="sm">
          <Plus className="mr-1 h-4 w-4" /> Add Review
        </Button>
      </div>

      {editItem && (
        <div className="bg-secondary/50 rounded-xl p-4 space-y-3 border border-border">
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
          <div key={t.id} className="flex items-start justify-between bg-card rounded-lg px-4 py-3 border border-border/50">
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

// ─── Admin Page ───
const AdminPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Cake Rush Admin</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your website content</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Site
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="w-full mb-8 bg-secondary/60 rounded-xl p-1">
            <TabsTrigger value="settings" className="flex-1 rounded-lg">Settings</TabsTrigger>
            <TabsTrigger value="menu" className="flex-1 rounded-lg">Menu</TabsTrigger>
            <TabsTrigger value="gallery" className="flex-1 rounded-lg">Gallery</TabsTrigger>
            <TabsTrigger value="testimonials" className="flex-1 rounded-lg">Testimonials</TabsTrigger>
          </TabsList>

          <TabsContent value="settings"><SettingsTab /></TabsContent>
          <TabsContent value="menu"><MenuTab /></TabsContent>
          <TabsContent value="gallery"><GalleryTab /></TabsContent>
          <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
