"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Mail, CreditCard, LogOut, ArrowRight, Sparkles, Shield, Gift, Phone, Edit3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getMember, logout, Member } from "@/components/membership";
import { createClient } from "@/utils/supabase/client";

export default function MembershipPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkMember = async () => {
      const currentMember = getMember();
      setMember(currentMember);
      setMounted(true);

      if (currentMember) {
        // Check admin via direct fetch
        const supabaseUrl = 'https://igfnlqmevjanfpcxxanh.supabase.co';
        const anonKey = 'sb_publishable_vMWqJ9fEmL5qMKyvkipFww_0YKhLmNm';
        
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${currentMember.id}&select=is_admin`, {
            headers: {
              'apikey': anonKey,
              'Authorization': `Bearer ${anonKey}`,
            },
          });
          const data = await response.json();
          setIsAdmin(data?.[0]?.is_admin || false);
        } catch (err) {
          console.error('Error checking admin:', err);
          setIsAdmin(false);
        }
      }
    };

    checkMember();
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/welcome";
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-zinc-500">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-gold" />
            </div>
            <h1 className="font-serif text-3xl text-white mb-4">Membership Required</h1>
            <p className="text-zinc-500 mb-8">
              Please sign up or log in to access your member dashboard and view your digital member card.
            </p>
            <Link
              href="/welcome"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-light text-white font-medium tracking-wide rounded-xl transition-all duration-300"
            >
              Sign In / Join
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12 lg:py-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Digital Member Card */}
          <div className="mb-12 lg:mb-16">
            <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 border border-[rgba(197,160,89,0.3)] rounded-2xl p-8 lg:p-10 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logo.png" 
                      alt="Smokey Dreamz" 
                      className="h-8 w-auto object-contain"
                    />
                  </div>
                  <span className="px-4 py-1 bg-gold/20 border border-gold/30 text-gold text-xs font-medium tracking-wider uppercase rounded-full">
                    Member
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">Member ID</p>
                  <p className="font-serif text-3xl lg:text-4xl text-gold tracking-wider">{member.membershipId}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">Member Name</p>
                    <p className="text-white text-lg">{member.name}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs tracking-wider uppercase mb-1">Email</p>
                    <p className="text-white text-sm truncate">{member.email}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-600 text-xs">
                    <CreditCard className="w-4 h-4" />
                    <span>Valid 2026</span>
                  </div>
                  <Link 
                    href="/membership/card"
                    className="text-gold text-xs hover:text-gold-light transition-colors"
                  >
                    View Full Card →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Member Profile */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl text-white mb-6">Your Profile</h2>
            <div className="bg-surface border border-[rgba(197,160,89,0.15)] rounded-xl p-6 lg:p-8">
              <div className="grid gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Full Name</p>
                    <p className="text-white">{member.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Email</p>
                    <p className="text-white">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Contact Number</p>
                    <p className="text-white">{member.contactNumber || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">ID Number</p>
                    <p className="text-white">*****{member.idNumber.slice(-4)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gold/10 border border-gold/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-zinc-500 text-xs uppercase tracking-wider">Membership ID</p>
                    <p className="text-gold font-medium">{member.membershipId}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Link
                href="/membership/edit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-sm rounded-lg transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
          </section>

          {/* Member Benefits */}
          <section className="mb-12">
            <h2 className="font-serif text-2xl text-white mb-6">Member Benefits</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  icon: Sparkles,
                  title: "Exclusive Drops",
                  description: "Be first to access limited strains and products"
                },
                {
                  icon: Shield,
                  title: "Priority Service",
                  description: "Skip the queue with dedicated member support"
                },
                {
                  icon: Gift,
                  title: "Member Events",
                  description: "Invitations to exclusive gatherings and tastings"
                }
              ].map((benefit) => (
                <div
                  key={benefit.title}
                  className="p-6 bg-surface border border-[rgba(197,160,89,0.15)] rounded-xl"
                >
                  <benefit.icon className="w-8 h-8 text-gold mb-4" strokeWidth={1.5} />
                  <h3 className="font-serif text-lg text-white mb-2">{benefit.title}</h3>
                  <p className="text-zinc-500 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Actions */}
          <section>
            {isAdmin && (
              <div className="mb-4">
                <Link
                  href="/staff/verify"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium tracking-wide rounded-xl transition-all duration-300 w-full"
                >
                  <Shield className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/menu"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-accent hover:bg-accent-light text-white font-medium tracking-wide rounded-xl transition-all duration-300"
              >
                Browse Menu
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-6 py-4 border border-[rgba(197,160,89,0.3)] text-zinc-400 hover:text-white hover:border-red-500/30 font-medium tracking-wide rounded-xl transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
