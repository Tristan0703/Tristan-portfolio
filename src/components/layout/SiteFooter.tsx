"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { motion } from "framer-motion";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-line py-10 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/50 to-transparent" aria-hidden="true" />
      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="label text-bone">
            TLN<span className="text-accent">/</span>
          </span>
          <span className="label text-muted">
            © {profile.copyrightYear} {profile.name}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center gap-6"
        >
          <a
            href={`mailto:${profile.email}`}
            className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-accent group"
          >
            <motion.span whileHover={{ scale: 1.1, rotate: -5 }}>
              <Mail aria-hidden="true" className="h-4 w-4" />
            </motion.span>
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
            className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-accent group"
          >
            <motion.span whileHover={{ scale: 1.1 }}>
              <GithubIcon className="h-4 w-4" />
            </motion.span>
            GitHub
          </a>
          <Link
            href="/#top"
            className="label text-muted transition-colors hover:text-accent group inline-flex items-center gap-1"
          >
            Back to top
            <motion.span whileHover={{ y: -3 }}>
              ↑
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </footer>
  );
}
