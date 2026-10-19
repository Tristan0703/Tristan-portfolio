"use client";

import { profile } from "@/data/profile";
import { projectRepoUrl } from "@/data/projects";
import type { Project } from "@/data/types";
import { cn } from "@/lib/cn";
import { statusLabel, statusStyle } from "@/lib/status";
import { Tag } from "@/components/ui/Tag";
import { motion } from "framer-motion";

export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const isReserved = project.status === "reserved";
  const href = project.repoPath
    ? projectRepoUrl(project.repoPath, profile.repository)
    : undefined;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col bg-ink p-7 transition-all duration-300 hover:bg-panel/60 hover:border-accent/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:p-9",
        isReserved && "hatch",
        className,
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />
      <header className="relative flex items-start justify-between gap-4">
        <span className="label text-accent group-hover:scale-110 transition-transform">{project.index}</span>
        <span
          className={cn(
            "label border px-2.5 py-1.5 transition-all duration-200",
            statusStyle[project.status],
            isReserved && "animate-pulse",
          )}
        >
          {statusLabel[project.status]}
        </span>
      </header>

      <h3 className="relative mt-10 font-display text-2xl leading-tight tracking-tight text-bone sm:text-[1.7rem] group-hover:text-accent transition-colors duration-300">
        {project.title}
      </h3>

      <p className="relative mt-5 text-sm leading-relaxed text-muted">{project.description}</p>

      <ul className="relative mt-7 flex flex-wrap gap-2">
        {project.stack.map((item, index) => (
          <motion.li
            key={item}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            whileHover={{ scale: 1.05 }}
          >
            <Tag className="transition-all group-hover:border-accent/50 group-hover:text-accent">
              {item}
            </Tag>
          </motion.li>
        ))}
      </ul>

      <footer className="relative mt-auto flex items-center justify-between gap-4 border-t border-line pt-6">
        <span className="label text-muted">{project.year}</span>
        {href ? (
          <motion.a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="label text-bone transition-colors hover:text-accent flex items-center gap-1.5"
            whileHover={{ x: 4 }}
          >
            View source
            <span aria-hidden="true">↗</span>
          </motion.a>
        ) : (
          <span className="label text-muted">Scope in progress</span>
        )}
      </footer>
    </article>
  );
}
