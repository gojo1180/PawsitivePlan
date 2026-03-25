-- COSMETIC SHOP ITEMS SCHEMA UPDATE V3
-- Execute this script in your Supabase SQL Editor.

-- 1. Add description and sprite_folder columns to shop_items
ALTER TABLE shop_items
  ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sprite_folder TEXT DEFAULT NULL;

-- 2. Seed the 3 new cosmetic items
INSERT INTO shop_items (id, name, type, price, image_url, description, sprite_folder)
VALUES
  (gen_random_uuid(), 'Mahkota Emas', 'head', 150, '/asset/kosmetik/CROWN/IDLE/CROWN1.png', 'Mahkota emas mewah untuk peliharaanmu! Tampil bak raja.', 'CROWN'),
  (gen_random_uuid(), 'Kacamata Keren', 'face', 100, '/asset/kosmetik/GLASSES/IDLE/GLASSES1.png', 'Kacamata stylish yang bikin peliharaanmu makin kece!', 'GLASSES'),
  (gen_random_uuid(), 'Topi Bajak Laut', 'head', 200, '/asset/kosmetik/PIRRATEHAT/IDLE/PIRRATEHAT1.png', 'Topi bajak laut legendaris. Arrrr!', 'PIRRATEHAT')
ON CONFLICT DO NOTHING;

-- 3. Verify
-- SELECT id, name, type, price, sprite_folder FROM shop_items;
