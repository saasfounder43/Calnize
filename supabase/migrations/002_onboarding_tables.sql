-- Drop existing tables if they exist to apply new schema
drop table if exists availability cascade;
drop table if exists booking_types cascade;

-- Booking types table
create table if not exists booking_types (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  duration integer not null,
  price numeric default 0,
  currency text default 'USD',
  meeting_mode text,
  meeting_link text,
  location text,
  color_theme text default 'blue',
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table booking_types enable row level security;

create policy "Users can manage own booking types"
  on booking_types for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Availability table
create table if not exists availability (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  day_of_week text not null,
  start_time text not null,
  end_time text not null
);

alter table availability enable row level security;

create policy "Users can manage own availability"
  on availability for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
