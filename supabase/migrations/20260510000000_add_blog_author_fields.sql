-- Add author fields to blog_posts
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Calnize Team',
ADD COLUMN IF NOT EXISTS author_photo_url TEXT,
ADD COLUMN IF NOT EXISTS reading_time_minutes INTEGER DEFAULT 5;

-- Create index on author_name for filtering if needed
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_name ON blog_posts(author_name);
