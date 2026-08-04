/*
# EzeeCAD Full Schema

## Overview
Marketplace for 3D design models. Three user roles: client, designer, admin.
Designers upload models; clients browse and download; admins approve/reject.

## Tables

### profiles
Extension of auth.users. Stores display name, role, avatar.
- id: matches auth.users.id
- full_name: display name
- role: 'client' | 'designer' | 'admin'
- avatar_url: optional profile picture

### categories
Static category list for filtering models.
- name_fr, name_en, name_ar: multilingual labels
- slug: URL-safe identifier

### models
3D model listings uploaded by designers.
- title: model name
- description_fr/en/ar: multilingual descriptions
- category_id: foreign key to categories
- price: 0 = free
- designer_id: foreign key to profiles
- status: pending / approved / rejected
- images: array of image URLs (Supabase Storage)
- file_url: download ZIP URL
- downloads_count: cached counter

### downloads
Records each time a client downloads a model.
- user_id: client who downloaded
- model_id: which model

## Security
- RLS enabled on all tables
- profiles: users manage their own; admin can read all
- categories: public read, admin write
- models: designers manage their own; public reads approved; admin manages all
- downloads: authenticated users insert/read their own
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'designer', 'admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- PUBLIC profiles read for anon (landing page designer names)
DROP POLICY IF EXISTS "profiles_anon_select" ON profiles;
CREATE POLICY "profiles_anon_select" ON profiles FOR SELECT
  TO anon USING (true);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_fr text NOT NULL,
  name_en text NOT NULL,
  name_ar text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text DEFAULT 'Box',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_all" ON categories;
CREATE POLICY "categories_select_all" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- MODELS
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description_fr text DEFAULT '',
  description_en text DEFAULT '',
  description_ar text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price numeric NOT NULL DEFAULT 0 CHECK (price >= 0),
  designer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  images text[] DEFAULT '{}',
  file_url text,
  downloads_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS models_designer_idx ON models(designer_id);
CREATE INDEX IF NOT EXISTS models_category_idx ON models(category_id);
CREATE INDEX IF NOT EXISTS models_status_idx ON models(status);

ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Public can see approved models
DROP POLICY IF EXISTS "models_select_approved" ON models;
CREATE POLICY "models_select_approved" ON models FOR SELECT
  TO anon, authenticated USING (status = 'approved');

-- Designers see their own models regardless of status
DROP POLICY IF EXISTS "models_select_own" ON models;
CREATE POLICY "models_select_own" ON models FOR SELECT
  TO authenticated USING (auth.uid() = designer_id);

-- Admin sees all
DROP POLICY IF EXISTS "models_select_admin" ON models;
CREATE POLICY "models_select_admin" ON models FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "models_insert_designer" ON models;
CREATE POLICY "models_insert_designer" ON models FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = designer_id AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('designer', 'admin'))
  );

DROP POLICY IF EXISTS "models_update_own" ON models;
CREATE POLICY "models_update_own" ON models FOR UPDATE
  TO authenticated USING (auth.uid() = designer_id) WITH CHECK (auth.uid() = designer_id);

DROP POLICY IF EXISTS "models_update_admin" ON models;
CREATE POLICY "models_update_admin" ON models FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS "models_delete_own" ON models;
CREATE POLICY "models_delete_own" ON models FOR DELETE
  TO authenticated USING (auth.uid() = designer_id);

DROP POLICY IF EXISTS "models_delete_admin" ON models;
CREATE POLICY "models_delete_admin" ON models FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- DOWNLOADS
CREATE TABLE IF NOT EXISTS downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  downloaded_at timestamptz DEFAULT now(),
  UNIQUE(user_id, model_id)
);

CREATE INDEX IF NOT EXISTS downloads_user_idx ON downloads(user_id);

ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "downloads_select_own" ON downloads;
CREATE POLICY "downloads_select_own" ON downloads FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "downloads_insert_own" ON downloads;
CREATE POLICY "downloads_insert_own" ON downloads FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "downloads_delete_own" ON downloads;
CREATE POLICY "downloads_delete_own" ON downloads FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Seed categories
INSERT INTO categories (name_fr, name_en, name_ar, slug, icon) VALUES
  ('Mécanique', 'Mechanical', 'ميكانيكي', 'mechanical', 'Settings'),
  ('Mobilier', 'Furniture', 'أثاث', 'furniture', 'Sofa'),
  ('Robotique', 'Robotics', 'روبوتيك', 'robotics', 'Cpu'),
  ('Architecture', 'Architecture', 'عمارة', 'architecture', 'Building2'),
  ('Médical', 'Medical', 'طبي', 'medical', 'Heart'),
  ('Véhicules', 'Vehicles', 'مركبات', 'vehicles', 'Car')
ON CONFLICT (slug) DO NOTHING;

-- Function to increment download count safely
CREATE OR REPLACE FUNCTION increment_download_count(model_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE models SET downloads_count = downloads_count + 1 WHERE id = model_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
