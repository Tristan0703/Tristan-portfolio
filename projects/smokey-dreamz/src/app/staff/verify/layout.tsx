import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Verification",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StaffVerifyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
