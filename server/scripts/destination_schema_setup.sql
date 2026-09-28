-- RAJA ELECTRICALS DESTINATION SCHEMA SETUP SQL (IDEMPOTENT)
-- Target Database: Destination Supabase (ueohqicjodxwkwdxcrnj)
-- Generated from Source PostgreSQL Introspection

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    image text,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. BRANDS TABLE
CREATE TABLE IF NOT EXISTS public.brands (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    logo text,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    category text,
    description text,
    price numeric,
    image text,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. GALLERY TABLE
CREATE TABLE IF NOT EXISTS public.gallery (
    id text NOT NULL PRIMARY KEY,
    title text,
    image text,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. ADMINS TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id bigint NOT NULL PRIMARY KEY,
    email text,
    password_hash text,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS password_hash text;

-- 6. SITE_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id bigint NOT NULL PRIMARY KEY,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 7. CATALOGUES TABLE
CREATE TABLE IF NOT EXISTS public.catalogues (
    id bigint NOT NULL PRIMARY KEY,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 8. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
    id bigint NOT NULL PRIMARY KEY,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 9. INDUSTRIES TABLE
CREATE TABLE IF NOT EXISTS public.industries (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    image text,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 10. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id bigint NOT NULL PRIMARY KEY,
    data jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);

-- 11. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    image_url text,
    category text,
    client_name text,
    project_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Definitions (DROP IF EXISTS before CREATE)
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Brands" ON public.brands;
CREATE POLICY "Public Read Brands" ON public.brands FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Gallery" ON public.gallery;
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public Read Site Settings" ON public.site_settings;
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);
