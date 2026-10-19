import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smokey Dreamz Blairgowrie | Fairy Crescent - Boutique Fabrics & Private Membership",
  description: "Whimsical cannabis experience in Blairgowrie, Johannesburg. Step into our Fairy Crescent location — ethereal lighting and soft botanical touches. Boutique fabrics, curated strains, private membership club.",
  keywords: ["Blairgowrie cannabis", "Fairy Crescent", "cannabis dispensary Johannesburg", "boutique fabrics", "private membership", "premium cannabis Blairgowrie"],
  openGraph: {
    title: "Smokey Dreamz Blairgowrie | Fairy Crescent",
    description: "Where Whimsy Meets Wonder — Boutique Fabrics & Private Membership in Blairgowrie, Johannesburg.",
    locale: "en_ZA",
    type: "website",
  },
};

export default function BlairgowrieLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
