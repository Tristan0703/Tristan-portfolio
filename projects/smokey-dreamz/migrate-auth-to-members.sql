-- ============================================
-- PART 1: Fix RLS Policies
-- ============================================
DROP POLICY IF EXISTS "Allow signup inserts" ON members;
DROP POLICY IF EXISTS "Allow signup inserts auth" ON members;
DROP POLICY IF EXISTS "Allow read for auth" ON members;
DROP POLICY IF EXISTS "Allow read for anon" ON members;
DROP POLICY IF EXISTS "Allow update own" ON members;
DROP POLICY IF EXISTS "members_insert_public" ON members;
DROP POLICY IF EXISTS "members_select_public" ON members;
DROP POLICY IF EXISTS "members_update_own" ON members;

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_insert_anyone" ON members
  FOR INSERT WITH CHECK (true);

CREATE POLICY "members_select_anyone" ON members
  FOR SELECT USING (true);

CREATE POLICY "members_update_own" ON members
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "members_delete_own" ON members
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- PART 2: Create Trigger for Future Signups
-- ============================================
CREATE OR REPLACE FUNCTION public.create_member_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.members (id, email, membership_id, name, id_number, contact_number)
  VALUES (
    NEW.id,
    NEW.email,
    'SD-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
    COALESCE(NEW.raw_user_meta_data->>'name', 'New Member'),
    COALESCE(NEW.raw_user_meta_data->>'id_number', ''),
    COALESCE(NEW.raw_user_meta_data->>'contact_number', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_member_on_signup();

-- ============================================
-- PART 3: Migrate Existing auth.users to members
-- Only inserts users who don't already have a member record
-- ============================================
INSERT INTO public.members (id, email, membership_id, name, id_number, contact_number)
SELECT
  au.id,
  au.email,
  'SD-' || EXTRACT(YEAR FROM au.created_at) || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0'),
  COALESCE(au.raw_user_meta_data->>'name', ''),
  COALESCE(au.raw_user_meta_data->>'id_number', ''),
  COALESCE(au.raw_user_meta_data->>'contact_number', '')
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.members);
