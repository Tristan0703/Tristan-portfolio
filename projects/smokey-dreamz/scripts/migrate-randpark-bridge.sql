-- =====================================================
-- Smokey Dreamz - Randpark Bridge Schema Migration
-- Run this in Supabase SQL Editor before deploying scripts
-- =====================================================

-- 1. Add inventory tracking columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS branch_id TEXT DEFAULT 'randpark';
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2),
    total_amount NUMERIC(10,2),
    branch_id TEXT DEFAULT 'randpark',
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    membership_id TEXT,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'aronium',
    receipt_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create inventory_log table for tracking stock changes
CREATE TABLE IF NOT EXISTS inventory_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    previous_quantity INTEGER,
    new_quantity INTEGER,
    change_reason TEXT DEFAULT 'sync',
    branch_id TEXT DEFAULT 'randpark',
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    membership_id TEXT,
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'aronium',
    receipt_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_branch_date ON sales(branch_id, sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_product ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_receipt ON sales(receipt_id);
CREATE INDEX IF NOT EXISTS idx_inventory_log_product ON inventory_log(product_id);
CREATE INDEX IF NOT EXISTS idx_products_branch ON products(branch_id);

-- 5. RLS Policies for sales table
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Service role can insert/update sales (upsert from Python script)
CREATE POLICY "sales_insert_service" ON sales
    FOR INSERT WITH CHECK (true);

CREATE POLICY "sales_update_service" ON sales
    FOR UPDATE USING (true);

-- Service role can read sales
CREATE POLICY "sales_select_service" ON sales
    FOR SELECT USING (true);

-- Public can read sales (for admin dashboard via anon key)
CREATE POLICY "sales_select_public" ON sales
    FOR SELECT USING (true);

-- 6. RLS Policies for inventory_log
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_log_insert_service" ON inventory_log
    FOR INSERT WITH CHECK (true);

CREATE POLICY "inventory_log_select_service" ON inventory_log
    FOR SELECT USING (true);

CREATE POLICY "inventory_log_select_public" ON inventory_log
    FOR SELECT USING (true);

-- 7. Update products policies to include stock management
CREATE POLICY "products_update_service" ON products
    FOR UPDATE USING (true) WITH CHECK (true);

-- 8. Create a function for upserting sales (prevents duplicates by receipt_id + product)
CREATE OR REPLACE FUNCTION upsert_sale(
    p_product_id UUID,
    p_product_name TEXT,
    p_product_category TEXT,
    p_quantity INTEGER,
    p_unit_price NUMERIC,
    p_total_amount NUMERIC,
    p_branch_id TEXT,
    p_member_id UUID DEFAULT NULL,
    p_membership_id TEXT DEFAULT NULL,
    p_receipt_id TEXT,
    p_sale_date TIMESTAMP WITH TIME ZONE
) RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
BEGIN
    SELECT id INTO v_sale_id FROM sales
    WHERE receipt_id = p_receipt_id AND product_id = p_product_id AND branch_id = p_branch_id
    LIMIT 1;

    IF v_sale_id IS NOT NULL THEN
        UPDATE sales SET
            quantity = p_quantity,
            unit_price = p_unit_price,
            total_amount = p_total_amount,
            member_id = p_member_id,
            membership_id = p_membership_id,
            sale_date = p_sale_date,
            created_at = NOW()
        WHERE id = v_sale_id;
        RETURN v_sale_id;
    ELSE
        INSERT INTO sales (
            product_id, product_name, product_category, quantity,
            unit_price, total_amount, branch_id, member_id, membership_id,
            receipt_id, sale_date
        ) VALUES (
            p_product_id, p_product_name, p_product_category, p_quantity,
            p_unit_price, p_total_amount, p_branch_id, p_member_id, p_membership_id,
            p_receipt_id, p_sale_date
        ) RETURNING id INTO v_sale_id;
        RETURN v_sale_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create a function to sync inventory from Aronium
CREATE OR REPLACE FUNCTION sync_product_availability(
    p_product_name TEXT,
    p_quantity INTEGER,
    p_branch_id TEXT DEFAULT 'randpark'
) RETURNS VOID AS $$
DECLARE
    v_product_id UUID;
    v_prev_quantity INTEGER;
BEGIN
    -- Find product by name and branch
    SELECT id, stock_quantity INTO v_product_id, v_prev_quantity
    FROM products
    WHERE name ILIKE p_product_name AND branch_id = p_branch_id
    LIMIT 1;

    IF v_product_id IS NOT NULL THEN
        -- Update stock and availability
        UPDATE products SET
            stock_quantity = p_quantity,
            is_available = CASE WHEN p_quantity > 0 THEN true ELSE false END,
            updated_at = NOW()
        WHERE id = v_product_id;

        -- Log the change
        INSERT INTO inventory_log (product_id, product_name, previous_quantity, new_quantity, branch_id)
        VALUES (v_product_id, p_product_name, v_prev_quantity, p_quantity, p_branch_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Migration complete
-- =====================================================
