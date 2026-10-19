import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locations | Smokey Dreamz - 5 Branches Across Gauteng & Mpumalanga",
  description: "Visit any of our 5 Smokey Dreamz branches across Johannesburg and Mpumalanga. Blairgowrie, Randpark Ridge, Witbank, Albertskroon, and Bronkhorstspruit.",
  keywords: ["cannabis locations", "cannabis dispensary Johannesburg", "cannabis Witbank", "cannabis Mpumalanga", "Blairgowrie", "Randpark Ridge", "Smokey Dreamz branches"],
  openGraph: {
    title: "Locations | Smokey Dreamz - 5 Branches",
    description: "Visit any of our 5 Smokey Dreamz branches across Johannesburg and Mpumalanga.",
    type: "website",
  },
};

export default function LocationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
