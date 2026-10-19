import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Menu | Premium Cannabis Strains & Edibles",
  description: "Explore our curated collection of premium cannabis strains, edibles, and boutique products. Boutique flower, premium strains, infused edibles — inquire for pricing.",
  keywords: ["cannabis menu", "cannabis strains", "premium cannabis", "edibles", "boutique flower", "cannabis Johannesburg", "Smokey Dreamz menu"],
  openGraph: {
    title: "Menu | Smokey Dreamz - Premium Cannabis Products",
    description: "Explore our curated collection of premium cannabis strains, edibles, and boutique products.",
    type: "website",
  },
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
