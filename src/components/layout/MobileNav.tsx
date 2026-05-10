/**
 * MobileNav — hamburger button + slide-down drawer for small screens.
 *
 * Why client component?
 *   It manages open/closed state with `useState`, which only exists at runtime
 *   in the browser. Server components can't use React hooks like useState.
 *
 * Concept showcase:
 *  - **`useState<T>`** — generic hook. The `<boolean>` annotation is optional
 *    here (TS infers from `false`) but shown for clarity.
 *  - **`AnimatePresence`** — Framer Motion component that animates children
 *    *out* when they unmount. Without it, removing the drawer from the DOM
 *    would skip the exit animation.
 *  - **Conditional rendering with `&&`** — `{open && <X />}` renders nothing
 *    when `open` is false.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/constants";

export function MobileNav() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full glass text-foreground"
      >
        {/* Render the right icon based on state. Inline if/else with ternary. */}
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            // Animations on enter, exit, and active state.
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass absolute left-4 right-4 top-16 z-40 rounded-2xl p-4"
          >
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-foreground-muted transition hover:bg-white/5 hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
