"use client";

import { profile } from "@/data/profile";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Reveal } from "@/components/ui/Reveal";
import { HeroVisual } from "./HeroVisual";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const frameLabels = [
  { position: "left-3 top-3", text: "SG-01 / LATTICE" },
  { position: "right-3 top-3", text: "WEBGL / REALTIME" },
  { position: "bottom-3 left-3", text: "ICOSAHEDRON / NODES" },
  { position: "bottom-3 right-3", text: "RAF / CAPPED" },
];

export function Hero() {
  return (
    <section id="top" className="relative border-b border-line overflow-hidden">
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(77, 216, 230, 0.08), transparent),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(77, 216, 230, 0.04), transparent)
          `
        }}
      />
      <div className="mx-auto grid w-full max-w-[1220px] gap-14 px-6 pb-20 pt-32 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-28 lg:pt-40">
        <div className="lg:col-span-7">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <p className="label text-muted">{profile.availability}</p>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="label mt-8 text-accent">Portfolio / 2026</p>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="mt-5 font-display text-[2.6rem] leading-[0.98] tracking-[-0.02em] text-bone sm:text-6xl lg:text-[4.4rem]">
              {profile.role.split(" & ").map((part, i) => (
                <span key={i} className="block">{part}</span>
              ))}
            </h1>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-6 flex items-center gap-4">
              <span className="h-px w-10 bg-gradient-to-r from-accent to-transparent" aria-hidden="true" />
              <p className="label text-bone">{profile.name}</p>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {profile.summary}
            </p>
          </Reveal>

          <Reveal delay={0.25}>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink
                href={profile.primaryCta.href}
                external={profile.primaryCta.external}
                variant="primary"
              >
                {profile.primaryCta.label}
              </ButtonLink>
              <ButtonLink
                href={profile.secondaryCta.href}
                external={profile.secondaryCta.external}
              >
                {profile.secondaryCta.label}
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <dl className="mt-14 grid max-w-xl grid-cols-1 gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-3">
              <div className="group">
                <dt className="label text-muted group-hover:text-accent transition-colors">Discipline</dt>
                <dd className="mt-2 text-sm text-bone">Full-stack architecture</dd>
              </div>
              <div className="group">
                <dt className="label text-muted group-hover:text-accent transition-colors">Specialism</dt>
                <dd className="mt-2 text-sm text-bone">3D & virtual reality</dd>
              </div>
              <div className="group">
                <dt className="label text-muted group-hover:text-accent transition-colors">Mode</dt>
                <dd className="mt-2 text-sm text-bone">Contract / technical direction</dd>
              </div>
            </dl>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:col-span-5">
          <div className="relative aspect-square w-full overflow-hidden border border-line bg-panel/40 transition-all duration-500 hover:border-accent/50">
            <HeroVisual />
            {frameLabels.map((label) => (
              <span
                key={label.text}
                className={`label pointer-events-none absolute ${label.position} text-muted/80 transition-opacity duration-300 group-hover:opacity-100`}
              >
                {label.text}
              </span>
            ))}
            <span
              className="pointer-events-none absolute left-0 top-0 h-4 w-px bg-accent"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute left-0 top-0 h-px w-4 bg-accent"
              aria-hidden="true"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
          </div>
          <p className="label mt-4 flex items-center justify-between text-muted">
            <span>Figure 01 — engine lattice</span>
            <span>Three.js</span>
          </p>
        </Reveal>
      </div>

      <motion.a
        href="#arsenal"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted/60 transition-colors hover:text-accent"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-label="Scroll to explore"
      >
        <p className="label">Scroll</p>
        <ChevronDown className="h-5 w-5 animate-bounce" aria-hidden="true" />
      </motion.a>
    </section>
  );
}
