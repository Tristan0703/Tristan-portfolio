import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile",
  robots: {
    index: false,
    follow: false,
  },
};

export default function EditLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
