"use client";

import { ArrowUpRight, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "./ContactForm";
import { motion } from "framer-motion";

export function Contact() {
  return (
    <section id="contact" className="relative py-20 lg:py-28 overflow-hidden">
      <motion.div
        className="absolute inset-0 -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 20% 0%, rgba(77, 216, 230, 0.05), transparent),
            radial-gradient(ellipse 50% 30% at 80% 100%, rgba(77, 216, 230, 0.03), transparent)
          `
        }}
      />
      <div className="mx-auto w-full max-w-[1220px] px-6">
        <SectionHeader
          index="03"
          title="Contact"
          description="Send the systems involved, the constraints, and the outcome you need. I reply with a technical response, not a sales deck."
        />

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <p className="label text-accent">Direct line</p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-5 flex items-center gap-3 font-display text-xl tracking-tight text-bone transition-colors hover:text-accent sm:text-2xl group"
            >
              <motion.span whileHover={{ scale: 1.1, rotate: -5 }}>
                <Mail aria-hidden="true" className="h-5 w-5 text-accent" />
              </motion.span>
              {profile.email}
            </a>

            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 flex items-center gap-3 font-display text-xl tracking-tight text-bone transition-colors hover:text-accent sm:text-2xl group"
            >
              <motion.span whileHover={{ scale: 1.1 }}>
                <GithubIcon className="h-5 w-5 text-accent" />
              </motion.span>
              github.com/Tristan0703
              <motion.span whileHover={{ x: 4 }}>
                <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-muted" />
              </motion.span>
            </a>

            <dl className="mt-12 space-y-6 border-t border-line pt-8">
              <div className="group">
                <dt className="label text-muted group-hover:text-accent transition-colors">Availability</dt>
                <dd className="mt-2 text-sm text-bone">{profile.availability}</dd>
              </div>
              <div className="group">
                <dt className="label text-muted group-hover:text-accent transition-colors">Engagements</dt>
                <dd className="mt-2 text-sm text-bone">
                  Technical direction, full-stack builds, 3D and VR systems.
                </dd>
              </div>
              <div className="group">
                <dt className="label text-muted group-hover:text-accent transition-colors">Source</dt>
                <dd className="mt-2 text-sm text-bone">
                  <a
                    href={profile.repository}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
                  >
                    Project sources and site build
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="relative border border-line bg-panel/40 p-6 sm:p-8 overflow-hidden group hover:border-accent/30 transition-colors duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" />
              <p className="label mb-8 text-muted relative z-10">Contract pitch</p>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
