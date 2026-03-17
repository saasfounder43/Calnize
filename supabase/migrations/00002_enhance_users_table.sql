-- Enhance users table with missing fields from the Auth & Accounts plan
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS calendar_connected boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Ensure RLS policies cover the new columns (they usually do if it's broad SELECT/UPDATE)
-- But let's verify if we need to add specific ones. The current policies are:
-- "Anyone can view user profiles" USING (true)
-- "Users can update own profile" USING (auth.uid() = id)
-- Those cover it.
