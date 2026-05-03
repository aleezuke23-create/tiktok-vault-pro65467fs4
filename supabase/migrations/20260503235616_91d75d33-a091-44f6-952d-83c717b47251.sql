
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  tiktok_url TEXT NOT NULL,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  followers INTEGER NOT NULL DEFAULT 0,
  likes BIGINT NOT NULL DEFAULT 0,
  following INTEGER NOT NULL DEFAULT 0,
  videos INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  country_code TEXT,
  notes TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Single-user app, no auth: allow all access (anon + authenticated)
CREATE POLICY "public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "public write categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "public update categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "public delete categories" ON public.categories FOR DELETE USING (true);

CREATE POLICY "public read accounts" ON public.accounts FOR SELECT USING (true);
CREATE POLICY "public write accounts" ON public.accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "public update accounts" ON public.accounts FOR UPDATE USING (true);
CREATE POLICY "public delete accounts" ON public.accounts FOR DELETE USING (true);

CREATE INDEX idx_accounts_followers ON public.accounts(followers DESC);
CREATE INDEX idx_accounts_created_at ON public.accounts(created_at DESC);
