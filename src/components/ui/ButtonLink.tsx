import Link from "next/link";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

interface ButtonLinkProps {
  href: string;
  children: string;
  external?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

const base =
  "label inline-flex items-center gap-2.5 border px-5 py-3.5 transition-all duration-200";

const variants = {
  primary: "border-accent bg-accent text-ink hover:bg-bone hover:border-bone hover:shadow-[0_0_24px_rgba(77,216,230,0.3)]",
  secondary: "border-line text-bone hover:border-accent hover:text-accent hover:bg-panel/50",
} as const;

const MotionLink = motion(Link);

export function ButtonLink({
  href,
  children,
  external = false,
  variant = "secondary",
  className,
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], className);

  const linkContent = (
    <motion.span
      whileHover={{ x: 4 }}
      whileTap={{ x: 0 }}
      transition={{ duration: 0.15 }}
    >
      {children}
      <span aria-hidden="true">{external ? "↗" : "→"}</span>
    </motion.span>
  );

  if (external) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={classes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {linkContent}
      </motion.a>
    );
  }

  return (
    <MotionLink
      href={href}
      className={classes}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {linkContent}
    </MotionLink>
  );
}
