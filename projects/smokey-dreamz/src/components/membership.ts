import { Member, memberFromRow, MemberRow } from "./members";

const MEMBERSHIP_KEY = "smokey_dreamz_member";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const SESSION_COOKIE_NAME = `sb-${encodeURIComponent(SUPABASE_URL)}-auth-token`;

export type { Member };
export { memberFromRow };
export type { MemberRow };

export function getMember(): Member | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(MEMBERSHIP_KEY);
  return stored ? JSON.parse(stored) : null;
}

function saveMember(member: Member): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(member));
}

function clearMember(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MEMBERSHIP_KEY);
}

export function generateMembershipId(): string {
  const year = new Date().getFullYear();
  const bytes = new Uint32Array(1);
  crypto.getRandomValues(bytes);
  const random = (bytes[0] % 9000 + 1000).toString();
  return `SD-${year}-${random}`;
}

export function isLoggedIn(): boolean {
  return getMember() !== null;
}

function storeSession(session: { access_token: string; refresh_token: string; expires_at?: number; user: any }): void {
  if (typeof window === 'undefined') return;
  const cookieValue = JSON.stringify(session);
  localStorage.setItem(SESSION_COOKIE_NAME, cookieValue);
  document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(cookieValue)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_COOKIE_NAME);
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0`;
}

export async function logout(): Promise<void> {
  const stored = localStorage.getItem(SESSION_COOKIE_NAME);
  if (stored) {
    try {
      const session = JSON.parse(stored);
      if (session?.access_token) {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': ANON_KEY,
            'Authorization': `Bearer ${session.access_token}`,
          },
        }).catch(() => {});
      }
    } catch {}
  }
  clearSession();
  clearMember();
}

export async function signUp(
  name: string,
  email: string,
  idNumber: string,
  contactNumber: string,
  password: string
): Promise<{ success: boolean; error?: string; member?: Member }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = (name || '').replace(/[^\p{L}\p{N}\s'\-.]/gu, '').trim();
  const cleanId = (idNumber || '').replace(/[^\d]/g, '');
  const cleanContact = (contactNumber || '').replace(/[^0-9+\-() ]/g, '');

  if (!cleanEmail.includes('@')) {
    return { success: false, error: 'Invalid email address' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' };
  }

  try {
    // Create auth user - trigger auto-creates member record
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        data: {
          name: cleanName,
          id_number: cleanId,
          contact_number: cleanContact,
        },
      }),
    });

    if (!authResponse.ok) {
      const authErr = await authResponse.json();
      const errMsg = authErr.msg || authErr.message || 'Failed to create account';
      if (errMsg.includes('already registered') || errMsg.includes('duplicate')) {
        return { success: false, error: 'Account already exists. Please sign in.' };
      }
      return { success: false, error: errMsg };
    }

    const authData = await authResponse.json();
    const userId = authData.user?.id || authData.id;
    if (!userId) {
      return { success: false, error: 'Account may already exist' };
    }

    // Small delay for trigger to create member record
    await new Promise((r) => setTimeout(r, 500));

    // Fetch the auto-created member record
    const memberResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
    });

    let member: Member = {
      id: userId,
      membershipId: generateMembershipId(),
      name: cleanName,
      email: cleanEmail,
      idNumber: cleanId,
      contactNumber: cleanContact,
      createdAt: new Date().toISOString(),
    };

    if (memberResponse.ok) {
      const memberData = await memberResponse.json();
      if (memberData?.[0]) {
        const m = memberData[0];
        member = {
          id: m.id,
          membershipId: m.membership_id,
          name: m.name,
          email: m.email,
          idNumber: m.id_number,
          contactNumber: m.contact_number,
          createdAt: m.created_at,
        };
      }
    }

    // Auto sign in to get session tokens
    const loginResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      if (loginData.access_token && loginData.user) {
        storeSession({
          access_token: loginData.access_token,
          refresh_token: loginData.refresh_token,
          expires_at: loginData.expires_at,
          user: loginData.user,
        });
      }
    }

    saveMember(member);
    return { success: true, member };

  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; member?: Member }> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': ANON_KEY },
      body: JSON.stringify({ email: cleanEmail, password }),
    });

    if (!authResponse.ok) {
      return { success: false, error: 'Invalid email or password' };
    }

    const authData = await authResponse.json();
    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Store session in BOTH localStorage and cookies so middleware can detect it
    storeSession({
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      expires_at: authData.expires_at,
      user: authData.user,
    });

    // Fetch member record
    const memberResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${authData.access_token}`,
      },
    });

    if (!memberResponse.ok) {
      return { success: false, error: 'Member record not found' };
    }

    const memberData = await memberResponse.json();
    if (!memberData || memberData.length === 0) {
      return { success: false, error: 'Member record not found' };
    }

    const m = memberData[0];
    const member: Member = {
      id: m.id,
      membershipId: m.membership_id,
      name: m.name,
      email: m.email,
      idNumber: m.id_number,
      contactNumber: m.contact_number,
      createdAt: m.created_at,
    };

    saveMember(member);
    return { success: true, member };

  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export function formatWhatsAppMessage(
  member: Member,
  items: { name: string; subcategory: string; strainType: string | null; thc: string }[]
): string {
  const itemsList = items
    .map(
      (item) =>
        `• ${item.name} (${item.subcategory})${
          item.strainType ? ` - ${item.strainType}` : ""
        } - THC: ${item.thc}`
    )
    .join("\n");

  return `Hi Smokey Dreamz! This is ${member.name} (Member: ${member.membershipId}). I'd like a quote for:

${itemsList}

Total Items: ${items.length}`;
}
