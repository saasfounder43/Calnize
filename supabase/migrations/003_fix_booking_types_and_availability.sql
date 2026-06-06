-- This migration fixes the schema changes that broke the app during the last update
-- It restores the original booking_types structure required by the frontend slots API

-- 1. Drop the incorrect tables
DROP TABLE IF EXISTS booking_types CASCADE;
DROP TABLE IF EXISTS availability CASCADE;

-- 2. Recreate booking_types correctly matching the Next.js API expectations
CREATE TABLE booking_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  description text,
  duration_minutes integer NOT NULL,
  price numeric,
  currency text DEFAULT 'USD',
  buffer_minutes integer DEFAULT 0,
  minimum_notice_minutes integer DEFAULT 60, -- Default 1 hour
  max_bookings_per_day integer,
  participation_mode text DEFAULT 'virtual',
  meeting_link text,
  is_active boolean DEFAULT true,
  color_theme text DEFAULT 'purple',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, slug)
);

-- 3. Restore Policies
ALTER TABLE booking_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own booking types" ON booking_types FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can view active booking types" ON booking_types FOR SELECT USING (is_active = true);

-- Add Admin policy if function exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin') THEN
    CREATE POLICY "Admins can manage all booking types" ON booking_types FOR ALL USING (public.is_admin());
  END IF;
END $$;
