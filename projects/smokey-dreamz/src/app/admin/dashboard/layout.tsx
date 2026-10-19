import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Randpark Daily Log",
  description: "Real-time sales, inventory, and daily log for Smokey Dreamz Randpark Ridge branch.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
