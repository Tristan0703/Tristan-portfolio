import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Smokey Dreamz Witbank | Retro Arcade - Private Membership & Premium Cannabis",
  description: "80s Neon dreamscape cannabis experience in Witbank, Mpumalanga. Where synthwave meets premium cannabis in an arcade wonderland. Private membership club, curated strains.",
  keywords: ["Witbank cannabis", "Retro Arcade", "cannabis Mpumalanga", "private membership", "premium cannabis Witbank", "boutique fabrics"],
  openGraph: {
    title: "Smokey Dreamz Witbank | Retro Arcade",
    description: "Insert Coin to Dream — Private Membership & Premium Cannabis in Witbank, Mpumalanga.",
    locale: "en_ZA",
    type: "website",
  },
};

export default function WitbankLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
