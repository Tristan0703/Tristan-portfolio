-- BOUTIQUE FLOWER
INSERT INTO products (name, category, description, is_available, created_at) VALUES
('Gorilla Glue', 'Boutique', '1g - R100', true, NOW()),
('Blockberry', 'Boutique', '1g - R100', true, NOW()),
('Babba B', 'Boutique', '2g - R120', true, NOW()),
('Palm Kush', 'Boutique', '2g - R120', true, NOW()),
('Triple Cheese', 'Boutique', '2g - R120', true, NOW())
ON CONFLICT DO NOTHING;

-- PREMIUM FLOWER
INSERT INTO products (name, category, description, is_available, created_at) VALUES
('Jungle Diamonds', 'Premium', '1g - R150', true, NOW()),
('Ricky Bobby', 'Premium', '1g - R150', true, NOW()),
('Zephyr', 'Premium', '1g - R150', true, NOW()),
('King Fruit', 'Premium', '1g - R150', true, NOW()),
('Mac Stomper', 'Premium', '1g - R150', true, NOW()),
('WW2', 'Premium', '5g - R200', true, NOW()),
('D. Dog', 'Premium', '5g - R200', true, NOW()),
('Granny Smith', 'Premium', '5g - R200', true, NOW()),
('Triple X', 'Premium', '5g - R200', true, NOW()),
('Sour D', 'Premium', '5g - R200', true, NOW())
ON CONFLICT DO NOTHING;

-- PREMIUM PREROLLS
INSERT INTO products (name, category, description, is_available, created_at) VALUES
('Plat Kush Preroll', 'Premium', 'Preroll - 60/80', true, NOW()),
('Nag Champa Preroll', 'Premium', 'Preroll - 60/80', true, NOW()),
('Slurry Cane Preroll', 'Premium', 'Preroll - 60/80', true, NOW())
ON CONFLICT DO NOTHING;

-- SD PREROLLS (Boutique)
INSERT INTO products (name, category, description, is_available, created_at) VALUES
('Stanky Cheese Preroll', 'Boutique', 'SD Preroll', true, NOW()),
('Fanta Sea Preroll', 'Boutique', 'SD Preroll', true, NOW()),
('Permanent Marker Preroll', 'Boutique', 'SD Preroll', true, NOW()),
('Blockberry Preroll', 'Boutique', 'SD Preroll', true, NOW()),
('Sour D Preroll', 'Boutique', 'SD Preroll', true, NOW()),
('Pau Hana Preroll', 'Boutique', 'SD Preroll', true, NOW()),
('Zoap Preroll', 'Boutique', 'SD Preroll', true, NOW()),
('Coffee Breath Preroll', 'Boutique', 'SD Preroll', true, NOW()),
('Master Trainwreck Preroll', 'Boutique', 'SD Preroll', true, NOW()),
('Tart Pops Preroll', 'Boutique', 'SD Preroll', true, NOW())
ON CONFLICT DO NOTHING;

-- EDIBLES - BEVERAGES
INSERT INTO products (name, category, description, is_available, created_at) VALUES
('Mango Juice 330ml', 'Edibles', 'Beverage', true, NOW()),
('Mango Shots 50ml', 'Edibles', 'Beverage', true, NOW()),
('Sobolo', 'Edibles', 'Beverage', true, NOW())
ON CONFLICT DO NOTHING;

-- EDIBLES - GUMMIES
INSERT INTO products (name, category, description, is_available, created_at) VALUES
('Mini Bears (Sativa)', 'Edibles', 'Gummy - Sativa', true, NOW()),
('Donuts (Indica)', 'Edibles', 'Infused - Indica', true, NOW()),
('Bones (Sativa)', 'Edibles', 'Infused - Sativa', true, NOW()),
('Bones (Indica)', 'Edibles', 'Infused - Indica', true, NOW()),
('Skulls (Sativa)', 'Edibles', 'Infused - Sativa', true, NOW()),
('Skulls (Indica)', 'Edibles', 'Infused - Indica', true, NOW()),
('Jelly Tots (Sativa)', 'Edibles', 'Gummy - Sativa', true, NOW()),
('Jelly Tots (Indica)', 'Edibles', 'Gummy - Indica', true, NOW())
ON CONFLICT DO NOTHING;

-- EDIBLES - LOLLIPOPS
INSERT INTO products (name, category, description, is_available, created_at) VALUES
('Lollipop 10mg', 'Edibles', '10mg THC', true, NOW()),
('Lollipop 25mg', 'Edibles', '25mg THC', true, NOW()),
('Lollipop 50mg', 'Edibles', '50mg THC', true, NOW()),
('Lollipop 100mg', 'Edibles', '100mg THC', true, NOW())
ON CONFLICT DO NOTHING;

-- EDIBLES - CHOCOLATES & TREATS
INSERT INTO products (name, category, description, is_available, created_at) VALUES
('Snickers (Indica)', 'Edibles', 'Infused chocolate bar - Indica', true, NOW()),
('Snickers (Sativa)', 'Edibles', 'Infused chocolate bar - Sativa', true, NOW()),
('Brownie (Indica)', 'Edibles', 'Infused brownie - Indica', true, NOW()),
('Peanut Butter Cups (Indica)', 'Edibles', 'Infused candy - Indica', true, NOW()),
('Peanut Butter Cups (Sativa)', 'Edibles', 'Infused candy - Sativa', true, NOW()),
('Rolo (Indica)', 'Edibles', 'Infused candy - Indica', true, NOW()),
('Rolo (Sativa)', 'Edibles', 'Infused candy - Sativa', true, NOW()),
('Marshmallow', 'Edibles', 'Infused marshmallow', true, NOW()),
('Cookies', 'Edibles', 'Infused cookies', true, NOW())
ON CONFLICT DO NOTHING;
