"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, BarChart3, Users } from "lucide-react";
import ExecutiveDashboard from "@/components/ExecutiveDashboard";
import MembersPanel from "@/components/MembersPanel";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://igfnlqmevjanfpcxxanh.supabase.co";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_vMWqJ9fEmL5qMKyvkipFww_0YKhLmNm";

interface AdminUser {
  email: string;
  name?: string;
}

function AuthSkeleton() {
  return (
    <div className="min-h-screen bg-black">
      <div className="animate-pulse">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-48 h-6 bg-zinc-800 rounded" />
            <div className="w-32 h-4 bg-zinc-800/50 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="w-24 h-9 bg-zinc-800 rounded-lg" />
            <div className="w-24 h-9 bg-zinc-800 rounded-lg" />
          </div>
        </div>
        <div className="px-6 py-3 border-b border-white/5">
          <div className="flex gap-1">
            {[1, 2].map((i) => (
              <div key={i} className="w-36 h-9 bg-zinc-800 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-zinc-800/50 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onLogin }: { onLogin: (user: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = (email.trim() || "").replace(/[^a-zA-Z0-9@._-]/g, "");
    const cleanPassword = password;

    try {
      const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ANON_KEY },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      if (!authResponse.ok) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const authData = await authResponse.json();
      const userId = authData.user?.id;
      if (!userId) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const session = {
        access_token: authData.access_token,
        refresh_token: authData.refresh_token,
        expires_at: authData.expires_at,
        user: authData.user,
      };
      const sessionKey = `sb-${encodeURIComponent(SUPABASE_URL)}-auth-token`;
      const cookieValue = JSON.stringify(session);
      localStorage.setItem(sessionKey, cookieValue);
      document.cookie = `${sessionKey}=${encodeURIComponent(cookieValue)}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

      const memberResponse = await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${userId}&select=is_admin,name,email`, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${authData.access_token}` },
      });

      if (!memberResponse.ok) {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      const memberData = await memberResponse.json();
      if (!memberData?.[0]?.is_admin) {
        setError("Access denied. Admin privileges required.");
        setLoading(false);
        return;
      }

      onLogin({ email: memberData[0].email, name: memberData[0].name });
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h1 className="font-serif text-3xl text-white mb-2">Staff Portal</h1>
          <p className="text-zinc-500">Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-950/30 border border-red-900/50 rounded-xl text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:border-gold focus:outline-none"
              placeholder="admin@smokeydreamz.co.za"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 focus:border-gold focus:outline-none pr-12"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gold hover:bg-gold-light text-black font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/welcome" className="text-zinc-500 hover:text-gold text-sm">
            {"\u2190"} Back to main site
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"loading" | "login" | "authenticated">("loading");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [view, setView] = useState<"dashboard" | "members">("dashboard");

  useEffect(() => {
    const checkAuth = async () => {
      const sessionKey = `sb-${encodeURIComponent(SUPABASE_URL)}-auth-token`;
      const stored = localStorage.getItem(sessionKey);
      if (!stored) {
        setAuthState("login");
        return;
      }
      try {
        const session = JSON.parse(stored);
        if (!session?.user?.id) {
          setAuthState("login");
          return;
        }
        const memberResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/members?id=eq.${session.user.id}&select=is_admin,name,email`,
          { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }
        );
        if (memberResponse.ok) {
          const data = await memberResponse.json();
          if (data?.[0]?.is_admin) {
            setUser({ email: data[0].email, name: data[0].name });
            setAuthState("authenticated");
            return;
          }
        }
      } catch {}
      setAuthState("login");
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (loggedInUser: AdminUser) => {
    setUser(loggedInUser);
    setAuthState("authenticated");
  };

  const handleLogout = () => {
    localStorage.removeItem(`sb-${encodeURIComponent(SUPABASE_URL)}-auth-token`);
    setUser(null);
    setAuthState("login");
  };

  if (authState === "loading") return <AuthSkeleton />;
  if (authState === "login") return <LoginForm onLogin={handleLoginSuccess} />;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-gold">Admin Control Room</h1>
          <p className="text-zinc-500 text-sm">{user?.name || user?.email} \u2014 Admin</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/staff/verify")}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-sm transition-all"
          >
            Staff Verify
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-950/50 hover:bg-red-950/80 border border-red-900/50 rounded-lg text-sm text-red-400 transition-all"
          >
            Logout
          </button>
        </div>
      </header>

      <nav className="px-6 py-3 border-b border-white/5 flex gap-2">
        <button
          onClick={() => setView("dashboard")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            view === "dashboard"
              ? "bg-gold text-black shadow-lg shadow-gold/20"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Executive Dashboard
        </button>
        <button
          onClick={() => setView("members")}
          className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
            view === "members"
              ? "bg-gold text-black shadow-lg shadow-gold/20"
              : "bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Member Search
        </button>
      </nav>

      <main className="p-6">
        <div className={view !== "dashboard" ? "hidden" : ""}>
          <ExecutiveDashboard />
        </div>
        <div className={view !== "members" ? "hidden" : ""}>
          <MembersPanel />
        </div>
      </main>
    </div>
  );
}
