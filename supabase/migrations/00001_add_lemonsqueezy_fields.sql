-- Migration: Add Lemon Squeezy subscription fields to users table
-- Date: 2026-03-11
-- Description: Adds subscription_status and subscription_id columns for Lemon Squeezy integration

-- Add subscription tracking columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id text DEFAULT NULL;

-- Optional: Remove Stripe-specific column (keep for now as reference)
-- ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id;

-- Create index for efficient webhook lookups by subscription_id
CREATE INDEX IF NOT EXISTS idx_users_subscription_id ON users(subscription_id) WHERE subscription_id IS NOT NULL;
