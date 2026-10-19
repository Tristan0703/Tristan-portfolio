import type { Project } from "./types";

export const projects: Project[] = [
  {
    slug: "booking-architecture",
    index: "01",
    title: "Proof-of-Concept Booking Architecture",
    description:
      "I engineered the web application architectures, database schemas, and digital booking funnels. I designed automated workflows and product schemas to optimize the user booking experience.",
    stack: ["React", "PostgreSQL", "Full-Stack"],
    status: "shipped",
    repoPath: "projects/k-and-r-thread",
    year: "2026",
  },
  {
    slug: "vr-training-modules",
    index: "02",
    title: "Virtual Reality Training Modules",
    description:
      "I build immersive 3D and VR products for construction safety training and mining substation simulations, utilizing custom mechanics and interactive environments.",
    stack: ["UE5", "Unity", "VR"],
    status: "in-development",
    year: "2026",
  },
  {
    slug: "retail-workflow-systems",
    index: "03",
    title: "Retail Workflow Systems",
    description:
      "I formulated retail technical workflows and managed operations, integrating business logic to streamline daily fulfillment and enterprise management.",
    stack: ["Systems Architecture", "Retail Tech"],
    status: "shipped",
    repoPath: "projects/smokey-dreamz",
    year: "2026",
  },
  {
    slug: "interactive-game-mechanics",
    index: "04",
    title: "Interactive Game Mechanics",
    description:
      "I developed custom logic including BPM-synced spawning for a rhythm roguelike and UI architecture for a mobile liquid sorting puzzle game.",
    stack: ["C#", "Game Design"],
    status: "in-development",
    year: "2026",
  },
  {
    slug: "heavy-hitters",
    index: "05",
    title: "Heavy Hitters (Client Work)",
    description:
      "I built a remote desktop system pairing a .NET/C# Windows host with a React Native client, routing sessions over a private NetBird mesh network with custom screen capture, encoding, and input services.",
    stack: [".NET", "C#", "React Native", "NetBird"],
    status: "reserved",
    repoPath: "projects/pc-dev-remote",
    year: "2026",
  },
];

export function projectRepoUrl(repoPath: string, repositoryBase: string): string {
  return `${repositoryBase}/tree/main/${repoPath}`;
}
