-- =====================================================
-- Smokey Dreamz - Product Cleanup & Category Fix
-- Run AFTER the bridge migration SQL
-- =====================================================

-- 1. Fix product categories
-- Prerolls should be Boutique
UPDATE products SET category = 'Boutique' WHERE name LIKE '%Preroll%';

-- Concentrates/tubes should be Boutique (not Edibles)
UPDATE products SET category = 'Boutique'
WHERE name IN ('La Cron', 'Pau Hana', 'Zoap', 'Tart Pops', 'Master Trainwreck', 'Coffee Breath', 'Quantum Berry')
AND category = 'Edibles';

-- 2. Remove duplicate products (keep the one with most recent created_at)
DELETE FROM products
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY name, category ORDER BY created_at DESC) as rn
        FROM products
    ) dup
    WHERE dup.rn > 1
);

-- 3. Remove cross-category duplicates
-- Keep Premium versions of shared names; delete Boutique copies
DELETE FROM products WHERE name = 'Gorilla Glue' AND category = 'Boutique';
DELETE FROM products WHERE name = 'Granny Smith' AND category = 'Boutique';
DELETE FROM products WHERE name = 'Triple X' AND category = 'Boutique';

-- 4. Verify clean - should return empty
SELECT name, category, COUNT(*) as cnt 
FROM products 
GROUP BY name, category 
HAVING COUNT(*) > 1;

-- 5. Show final counts
SELECT category, COUNT(*) as total FROM products GROUP BY category;
