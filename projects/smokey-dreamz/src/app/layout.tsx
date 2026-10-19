import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const SITE_URL = "https://smokey-dreamz.co.za";

export const metadata: Metadata = {
  title: {
    default: "Smokey Dreamz | Premium Cannabis Experience",
    template: "%s | Smokey Dreamz",
  },
  description: "Johannesburg's premier destination for bespoke cannabis products. Curated strains, exceptional quality, private membership.",
  keywords: ["cannabis", "Johannesburg", "premium cannabis", "cannabis dispensary", "Blairgowrie", "Randpark Ridge", "Witbank", "private membership"],
  manifest: "/manifest.json",
  icons: {
    icon: "/logo.png",
    apple: "/SDLogo.png",
  },
  openGraph: {
    title: "Smokey Dreamz | Premium Cannabis Experience",
    description: "Johannesburg's premier destination for bespoke cannabis products. Curated strains, exceptional quality.",
    url: SITE_URL,
    siteName: "Smokey Dreamz",
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smokey Dreamz | Premium Cannabis Experience",
    description: "Johannesburg's premier destination for bespoke cannabis products.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#c5a059",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col antialiased">
      <ServiceWorkerRegistration />
      {children}
      </body>
    </html>
  );
}