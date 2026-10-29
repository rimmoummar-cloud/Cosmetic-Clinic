ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS description_fr TEXT;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS description_fr TEXT;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS description_fr TEXT;
