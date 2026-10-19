"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthContext";
import { Loader2, LogOut } from "lucide-react";

export default function TactileHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, isLoading, signOutUser } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const navLinks = [
    { href: "/", label: "Atelier" },
    { href: "/fabrics", label: "Collections" },
    { href: "/account", label: "Account" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? "glass py-3 premium-glow" : "py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
        <Link
          href="/"
          className="font-playfair text-2xl tracking-[0.3em] text-charcoal hover:text-gold transition-colors duration-500"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          K&R
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm tracking-[0.2em] transition-colors duration-500 ${
                pathname === link.href
                  ? "text-gold"
                  : "text-charcoal hover:text-gold"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-6">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gold" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-charcoal tracking-[0.1em]">
                {profile?.company || profile?.full_name || user.email}
              </span>
              <button
                onClick={signOutUser}
                className="text-charcoal hover:text-gold transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm tracking-[0.15em] text-charcoal hover:text-gold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm px-4 py-2 border border-charcoal hover:border-gold hover:text-gold transition-colors tracking-[0.15em]"
              >
                Join
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-charcoal"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-bone border-t border-platinum p-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm tracking-[0.2em] py-2 transition-colors ${
                pathname === link.href ? "text-gold" : "text-charcoal"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-platinum pt-4">
            {user ? (
              <button
                onClick={() => {
                  signOutUser();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 text-sm text-charcoal hover:text-gold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm tracking-[0.15em] text-charcoal hover:text-gold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  className="block text-sm tracking-[0.15em] text-gold"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}