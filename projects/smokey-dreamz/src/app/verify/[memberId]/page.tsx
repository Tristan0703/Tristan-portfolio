"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle, XCircle, User, Calendar, Shield } from "lucide-react";

interface MemberData {
  id: string;
  membership_id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function VerifyPage() {
  const params = useParams();
  const memberId = params.memberId as string;
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("members")
        .select("id, membership_id, name, email, created_at")
        .eq("id", memberId)
        .single();

      if (error) {
        setError("Member not found");
      } else {
        setMember(data as MemberData);
      }
      setLoading(false);
    };

    if (memberId) {
      fetchMember();
    }
  }, [memberId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Verifying...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-red-950/30 border border-red-900/50 rounded-2xl p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="font-serif text-2xl text-red-400 mb-2">Invalid Member</h1>
            <p className="text-zinc-500">This membership could not be verified.</p>
          </div>
        </div>
      </div>
    );
  }

  const memberSince = new Date(member.created_at);
  const year = memberSince.getFullYear();
  const month = memberSince.toLocaleDateString("en-US", { month: "long" });
  const day = memberSince.getDate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="bg-zinc-900/50 border border-green-900/50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="font-serif text-3xl text-green-400 mb-2">VERIFIED</h1>
            <p className="text-zinc-500">Valid Smokey Dreamz Member</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl">
              <Shield className="w-5 h-5 text-gold" />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Membership ID</p>
                <p className="text-white font-medium">{member.membership_id}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl">
              <User className="w-5 h-5 text-gold" />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Member Name</p>
                <p className="text-white font-medium">{member.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-black/30 rounded-xl">
              <Calendar className="w-5 h-5 text-gold" />
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Member Since</p>
                <p className="text-white font-medium">{month} {day}, {year}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-zinc-600 text-xs">
              Smokey Dreamz • Johannesburg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}