/*
# Create storage buckets for EzeeCAD
Run this in Supabase Dashboard -> SQL Editor (or via CLI migration).
Creates the two buckets referenced by storage_policies.sql if they don't exist yet.
*/

insert into storage.buckets (id, name, public, file_size_limit)
values ('model-images', 'model-images', true, 5242880)   -- 5MB per image
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit)
values ('model-files', 'model-files', true, 209715200)   -- 200MB per zip
on conflict (id) do nothing;
