/**
 * commands.ts — pure command logic for the interactive terminal.
 *
 * This module is intentionally **decoupled from React**. It exports:
 *   - `COMMANDS`: a static list of command names + descriptions
 *   - `runCommand`: a pure-ish function that takes a typed input + a
 *     `CommandContext` (router, window) and returns the output lines.
 *
 * Why split this out?
 *  - Smaller `Terminal.tsx` — UI concerns (state, focus, scroll) live there.
 *  - Easier to extend: adding a new command is one entry in one switch.
 *  - Pure-ish functions are trivially testable (no DOM/React needed for
 *    most cases — the few side effects, like `router.push` and
 *    `window.open`, are isolated to the `goto` and `resume` branches).
 *
 * Concept showcase:
 *  - **Discriminated-union return type** (`CommandResult`) — every command
 *    answer carries a `kind` so the caller can react to special outcomes
 *    (e.g. `clear` wipes scrollback, `noop` for empty input).
 *  - **`Readonly<T>`** on the context object — the consumer can read but
 *    not mutate the injected dependencies.
 *  - **Type-safe command lookup** — `CommandName` literal union catches
 *    typos at compile time.
 */

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { ECOSYSTEM } from "@/data/ecosystem";
import { SKILLS, type SkillCategory } from "@/data/skills";
import { SITE, SOCIALS } from "@/lib/constants";

// ── Command catalog ────────────────────────────────────────────────────────
// `as const` freezes both the array and every nested string, so each `name`
// is its literal type, not just `string`. We use that below to derive a
// `CommandName` union for compile-time safety.
export const COMMANDS = [
  { name: "help", description: "List all available commands." },
  { name: "whoami", description: "Show owner identity in one line." },
  { name: "skills", description: "Show skill categories with counts." },
  { name: "projects", description: "List ecosystem projects (use --recent for highlights)." },
  { name: "contact", description: "Show contact details and social links." },
  { name: "resume", description: "Open the résumé PDF in a new tab." },
  { name: "clear", description: "Clear the terminal scrollback." },
  { name: "goto", description: "Navigate to a route (e.g. goto /projects)." },
  { name: "ls", description: "List ecosystem projects like a directory." },
] as const;

// Derived literal-string union. `(typeof COMMANDS)[number]["name"]` reads as:
// "the type of any element of COMMANDS, then index by 'name'". Result:
//   "help" | "whoami" | "skills" | ... | "ls"
export type CommandName = (typeof COMMANDS)[number]["name"];

// Plain string array of names — handy for tab-completion matching.
export const COMMAND_NAMES: readonly string[] = COMMANDS.map((c) => c.name);

// ── Result shape ───────────────────────────────────────────────────────────
// Discriminated union: every result has a `kind` tag. The terminal decides
// what to do next based on the tag. Most commands return `{ kind: "lines" }`
// with their output; `clear` returns `{ kind: "clear" }`; empty input is
// `{ kind: "noop" }` (don't even add a line to scrollback).
export type CommandResult =
  | { kind: "lines"; lines: readonly string[] }
  | { kind: "clear" }
  | { kind: "noop" };

// Dependencies the command runner needs from the outside world. Marking the
// whole thing `Readonly<...>` (a TS utility type) prevents commands from
// reassigning the router or window references by accident.
export type CommandContext = Readonly<{
  // `AppRouterInstance` is the type returned by `useRouter()` from
  // "next/navigation" in the App Router. Importing the type (not the value)
  // costs nothing at runtime.
  router: AppRouterInstance;
  // `Window | undefined` — server-render-safe; we only use it on click.
  win: Window | undefined;
}>;

// Routes the `goto` command will accept. `as const` again so each entry is
// its own literal type, then `(typeof VALID_ROUTES)[number]` gives the union.
const VALID_ROUTES = ["/", "/projects", "/services", "/contact"] as const;
type ValidRoute = (typeof VALID_ROUTES)[number];

// Type predicate (a.k.a. "type guard"): returns `arg is ValidRoute` so TS
// narrows the type inside the `if` branch where we call this.
function isValidRoute(value: string): value is ValidRoute {
  return (VALID_ROUTES as readonly string[]).includes(value);
}

// ── Helpers ────────────────────────────────────────────────────────────────

// Group SKILLS by category. `Record<K, V>` is a TS utility type for an
// object whose keys are `K` and values are `V`. Here we want
// `Record<SkillCategory, number>` — every category mapped to a count.
function skillCounts(): Record<SkillCategory, number> {
  // Start with `Partial<Record<...>>` (every key optional) then fill in.
  // Using `Partial<>` avoids needing a placeholder zero per category.
  const acc: Partial<Record<SkillCategory, number>> = {};
  for (const skill of SKILLS) {
    acc[skill.category] = (acc[skill.category] ?? 0) + 1;
  }
  // Cast back to the "complete" record once we know every used category
  // has been counted. Categories with zero skills simply won't appear.
  return acc as Record<SkillCategory, number>;
}

// ── Command implementations ───────────────────────────────────────────────

function helpLines(): string[] {
  // Pad name column for alignment. The longest name's length sets the gutter.
  const widest = COMMANDS.reduce((n, c) => Math.max(n, c.name.length), 0);
  return [
    "Available commands:",
    "",
    ...COMMANDS.map(
      (c) => `  ${c.name.padEnd(widest + 2, " ")}${c.description}`,
    ),
  ];
}

function whoamiLines(): string[] {
  return ["Shamar T. Patnett · IT Manager · Belmopan, Belize"];
}

function skillsLines(): string[] {
  const counts = skillCounts();
  // Object.entries returns `[string, number][]` here. We sort high → low.
  const rows = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return [
    `Skills (${SKILLS.length} total across ${rows.length} categories):`,
    "",
    ...rows.map(([cat, n]) => `  ${cat.padEnd(22, " ")}${n}`),
    "",
    "Tip: visit /projects for the full breakdown.",
  ];
}

// `projects` and `projects --recent` share most of their formatting.
function projectsLines(args: readonly string[]): string[] {
  const recent = args.includes("--recent");
  // For --recent we narrow to marketplace + betting (per task spec).
  const list = recent
    ? ECOSYSTEM.filter((e) => e.kind === "marketplace" || e.kind === "betting")
    : ECOSYSTEM;
  if (list.length === 0) return ["(no projects)"];
  return [
    recent ? "Recent flagship projects:" : "Ecosystem projects:",
    "",
    ...list.map((e) => `  ${e.title} — ${e.tagline}`),
  ];
}

function contactLines(): string[] {
  return [
    `Email     ${SITE.email}`,
    `Phone     ${SITE.phone}`,
    `Location  ${SITE.location}`,
    `GitHub    ${SOCIALS.github}`,
    `LinkedIn  ${SOCIALS.linkedin}`,
    `Company   ${SOCIALS.company}`,
  ];
}

function lsLines(): string[] {
  // Mimic a `ls`-ish directory listing — one title per line.
  return ECOSYSTEM.map((e) => e.title);
}

// `goto` takes the next arg. Returns a status line; navigation is performed
// here as a side effect through the injected router so the call site stays
// declarative.
function gotoLines(args: readonly string[], ctx: CommandContext): string[] {
  const target = args[0];
  if (!target) {
    return [
      "usage: goto <route>",
      `valid:  ${VALID_ROUTES.join(", ")}`,
    ];
  }
  if (!isValidRoute(target)) {
    return [
      `goto: unknown route '${target}'.`,
      `valid:  ${VALID_ROUTES.join(", ")}`,
    ];
  }
  // Side effect: in-app navigation. Because `goto` runs from a click /
  // keypress event handler (NOT during render), this is safe and idiomatic.
  ctx.router.push(target);
  return [`Navigating to ${target} …`];
}

// `resume` opens the PDF in a new tab. We guard `window` because this
// module could conceivably be imported at build time, where `window` is
// undefined. The terminal only ever calls us from a click handler though.
function resumeLines(ctx: CommandContext): string[] {
  if (ctx.win) {
    // Open in a new tab. `noopener` strips access to `window.opener` for
    // security; standard practice for `target="_blank"`-equivalent links.
    ctx.win.open("/resume.pdf", "_blank", "noopener,noreferrer");
  }
  return ["downloading résumé …", "Opening résumé in new tab."];
}

// ── Public entrypoint ─────────────────────────────────────────────────────

/**
 * runCommand — parse a raw input string and dispatch.
 *
 * Parser is deliberately tiny:
 *   - trim outer whitespace
 *   - split on any whitespace
 *   - lowercase only the verb (so flags / paths keep their case)
 *
 * Anything more (quoted args, escapes, pipes) would be over-engineering for
 * a portfolio terminal. If we ever need it, switch to a real tokenizer.
 */
export function runCommand(raw: string, ctx: CommandContext): CommandResult {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { kind: "noop" };

  // `split(/\s+/)` collapses runs of whitespace. Destructure into verb + args.
  const tokens = trimmed.split(/\s+/);
  const verb = (tokens[0] ?? "").toLowerCase();
  const args = tokens.slice(1);

  switch (verb) {
    case "help":
      return { kind: "lines", lines: helpLines() };
    case "whoami":
      return { kind: "lines", lines: whoamiLines() };
    case "skills":
      return { kind: "lines", lines: skillsLines() };
    case "projects":
      return { kind: "lines", lines: projectsLines(args) };
    case "contact":
      return { kind: "lines", lines: contactLines() };
    case "resume":
      return { kind: "lines", lines: resumeLines(ctx) };
    case "ls":
      return { kind: "lines", lines: lsLines() };
    case "goto":
      return { kind: "lines", lines: gotoLines(args, ctx) };
    case "clear":
      return { kind: "clear" };
    default:
      return {
        kind: "lines",
        lines: [`command not found: ${verb}. Type 'help'.`],
      };
  }
}
