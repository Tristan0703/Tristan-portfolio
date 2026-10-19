"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Star, ArrowRight, Droplets, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemedMemberCard from "@/components/branches/ThemedMemberCard";
import InstagramGallery from "@/components/branches/InstagramGallery";
import { branches } from "@/components/branches/branchData";

const branch = branches.randpark;

export default function RandparkRidgePage() {
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
      <div className="absolute inset-0 bg-gradient-to-br from-sky-900/20 via-transparent to-blue-900/10" />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="caustics" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-sky-400 animate-pulse"/>
              <circle cx="150" cy="150" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }}/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#caustics)" className="opacity-30"/>
        </svg>
      </div>

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
                    <Droplets className="w-6 h-6" style={{ color: branch.theme?.accent }} />
                    <span className="text-zinc-400 text-sm">The Hub Location</span>
                  </div>
                  <ThemedMemberCard branch={branch} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <Leaf className="w-12 h-12 mx-auto mb-6" style={{ color: branch.theme?.accent }} />
            <h3 className="font-serif text-3xl text-white mb-4">The Pond & Garden Sanctuary</h3>
            <p className="text-zinc-400 leading-relaxed">
              Our Randpark Ridge location serves as the central hub for Smokey Dreamz enthusiasts. 
              Surrounded by lush gardens and tranquil water features, this location offers a 
              peaceful escape where you can explore our extensive menu while connecting with 
              fellow cannabis connoisseurs.
            </p>
          </div>
        </section>
        
        <InstagramGallery branch={branch} />
      </main>

      <Footer />
    </div>
  );
}
