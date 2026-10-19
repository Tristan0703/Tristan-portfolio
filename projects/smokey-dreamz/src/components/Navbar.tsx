"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/locations", label: "Locations" },
  { href: "/membership", label: "Membership" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-[rgba(197,160,89,0.15)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          <Link href="/" className="flex items-center pl-4 h-10 lg:h-12 overflow-visible">
            <img 
              src="/logo.png" 
              alt="Smokey Dreamz" 
              className="h-full w-auto object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs xl:text-sm font-medium tracking-wider transition-all duration-300 relative group ${
                  pathname === link.href
                    ? "text-gold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label.toUpperCase()}
                <span className={`absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full ${
                  pathname === link.href ? "w-full" : ""
                }`} />
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-surface rounded-lg transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[rgba(197,160,89,0.15)] bg-surface/95 backdrop-blur-md animate-slide-up">
          <nav className="px-6 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block py-3 px-4 text-sm font-medium tracking-wider rounded-lg transition-all duration-200 ${
                  pathname === link.href
                    ? "text-gold bg-gold/5"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
