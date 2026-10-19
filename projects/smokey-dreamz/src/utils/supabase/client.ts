import { createBrowserClient } from "@supabase/ssr";
import { requireSupabaseEnv } from "./env";

const { url, key } = requireSupabaseEnv();

export const createClient = () =>
  createBrowserClient(url, key);
