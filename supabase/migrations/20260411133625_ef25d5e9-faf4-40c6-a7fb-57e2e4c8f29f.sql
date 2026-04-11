-- Create flexible pricing table
CREATE TABLE public.menu_item_prices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  weight_label text NOT NULL,
  price text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.menu_item_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read menu item prices" ON public.menu_item_prices FOR SELECT USING (true);
CREATE POLICY "Anyone can insert menu item prices" ON public.menu_item_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update menu item prices" ON public.menu_item_prices FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete menu item prices" ON public.menu_item_prices FOR DELETE USING (true);

-- Migrate existing data into new table
INSERT INTO public.menu_item_prices (menu_item_id, weight_label, price, sort_order)
SELECT id, '½ Kg', price_half_kg, 1 FROM public.menu_items WHERE price_half_kg != '';

INSERT INTO public.menu_item_prices (menu_item_id, weight_label, price, sort_order)
SELECT id, '1 Kg', price_one_kg, 2 FROM public.menu_items WHERE price_one_kg != '';

-- Drop hardcoded columns
ALTER TABLE public.menu_items DROP COLUMN price_half_kg;
ALTER TABLE public.menu_items DROP COLUMN price_one_kg;
