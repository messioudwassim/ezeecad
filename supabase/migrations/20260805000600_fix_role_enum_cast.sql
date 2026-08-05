/*
# Fix: handle_new_user() - cast role vers le type enum user_role

## Pourquoi
La colonne profiles.role est de type enum "user_role" (pas text).
La fonction handle_new_user() (trigger sur auth.users) insérait une valeur
texte brute récupérée depuis raw_user_meta_data, sans la convertir vers ce
type enum -> erreur Postgres 42804 "column role is of type user_role but
expression is of type text" à CHAQUE inscription.

## Solution
Cast explicite ::user_role sur la valeur avant insertion.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Ne jamais faire échouer la création du compte auth à cause du profil :
  -- le fallback client-side dans AuthContext.tsx (fetchProfile) rattrapera
  -- la création du profil si ce trigger échoue pour une raison quelconque.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;