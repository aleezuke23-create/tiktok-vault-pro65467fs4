ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS monetized_at timestamp with time zone;

UPDATE public.accounts
SET monetized_at = COALESCE(last_synced_at, updated_at, created_at)
WHERE followers >= 10000 AND monetized_at IS NULL;