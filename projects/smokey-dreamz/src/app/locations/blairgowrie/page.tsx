"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Star, ArrowRight, Leaf, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemedMemberCard from "@/components/branches/ThemedMemberCard";
import InstagramGallery from "@/components/branches/InstagramGallery";
import { branches } from "@/components/branches/branchData";

const branch = branches.blairgowrie;

export default function BlairgowriePage() {
  const [mounted, setMounted] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const verified = document.cookie.includes("age-verified=true");
    setIsVerified(verified);
    if (!verified) router.push("/welcome");
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/10" />
      
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="botanical" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M10 0 Q15 5 10 10 Q5 15 10 20" stroke="currentColor" fill="none" strokeWidth="0.2" className="text-green-500"/>
            <circle cx="10" cy="10" r="2" fill="currentColor" className="text-green-500"/>
          </pattern>
          <rect width="100%" height="100%" fill="url(#botanical)"/>
        </svg>
      </div>

      <div className="absolute top-20 left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-40 right-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <Navbar />

      <main className="flex-1 relative z-10">
        <section className="py-16 lg:py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <span 
                  className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-6"
                  style={{ backgroundColor: `${branch.theme?.primary}30`, color: branch.theme?.accent }}
                >
                  {branch.subtitle}
                </span>
                <h1 className="font-serif text-5xl lg:text-6xl text-white mb-4">
                  Smokey Dreamz
                </h1>
                <h2 className="text-3xl lg:text-4xl mb-6" style={{ color: branch.theme?.accent }}>
                  {branch.name}
                </h2>
                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                  {branch.vibe}
                </p>
                <p className="font-serif text-xl mb-8" style={{ color: branch.theme?.accent }}>
                  {branch.tagline}
                </p>
                <div className="flex items-center gap-1 text-yellow-400 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                  <span className="ml-2 text-zinc-400">4.5 out of 5</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-zinc-300">
                    <MapPin className="w-5 h-5" style={{ color: branch.theme?.accent }} />
                    <span>{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-300">
                    <Clock className="w-5 h-5" style={{ color: branch.theme?.accent }} />
                    <div>
                      <p>Mon-Fri: {branch.hours.weekdays}</p>
                      <p>Sat-Sun: {branch.hours.weekend}</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-8 py-4 text-white font-medium tracking-wide rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  style={{ backgroundColor: branch.theme?.primary }}
                >
                  View Menu
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
                  style={{ backgroundColor: branch.theme?.primary }}
                />
                <div className="relative bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-md rounded-3xl p-8 border border-white/10">
                  <div className="flex items-center gap-3 mb-6">
                    <Leaf className="w-6 h-6" style={{ color: branch.theme?.accent }} />
                    <span className="text-zinc-400 text-sm">Alice in Wonderland Theme</span>
                  </div>
                  <ThemedMemberCard branch={branch} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-6" style={{ color: branch.theme?.accent }} />
            <h3 className="font-serif text-3xl text-white mb-4">The Fairy Crescent Experience</h3>
            <p className="text-zinc-400 leading-relaxed">
              Step into our Blairgowrie location and discover a whimsical wonderland where 
              ethereal lighting and soft botanical touches create an atmosphere of pure relaxation. 
              Our knowledgeable staff will guide you through our curated selection, ensuring 
              you find the perfect strain for your dream.
            </p>
          </div>
        </section>
        
        <InstagramGallery branch={branch} />
      </main>

      <Footer />
    </div>
  );
}
