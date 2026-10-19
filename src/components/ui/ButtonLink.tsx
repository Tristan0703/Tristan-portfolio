import Link from "next/link";
import { cn } from "@/lib/cn";

interface ButtonLinkProps {
  href: string;
  children: string;
  external?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

const base =
  "label inline-flex items-center gap-2.5 border px-5 py-3.5 transition-colors duration-200";

const variants = {
  primary: "border-accent bg-accent text-ink hover:bg-bone hover:border-bone",
  secondary: "border-line text-bone hover:border-accent hover:text-accent",
} as const;

export function ButtonLink({
  href,
  children,
  external = false,
  variant = "secondary",
  className,
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], className);

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={classes}>
        {children}
        <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
