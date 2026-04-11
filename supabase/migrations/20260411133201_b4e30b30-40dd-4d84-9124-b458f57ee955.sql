ALTER TABLE public.menu_items 
  ADD COLUMN price_half_kg text NOT NULL DEFAULT '',
  ADD COLUMN price_one_kg text NOT NULL DEFAULT '',
  ADD COLUMN is_custom_only boolean NOT NULL DEFAULT false;
