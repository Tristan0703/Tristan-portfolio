"use client";

import { StrainProfile, getStrainProfile, getTypeColor } from "./strainData";
import { X } from "lucide-react";

interface StrainHoverCardProps {
  strainName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function StrainHoverCard({ strainName, isOpen, onClose }: StrainHoverCardProps) {
  const profile = getStrainProfile(strainName);

  if (!profile) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          
          <div 
            className="relative w-full max-w-lg bg-gradient-to-br from-zinc-900 via-zinc-800/95 to-zinc-900 border border-[rgba(197,160,89,0.3)] rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
            style={{
              boxShadow: '0 0 60px rgba(197, 160, 89, 0.15), 0 25px 50px rgba(0,0,0,0.5)'
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 pb-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="font-serif text-2xl md:text-3xl text-white tracking-wide">
                  {strainName}
                </h2>
                <span className={`px-3 py-1 text-xs font-medium tracking-wider uppercase rounded-full border ${getTypeColor(profile.type)}`}>
                  {profile.type}
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gold/80 mb-2">
                    Genetic Lineage
                  </h3>
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {profile.lineage}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gold/80 mb-2">
                    Dominant Terpenes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.terpenes.map((terpene, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 rounded-lg text-zinc-300"
                      >
                        {terpene}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gold/80 mb-2">
                    Effects
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.effects.map((effect, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 text-xs font-medium bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.2)] rounded-lg text-gold"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gold/80 mb-2">
                    Flavor Profile
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.flavor.map((flavor, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 text-xs font-medium bg-white/5 border border-white/10 rounded-lg text-zinc-400"
                      >
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-black/20 border-t border-white/5">
              <p className="text-xs text-zinc-500 text-center">
                Premium cannabis strain • Third-party tested
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
