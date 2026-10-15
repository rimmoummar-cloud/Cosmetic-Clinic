ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'products'
          AND column_name = 'image_url'
    ) THEN
        EXECUTE $migration$
            UPDATE public.products
            SET image_urls = ARRAY[image_url::text]
            WHERE image_url IS NOT NULL
              AND btrim(image_url::text) <> ''
              AND COALESCE(cardinality(image_urls), 0) = 0
        $migration$;
    END IF;
END
$$;
