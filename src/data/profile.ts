import type { Profile } from "./types";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const profile: Profile = {
  name: "Tristan Lincoln Niekerk",
  role: "Technical Director & Software Developer",
  summary:
    "I build full-stack web systems, interactive 3D applications, and VR training simulations. 15 years writing production code across React/Next.js, .NET, Unreal Engine, and Unity. Currently contracting on architecture, 3D web, and simulation projects.",
  email: "tristanniekerk@gmail.com",
  github: "https://github.com/Tristan0703",
  repository: "https://github.com/Tristan0703/Tristan-portfolio",
  availability: "Open to contract engagements",
  copyrightYear: "2026",
  primaryCta: {
    label: "View Repositories",
    href: "https://github.com/Tristan0703",
    external: true,
  },
  secondaryCta: {
    label: "Review Technical Scopes",
    href: "/scopes",
    external: false,
  },
  metaDescription:
    "Technical Director and Software Developer building full-stack web infrastructure, interactive 3D systems, and VR training simulations. 15 years production experience across React, .NET, Unreal Engine, and Unity.",
};
