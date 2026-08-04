/*
# Rend handle_new_user() defensif

## Pourquoi
Le trigger precedent (20260805000200) faisait echouer TOUTE la creation du
compte ("Database error saving new user") si l'insert dans profiles levait
la moindre exception, quelle qu'en soit la cause exacte. On isole
maintenant l'insert dans un bloc BEGIN/EXCEPTION : si ca echoue, on log un
WARNING (visible dans Supabase -> Logs -> Postgres Logs) mais on laisse la
creation du compte auth.users continuer normalement.

## Filet de securite complementaire
Si le profil n'a pas pu etre cree ici, AuthContext.tsx (mis a jour dans le
meme lot) le recreera automatiquement a la premiere connexion reussie de
l'utilisateur -> a ce moment une session valide existe, donc la policy RLS
"profiles_insert_own" (auth.uid() = id) autorise l'insertion cote client.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'client')
    )
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user: impossible de creer le profil pour % : %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Le trigger existe deja (cree par la migration precedente), on s'assure
-- juste qu'il pointe bien vers cette nouvelle version de la fonction.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
