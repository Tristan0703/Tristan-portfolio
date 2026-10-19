import type { Profile } from "./types";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const profile: Profile = {
  name: "Tristan Lincoln Niekerk",
  role: "Technical Director & Software Developer",
  summary:
    "I architect immersive environments and engineer digital architectures that solve real-world operational challenges. I specialize in full-stack web infrastructure, interactive visual systems, and virtual reality software development.",
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
    "Technical Director and Software Developer building full-stack web infrastructure, interactive visual systems, and virtual reality software for real-world operational challenges.",
};
