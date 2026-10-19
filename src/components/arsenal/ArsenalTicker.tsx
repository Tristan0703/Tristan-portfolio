"use client";

import { useState } from "react";
import { arsenalTicker } from "@/data/arsenal";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";

export function ArsenalTicker() {
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const items = [...arsenalTicker, ...arsenalTicker];

  if (reduceMotion) {
    return (
      <div className="flex flex-wrap items-center gap-4 border-y border-line py-6">
        <div className="flex-1 flex flex-wrap gap-3">
          {arsenalTicker.map((item, index) => (
            <span key={item} className="label flex items-center gap-2 whitespace-nowrap text-muted">
              {item}
              {index < arsenalTicker.length - 1 && <span className="text-accent-dim">/</span>}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-4 border-y border-line py-3 overflow-hidden">
      <div className="relative flex-1 overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <motion.div
          className={cn(
            "flex w-max items-center gap-10",
            paused && "ticker-paused",
          )}
          animate={{ x: paused ? 0 : "-50%" }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          style={{ willChange: "transform" }}
          aria-hidden="true"
        >
          {items.map((item, index) => (
            <span key={`${item}-${index}`} className="label flex items-center gap-10 whitespace-nowrap text-muted">
              {item}
              <span className="text-accent-dim">/</span>
            </span>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink via-transparent 50%, to-ink" aria-hidden="true" />
      </div>
      <motion.button
        type="button"
        onClick={() => setPaused((current) => !current)}
        aria-pressed={paused}
        className="label shrink-0 border border-line px-3 py-2 text-muted transition-colors hover:border-accent hover:text-accent"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {paused ? "Resume" : "Pause"}
      </motion.button>
    </div>
  );
}
