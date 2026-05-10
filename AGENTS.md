<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project rules

## Audience: TypeScript beginner

Owner is **new to TypeScript and this stack** (Next.js App Router, Tailwind v4, Framer Motion, React 19 Server/Client Components). Code is also a learning resource.

### How to write code

- **Comment generously, but teach — don't narrate.** Every non-trivial file gets a top-of-file block comment explaining: what the file does, why it exists, and which TS/React/Next concepts it demonstrates.
- **Inline comments** when introducing a new concept the first time it appears in the codebase (e.g. generics, union types, `as const`, `"use client"`, server vs client components, `Variants`, discriminated unions). Link to the relevant doc in `node_modules/next/dist/docs/` or MDN when useful.
- **Name the TS feature** in the comment (e.g. `// Type narrowing via `in` operator`, `// Readonly<T> — props can't be mutated`).
- Prefer **explicit types over inferred** when the type is teaching-worthy (props, return types of exported functions). Use inference for trivial locals.
- Avoid `any`. If unavoidable, comment why and what the safer alternative would be.
- Show the **why behind Tailwind utilities** when the class string is non-obvious (`backdrop-blur`, arbitrary values, `@utility` custom rules).
- For Framer Motion: explain `variants`, `initial/animate/whileInView`, `viewport={{ once }}` the first time each appears.
- For Next.js App Router: call out `"use client"` boundaries, why a component is server vs client, and what `metadata` exports do.

### How to explain in chat

- After non-trivial changes, give a **short "what you just learned" recap** (3–6 bullets max) covering the new concepts introduced.
- When user asks "why does X work?", answer with the **mental model** first, then the syntax.
- Don't assume prior TS knowledge: when using utility types (`Partial`, `Pick`, `Omit`, `Record`, `Readonly`), spell out what they do on first use per session.
- Skip recap on trivial changes (renames, copy edits, dependency bumps).

### Don't

- Don't dump huge code blocks without commentary.
- Don't use clever one-liners when a clearer multi-line version teaches better.
- Don't skip type annotations on exported APIs just because TS infers them.
