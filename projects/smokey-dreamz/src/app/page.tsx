"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      const cookies = document.cookie.split(';');
      const ageVerified = cookies.some(cookie => cookie.trim().startsWith('age-verified='));
      setIsAuthenticated(ageVerified);
    }, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <section className="relative min-h-[85vh] flex items-center justify-center px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-dark/40 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
          
          <div className="max-w-4xl mx-auto text-center relative z-10 py-16 lg:py-24">
            <div className="animate-fade-in">
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-8 lg:mb-12 leading-[1.3]">
                The Dream <br />
                <span className="text-gold">Awaits</span>
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-14 lg:mb-16 leading-relaxed px-4">
                Johannesburg&apos;s premier destination for bespoke cannabis experiences. 
                Curated strains, exceptional quality, delivered with discretion.
              </p>
            </div>

            <div className={`flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-200 transition-opacity duration-300 ${isAuthenticated ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
              <Link
                href="/menu"
                className="group inline-flex items-center justify-center gap-3 px-8 lg:px-10 py-4 bg-accent hover:bg-accent-light text-white font-medium tracking-wide rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-accent/20 border border-[rgba(197,160,89,0.3)]"
              >
                Explore Menu
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center gap-2 px-8 lg:px-10 py-4 border border-[rgba(197,160,89,0.4)] hover:border-gold hover:bg-gold/10 text-white font-medium tracking-wide rounded-xl transition-all duration-300"
              >
                Latest Feed
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24 lg:py-32 px-6 lg:px-8 border-t border-[rgba(197,160,89,0.1)]">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "Curated Selection",
                  description: "Hand-picked strains from premium growers, selected for quality and character."
                },
                {
                  icon: Shield,
                  title: "Lab Verified",
                  description: "Every product tested and verified. Complete transparency in THC levels and profiles."
                },
                {
                  icon: Truck,
                  title: "Discreet Delivery",
                  description: "Professional, unmarked delivery. Your privacy is our priority."
                }
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="group p-8 lg:p-10 bg-surface border border-[rgba(197,160,89,0.15)] rounded-xl hover:border-[rgba(197,160,89,0.3)] transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center mb-6 lg:mb-8 group-hover:bg-gold/20 transition-colors">
                    <feature.icon className="w-6 h-6 lg:w-7 lg:h-7 text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl lg:text-2xl text-white mb-4">{feature.title}</h3>
                  <p className="text-zinc-500 leading-relaxed text-sm lg:text-base">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 lg:py-32 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-gold mb-6 block">Begin Your Journey</span>
            <h2 className="font-serif text-3xl lg:text-4xl md:text-5xl text-white mb-6 leading-[1.3]">Ready to Explore?</h2>
            <p className="text-zinc-500 mb-14 lg:mb-16 max-w-xl mx-auto leading-relaxed">
              Browse our curated menu, build your personalized quotation, 
              and experience the Smokey Dreamz difference.
            </p>
            <Link
              href="/menu"
              className="group inline-flex items-center gap-3 px-8 lg:px-10 py-4 bg-gold hover:bg-gold-light text-background font-medium tracking-wide rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/20"
            >
              View Menu
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
