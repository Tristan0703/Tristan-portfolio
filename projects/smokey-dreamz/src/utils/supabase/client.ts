import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://igfnlqmevjanfpcxxanh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_vMWqJ9fEmL5qMKyvkipFww_0YKhLmNm';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );