import Link from "next/link";
import { NAV_LINKS, SITE } from "@/lib/constants";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full glass px-5 py-2.5 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm tracking-tight text-foreground"
        >
          <span className="text-gradient font-semibold">{SITE.name}</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-foreground-muted sm:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          className="rounded-full bg-accent-cyan/15 px-4 py-1.5 text-xs font-medium text-accent-cyan ring-1 ring-accent-cyan/30 transition hover:bg-accent-cyan/25"
        >
          Hire me
        </Link>
      </div>
    </header>
  );
}
