"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Clock, ArrowRight, ExternalLink, Navigation } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { branches, getTodayHours } from "@/components/branches/branchData";
import Link from "next/link";

export default function LocationsPage() {
  const [isVerified, setIsVerified] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const verified = document.cookie.includes("age-verified=true");
    setIsVerified(verified);
    
    if (!verified) {
      router.push("/welcome");
    }
  }, [router]);

  if (!mounted) return null;

  const branchList = Object.values(branches);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12 lg:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-serif text-4xl lg:text-5xl text-white mb-4">
              Our Locations
            </h1>
            <p className="text-zinc-500 max-w-2xl mx-auto">
              Visit any of our 5 branches across Johannesburg and Mpumalanga.
              Each location offers a unique experience while maintaining our signature premium service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {branchList.map((branch) => (
              <div
                key={branch.id}
                className="group relative bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-[rgba(197,160,89,0.2)] rounded-2xl p-6 hover:border-gold/40 transition-all duration-300 hover:scale-[1.02]"
              >
                {branch.hasPage && (
                  <div className="absolute top-4 right-4">
                    <ExternalLink className="w-4 h-4 text-gold/50" />
                  </div>
                )}
                
                <div className="mb-4">
                  <span className="text-gold text-xs tracking-wider uppercase">{branch.subtitle}</span>
                  <h3 className="font-serif text-2xl text-white mt-1">{branch.name}</h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-2 text-zinc-400">
                    <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">{branch.address}</p>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                    <p className="text-xs">Today: {getTodayHours(branch)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href={branch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-sm font-medium rounded-lg transition-all duration-300"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                  
                  {branch.hasPage && (
                    <Link
                      href={`/locations/${branch.id === 'randpark' ? 'randpark-ridge' : branch.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-transparent hover:bg-white/5 border border-white/20 text-zinc-300 text-sm font-medium rounded-lg transition-all duration-300"
                    >
                      Explore Location
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-surface/50 border border-[rgba(197,160,89,0.2)] rounded-full">
              <Clock className="w-4 h-4 text-gold" />
              <span className="text-zinc-400 text-sm">All locations open 7 days a week</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}