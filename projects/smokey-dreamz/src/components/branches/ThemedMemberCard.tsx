"use client";

import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { getMember, Member } from "@/components/membership";
import { BranchTheme, Branch } from "./branchData";

interface ThemedMemberCardProps {
  branch: Branch;
}

export default function ThemedMemberCard({ branch }: ThemedMemberCardProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMember(getMember());
  }, []);

  if (!mounted || !member) return null;

  return (
    <div 
      className="relative bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 backdrop-blur-md border rounded-2xl p-6 overflow-hidden"
      style={{ borderColor: `${branch.theme?.primary}40` }}
    >
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: branch.theme?.primary, transform: 'translate(30%, -30%)' }}
      />

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Smokey Dreamz" 
            className="h-8 w-auto object-contain"
          />
        </div>
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase"
          style={{ backgroundColor: `${branch.theme?.primary}30`, color: branch.theme?.accent }}
        >
          {branch.name}
        </span>
      </div>

      <div className="mb-4">
        <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">Member ID</p>
        <p 
          className="font-serif text-2xl tracking-wider"
          style={{ color: branch.theme?.accent }}
        >
          {member.membershipId}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">Member</p>
          <p className="text-white text-sm">{member.name}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">Location</p>
          <p className="text-white text-sm">{branch.subtitle}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-zinc-600 text-xs">
          <CreditCard className="w-4 h-4" />
          <span>2026</span>
        </div>
        <p className="text-zinc-600 text-xs">Present at visit</p>
      </div>

      <div 
        className="absolute bottom-0 left-0 right-0 h-1"
        style={{ backgroundColor: branch.theme?.primary }}
      />
    </div>
  );
}
