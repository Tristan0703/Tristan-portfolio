"use client";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

let supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

export const supabaseClient = getSupabase();

export type UserRole = "standard" | "designer" | "vip";

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string | null;
  company: string | null;
  phone: string | null;
  created_at: string;
}

export const canAccessVault = (role: UserRole): boolean => {
  return role === "designer" || role === "vip";
};

export const getVaultBenefits = () => [
  "Exclusive access to limited edition fabrics",
  "Private viewings of new collections",
  "Dedicated concierge consultation",
  "Priority allocation on high-demand items",
  "Invitations to exclusive atelier events",
];

export async function getProfile(userId: string): Promise<Profile | null> {
  const client = getSupabase();
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) return null;
  return data as Profile;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | null> {
  const client = getSupabase();
  const { data, error } = await client
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  
  if (error) return null;
  return data as Profile;
}

export async function signUp(email: string, password: string, fullName?: string) {
  const client = getSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const client = getSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = getSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const client = getSupabase();
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/reset-password`,
  });

  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const client = getSupabase();
  const { error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}