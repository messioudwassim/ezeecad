/*
# Commandes de paiement (Chargily Pay - CIB/EDAHABIA)

## Pourquoi
Les modèles payants (price > 0) doivent être payés avant téléchargement.
Cette table trace chaque tentative de paiement Chargily et son statut,
indépendamment de la table `downloads` (qui n'enregistre que les
téléchargements réellement autorisés/gratuits/payés).

## Colonnes
- chargily_checkout_id : id du checkout côté Chargily (pour retrouver la commande
  depuis le webhook, qui ne connaît que cet id)
- status : pending (créé, en attente de paiement) / paid / failed / expired
- amount : montant en DA au moment de l'achat (indépendant du prix courant du modèle,
  qui peut changer après coup)

## Sécurité
- Un client ne voit que ses propres commandes
- Seul le service role (utilisé par les edge functions) peut insérer/mettre à jour
  le statut -> empêche un client de se déclarer "paid" lui-même côté client
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'dzd',
  chargily_checkout_id text UNIQUE,
  checkout_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_model_idx ON orders(model_id);
CREATE INDEX IF NOT EXISTS orders_checkout_idx ON orders(chargily_checkout_id);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Un utilisateur voit uniquement ses propres commandes
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Admin voit tout (support client, litiges)
DROP POLICY IF EXISTS "orders_select_admin" ON orders;
CREATE POLICY "orders_select_admin" ON orders FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Aucune policy INSERT/UPDATE pour "authenticated" : seules les edge functions,
-- qui utilisent la clé service_role (contourne RLS), peuvent créer/modifier
-- une commande. Ça empêche un client de fabriquer une commande "paid" lui-même.
