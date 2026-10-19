"use client";

import Link from "next/link";
import { MapPin, Clock, Star } from "lucide-react";
import { Branch } from "./branchData";

interface BranchCardProps {
  branch: Branch;
}

export default function BranchCard({ branch }: BranchCardProps) {
  return (
    <Link href={`/locations/${branch.id === 'randpark' ? 'randpark-ridge' : branch.id}`}>
      <div className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl">
        <div className={`absolute inset-0 bg-gradient-to-br ${branch.theme?.gradient} backdrop-blur-sm`} />
        
        <div className={`absolute inset-0 bg-gradient-to-br ${branch.theme?.primary}/10 via-transparent`} />

        <div className={`absolute inset-0 shadow-inner ${branch.theme?.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase"
                style={{ backgroundColor: `${branch.theme?.primary}20`, color: branch.theme?.accent }}
              >
                {branch.subtitle}
              </span>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm">4.5</span>
              </div>
            </div>

            <h3 className="font-serif text-3xl text-white mb-2">
              Smokey Dreamz
            </h3>
            <h4 className="text-xl text-zinc-300 mb-4">
              {branch.name}
            </h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-zinc-400">
              <MapPin className="w-4 h-4" style={{ color: branch.theme?.accent }} />
              <span className="text-sm">{branch.address}</span>
            </div>
            <div className="flex items-center gap-3 text-zinc-400">
              <Clock className="w-4 h-4" style={{ color: branch.theme?.accent }} />
              <span className="text-sm">{branch.hours.weekdays}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: branch.theme?.accent }}>
            <span>Explore Location</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>

        <div 
          className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-all duration-500"
          style={{ backgroundColor: branch.theme?.accent }}
        />
      </div>
    </Link>
  );
}
