/*
# Restreint les policies de stockage au propriétaire du fichier

## Pourquoi
Les policies créées dans 20260804002755_storage_policies.sql autorisaient
UPDATE/DELETE à TOUT utilisateur authentifié sur TOUT le bucket -> n'importe
quel compte "client" connecté pouvait supprimer ou écraser les fichiers
uploadés par n'importe quel designer.

## Solution
On restreint UPDATE/DELETE aux objets dont le premier segment du chemin
correspond à l'uuid de l'utilisateur connecté. Ça correspond exactement à
la structure `models/{user.id}/...` déjà utilisée par UploadModelPage.tsx
et par les edge functions r2/s3-upload-url. L'INSERT reste ouvert à tout
utilisateur authentifié (nécessaire pour uploader un nouveau fichier),
mais UPDATE/DELETE sont maintenant limités à ses propres fichiers.
*/

-- model-images
DROP POLICY IF EXISTS "model_images_auth_update" ON storage.objects;
CREATE POLICY "model_images_owner_update" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'model-images' AND (storage.foldername(name))[2] = auth.uid()::text);

DROP POLICY IF EXISTS "model_images_auth_delete" ON storage.objects;
CREATE POLICY "model_images_owner_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'model-images' AND (storage.foldername(name))[2] = auth.uid()::text);

-- model-files
DROP POLICY IF EXISTS "model_files_auth_update" ON storage.objects;
CREATE POLICY "model_files_owner_update" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'model-files' AND (storage.foldername(name))[2] = auth.uid()::text);

DROP POLICY IF EXISTS "model_files_auth_delete" ON storage.objects;
CREATE POLICY "model_files_owner_delete" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'model-files' AND (storage.foldername(name))[2] = auth.uid()::text);
