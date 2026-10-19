import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "booking-architecture",
    index: "01",
    title: "Proof-of-Concept Booking Architecture",
    description:
      "Designed the application architecture, PostgreSQL schema, and booking funnel for a proof-of-concept platform. Built React frontend with route-level separation between catalogue and booking flows. Automated workflow transitions for selection, scheduling, and confirmation.",
    stack: ["React", "PostgreSQL", "TypeScript", "Full-Stack"],
    status: "shipped",
    repoPath: "projects/k-and-r-thread",
    year: "2026",
  },
  {
    slug: "vr-training-modules",
    index: "02",
    title: "VR Training Modules (Construction & Mining)",
    description:
      "Building immersive VR training simulations for construction safety and mining substation operations. Custom interaction mechanics in Unreal Engine 5 and Unity — hazard identification, procedure training, and assessment systems. Cross-engine architecture sharing mechanic logic between UE5 (high-fidelity) and Unity (portable builds).",
    stack: ["Unreal Engine 5", "Unity", "C#", "Blueprints", "VR", "OpenXR"],
    status: "in-development",
    year: "2026",
  },
  {
    slug: "retail-workflow-systems",
    index: "03",
    title: "Retail Workflow Platform (Smokey Dreamz)",
    description:
      "Multi-branch retail operations platform on Next.js/Supabase. Branch-aware routing, POS integration bridging till software to digital platform, PWA for floor staff. Automated fulfillment and stock rules, per-branch configuration and reporting.",
    stack: ["Next.js", "Supabase", "PostgreSQL", "PWA", "TypeScript", "POS Integration"],
    status: "shipped",
    repoPath: "projects/smokey-dreamz",
    year: "2026",
  },
  {
    slug: "interactive-game-mechanics",
    index: "04",
    title: "Interactive Game Mechanics",
    description:
      "Custom gameplay systems: BPM-synced spawn scheduler for a rhythm roguelike (C# timing system decoupled from rendering), and mobile-first UI architecture for a liquid sorting puzzle (touch layout, state management, container validation logic).",
    stack: ["C#", "Unity", "Game Architecture", "Mobile UI"],
    status: "in-development",
    year: "2026",
  },
  {
    slug: "heavy-hitters",
    index: "05",
    title: "Heavy Hitters — Remote Desktop System",
    description:
      "Remote desktop pairing .NET 8 Windows host with React Native client over NetBird mesh. Custom screen capture pipeline, adaptive WebP encoding, input injection back into Windows host. Authentication and session coordination across both ends.",
    stack: [".NET 8", "C#", "React Native", "NetBird", "WebP", "WebSocket"],
    status: "reserved",
    repoPath: "projects/pc-dev-remote",
    year: "2026",
  },
];

export function projectRepoUrl(repoPath: string, repositoryBase: string): string {
  return `${repositoryBase}/tree/main/${repoPath}`;
}
