import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Member Card",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
