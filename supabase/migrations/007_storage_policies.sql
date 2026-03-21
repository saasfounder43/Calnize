-- Migration 007: Setup Storage for Branding Assets

-- 1. Create the bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('branding-assets', 'branding-assets', true)
on conflict (id) do nothing;

-- 2. Enable RLS on storage.objects (if not already enabled)
alter table storage.objects enable row level security;

-- 3. Policy: Allow users to upload their own assets
-- We use the path prefix format: 'user_id/filename'
create policy "Users can upload their own branding assets"
on storage.objects for insert
with check (
  bucket_id = 'branding-assets' and
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 4. Policy: Allow users to update their own assets
create policy "Users can update their own branding assets"
on storage.objects for update
using (
  bucket_id = 'branding-assets' and
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 5. Policy: Allow users to delete their own assets
create policy "Users can delete their own branding assets"
on storage.objects for delete
using (
  bucket_id = 'branding-assets' and
  (auth.uid())::text = (storage.foldername(name))[1]
);

-- 6. Policy: Allow public read access to branding assets
create policy "Public can read branding assets"
on storage.objects for select
using (bucket_id = 'branding-assets');
