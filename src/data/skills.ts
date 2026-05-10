/**
 * skills.ts — data for the About / Skills section.
 *
 * Concept showcase:
 *  - Plain TS module exporting typed arrays — Next.js compiles this into the
 *    server bundle (or static HTML) without any client cost.
 *  - `as const` arrays of objects → each object's fields keep their literal
 *    types, so `SKILLS[0].name` is `"Flutter"`, not just `string`.
 *  - Splitting by category keeps the UI grouping flexible.
 */

export type SkillCategory = "Frontend" | "Backend" | "Infra" | "Payments";

export interface Skill {
  name: string;
  category: SkillCategory;
  description: string;
}

export const SKILLS: readonly Skill[] = [
  {
    name: "Flutter",
    category: "Frontend",
    description: "Cross-platform mobile + web apps with custom design systems.",
  },
  {
    name: "Next.js / React",
    category: "Frontend",
    description: "App Router, Server Components, modern React patterns.",
  },
  {
    name: "Serverpod",
    category: "Backend",
    description: "Dart-native backend with built-in auth, RPC, and streaming.",
  },
  {
    name: "PostgreSQL",
    category: "Backend",
    description: "Schema design, migrations, indexing for transactional data.",
  },
  {
    name: "Docker",
    category: "Infra",
    description: "Containerization for reproducible local + production envs.",
  },
  {
    name: "Linux",
    category: "Infra",
    description: "Server admin, systemd units, hardening for self-hosting.",
  },
  {
    name: "WireGuard",
    category: "Infra",
    description: "Private mesh networking between services and devices.",
  },
  {
    name: "Payment integrations",
    category: "Payments",
    description: "Local Belize gateways + reconciliation pipelines.",
  },
] as const;
