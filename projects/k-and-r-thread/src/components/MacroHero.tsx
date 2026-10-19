"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MacroHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative h-[120vh] overflow-hidden"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 will-change-transform"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(/fabrics/Challis.png)",
          }}
        />
        <div className="absolute inset-0 bg-charcoal/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-transparent to-charcoal/60" />
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-charcoal/40 backdrop-blur-[20px] border border-bone/10 px-16 py-12 text-center max-w-lg luxury-border"
        >
          <p className="text-bone/80 text-xs tracking-[0.4em] mb-4">
            THE DIGITAL ATELIER
          </p>
          <h1
            className="font-playfair text-4xl md:text-5xl lg:text-6xl text-bone mb-6 leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            The Winter &apos;26 Reserve
          </h1>
          <p className="text-bone/70 text-sm tracking-[0.15em] mb-8">
            Italian Superfine Wool &amp; Silk Collections
          </p>
          <Link
            href="/fabrics"
            className="inline-flex items-center gap-3 text-bone/90 text-xs tracking-[0.2em] hover:text-bone transition-colors"
          >
            Explore Collection
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2 text-bone/40">
          <span className="text-[10px] tracking-[0.3em]">SCROLL</span>
          <div className="w-[1px] h-12 bg-bone/30 overflow-hidden">
            <motion.div
              animate={{ y: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-1/2 bg-bone/60"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}