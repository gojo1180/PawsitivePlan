-- TAMAGOTCHI PET SYSTEM SCHEMA UPDATE V2
-- Execute this script in your Supabase SQL Editor.

-- 1. Add tags and last_completed_at columns to tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS last_completed_at TIMESTAMP WITH TIME ZONE NULL;

-- 2. Verify modifications
-- SELECT id, title, tags, last_completed_at FROM tasks LIMIT 5;
