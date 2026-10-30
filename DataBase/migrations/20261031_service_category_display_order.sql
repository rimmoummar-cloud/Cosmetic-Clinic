-- Idempotent schema tracking for service category display order.
-- Existing category records keep a NULL order until an admin assigns one.
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS "order" INTEGER;
