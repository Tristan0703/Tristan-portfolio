export interface Cta {
  label: string;
  href: string;
  external: boolean;
}

export interface Profile {
  name: string;
  role: string;
  summary: string;
  email: string;
  github: string;
  repository: string;
  availability: string;
  copyrightYear: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  metaDescription: string;
}

export interface ArsenalGroup {
  id: string;
  index: string;
  category: string;
  items: string[];
}

export type ProjectStatus = "shipped" | "in-development" | "reserved";

export interface Project {
  slug: string;
  index: string;
  title: string;
  description: string;
  stack: string[];
  status: ProjectStatus;
  repoPath?: string;
  year: string;
}

export interface ScopeDeliverable {
  label: string;
  detail: string;
  pending?: boolean;
}

export interface Scope {
  slug: string;
  title: string;
  summary: string;
  objectives: string[];
  architecture: string[];
  deliverables: ScopeDeliverable[];
  status: ProjectStatus;
}
