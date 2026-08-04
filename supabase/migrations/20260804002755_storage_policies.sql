/*
# Storage Policies for model-images and model-files buckets

## Overview
- model-images: public read, authenticated write
- model-files: public read, authenticated write
*/

-- model-images policies
DROP POLICY IF EXISTS "model_images_public_read" ON storage.objects;
CREATE POLICY "model_images_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'model-images');

DROP POLICY IF EXISTS "model_images_auth_write" ON storage.objects;
CREATE POLICY "model_images_auth_write" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'model-images');

DROP POLICY IF EXISTS "model_images_auth_update" ON storage.objects;
CREATE POLICY "model_images_auth_update" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'model-images');

DROP POLICY IF EXISTS "model_images_auth_delete" ON storage.objects;
CREATE POLICY "model_images_auth_delete" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'model-images');

-- model-files policies
DROP POLICY IF EXISTS "model_files_public_read" ON storage.objects;
CREATE POLICY "model_files_public_read" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'model-files');

DROP POLICY IF EXISTS "model_files_auth_write" ON storage.objects;
CREATE POLICY "model_files_auth_write" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'model-files');

DROP POLICY IF EXISTS "model_files_auth_update" ON storage.objects;
CREATE POLICY "model_files_auth_update" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'model-files');

DROP POLICY IF EXISTS "model_files_auth_delete" ON storage.objects;
CREATE POLICY "model_files_auth_delete" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'model-files');
