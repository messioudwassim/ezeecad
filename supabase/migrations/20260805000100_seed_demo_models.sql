/*
# Seed - Produits de démonstration EzeeCAD

COMMENT UTILISER CE FICHIER :
1. Crée d'abord un compte "Designer" via l'app (page Register -> role Designer).
   Ex: email demo@ezeecad.com
2. Récupère son id: dans Supabase Dashboard -> SQL Editor, lance:
      select id, full_name, role from profiles where role = 'designer';
3. Remplace 'PASTE_DESIGNER_ID_HERE' ci-dessous par cet id (uuid).
4. Remplace les URLs d'images par de vraies images (Unsplash, Pexels,
   ou tes propres renders 3D) -> clic droit "copier l'adresse de l'image".
5. Lance ce script dans le SQL Editor de Supabase (projet ecfbrerzocxeikxketoa).

Ces produits sont juste pour que le marketplace ne soit pas vide au lancement.
Remplace-les plus tard par les vrais modèles de tes designers.
*/

do $$
declare
  v_designer_id uuid := '3ec2261c-c579-4a70-bab4-b0ee1081557a'; -- <-- à remplacer
  v_mechanical uuid;      -- categories.id est uuid dans ce projet
  v_furniture uuid;
  v_robotics uuid;
  v_architecture uuid;
begin
  select id into v_mechanical   from categories where slug = 'mechanical';
  select id into v_furniture    from categories where slug = 'furniture';
  select id into v_robotics     from categories where slug = 'robotics';
  select id into v_architecture from categories where slug = 'architecture';

  insert into models
    (title, description_fr, description_en, description_ar, category_id, price, designer_id, status, images)
  values
    (
      'Support Moteur Universel V2',
      'Support moteur robuste imprimable en 3D, compatible moteurs NEMA 17/23. Tolérances optimisées pour impression FDM.',
      'Robust 3D-printable motor mount, compatible with NEMA 17/23 motors. Tolerances optimized for FDM printing.',
      'حامل محرك متين قابل للطباعة ثلاثية الأبعاد، متوافق مع محركات NEMA 17/23.',
      v_mechanical, 0, v_designer_id, 'approved',
      array['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800']
    ),
    (
      'Chaise Scandinave Modulaire',
      'Modèle CAO complet d''une chaise au design scandinave, pièces assemblables sans visserie apparente.',
      'Full CAD model of a Scandinavian-style chair, assemblable parts with hidden fasteners.',
      'نموذج ثلاثي الأبعاد كامل لكرسي بتصميم اسكندنافي، قطع قابلة للتجميع.',
      v_furniture, 1500, v_designer_id, 'approved',
      array['https://images.unsplash.com/photo-1503602642458-232111445657?w=800']
    ),
    (
      'Bras Robotique 6 Axes',
      'Modèle complet d''un bras robotique 6 axes pour prototypage éducatif, fichiers STEP + STL inclus.',
      'Full 6-axis robotic arm model for educational prototyping, STEP + STL files included.',
      'نموذج كامل لذراع روبوتية بست محاور للنماذج الأولية التعليمية.',
      v_robotics, 3500, v_designer_id, 'approved',
      array['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800']
    ),
    (
      'Maquette Villa Moderne',
      'Maquette architecturale 3D d''une villa moderne, idéale pour rendus et présentations clients.',
      '3D architectural model of a modern villa, ideal for renders and client presentations.',
      'نموذج معماري ثلاثي الأبعاد لفيلا حديثة، مثالي للعروض التقديمية.',
      v_architecture, 5000, v_designer_id, 'approved',
      array['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800']
    );
end $$;
