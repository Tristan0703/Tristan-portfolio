"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getMember } from "@/components/membership";
import { Search, User, Calendar, CheckCircle, XCircle, Clock, MapPin, Lock } from "lucide-react";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

interface MemberData {
  id: string;
  membership_id: string;
  name: string;
  is_admin: boolean;
  created_at: string;
}

export default function StaffSearch({ embedded }: { embedded?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [lastVisit, setLastVisit] = useState<string | null>(null);
  const [recordingVisit, setRecordingVisit] = useState(false);
  const [visitRecorded, setVisitRecorded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const currentMember = getMember();
      if (!currentMember) {
        router.push("/welcome");
        return;
      }

      try {
        const sessionKey = `sb-${encodeURIComponent(SUPABASE_URL)}-auth-token`;
        const stored = localStorage.getItem(sessionKey);
        const token = stored ? JSON.parse(stored).access_token : null;

        const response = await fetch(`${SUPABASE_URL}/rest/v1/members?id=eq.${currentMember.id}&select=is_admin`, {
          headers: {
            apikey: ANON_KEY,
            Authorization: token ? `Bearer ${token}` : `Bearer ${ANON_KEY}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data?.[0]?.is_admin || false);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }

      setChecking(false);
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchMember(query);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const recordVisit = async (memberId: string, branchId: string = "staff") => {
    setRecordingVisit(true);

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          member_id: memberId,
          branch_id: branchId,
        }),
      });

      if (response.ok || response.status === 201) {
        setLastVisit(new Date().toISOString());
        setVisitRecorded(true);
        setTimeout(() => setVisitRecorded(false), 3000);
      }
    } catch {
    }

    setRecordingVisit(false);
  };

  const searchMember = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setMember(null);
      setError(null);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    const searchTerm = searchQuery.trim().toUpperCase();

    let result;

    // Try edge function first
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membership_id: searchTerm }),
      });

      result = await response.json();
    } catch {
      result = null;
    }

    // Fallback to direct REST API if edge function fails
    if (!result?.valid) {
      try {
        // Try exact match first
        let response = await fetch(
          `${SUPABASE_URL}/rest/v1/members?membership_id=eq.${searchTerm}&select=id,membership_id,name,is_admin,created_at`,
          { headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` } }
        );

        let data = response.ok ? await response.json() : [];

        // If no exact match and term is numeric or short, try suffix match (last 4 digits)
        if (!data || data.length === 0) {
          response = await fetch(
            `${SUPABASE_URL}/rest/v1/members?membership_id=ilike.%25${searchTerm}&select=id,membership_id,name,is_admin,created_at&limit=1`,
            { headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` } }
          );
          data = response.ok ? await response.json() : [];
        }

        if (data && data.length > 0) {
          const m = data[0];
          result = {
            valid: true,
            member: {
              id: m.id,
              membership_id: m.membership_id,
              name: m.name,
              member_since: m.created_at,
            },
          };
        }
      } catch {
      }
    }

    if (!result?.valid) {
      setMember(null);
      setError(result?.error || "Member not found");
      setLastVisit(null);
    } else {
      setMember({
        id: result.member.id,
        membership_id: result.member.membership_id,
        name: result.member.name,
        is_admin: false,
        created_at: result.member.member_since,
      });
      setError(null);

      try {
        const visitResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/visits?member_id=eq.${result.member.id}&order=created_at.desc&limit=1`,
          { headers: { 'apikey': ANON_KEY } }
        );

        if (visitResponse.ok) {
          const visitData = await visitResponse.json();
          if (visitData && visitData.length > 0) {
            setLastVisit(visitData[0].created_at);
          } else {
            setLastVisit(null);
          }
        } else {
          setLastVisit(null);
        }
      } catch {
        setLastVisit(null);
      }
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchMember(query);
    }
  };

  if (!embedded) {
    if (checking) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="text-center">
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-red-400 font-serif text-xl mb-2">Access Denied</h1>
            <p className="text-zinc-500">Admin access required for this page.</p>
          </div>
        </div>
      );
    }
  }

  const outerClass = embedded ? "p-4" : "min-h-screen bg-black p-4 sm:p-6";

  return (
    <div className={outerClass}>
      <div className={embedded ? "" : "max-w-lg mx-auto"}>
        <div className="mb-6">
          <h1 className="font-serif text-2xl text-white mb-2">Member Verification</h1>
          <p className="text-zinc-500 text-sm">Scan or enter membership ID</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter membership ID (e.g., SD-2026-0001)"
            className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-lg tracking-wider placeholder-zinc-600 focus:border-gold focus:outline-none"
            autoFocus
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-red-400 font-serif text-lg mb-1">Member Not Found</h3>
            <p className="text-zinc-500 text-sm">No member matches "{query}"</p>
          </div>
        )}

        {member && (
          <div className="space-y-4">
            <div className="bg-green-950/20 border border-green-900/50 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h3 className="text-green-400 font-serif text-xl">Verified Member</h3>
                  <p className="text-zinc-500 text-sm">Valid Smokey Dreamz Membership</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <User className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Member Name</p>
                    <p className="text-white">{member.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center text-gold font-bold text-sm">#</div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Membership ID</p>
                    <p className="text-gold font-medium">{member.membership_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Member Since</p>
                    <p className="text-white">
                      {new Date(member.created_at).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {lastVisit && (
                  <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                    <Clock className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Last Visit</p>
                      <p className="text-white">
                        {new Date(lastVisit).toLocaleDateString("en-ZA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })} at{" "}
                        {new Date(lastVisit).toLocaleTimeString("en-ZA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {!lastVisit && (
                  <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                    <MapPin className="w-5 h-5 text-zinc-600" />
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Last Visit</p>
                      <p className="text-zinc-600">First time visiting</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                setQuery("");
                setMember(null);
                setSearched(false);
                setVisitRecorded(false);
                inputRef.current?.focus();
              }}
              className="w-full py-3 bg-zinc-800 text-white font-medium rounded-xl hover:bg-zinc-700 transition-all"
            >
              Scan Next Member
            </button>

            <button
              onClick={() => member && recordVisit(member.id)}
              disabled={recordingVisit || visitRecorded}
              className={`w-full py-3 font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
                visitRecorded
                  ? "bg-green-600 text-white"
                  : recordingVisit
                  ? "bg-green-600/50 text-white cursor-wait"
                  : "bg-green-700 hover:bg-green-600 text-white"
              }`}
            >
              {visitRecorded ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Visit Recorded
                </>
              ) : recordingVisit ? (
                "Recording..."
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Record Visit
                </>
              )}
            </button>
          </div>
        )}

        {!member && !error && !loading && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-600">Enter a membership ID to search</p>
          </div>
        )}
      </div>
    </div>
  );
}
