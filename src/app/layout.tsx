import type { Metadata } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { profile, siteUrl } from "@/data/profile";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.role} — ${profile.name}`,
    template: `%s — ${profile.name}`,
  },
  description: profile.metaDescription,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: profile.github }],
  creator: profile.name,
  keywords: [
    "technical director",
    "software developer",
    "full-stack architecture",
    "virtual reality",
    "Three.js",
    "Unreal Engine 5",
    "Unity",
    "PostgreSQL",
    "Supabase",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: `${profile.role} — ${profile.name}`,
    description: profile.metaDescription,
    siteName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.role} — ${profile.name}`,
    description: profile.metaDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  description: profile.metaDescription,
  email: `mailto:${profile.email}`,
  url: siteUrl,
  sameAs: [profile.github],
  knowsAbout: [
    "Full-stack web architecture",
    "Interactive visual systems",
    "Virtual reality software development",
    "Three.js",
    "Unreal Engine 5",
    "Unity",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="label sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:border focus:border-accent focus:bg-ink focus:px-4 focus:py-3 focus:text-accent"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
