create table if not exists users (
  id uuid primary key,
  email text unique not null,
  name text,
  profile_picture text,
  user_type text default null,
  plan_type text default 'free',
  slug text unique not null,
  timezone text,
  calendar_connected boolean default false,
  created_at timestamp with time zone default now()
);

alter table users enable row level security;

create policy "Users can view own data"
  on users for select
  using (auth.uid() = id);

create policy "Users can insert own data"
  on users for insert
  with check (auth.uid() = id);

create policy "Users can update own data"
  on users for update
  using (auth.uid() = id);
