"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profile } from "@/data/profile";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

const navItems = [
  { label: "Arsenal", href: "/#arsenal" },
  { label: "Work", href: "/#work" },
  { label: "Scopes", href: "/scopes" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollTop / docHeight);
      setScrolled(scrollTop > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className={cn(
      "fixed inset-x-0 top-0 z-50 border-b border-line bg-ink/85 backdrop-blur-md transition-all duration-300",
      scrolled && "bg-ink/95 shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
    )}>
      <div className="mx-auto flex h-16 w-full max-w-[1220px] items-center justify-between gap-6 px-6">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="label text-bone">
            TLN<span className="text-accent">/</span>
          </span>
          <span className="label hidden text-muted transition-colors group-hover:text-bone sm:inline">
            Tristan Lincoln Niekerk
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="label text-muted transition-colors hover:text-accent relative after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-accent after:transition-width hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub dashboard"
            className="hidden text-muted transition-colors hover:text-accent md:inline-flex"
          >
            <GithubIcon className="h-[1.15rem] w-[1.15rem]" />
          </a>
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="label border border-line px-3 py-2 text-muted transition-colors hover:border-accent hover:text-accent md:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <motion.div
        className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-accent to-accent/20"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: scrollProgress }}
        transition={{ ease: "linear", duration: 0.1 }}
        style={{ transformOrigin: "left center" }}
        aria-hidden="true"
      />

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-line bg-ink md:hidden overflow-hidden",
          open ? "block" : "hidden",
        )}
      >
        <motion.nav
          aria-label="Mobile"
          className="mx-auto flex max-w-[1220px] flex-col px-6 py-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {navItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="label border-b border-line py-4 text-muted transition-colors last:border-b-0 hover:text-accent"
              style={{ transitionDelay: `${index * 0.03}s` }}
            >
              {item.label}
            </Link>
          ))}
        </motion.nav>
      </div>
    </header>
  );
}
