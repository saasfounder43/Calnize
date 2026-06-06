-- Drop duplicate / unused columns
alter table users drop column if exists plan;
alter table users drop column if exists username;

-- Ensure correct defaults
alter table users alter column onboarding_completed set default false;
alter table users alter column plan_type set default 'free';

-- Reset your test account (replace with your actual email)
-- update users set onboarding_completed = false, user_type = null where email = 'your@email.com';
