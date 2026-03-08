-- 1. CLEANUP (Ensures a fresh start)
DROP TABLE IF EXISTS bookings, oauth_tokens, availability_rules, booking_types, users CASCADE;

-- 2. USERS TABLE (Profiles)
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  username text UNIQUE,
  timezone text DEFAULT 'UTC',
  stripe_customer_id text,
  plan text DEFAULT 'free',
  role text DEFAULT 'user',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. BOOKING TYPES
CREATE TABLE booking_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  duration_minutes integer NOT NULL,
  price numeric,
  currency text DEFAULT 'USD',
  buffer_time_minutes integer DEFAULT 0,
  participation_mode text DEFAULT 'virtual',
  meeting_link text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- 4. AVAILABILITY RULES
CREATE TABLE availability_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  weekday integer NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL
);

-- 5. BOOKINGS
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_type_id uuid REFERENCES booking_types(id) ON DELETE CASCADE,
  host_user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_email text NOT NULL,
  guest_notes text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  payment_status text DEFAULT 'free',
  stripe_payment_intent_id text,
  calendar_event_id text,
  status text DEFAULT 'confirmed',
  created_at timestamp with time zone DEFAULT now()
);

-- 6. OAUTH TOKENS
CREATE TABLE oauth_tokens (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expiry_date bigint NOT NULL
);

-- 7. ENABLE RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES
CREATE POLICY "Anyone can view user profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own booking types" ON booking_types FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view active booking types" ON booking_types FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own availability" ON availability_rules FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view availability" ON availability_rules FOR SELECT USING (true);

CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (auth.uid() = host_user_id);
CREATE POLICY "Anyone can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = host_user_id);
CREATE POLICY "Users can delete own bookings" ON bookings FOR DELETE USING (auth.uid() = host_user_id);

CREATE POLICY "Users can manage own tokens" ON oauth_tokens FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- ADMIN POLICIES
-- ============================================

-- Admins can view/edit everything in users table
CREATE POLICY "Admins can manage all users" ON users FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Admins can manage all booking types
CREATE POLICY "Admins can manage all booking types" ON booking_types FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Admins can manage all availability rules
CREATE POLICY "Admins can manage all availability" ON availability_rules FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Admins can manage all bookings
CREATE POLICY "Admins can manage all bookings" ON bookings FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Admins can manage all tokens
CREATE POLICY "Admins can manage all tokens" ON oauth_tokens FOR ALL USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Initial Admin Setup
-- (Note: Run this manually in Supabase UI for existing users)
UPDATE users SET role = 'admin' WHERE email = 'saasfounder43@gmail.com';
