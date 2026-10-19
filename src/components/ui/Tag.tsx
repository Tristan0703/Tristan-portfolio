import { cn } from "@/lib/cn";

export function Tag({ children, className }: { children: string; className?: string }) {
  return (
    <span
      className={cn(
        "label inline-flex items-center border border-line px-2.5 py-1.5 text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
