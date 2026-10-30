-- Safe for databases where the schema was already applied manually.
-- Existing product rows and category assignments are left unchanged.
CREATE TABLE IF NOT EXISTS public.categoriesitem (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  name_fr VARCHAR(200),
  description_fr TEXT
);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_category_id_fkey'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_category_id_fkey
      FOREIGN KEY (category_id)
      REFERENCES public.categoriesitem(id)
      ON DELETE SET NULL;
  END IF;
END
$$;
