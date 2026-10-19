"use client";

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  index: string;
  title: string;
  description?: ReactNode;
  id?: string;
}

export function SectionHeader({ index, title, description, id }: SectionHeaderProps) {
  return (
    <Reveal className="border-b border-line pb-8">
      <motion.p
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="label text-accent"
      >
        {index} / {title}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <h2
          id={id}
          className="font-display text-3xl leading-[1.05] tracking-tight text-bone sm:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <motion.p
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="max-w-md text-sm leading-relaxed text-muted"
          >
            {description}
          </motion.p>
        ) : null}
      </motion.div>
    </Reveal>
  );
}
