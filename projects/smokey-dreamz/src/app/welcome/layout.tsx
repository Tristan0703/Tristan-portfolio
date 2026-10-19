import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome | Smokey Dreamz - Join Our Private Membership",
  description: "Join Smokey Dreamz private membership for exclusive access to premium cannabis, curated strains, and members-only experiences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
