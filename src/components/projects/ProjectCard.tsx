import { profile } from "@/data/profile";
import { projectRepoUrl } from "@/data/projects";
import type { Project } from "@/data/types";
import { cn } from "@/lib/cn";
import { statusLabel, statusStyle } from "@/lib/status";
import { Tag } from "@/components/ui/Tag";

export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const isReserved = project.status === "reserved";
  const href = project.repoPath
    ? projectRepoUrl(project.repoPath, profile.repository)
    : undefined;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col bg-ink p-7 transition-colors duration-300 hover:bg-panel/60 sm:p-9",
        isReserved && "hatch",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4">
        <span className="label text-accent">{project.index}</span>
        <span
          className={cn(
            "label border px-2.5 py-1.5",
            statusStyle[project.status],
          )}
        >
          {statusLabel[project.status]}
        </span>
      </header>

      <h3 className="mt-10 font-display text-2xl leading-tight tracking-tight text-bone sm:text-[1.7rem]">
        {project.title}
      </h3>

      <p className="mt-5 text-sm leading-relaxed text-muted">{project.description}</p>

      <ul className="mt-7 flex flex-wrap gap-2">
        {project.stack.map((item) => (
          <li key={item}>
            <Tag className="transition-colors group-hover:border-line-strong">
              {item}
            </Tag>
          </li>
        ))}
      </ul>

      <footer className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-6">
        <span className="label text-muted">{project.year}</span>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="label text-bone transition-colors hover:text-accent"
          >
            View source <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className="label text-muted">Scope in progress</span>
        )}
      </footer>
    </article>
  );
}
