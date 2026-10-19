-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Allow signup inserts" ON members;
DROP POLICY IF EXISTS "Allow signup inserts auth" ON members;
DROP POLICY IF EXISTS "Allow read for auth" ON members;
DROP POLICY IF EXISTS "Allow read for anon" ON members;
DROP POLICY IF EXISTS "Allow update own" ON members;
DROP POLICY IF EXISTS "members_insert_public" ON members;
DROP POLICY IF EXISTS "members_select_public" ON members;
DROP POLICY IF EXISTS "members_update_own" ON members;

-- Enable RLS on members table
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- POLICY 1: Allow ANYONE to insert (needed during signup before auth session is established)
CREATE POLICY "members_insert_anyone" ON members
  FOR INSERT
  TO public
  WITH CHECK (true);

-- POLICY 2: Allow ANYONE to read member records
CREATE POLICY "members_select_anyone" ON members
  FOR SELECT
  TO public
  USING (true);

-- POLICY 3: Allow users to update ONLY their own record
CREATE POLICY "members_update_own" ON members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- POLICY 4: Allow authenticated users to delete their own record
CREATE POLICY "members_delete_own" ON members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);
