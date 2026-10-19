import type { Metadata } from "next";
import Link from "next/link";
import { profile } from "@/data/profile";
import { projects, projectRepoUrl } from "@/data/projects";
import { scopes } from "@/data/scopes";
import { cn } from "@/lib/cn";
import { statusLabel, statusStyle } from "@/lib/status";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Technical Scopes",
  description:
    "Objectives, architecture decisions, and deliverables behind each engineering engagement.",
  alternates: {
    canonical: "/scopes",
  },
};

export default function ScopesPage() {
  const indexBySlug = new Map(projects.map((project) => [project.slug, project.index]));
  const repoBySlug = new Map(
    projects.map((project) => [project.slug, project.repoPath]),
  );

  return (
    <div className="mx-auto w-full max-w-[1220px] px-6 pb-20 pt-32 lg:pb-28 lg:pt-40">
      <Reveal>
        <Link
          href="/#work"
          className="label text-muted transition-colors hover:text-accent"
        >
          ← Back to featured engineering
        </Link>
      </Reveal>

      <Reveal delay={0.05}>
        <p className="label mt-10 text-accent">00 / Technical Scopes</p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl leading-[1.02] tracking-[-0.02em] text-bone sm:text-5xl">
          Scope sheets for each engineering engagement
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
          Objectives, architecture decisions, and deliverables for every engagement listed on
          the main page. Client-specific deliverables are published once cleared.
        </p>
      </Reveal>

      <div className="mt-16 space-y-px border border-line bg-line">
        {scopes.map((scope, index) => {
          const repoPath = repoBySlug.get(scope.slug);
          const href = repoPath
            ? projectRepoUrl(repoPath, profile.repository)
            : undefined;

          return (
            <Reveal key={scope.slug} delay={index * 0.04}>
              <article id={scope.slug} className="bg-ink p-7 sm:p-10">
                <header className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-baseline gap-4">
                    <span className="label text-accent">
                      {indexBySlug.get(scope.slug) ?? String(index + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display text-2xl tracking-tight text-bone sm:text-3xl">
                      {scope.title}
                    </h2>
                  </div>
                  <span className={cn("label border px-2.5 py-1.5", statusStyle[scope.status])}>
                    {statusLabel[scope.status]}
                  </span>
                </header>

                <p className="mt-6 max-w-3xl text-sm leading-relaxed text-muted">
                  {scope.summary}
                </p>

                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
                  <section aria-label={`${scope.title} objectives`}>
                    <h3 className="label text-muted">Objectives</h3>
                    <ul className="mt-5 space-y-3">
                      {scope.objectives.map((objective) => (
                        <li key={objective} className="flex gap-3 text-sm leading-relaxed text-bone">
                          <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-accent" />
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section aria-label={`${scope.title} architecture`}>
                    <h3 className="label text-muted">Architecture</h3>
                    <ul className="mt-5 space-y-3">
                      {scope.architecture.map((entry) => (
                        <li key={entry} className="flex gap-3 text-sm leading-relaxed text-bone">
                          <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-accent-dim" />
                          <span>{entry}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <section aria-label={`${scope.title} deliverables`} className="mt-10">
                  <h3 className="label text-muted">Deliverables</h3>
                  <dl className="mt-5 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2">
                    {scope.deliverables.map((deliverable) => (
                      <div
                        key={deliverable.label}
                        className={cn(
                          "bg-ink p-5",
                          deliverable.pending && "hatch border border-dashed border-line-strong",
                        )}
                      >
                        <dt className="label text-bone">{deliverable.label}</dt>
                        <dd className="mt-3 text-sm leading-relaxed text-muted">
                          {deliverable.detail}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>

                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="label mt-8 inline-flex items-center gap-2 text-bone transition-colors hover:text-accent"
                  >
                    View source <span aria-hidden="true">↗</span>
                  </a>
                ) : null}
              </article>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
