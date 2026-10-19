import Link from "next/link";
import { Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { GithubIcon } from "@/components/ui/GithubIcon";

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="label text-bone">
            TLN<span className="text-accent">/</span>
          </span>
          <span className="label text-muted">
            © {profile.copyrightYear} {profile.name}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <a
            href={`mailto:${profile.email}`}
            className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-accent"
          >
            <Mail aria-hidden="true" className="h-4 w-4" />
            {profile.email}
          </a>
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer noopener"
            className="label inline-flex items-center gap-2 text-muted transition-colors hover:text-accent"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
          <Link
            href="/#top"
            className="label text-muted transition-colors hover:text-accent"
          >
            Back to top ↑
          </Link>
        </div>
      </div>
    </footer>
  );
}
