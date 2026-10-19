import { projects } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectCard } from "./ProjectCard";

const spans: Record<string, string> = {
  "booking-architecture": "lg:col-span-7",
  "vr-training-modules": "lg:col-span-5",
  "retail-workflow-systems": "lg:col-span-5",
  "interactive-game-mechanics": "lg:col-span-7",
  "heavy-hitters": "lg:col-span-12",
};

export function ProjectGrid() {
  return (
    <section id="work" className="border-b border-line py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1220px] px-6">
        <SectionHeader
          index="02"
          title="Featured Engineering"
          description="Shipped systems, proofs of concept, and client work. Each entry links to its source where the code is public."
          id="work-title"
        />

        <div className="mt-10 grid grid-cols-1 gap-px border border-line bg-line lg:grid-cols-12">
          {projects.map((project, index) => (
            <Reveal
              key={project.slug}
              delay={index * 0.05}
              className={spans[project.slug] ?? "lg:col-span-6"}
            >
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>

        <p className="label mt-6 text-muted">
          Client deliverables for Heavy Hitters are pending publication.
        </p>
      </div>
    </section>
  );
}
