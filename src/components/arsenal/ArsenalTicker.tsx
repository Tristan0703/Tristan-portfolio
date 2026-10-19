"use client";

import { useState } from "react";
import { arsenalTicker } from "@/data/arsenal";
import { cn } from "@/lib/cn";

export function ArsenalTicker() {
  const [paused, setPaused] = useState(false);
  const items = [...arsenalTicker, ...arsenalTicker];

  return (
    <div className="flex items-center gap-4 border-y border-line py-3">
      <div className="relative flex-1 overflow-hidden">
        <div
          aria-hidden="true"
          className={cn(
            "flex w-max animate-marquee items-center gap-10",
            paused && "ticker-paused",
          )}
        >
          {items.map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="label flex items-center gap-10 whitespace-nowrap text-muted"
            >
              {item}
              <span className="text-accent-dim">/</span>
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((current) => !current)}
        aria-pressed={paused}
        className="label shrink-0 border border-line px-3 py-2 text-muted transition-colors hover:border-accent hover:text-accent"
      >
        {paused ? "Resume" : "Pause"}
      </button>
    </div>
  );
}
