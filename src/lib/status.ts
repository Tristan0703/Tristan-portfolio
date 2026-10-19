import type { ProjectStatus } from "@/data/types";

export const statusLabel: Record<ProjectStatus, string> = {
  shipped: "Shipped",
  "in-development": "In development",
  reserved: "Awaiting deliverables",
};

export const statusStyle: Record<ProjectStatus, string> = {
  shipped: "border-accent-dim text-accent",
  "in-development": "border-line-strong text-bone",
  reserved: "border-dashed border-line-strong text-muted",
};
