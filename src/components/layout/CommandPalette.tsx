/**
 * CommandPalette — keyboard-first navigation overlay (⌘K / Ctrl+K).
 *
 * What this file does
 *   Renders a single overlay, mounted once in the root layout, that opens
 *   when the user presses ⌘K (mac) or Ctrl+K (win/linux) — or when any
 *   button on the page asks it to open. Inside, a search input filters a
 *   typed list of "actions" (navigate, copy email, open social, etc.).
 *   Arrow keys move the highlight, Enter runs the action, Esc closes.
 *
 * Why a CLIENT component?
 *   We use `useState`, `useEffect`, and listen for browser keyboard events.
 *   Server components have no `window`, no React state, no event handlers,
 *   so this whole tree must hydrate in the browser. The "use client"
 *   directive at the top of the file marks the boundary — anything Next.js
 *   imports from here downstream is also client-rendered.
 *
 * Concepts demonstrated
 *  - **"use client"** boundary (vs the default Server Component).
 *  - **Discriminated union types** for actions (`type: "link" | "external" | "fn"`).
 *  - **`useEffect` cleanup** (return a function that removes the listener).
 *  - **`useMemo`** to avoid re-filtering on every render.
 *  - **`useRef<HTMLInputElement | null>`** — typed DOM ref.
 *  - **AnimatePresence** for enter/exit animations on conditional render.
 *  - **Custom DOM events** as a tiny pub/sub between unrelated components.
 *
 * Wiring choice — custom events vs Context
 *   Two parts of the UI need to OPEN this palette: the global ⌘K shortcut
 *   (handled inside this file) AND the small "⌘K" button in the Navbar.
 *   The Navbar is a sibling, not a parent, so prop-drilling won't work.
 *
 *   Two reasonable options:
 *     (a) React Context — a `<PaletteProvider>` that exposes `setOpen`
 *         to any child via `usePalette()`. Idiomatic, but more files and
 *         more concepts (Provider, Consumer, custom hook).
 *     (b) Custom DOM events — `window.dispatchEvent(new Event("palette:open"))`
 *         from anywhere; this component listens with `addEventListener`.
 *         Zero shared imports, no Provider tree, decoupled.
 *
 *   I chose (b) for this learning codebase because it's a single concept
 *   ("the window is a global event bus") and reads top-to-bottom in ONE
 *   file. The trade-off: events are stringly-typed — a typo in the event
 *   name fails silently. We export the constant `PALETTE_OPEN_EVENT` so
 *   the Navbar imports it instead of hardcoding the string.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Command as CommandIcon,
  CornerDownLeft,
  Download,
  ExternalLink,
  Home,
  Mail,
  Phone,
  Search,
} from "lucide-react";
import { SITE, SOCIALS } from "@/lib/constants";

/**
 * Public event name. Other components import THIS — not the string literal —
 * so a rename here propagates automatically (and TS won't let callers typo).
 */
export const PALETTE_OPEN_EVENT = "palette:open";

/**
 * One palette action. Discriminated union via the `type` field:
 *   - "link"     → internal route, push via Next router.
 *   - "external" → outbound URL, open in a new tab.
 *   - "fn"       → arbitrary side-effect (copy to clipboard, etc.).
 *
 * The compiler narrows on `type` inside `runAction` below, so we get
 * autocomplete for `href` only on link/external and for `run` only on fn.
 */
type Action =
  | {
      id: string;
      label: string;
      hint: string;
      keywords: ReadonlyArray<string>;
      icon: React.ComponentType<{ className?: string }>;
      type: "link";
      href: string;
    }
  | {
      id: string;
      label: string;
      hint: string;
      keywords: ReadonlyArray<string>;
      icon: React.ComponentType<{ className?: string }>;
      type: "external";
      href: string;
    }
  | {
      id: string;
      label: string;
      hint: string;
      keywords: ReadonlyArray<string>;
      icon: React.ComponentType<{ className?: string }>;
      type: "fn";
      run: () => void | Promise<void>;
    };

/**
 * Best-effort clipboard write. `navigator.clipboard` is async and can fail
 * (insecure context, permission denied) — we swallow errors so the palette
 * never throws into the React tree. A real app would surface a toast.
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // No-op. Clipboard can be unavailable in iframes / non-HTTPS dev origins.
  }
}

/**
 * Build the action list. Defined OUTSIDE the component so the array
 * identity is stable across renders (cheap memoization without useMemo).
 *
 * Note: actions that need the Next router (`/projects`, `/contact`) are
 * "link" types — the component reads `href` and calls `router.push`.
 * Actions that need a side-effect (clipboard, window.open) are "fn".
 */
const ACTIONS: ReadonlyArray<Action> = [
  {
    id: "home",
    label: "Go home",
    hint: "/",
    keywords: ["home", "landing", "index", "/"],
    icon: Home,
    type: "link",
    href: "/",
  },
  {
    id: "projects",
    label: "View projects",
    hint: "/projects",
    keywords: ["projects", "work", "portfolio", "case studies"],
    icon: Briefcase,
    type: "link",
    href: "/projects",
  },
  {
    id: "services",
    label: "View services",
    hint: "/services",
    keywords: ["services", "offerings", "consulting"],
    icon: Briefcase,
    type: "link",
    href: "/services",
  },
  {
    id: "about-me",
    label: "Meet the engineer",
    hint: "/about-me",
    keywords: ["about", "bio", "resume", "cv", "engineer", "shamar"],
    icon: Briefcase,
    type: "link",
    href: "/about-me",
  },
  {
    id: "contact",
    label: "Contact",
    hint: "/contact",
    keywords: ["contact", "hire", "reach out", "message"],
    icon: Mail,
    type: "link",
    href: "/contact",
  },
  {
    id: "copy-email",
    label: "Copy email",
    hint: SITE.email,
    keywords: ["email", "copy", "clipboard", "mail"],
    icon: Mail,
    type: "fn",
    run: () => copyToClipboard(SITE.email),
  },
  {
    id: "copy-phone",
    label: "Copy phone",
    hint: SITE.phone,
    keywords: ["phone", "call", "telephone", "number", "copy"],
    icon: Phone,
    type: "fn",
    run: () => copyToClipboard(SITE.phone),
  },
  {
    id: "github",
    label: "Open GitHub",
    hint: "github.com/ShTPDev",
    keywords: ["github", "code", "repos", "source"],
    icon: ExternalLink,
    type: "external",
    href: SOCIALS.github,
  },
  {
    id: "linkedin",
    label: "Open LinkedIn",
    hint: "linkedin.com",
    keywords: ["linkedin", "resume", "professional", "social"],
    icon: ExternalLink,
    type: "external",
    href: SOCIALS.linkedin,
  },
  {
    id: "company",
    label: "Open M3M3 Development",
    hint: "m3m3development.com",
    keywords: ["m3m3", "company", "agency", "business"],
    icon: ExternalLink,
    type: "external",
    href: SOCIALS.company,
  },
  // Résumé + CV both live on the /about-me page. The page has the embedded
  // preview AND the actual download button at the top of each section, so
  // routing the user there gives them context + control. The hash anchors
  // (`#resume`, `#cv`) are wired on the corresponding <Section id="..." />
  // elements in src/app/about-me/page.tsx.
  {
    id: "resume",
    label: "View résumé",
    hint: "/about-me#resume",
    keywords: ["resume", "preview", "download", "pdf", "one-pager"],
    icon: Download,
    type: "link",
    href: "/about-me#resume",
  },
  {
    id: "cv",
    label: "View CV",
    hint: "/about-me#cv",
    keywords: ["cv", "curriculum", "vitae", "long-form", "cover letter", "pdf"],
    icon: Download,
    type: "link",
    href: "/about-me#cv",
  },
];

export function CommandPalette() {
  // `open` controls whether the modal is mounted at all.
  const [open, setOpen] = useState<boolean>(false);
  // The current search query. Empty string = show all actions.
  const [query, setQuery] = useState<string>("");
  // Index of the highlighted row inside the FILTERED list.
  const [highlight, setHighlight] = useState<number>(0);

  // Typed DOM ref. `null` initial value matches React's runtime behavior
  // before the element mounts; the union `| null` is required by TS.
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Next's client-side router — used to navigate "link" actions without
  // a full page reload (preserves the SPA feel).
  const router = useRouter();

  /**
   * Open / close helpers. Centralizing the "open" path means we do the
   * query/highlight reset in ONE place — rather than chasing it through
   * multiple `useEffect` blocks. This also keeps our effects free of
   * `setState` calls (which the React 19 lint rule forbids: a setState
   * inside an effect body triggers a cascading render).
   */
  function openPalette(): void {
    setQuery("");
    setHighlight(0);
    setOpen(true);
  }
  function closePalette(): void {
    setOpen(false);
  }
  function togglePalette(): void {
    // Functional update — `v` is the previous value. Avoids stale-closure
    // bugs when this is called from an event listener registered once.
    setOpen((v) => {
      if (!v) {
        // Opening: reset state. Calling setState from a setState updater
        // is unusual but legal here because we want a single atomic flip.
        setQuery("");
        setHighlight(0);
      }
      return !v;
    });
  }

  /**
   * Global keyboard listener: ⌘K / Ctrl+K toggles the palette from
   * anywhere on the page. Mounted once via useEffect, cleaned up on
   * unmount so we don't leak listeners between hot reloads.
   */
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent): void {
      // `e.metaKey` is the Mac ⌘ key; `e.ctrlKey` covers Windows/Linux.
      const isToggle = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isToggle) {
        e.preventDefault(); // browsers map ⌘K to "focus address bar" — block it.
        togglePalette();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    // Cleanup: returned function runs on unmount or before the next effect.
    return () => window.removeEventListener("keydown", onKeyDown);
    // togglePalette is a stable closure over setOpen/setQuery/setHighlight,
    // all of which React guarantees are stable, so [] is correct.
  }, []);

  /**
   * Custom-event listener: any other component can dispatch
   *   window.dispatchEvent(new Event(PALETTE_OPEN_EVENT))
   * to open the palette. Used by the small ⌘K button in the Navbar.
   */
  useEffect(() => {
    function onOpen(): void {
      openPalette();
    }
    window.addEventListener(PALETTE_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(PALETTE_OPEN_EVENT, onOpen);
  }, []);

  /**
   * Side-effects tied to open/closed state: focus the input on open,
   * lock body scroll while open. NO setState calls here — those live in
   * `openPalette` / `togglePalette` so this effect stays "synchronize
   * external system" only (which is exactly what effects are for).
   */
  useEffect(() => {
    if (open) {
      // Defer focus to next animation frame so the input has actually mounted.
      // requestAnimationFrame waits one paint; queueMicrotask is too early.
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /**
   * Filter the action list by query. `useMemo` caches the result and only
   * recomputes when `query` changes — important because the filter runs
   * on every keystroke and React re-renders the whole list each time.
   *
   * Match logic: case-insensitive substring against label OR any keyword.
   */
  const filtered = useMemo<ReadonlyArray<Action>>(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return ACTIONS;
    return ACTIONS.filter((a) => {
      if (a.label.toLowerCase().includes(q)) return true;
      // `Array.prototype.some` short-circuits on the first match.
      return a.keywords.some((k) => k.toLowerCase().includes(q));
    });
  }, [query]);

  /**
   * Clamp the highlight index DURING RENDER instead of via `useEffect` +
   * `setState`. If the filter narrows the list below `highlight`, we
   * fall back to 0. Computed each render — cheap, no extra render pass,
   * no setState-in-effect lint warning.
   */
  const activeIndex =
    filtered.length === 0 ? 0 : Math.min(highlight, filtered.length - 1);

  /**
   * Run an action, then close the palette. The discriminated union means
   * TS narrows `action.type` per branch and we don't need any casts.
   */
  function runAction(action: Action): void {
    if (action.type === "link") {
      router.push(action.href);
    } else if (action.type === "external") {
      window.open(action.href, "_blank", "noopener,noreferrer");
    } else {
      // type === "fn" — `run` may be async; we don't await it here because
      // closing the palette shouldn't wait on a clipboard write.
      void action.run();
    }
    closePalette();
  }

  /**
   * Per-modal keyboard handling. Lives on the modal container so it only
   * fires while the palette is open AND focused.
   *
   * We feed the functional updater the CLAMPED current index (`activeIndex`)
   * so arrow navigation behaves correctly even when the list just shrank
   * due to filtering.
   */
  function onModalKeyDown(e: React.KeyboardEvent<HTMLDivElement>): void {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length === 0) return;
      setHighlight((activeIndex + 1) % filtered.length);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length === 0) return;
      setHighlight((activeIndex - 1 + filtered.length) % filtered.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const action = filtered[activeIndex];
      if (action) runAction(action);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        // Backdrop. Clicking it closes the palette. `role="dialog"` and the
        // aria-* props mark this as a modal for screen readers.
        <motion.div
          key="palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          // Inline style for the rgba backdrop so we don't need a Tailwind
          // arbitrary value; backdrop-blur is a Tailwind utility.
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
          className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-[18vh] backdrop-blur-sm"
          onClick={closePalette}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          {/*
            The card itself. `onClick` here calls `stopPropagation` so a
            click on the card doesn't bubble to the backdrop and close it.
            `onKeyDown` handles arrow/enter/esc while focus is anywhere
            inside the modal.
          */}
          <motion.div
            key="palette-card"
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="glass relative w-full max-w-xl overflow-hidden rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onModalKeyDown}
          >
            {/* Search row */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search aria-hidden="true" className="h-4 w-4 text-foreground-muted" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search…"
                // bg-transparent so the input inherits the glass card's blur.
                // outline-none is fine here because the modal itself has a
                // clear focus indicator (the ring on the highlighted row).
                className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
                aria-label="Search commands"
              />
            </div>

            {/* Results list */}
            <ul
              role="listbox"
              aria-label="Commands"
              className="max-h-[50vh] overflow-y-auto py-1"
            >
              {filtered.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-foreground-muted">
                  No matches for “{query}”.
                </li>
              )}
              {filtered.map((action, i) => {
                const Icon = action.icon;
                const isActive = i === activeIndex;
                return (
                  <li key={action.id}>
                    {/*
                      Using <button type="button"> instead of <li onClick>
                      so screen readers announce it as actionable and the
                      element is focusable by default. role="option" pairs
                      with the parent's role="listbox" for ARIA semantics.
                    */}
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => runAction(action)}
                      className={
                        "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors " +
                        (isActive
                          ? "bg-white/10 text-foreground"
                          : "text-foreground-muted hover:bg-white/5")
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{action.label}</span>
                      <span className="font-mono text-xs text-foreground-muted">
                        {action.hint}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Footer with kbd hints */}
            <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-2 text-[11px] text-foreground-muted">
              <div className="flex items-center gap-3">
                <KbdHint>
                  <CommandIcon className="h-3 w-3" />
                  <span>K</span>
                </KbdHint>
                <KbdHint>
                  <ArrowUp className="h-3 w-3" />
                  <ArrowDown className="h-3 w-3" />
                  <span>navigate</span>
                </KbdHint>
                <KbdHint>
                  <CornerDownLeft className="h-3 w-3" />
                  <span>select</span>
                </KbdHint>
                <KbdHint>
                  <span>esc</span>
                </KbdHint>
              </div>
              <span className="hidden sm:inline">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Tiny helper component for the keyboard-hint chips in the footer.
 * Defined in the same file because it's purely presentational and only
 * used here — splitting it out would just add an import.
 */
function KbdHint({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono">
      {children}
    </span>
  );
}
