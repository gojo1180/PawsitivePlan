-- TAMAGOTCHI PET SYSTEM SCHEMA UPDATE
-- Execute this script in your Supabase SQL Editor.

-- 1. Add survival columns to the pets table
ALTER TABLE pets 
  ADD COLUMN IF NOT EXISTS health INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS hunger INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS thirst INTEGER DEFAULT 100,
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS is_dead BOOLEAN DEFAULT FALSE;

-- 2. Seed default Food and Water into the shop_items table
-- The type will be "consumable" or "food" / "water"
INSERT INTO shop_items (id, name, type, price, image_url)
VALUES 
  (gen_random_uuid(), 'Ikan Segar (Cat Food)', 'food', 15, '/asset/makanan/ikan.png'),
  (gen_random_uuid(), 'Susu Peliharaan', 'water', 10, '/asset/makanan/susu.png')
ON CONFLICT DO NOTHING;

-- Verification query (Optional)
-- SELECT * FROM pets LIMIT 1;
