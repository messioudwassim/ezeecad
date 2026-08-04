/*
# Auto-création du profil à l'inscription

## Pourquoi
Avant cette migration, le profil était inséré côté client (AuthContext.signUp)
juste après supabase.auth.signUp(). Si la confirmation par email est activée
(réglage par défaut d'un projet Supabase), il n'y a pas encore de session
active à ce moment -> auth.uid() est null -> la policy RLS
"profiles_insert_own" rejette l'insertion -> l'inscription échoue.

## Solution
Un trigger sur auth.users (SECURITY DEFINER, donc il s'exécute avec les
droits du propriétaire de la fonction et n'est jamais bloqué par la RLS
de "profiles") crée automatiquement la ligne correspondante, en lisant
full_name/role dans raw_user_meta_data. Ça fonctionne que la confirmation
email soit activée ou non.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
