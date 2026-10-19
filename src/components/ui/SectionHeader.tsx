import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

interface SectionHeaderProps {
  index: string;
  title: string;
  description?: ReactNode;
  id?: string;
}

export function SectionHeader({ index, title, description, id }: SectionHeaderProps) {
  return (
    <Reveal className="border-b border-line pb-8">
      <p className="label text-accent">
        {index} / {title}
      </p>
      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2
          id={id}
          className="font-display text-3xl leading-[1.05] tracking-tight text-bone sm:text-4xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="max-w-md text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
    </Reveal>
  );
}
