import type { ArsenalGroup } from "./types";

export const arsenal: ArsenalGroup[] = [
  {
    id: "web-core",
    index: "01",
    category: "Web & Core",
    items: [
      "TypeScript",
      "JavaScript",
      "Python",
      "C#",
      "React",
      "Next.js",
      "HTML5",
      "CSS3",
      "Tailwind CSS",
    ],
  },
  {
    id: "backend-data",
    index: "02",
    category: "Backend & Data",
    items: ["PostgreSQL", "Supabase"],
  },
  {
    id: "engines-3d",
    index: "03",
    category: "Engines & 3D",
    items: ["Unreal Engine 5", "Unity", "Three.js", "A-Frame", "Cinemachine", "Meshy"],
  },
  {
    id: "environment-networking",
    index: "04",
    category: "Environment & Networking",
    items: ["OpenCode", "Ollama", "Qwen", "NetBird"],
  },
];

export const arsenalTicker: string[] = arsenal.flatMap((group) => group.items);
