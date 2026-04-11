import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Site Settings
export function useSiteSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*");
      if (error) throw error;
      const map: Record<string, string> = {};
      data.forEach((s) => { map[s.key] = s.value; });
      return map;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase.from("site_settings").update({ value }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site_settings"] }),
  });
}

// Menu
export function useMenuCategories() {
  return useQuery({
    queryKey: ["menu_categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu_items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_items").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

// Menu Item Prices (flexible weight/price variants)
export function useMenuItemPrices(menuItemId?: string) {
  return useQuery({
    queryKey: ["menu_item_prices", menuItemId],
    queryFn: async () => {
      let q = supabase.from("menu_item_prices").select("*").order("sort_order");
      if (menuItemId) q = q.eq("menu_item_id", menuItemId);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });
}

export function useAllMenuItemPrices() {
  return useQuery({
    queryKey: ["menu_item_prices_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menu_item_prices").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertMenuItemPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (price: any) => {
      const { error } = await supabase.from("menu_item_prices").upsert(price);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu_item_prices"] });
      qc.invalidateQueries({ queryKey: ["menu_item_prices_all"] });
    },
  });
}

export function useDeleteMenuItemPrice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_item_prices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menu_item_prices"] });
      qc.invalidateQueries({ queryKey: ["menu_item_prices_all"] });
    },
  });
}

export function useUpsertMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: any) => {
      const { error } = await supabase.from("menu_items").upsert(item);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu_items"] }),
  });
}

export function useDeleteMenuItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("menu_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menu_items"] }),
  });
}

// Gallery
export function useGalleryImages() {
  return useQuery({
    queryKey: ["gallery_images"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useAllGalleryImages() {
  return useQuery({
    queryKey: ["gallery_images_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (img: any) => {
      const { error } = await supabase.from("gallery_images").upsert(img);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery_images"] });
      qc.invalidateQueries({ queryKey: ["gallery_images_all"] });
    },
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery_images"] });
      qc.invalidateQueries({ queryKey: ["gallery_images_all"] });
    },
  });
}

// Testimonials
export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useAllTestimonials() {
  return useQuery({
    queryKey: ["testimonials_all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useUpsertTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (t: any) => {
      const { error } = await supabase.from("testimonials").upsert(t);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testimonials"] });
      qc.invalidateQueries({ queryKey: ["testimonials_all"] });
    },
  });
}

export function useDeleteTestimonial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["testimonials"] });
      qc.invalidateQueries({ queryKey: ["testimonials_all"] });
    },
  });
}
