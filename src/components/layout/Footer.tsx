import { SITE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-6xl px-6 pb-10 pt-12 text-sm text-foreground-muted">
      <div className="glass flex flex-col items-center justify-between gap-3 rounded-2xl px-6 py-5 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {SITE.author}
        </span>
        <span className="font-mono text-xs">
          built with Next.js · TypeScript · Tailwind
        </span>
      </div>
    </footer>
  );
}
