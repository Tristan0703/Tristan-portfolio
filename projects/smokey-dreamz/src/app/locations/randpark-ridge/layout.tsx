import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smokey Dreamz Randpark Ridge | Private Members Club",
  description: "Smokey Dreamz Randpark Ridge — an exclusive private members cannabis club. Tranquil organic sanctuary in Randpark Ridge, Johannesburg. Curated strains, exceptional quality, members-only access.",
  keywords: ["private cannabis club", "Randpark Ridge", "Smokey Dreamz members", "premium cannabis Johannesburg", "exclusive cannabis club", "members-only dispensary"],
  openGraph: {
    title: "Smokey Dreamz Randpark Ridge | Private Members Club",
    description: "An exclusive private members cannabis club in Randpark Ridge, Johannesburg. Curated strains, exceptional quality, members-only access.",
    locale: "en_ZA",
    type: "website",
  },
};

export default function RandparkRidgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
