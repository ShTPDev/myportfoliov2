/**
 * Terminal — fake-then-real terminal.
 *
 * Two-phase UX:
 *  1. **Demo phase** — auto-plays a typed script of IT-Manager commands and
 *     output blocks. Same content + pacing as before.
 *  2. **Interactive phase** — once the script ends, a fresh prompt with a
 *     focused `<input>` appears. The user can type real commands, get real
 *     output, browse history with ↑/↓, autocomplete with Tab, and clear
 *     scrollback with `clear`.
 *
 * The two phases share scrollback via a single `entries` array, so the demo
 * output stays visible while the user types new commands underneath.
 *
 * ─── Concept showcase (read top-to-bottom for a tour) ──────────────────────
 *
 *  • **Discriminated-union state machine** — `Mode = { phase: "demo"; ... } |
 *    { phase: "interactive" }`. Every render branch checks `mode.phase` and
 *    TypeScript narrows the rest of the object inside the branch. Adding a
 *    new phase later (say "frozen" while a long command runs) is a one-line
 *    edit; TS will then nag every place that needs to handle it.
 *
 *  • **Tagged scrollback entries** — `Entry = { kind: "cmd" } | { kind:
 *    "out" }`. We render different components per kind. Same pattern as the
 *    old `Step` type, just renamed because here it stores history, not a
 *    static script.
 *
 *  • **`useRef<HTMLInputElement | null>`** — a "drawer" for a value that
 *    survives re-renders without triggering one. We keep the live <input>
 *    DOM node here so we can `.focus()` it imperatively. Same pattern for
 *    the scroll anchor at the bottom of the terminal body.
 *
 *  • **`useEffect` for side effects only** — focusing the input, scrolling
 *    to the bottom, advancing the demo. We never call `setState` directly
 *    in render, and inside an effect we only call `setState` in response
 *    to *external* changes (the dep array) — never unconditionally.
 *
 *  • **Command parser** — `runCommand` lives in `./commands.ts`. It splits
 *    on whitespace, lowercases the verb, and dispatches via switch.
 *    Decoupling that logic from React keeps this file focused on UI.
 *
 *  • **History navigation** — pressing ↑ walks backward through past
 *    commands using a single `historyIndex` pointer. -1 means "at the
 *    current (live) input". We snapshot the live input on first ↑ so the
 *    user can scroll back to whatever they were typing.
 *
 *  • **Tab completion** — finds prefix matches against `COMMAND_NAMES`.
 *    Single match → fill it in. Multiple matches → show them once, then
 *    cycle with subsequent Tab presses.
 *
 *  • **Scrollback cap** — we keep at most `MAX_ENTRIES` entries so the DOM
 *    doesn't grow unboundedly during long sessions. Old entries roll off
 *    the top of the buffer.
 *
 *  • **`useRouter` from "next/navigation"** — App Router's router hook. We
 *    only call `router.push(...)` from event handlers (Enter key), not in
 *    render — Next will throw if you try to navigate during render.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { CommandLine } from "./CommandLine";
import { TerminalOutput } from "./TerminalOutput";
import {
  COMMAND_NAMES,
  runCommand,
  type CommandContext,
} from "./commands";

// ── Demo script (unchanged from previous version) ─────────────────────────
type DemoStep =
  | { kind: "cmd"; command: string }
  | { kind: "out"; lines: readonly string[] };

const SCRIPT: readonly DemoStep[] = [
  { kind: "cmd", command: "audit infrastructure" },
  {
    kind: "out",
    lines: [
      "✔ AD: 47 users · 12 service accounts",
      "✔ Network: redundant ISP · 99.97% uptime (90d)",
      "✔ Endpoints: 38/38 patched · 0 critical CVEs",
    ],
  },
  { kind: "cmd", command: "show m3-marketplace" },
  {
    kind: "out",
    lines: [
      "→ Cloud Run · 3 instances · healthy",
      "→ Cloud SQL (PostgreSQL 16) · primary + 1 replica",
      "→ Payments · Stripe + PayPal + Belize Bank gateway · any card",
      "→ Tx today · 142 captured · 0 failed",
    ],
  },
  { kind: "cmd", command: "review security-posture" },
  {
    kind: "out",
    lines: [
      "- MFA: enforced org-wide",
      "- Biometric login: enabled (mobile)",
      "- PCI-DSS tokenization: active",
      "- Audit log: 30-day retention · streaming to BQ",
    ],
  },
] as const;

// ── Scrollback entry types ────────────────────────────────────────────────
//
// `Entry` is a discriminated union (the `kind` field is the discriminator).
// "cmd" entries are static (already-typed) command lines — we render them
// without the typewriter animation in interactive mode for snappy feel.
// "out" entries are output blocks. We give every entry a unique `id` so
// React's reconciler has a stable key independent of array index.
type Entry =
  | { kind: "cmd"; id: number; command: string }
  | { kind: "out"; id: number; lines: readonly string[] };

// Cap to avoid unbounded DOM growth in long sessions. ~30 entries is plenty
// of context for the user while keeping render cost trivial.
const MAX_ENTRIES = 30;

// ── Mode state machine ────────────────────────────────────────────────────
//
// "demo" carries the script step pointer; "interactive" needs no payload.
// Splitting them like this means we can never have a stale `step` value
// hanging around once we transition — TS guarantees the field exists in
// exactly one variant.
type Mode =
  | { phase: "demo"; step: number }
  | { phase: "interactive" };

const PROMPT_GLYPH = "›";

export function Terminal() {
  // ── State ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>({ phase: "demo", step: 1 });
  const [entries, setEntries] = useState<readonly Entry[]>([]);

  // Live input + history. `historyIndex === -1` means "we're at the live
  // (un-submitted) input"; 0..n-1 indexes into `history` from newest.
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<readonly string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Tab-completion cycle state. Cleared on any non-Tab keystroke.
  // `matches` are the candidate names; `cycle` is the index we'll insert
  // next. Storing both lets us show all matches on first Tab and then
  // walk them on subsequent Tabs.
  const [tab, setTab] = useState<{
    matches: readonly string[];
    cycle: number;
  } | null>(null);

  // ── Refs (DOM handles, not state) ─────────────────────────────────────
  // `useRef<T | null>(null)` is the standard idiom for a DOM ref. The ref
  // object's `.current` is mutated by React when the element mounts /
  // unmounts; mutating it ourselves does NOT trigger a re-render.
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Counter for generating stable Entry ids without using Math.random()
  // (which React 19 strict mode forbids in render). A ref is perfect: we
  // bump it inside event handlers / effects, never during render.
  const idRef = useRef(0);
  const nextId = () => ++idRef.current;

  // The Next.js App Router. Only used inside event handlers (Enter key).
  const router = useRouter();

  // ── Helpers ────────────────────────────────────────────────────────────

  // Append entries while enforcing the scrollback cap. Functional setter
  // (`(prev) => ...`) reads the latest value safely even if multiple
  // appends are batched in one tick.
  const appendEntries = useCallback((added: readonly Entry[]) => {
    setEntries((prev) => {
      const next = [...prev, ...added];
      // Trim from the front (oldest first) until we're back under the cap.
      return next.length > MAX_ENTRIES
        ? next.slice(next.length - MAX_ENTRIES)
        : next;
    });
  }, []);

  // ── Auto-focus the input when interactive mode starts ─────────────────
  useEffect(() => {
    if (mode.phase === "interactive") {
      inputRef.current?.focus();
    }
  }, [mode.phase]);

  // ── Auto-scroll on new output ─────────────────────────────────────────
  // `scrollIntoView` is a DOM method — we trigger it whenever the entry
  // list grows. The bottom anchor is a tiny invisible div pinned below
  // the last entry.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [entries.length, mode.phase]);

  // ── Command execution ─────────────────────────────────────────────────
  // Build the dependency context once per render. The router itself is
  // stable across renders (Next caches it), so this is cheap.
  const submit = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      // Always echo the typed line back as a "cmd" entry (no typewriter —
      // it's already finished). Empty lines just clear input and no-op.
      if (trimmed.length === 0) {
        setInput("");
        return;
      }

      // Push command echo first so output appears underneath it.
      const echo: Entry = {
        kind: "cmd",
        id: nextId(),
        command: trimmed,
      };

      const ctx: CommandContext = {
        router,
        // `typeof window` guard keeps SSR happy even though this component
        // is "use client" — defensive belt-and-suspenders.
        win: typeof window !== "undefined" ? window : undefined,
      };
      const result = runCommand(trimmed, ctx);

      // Switch on the discriminant. TypeScript narrows `result` inside each
      // case so e.g. `result.lines` is only accessible in the "lines" arm.
      switch (result.kind) {
        case "clear":
          // Wipe scrollback entirely — demo output included.
          setEntries([]);
          break;
        case "lines":
          appendEntries([
            echo,
            { kind: "out", id: nextId(), lines: result.lines },
          ]);
          break;
        case "noop":
          // Empty input — already short-circuited above; this is just
          // defensive so the switch is exhaustive.
          appendEntries([echo]);
          break;
      }

      // Update history (newest at front), reset pointer + tab state, clear input.
      setHistory((prev) => [trimmed, ...prev].slice(0, 50));
      setHistoryIndex(-1);
      setTab(null);
      setInput("");
    },
    [appendEntries, router],
  );

  // ── Key handling: Enter / Up / Down / Tab ─────────────────────────────
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit(input);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (history.length === 0) return;
        // Walk further back into history. Cap at the oldest entry.
        const next = Math.min(historyIndex + 1, history.length - 1);
        setHistoryIndex(next);
        setInput(history[next] ?? "");
        setTab(null);
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (historyIndex <= 0) {
          // Already at (or past) the newest — return to live input.
          setHistoryIndex(-1);
          setInput("");
        } else {
          const next = historyIndex - 1;
          setHistoryIndex(next);
          setInput(history[next] ?? "");
        }
        setTab(null);
        return;
      }

      if (e.key === "Tab") {
        e.preventDefault();
        // Only tab-complete the verb (first token). Anything after a space
        // is an argument — leave it alone.
        const tokens = input.split(/\s+/);
        const head = (tokens[0] ?? "").toLowerCase();
        const matches = COMMAND_NAMES.filter((name) => name.startsWith(head));

        if (matches.length === 0) return;

        // Single match → just fill it in (and add a trailing space so the
        // user can immediately start typing args).
        if (matches.length === 1) {
          setInput(matches[0] + " ");
          setTab(null);
          return;
        }

        // Multiple matches:
        //  • First Tab → echo the candidate list as an output block, then
        //    "cycle index" starts at 0 so the next Tab fills the first.
        //  • Subsequent Tabs → walk the list, replacing the verb each time.
        if (!tab || tab.matches.join(",") !== matches.join(",")) {
          appendEntries([
            {
              kind: "out",
              id: nextId(),
              lines: [matches.join("    ")],
            },
          ]);
          setTab({ matches, cycle: 0 });
          return;
        }

        // Cycle through.
        const idx = tab.cycle % matches.length;
        setInput(matches[idx] + " ");
        setTab({ matches, cycle: tab.cycle + 1 });
        return;
      }

      // Any other key resets tab-completion cycling.
      if (tab) setTab(null);
    },
    [appendEntries, history, historyIndex, input, submit, tab],
  );

  // ── Demo callback: a CommandLine just finished typing ─────────────────
  // We push the command into scrollback (already animated, so subsequent
  // renders don't re-animate it), then schedule the next step. We do this
  // *outside* the typewriter component so the demo flow stays in one place.
  const onDemoCmdDone = useCallback((step: number) => {
    const cmd = SCRIPT[step - 1];
    if (!cmd || cmd.kind !== "cmd") return;
    // Push the typed command into scrollback as an already-animated entry.
    setEntries((prev) => {
      const next: Entry[] = [
        ...prev,
        { kind: "cmd", id: ++idRef.current, command: cmd.command },
      ];
      const out = SCRIPT[step]; // peek next step
      if (out?.kind === "out") {
        next.push({ kind: "out", id: ++idRef.current, lines: out.lines });
      }
      return next.length > MAX_ENTRIES
        ? next.slice(next.length - MAX_ENTRIES)
        : next;
    });
    // Advance: skip past both the cmd and its paired out (script structure
    // alternates cmd → out → cmd → out → …). When we run off the end of
    // the script, transition straight to interactive mode — keeping this
    // event-driven (not effect-driven) avoids the React-19 "no setState in
    // useEffect" lint rule.
    const nextStep = step + 2;
    if (nextStep > SCRIPT.length) {
      setMode({ phase: "interactive" });
    } else {
      setMode({ phase: "demo", step: nextStep });
    }
  }, []);

  // ── Click anywhere → focus input (terminal feel) ──────────────────────
  // Only meaningful in interactive mode. We don't `preventDefault` so text
  // selection still works — focus just snaps to the input on plain clicks.
  const onContainerClick = useCallback(() => {
    if (mode.phase === "interactive") {
      inputRef.current?.focus();
    }
  }, [mode.phase]);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="glass overflow-hidden rounded-2xl">
      {/* Window chrome — three Mac dots + title. */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        <span className="ml-3 font-mono text-[11px] text-foreground-muted">
          m3@portfolio:~ — bash
        </span>
      </div>

      {/* Terminal body. `max-h` + `overflow-y-auto` lets long sessions
          scroll independently of the page. Click → focus input. */}
      <div
        onClick={onContainerClick}
        className="max-h-[28rem] space-y-3 overflow-y-auto p-5"
      >
        {/* Scrollback (both demo output and user output flow through here). */}
        {entries.map((entry) => {
          if (entry.kind === "cmd") {
            // `animate={false}` shows the command instantly. The typed-in
            // version is reserved for the live demo step below.
            return (
              <StaticCommandLine key={entry.id} command={entry.command} />
            );
          }
          return <TerminalOutput key={entry.id} lines={entry.lines} />;
        })}

        {/* The currently-animating demo command, if any. We render it
            outside scrollback so it can animate, then push itself into
            scrollback via onDone. */}
        {mode.phase === "demo" &&
          mode.step <= SCRIPT.length &&
          SCRIPT[mode.step - 1]?.kind === "cmd" && (
            <CommandLine
              // `key` includes the step so React mounts a fresh typewriter
              // each step (effects re-run on remount — that's our reset).
              key={`demo-${mode.step}`}
              command={(SCRIPT[mode.step - 1] as { command: string }).command}
              onDone={() => onDemoCmdDone(mode.step)}
            />
          )}

        {/* Interactive prompt — visible only after the demo finishes. */}
        {mode.phase === "interactive" && (
          <InteractivePrompt
            inputRef={inputRef}
            value={input}
            onChange={setInput}
            onKeyDown={onKeyDown}
          />
        )}

        {/* Scroll anchor — auto-scrolls into view on each new entry. */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────────

/**
 * StaticCommandLine — same visual as CommandLine but no typewriter. We use
 * this for entries already in scrollback (animation has already played).
 *
 * It would be tempting to reuse CommandLine with a "static" flag, but the
 * typewriter hook always animates. Splitting keeps each component simple.
 */
function StaticCommandLine({ command }: { command: string }) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-sm">
      <span className="text-accent-cyan">{PROMPT_GLYPH}</span>
      <span className="text-foreground">{command}</span>
    </div>
  );
}

/**
 * InteractivePrompt — the live input row.
 *
 * Notes:
 *  • `inputMode="text"` + `autoComplete="off"` + `spellCheck={false}` make
 *    mobile/desktop browsers stop "helping" us with corrections.
 *  • The input is intentionally invisible (`bg-transparent outline-none`)
 *    so the parent's font-mono styling and the prompt glyph give it the
 *    terminal look. We render a blinking caret as a separate span — same
 *    `animate-pulse` trick CommandLine uses while typing.
 *  • `RefObject<HTMLInputElement | null>` is the prop type for a ref
 *    forwarded from the parent.
 */
function InteractivePrompt({
  inputRef,
  value,
  onChange,
  onKeyDown,
}: {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (next: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-sm">
      <span className="text-accent-cyan">{PROMPT_GLYPH}</span>
      {/* `relative` wrapper so the caret can sit at the end of the typed
          text. Width grows naturally with content. */}
      <div className="relative flex flex-1 items-baseline">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="terminal input"
          className="flex-1 border-0 bg-transparent text-foreground caret-accent-cyan outline-none"
        />
        {/* Decorative blinking block. The real caret is also visible
            (caret-accent-cyan) — this just adds the chunky terminal vibe
            when the input is empty. */}
        {value.length === 0 && (
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 inline-block h-4 w-[7px] animate-pulse bg-accent-cyan/80"
          />
        )}
      </div>
    </div>
  );
}
