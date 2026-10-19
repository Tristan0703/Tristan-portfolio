import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1220px] flex-col justify-center px-6 pb-24 pt-40">
      <p className="label text-accent">404 / Route not found</p>
      <h1 className="mt-6 font-display text-4xl tracking-tight text-bone sm:text-5xl">
        No component mounted at this path
      </h1>
      <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted">
        The requested route does not exist. Return to the portfolio index to continue.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="label inline-flex items-center gap-2.5 border border-line px-5 py-3.5 text-bone transition-colors hover:border-accent hover:text-accent"
        >
          Return to index <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
