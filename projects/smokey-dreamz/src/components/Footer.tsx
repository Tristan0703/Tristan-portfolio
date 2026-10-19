"use client";

import Link from "next/link";
import { MapPin, Clock, ExternalLink, Navigation, Phone, MessageCircle } from "lucide-react";
import { branches, getTodayHours } from "@/components/branches/branchData";

export default function Footer() {
  const branchList = Object.values(branches);

  return (
    <footer className="bg-surface border-t border-[rgba(197,160,89,0.15)]">
      <section className="py-20 px-8 border-b border-[rgba(197,160,89,0.1)]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium tracking-[0.2em] uppercase text-gold mb-4 block">Our Locations</span>
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Visit Any Branch</h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              Find your nearest Smokey Dreamz location across Johannesburg and Mpumalanga
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {branchList.map((branch) => (
              <div
                key={branch.id}
                className="relative bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 border border-[rgba(197,160,89,0.2)] rounded-xl p-6 hover:border-gold/40 transition-all duration-300"
              >
                <div className="mb-4">
                  <h3 className="font-serif text-lg text-white mb-1">{branch.name}</h3>
                  <p className="text-gold text-xs tracking-wider uppercase">{branch.subtitle}</p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2 text-zinc-400">
                    <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                    <p className="text-xs leading-relaxed">{branch.address}</p>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                    <p className="text-xs">Today: {getTodayHours(branch)}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <a
                    href={branch.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 text-gold text-sm font-medium rounded-lg transition-all duration-300"
                  >
                    <Navigation className="w-4 h-4" />
                    Get Directions
                  </a>
                  
                  {branch.hasPage && (
                    <Link
                      href={`/locations/${branch.id === 'randpark' ? 'randpark-ridge' : branch.id}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-transparent hover:bg-white/5 border border-white/20 text-zinc-300 text-sm font-medium rounded-lg transition-all duration-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit Page
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <h3 className="font-serif text-lg text-white mb-6">Contact</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-zinc-400">
                  <MapPin className="w-5 h-5 text-gold mt-0.5" />
                  <div className="text-sm leading-relaxed">
                    <p className="text-zinc-300 mb-2">5 Branches across Johannesburg & Mpumalanga</p>
                    <Link href="/locations" className="text-gold hover:text-gold-light transition-colors">
                      View all locations →
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <MessageCircle className="w-5 h-5 text-gold" />
                  <a href="https://wa.me/27123456789" className="text-sm hover:text-gold transition-colors">
                    WhatsApp: +27 12 345 6789
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg text-white mb-6">Hours</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Clock className="w-5 h-5 text-gold" />
                  <div className="text-sm">
                    <p>View hours by location</p>
                    <Link href="/locations" className="text-gold hover:text-gold-light transition-colors">
                      See all branch hours →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-lg text-white mb-6">Quick Links</h3>
              <nav className="space-y-3">
                {[
                  { label: 'Menu', href: '/menu' },
                  { label: 'Locations', href: '/locations' },
                  { label: 'Membership', href: '/membership' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-zinc-400 hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="pt-8 border-t border-[rgba(197,160,89,0.1)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Smokey Dreamz" 
                className="h-8 lg:h-10 w-auto object-contain"
              />
              <span className="font-serif text-base lg:text-lg text-[#c5a059]">SMOKEY DREAMZ</span>
            </div>
            <p className="text-zinc-600 text-xs">
              For adult use only. Must be 21+ to purchase. © 2026 Smokey Dreamz.
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
}