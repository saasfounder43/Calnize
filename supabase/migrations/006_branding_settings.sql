-- Branding settings table
create table if not exists branding_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade unique,
  logo_url text,
  white_label boolean default false,
  created_at timestamp with time zone default now()
);

alter table branding_settings enable row level security;

create policy "Users can manage own branding"
  on branding_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow public read for booking pages
create policy "Public can read branding"
  on branding_settings for select
  using (true);
