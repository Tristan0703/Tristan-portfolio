import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership Dashboard",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MembershipLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
