/*
# Fix: policy manquante pour la gestion des utilisateurs par l'Admin

## Pourquoi
Le panel Admin permet de changer le rôle d'un utilisateur (client <-> designer),
mais aucune policy RLS n'autorisait un admin à UPDATE le profil d'un AUTRE
utilisateur (seule la policy "profiles_update_own" existait, limitée à
auth.uid() = id). Résultat : la fonctionnalité échouait silencieusement côté
base de données (bloquée par RLS), même si l'interface semblait fonctionner.
*/

DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );