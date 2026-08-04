import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Profile = {
  id: string;
  full_name: string;
  role: 'client' | 'designer' | 'admin';
  avatar_url: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name_fr: string;
  name_en: string;
  name_ar: string;
  slug: string;
  icon: string;
};

export type Model = {
  id: string;
  title: string;
  description_fr: string;
  description_en: string;
  description_ar: string;
  category_id: string | null;
  price: number;
  designer_id: string;
  status: 'pending' | 'approved' | 'rejected';
  images: string[];
  file_url: string | null;
  downloads_count: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  designer?: Profile;
};
