"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Star, ArrowRight, Gamepad2, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemedMemberCard from "@/components/branches/ThemedMemberCard";
import InstagramGallery from "@/components/branches/InstagramGallery";
import { branches } from "@/components/branches/branchData";

const branch = branches.witbank;

export default function WitbankPage() {
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
      <div className="absolute inset-0 bg-gradient-to-br from-pink-900/30 via-purple-900/20 to-fuchsia-900/30" />
      
      <div className="absolute inset-0 opacity-20">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(236, 72, 153, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(236, 72, 153, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="absolute top-20 left-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{
          background: `radial-gradient(circle, ${branch.theme?.primary}40 0%, transparent 70%)`,
        }}
      />

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
                <h1 
                  className="font-serif text-5xl lg:text-6xl mb-4"
                  style={{
                    color: branch.theme?.accent,
                    textShadow: `0 0 30px ${branch.theme?.primary}80`,
                  }}
                >
                  Smokey Dreamz
                </h1>
                <h2 
                  className="text-3xl lg:text-4xl mb-6"
                  style={{ color: branch.theme?.primary }}
                >
                  {branch.name}
                </h2>
                <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                  {branch.vibe}
                </p>
                <p 
                  className="font-serif text-xl mb-8"
                  style={{ color: branch.theme?.accent }}
                >
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
                  style={{
                    backgroundColor: branch.theme?.primary,
                    boxShadow: `0 0 20px ${branch.theme?.primary}60`,
                  }}
                >
                  <Gamepad2 className="w-5 h-5" />
                  View Menu
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
                  style={{ backgroundColor: branch.theme?.primary }}
                />
                <div 
                  className="relative bg-gradient-to-br from-zinc-900/90 to-black/90 backdrop-blur-md rounded-3xl p-8 border-2"
                  style={{ borderColor: `${branch.theme?.primary}60` }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="w-6 h-6 animate-pulse" style={{ color: branch.theme?.accent }} />
                    <span className="text-zinc-400 text-sm">Level 1: Arcade Zone</span>
                  </div>
                  <ThemedMemberCard branch={branch} />
                  
                  <button
                    className="w-full mt-6 py-4 font-bold text-lg rounded-xl tracking-wider transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-pulse"
                    style={{
                      backgroundColor: branch.theme?.primary,
                      color: 'white',
                      boxShadow: `0 0 30px ${branch.theme?.primary}80`,
                      fontFamily: 'monospace',
                    }}
                  >
                    INSERT COIN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 border-t" style={{ borderColor: `${branch.theme?.primary}30` }}>
          <div className="max-w-4xl mx-auto text-center">
            <Gamepad2 
              className="w-12 h-12 mx-auto mb-6 animate-pulse" 
              style={{ color: branch.theme?.accent }} 
            />
            <h3 
              className="font-serif text-3xl mb-4"
              style={{ color: branch.theme?.accent }}
            >
              The Retro Arcade Experience
            </h3>
            <p className="text-zinc-400 leading-relaxed">
              Step into our Witbank location and transport yourself to the neon-lit arcades of the 80s. 
              With synthwave beats, classic arcade aesthetics, and our premium cannabis selection, 
              this is where nostalgia meets the dream state. Level up your experience at the arcade.
            </p>
            
            <div className="mt-8 inline-block">
              <span 
                className="px-4 py-2 rounded-lg font-mono text-sm"
                style={{
                  backgroundColor: `${branch.theme?.primary}20`,
                  color: branch.theme?.accent,
                  border: `1px solid ${branch.theme?.primary}40`,
                }}
              >
                TODO: Replace placeholder with arcade-logo-level.mp4
              </span>
            </div>
          </div>
        </section>
        
        <InstagramGallery branch={branch} />
      </main>

      <Footer />
    </div>
  );
}
