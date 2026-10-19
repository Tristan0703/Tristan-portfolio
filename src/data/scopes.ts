import type { Scope } from "./types";

export const scopes: Scope[] = [
  {
    slug: "booking-architecture",
    title: "Proof-of-Concept Booking Architecture",
    summary:
      "A booking platform proof of concept covering application architecture, relational schema design, and an end-to-end digital booking funnel.",
    objectives: [
      "Define the web application architecture that supports the booking funnel end to end.",
      "Model the relational schema for products, availability, and reservations.",
      "Automate the workflow between selection, scheduling, and confirmation.",
      "Reduce friction at each step of the user booking experience.",
    ],
    architecture: [
      "React application layer with route-level separation between catalogue and booking flows.",
      "PostgreSQL schema for products, availability windows, and bookings with referential integrity.",
      "Automated workflow steps triggered on booking state transitions.",
      "Product schema designed for extension as the catalogue grows.",
    ],
    deliverables: [
      { label: "Application architecture", detail: "Route map, component boundaries, and data flow." },
      { label: "Database schema", detail: "Tables, keys, constraints, and migration strategy." },
      { label: "Booking funnel", detail: "Selection, scheduling, and confirmation flow." },
      { label: "Automated workflows", detail: "State-driven transitions and notifications." },
    ],
    status: "shipped",
  },
  {
    slug: "vr-training-modules",
    title: "Virtual Reality Training Modules",
    summary:
      "Immersive 3D and VR training products for construction safety and mining substation simulation work, built around custom interaction mechanics.",
    objectives: [
      "Recreate high-risk construction and mining environments as repeatable training simulations.",
      "Implement custom mechanics for interaction, assessment, and progression.",
      "Deliver the same training intent across Unreal Engine 5 and Unity pipelines.",
      "Keep environments interactive rather than scripted walkthroughs.",
    ],
    architecture: [
      "Unreal Engine 5 for high-fidelity environment and lighting passes.",
      "Unity for portable training builds and lighter hardware targets.",
      "Custom interaction mechanics layered over environment geometry.",
      "Interactive environment states driven by trainee actions.",
    ],
    deliverables: [
      { label: "Construction safety module", detail: "Hazard identification and procedure training." },
      { label: "Mining substation simulation", detail: "Substation walkthrough and operating procedure training." },
      { label: "Custom mechanics", detail: "Interaction, feedback, and progression systems." },
      { label: "Build targets", detail: "UE5 and Unity deployment profiles." },
    ],
    status: "in-development",
  },
  {
    slug: "retail-workflow-systems",
    title: "Retail Workflow Systems",
    summary:
      "Retail technical workflows and operations management, integrating business logic into daily fulfilment and enterprise management.",
    objectives: [
      "Map daily retail operations into defined technical workflows.",
      "Integrate business logic directly into fulfilment and stock management.",
      "Give management a single operational view across branches.",
      "Reduce manual handling in recurring daily processes.",
    ],
    architecture: [
      "Next.js application layer with branch-aware routing.",
      "Supabase-backed operational data for products, members, and visits.",
      "Point-of-sale integration bridging till software to the digital platform.",
      "Progressive web app delivery for staff devices on the floor.",
    ],
    deliverables: [
      { label: "Workflow definition", detail: "Documented daily operating procedures." },
      { label: "Business logic integration", detail: "Fulfilment and stock rules embedded in the platform." },
      { label: "Branch operations", detail: "Per-branch configuration and reporting." },
      { label: "POS bridge", detail: "Automated synchronisation from till software to the platform." },
    ],
    status: "shipped",
  },
  {
    slug: "interactive-game-mechanics",
    title: "Interactive Game Mechanics",
    summary:
      "Custom gameplay logic spanning BPM-synced spawning for a rhythm roguelike and UI architecture for a mobile liquid sorting puzzle.",
    objectives: [
      "Drive rhythm roguelike spawn logic directly from track tempo.",
      "Build UI architecture that holds up on mobile touch targets.",
      "Separate mechanic logic from presentation so systems stay testable.",
      "Keep input latency low enough for timing-critical play.",
    ],
    architecture: [
      "C# gameplay layer with timing systems decoupled from rendering.",
      "BPM-synced spawn scheduler for the rhythm roguelike.",
      "Mobile-first UI architecture for the liquid sorting puzzle.",
      "State-driven interaction contracts between gameplay and interface.",
    ],
    deliverables: [
      { label: "BPM spawn system", detail: "Tempo-locked spawning and pattern scheduling." },
      { label: "Roguelike run logic", detail: "Progression and encounter structure." },
      { label: "Mobile UI architecture", detail: "Touch layout, state, and feedback systems." },
      { label: "Sorting puzzle logic", detail: "Container state model and move validation." },
    ],
    status: "in-development",
  },
  {
    slug: "heavy-hitters",
    title: "Heavy Hitters (Client Work)",
    summary:
      "A remote desktop system pairing a .NET/C# Windows host with a React Native client over a private mesh network.",
    objectives: [
      "Establish a private network path between host and client devices.",
      "Capture, encode, and transport the host screen with controlled latency.",
      "Inject remote input back into the Windows host.",
      "Keep the client usable on mobile hardware.",
    ],
    architecture: [
      ".NET 8 host application with screen capture, encoding, and input services.",
      "React Native client with a dedicated remote view screen.",
      "NetBird mesh networking for private host-to-client connectivity.",
      "Authentication and session coordination between both ends.",
    ],
    deliverables: [
      { label: "Host application", detail: ".NET/C# capture, encode, and input services." },
      { label: "Mobile client", detail: "React Native remote view and connection flow." },
      { label: "Network layer", detail: "NetBird mesh connectivity and session routing." },
      { label: "Deliverables pending", detail: "Client-specific scope to be published.", pending: true },
    ],
    status: "reserved",
  },
];
