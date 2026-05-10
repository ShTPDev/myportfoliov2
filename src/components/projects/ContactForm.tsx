/**
 * ContactForm — controlled form that POSTs to `/api/contact`.
 *
 * Why this is a CLIENT component:
 *  - It uses `useState` (React hook) and DOM event handlers (onSubmit,
 *    onChange). Hooks and event handlers can only run in the browser, so
 *    React requires the file to start with the `"use client"` directive.
 *  - The directive is a *boundary marker*, not a per-component flag. Every
 *    component exported from a `"use client"` file is a Client Component;
 *    anything they import that doesn't itself say `"use client"` is still
 *    rendered server-side at build/request time.
 *
 * Concepts demonstrated (read top to bottom):
 *  - **Controlled inputs** — React state is the single source of truth for
 *    each field. `value={name}` + `onChange={(e) => setName(e.target.value)}`
 *    keeps the DOM and React in sync. Compare to "uncontrolled" inputs
 *    where you read `formRef.current.name.value` on submit.
 *  - **`useState<T>(...)`** — generic type parameter pins the state's type.
 *    `useState<string>("")` reads as: "state of type string, initial ''".
 *  - **Literal-union state machine** — `Status` is `"idle" | "submitting" |
 *    "success" | "error"`. TypeScript narrows usage so you can't transition
 *    to a non-existent state, and a `switch`/`if-chain` becomes exhaustive.
 *  - **`fetch` error handling** — `fetch` only rejects on NETWORK failure;
 *    HTTP 4xx/5xx still resolve. We must check `res.ok` ourselves.
 *  - **`async`/`await` with `try`/`catch`** — `await` unwraps a Promise; if
 *    the underlying Promise rejects, the rejection becomes a thrown error
 *    that `catch` can grab.
 *  - **`event.preventDefault()`** — without it, the browser submits the form
 *    the old-fashioned way (full page reload). We want JS to handle it.
 *  - **`AnimatePresence` + `motion`** — Framer Motion's pair for entry +
 *    EXIT animations. Without `AnimatePresence`, removing a node from the
 *    tree skips the exit animation entirely (React just unmounts it).
 */

"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
// Note on icon names: lucide-react v1.x renamed `CheckCircle2` and
// `AlertCircle` to `CircleCheck` and `CircleAlert`. We use the new names
// here — same glyphs, future-proof imports.
import { CircleCheck, CircleAlert } from "lucide-react";

/**
 * The four states this form can be in.
 *
 * Why a literal union? It makes invalid states unrepresentable: TS will
 * yell if anyone writes `setStatus("loading")` (typo) or forgets to handle
 * one of the cases. Compare to `useState<string>("idle")` where any string
 * is allowed — far less safety.
 */
type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm(): React.JSX.Element {
  // One state slot per field. Could be combined into a single object —
  // either approach is fine; separate slots are simpler to read for a
  // beginner and avoid the "spread the previous object every update" dance.
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [status, setStatus] = useState<Status>("idle");
  // Holds the human-readable error message when status === "error".
  // Separate from `status` so we don't lose the type discipline above.
  const [errorMessage, setErrorMessage] = useState<string>("");

  /**
   * Submit handler.
   *
   * Type note: `FormEvent<HTMLFormElement>` is React's typed wrapper around
   * the native browser `submit` event. The generic narrows
   * `event.currentTarget` to `HTMLFormElement`. We don't need `currentTarget`
   * here (we already have the values in state), but the type makes
   * `preventDefault` autocomplete cleanly.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    setStatus("submitting");
    setErrorMessage("");

    try {
      // `fetch` is the Web platform HTTP client — no library needed. Returns
      // a Promise<Response>. `await` unwraps it.
      const res = await fetch("/api/contact", {
        method: "POST",
        // `Content-Type` tells the server we're sending JSON. The server's
        // `request.json()` call relies on this header being correct.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      // Important: `fetch` only rejects on NETWORK failure (offline, DNS,
      // CORS). A 400 or 500 status STILL resolves the Promise. We have to
      // check `res.ok` (true for 200–299) ourselves.
      if (!res.ok) {
        // Try to read the server's JSON error message. `.catch(() => ({}))`
        // guards against bodies that aren't JSON.
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Request failed with status ${res.status}`);
      }

      // Success path — clear the fields and flip to the success card.
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setStatus("success");
    } catch (err) {
      // `err` is typed as `unknown` (TS 4.4+). Narrow before reading.
      const text = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(text);
      setStatus("error");
    }
  }

  // Convenience flag — clearer at the call site than `status === "submitting"`
  // sprinkled everywhere.
  const isSubmitting = status === "submitting";

  return (
    <div className="glass rounded-2xl p-6 sm:p-8">
      {/*
        AnimatePresence with `mode="wait"` swaps the success card and the
        form. `mode="wait"` waits for the exiting child to finish its exit
        animation before mounting the next one — no overlap, no layout jump.
      */}
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            // `initial` = state before mount, `animate` = state after mount,
            // `exit` = state on unmount (only fires inside AnimatePresence).
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex flex-col items-center gap-4 py-6 text-center"
          >
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-300 ring-1 ring-emerald-300/30">
              <CircleCheck aria-hidden="true" size={26} />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Message sent.
            </h3>
            <p className="max-w-sm text-sm text-foreground-muted">
              Thanks — I&apos;ll get back to you within a day or two. For
              urgent inquiries, email or call directly.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-2 rounded-full px-4 py-2 text-sm text-foreground-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            // `noValidate` turns off the browser's built-in validation
            // bubbles — we'll surface server-side validation errors via
            // our own `aria-live` region. Native `required` attrs still
            // give the form the right semantics for assistive tech.
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            {/* Name + Email row: side-by-side at sm+ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="name"
                label="Name"
                value={name}
                onChange={setName}
                placeholder="Jane Founder"
                autoComplete="name"
                required
                disabled={isSubmitting}
              />
              <Field
                id="email"
                type="email"
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>

            <Field
              id="subject"
              label="Subject (optional)"
              value={subject}
              onChange={setSubject}
              placeholder="IT Manager role at …"
              disabled={isSubmitting}
            />

            {/* Message — multiline, so it gets a <textarea>, not <input>. */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="message"
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting}
                rows={5}
                placeholder="A few sentences about the role, team size, timeline…"
                className="resize-y rounded-lg bg-white/5 px-3 py-2 text-sm text-foreground ring-1 ring-white/10 placeholder:text-foreground-muted focus:outline-none focus:ring-accent-cyan disabled:opacity-60"
              />
            </div>

            {/*
              Status region — `aria-live="polite"` tells screen readers to
              announce updates without interrupting the current speech.
              Empty when status is idle/submitting (we use the button label
              for the submitting state instead).
            */}
            <div aria-live="polite" className="min-h-[1.25rem]">
              {status === "error" && (
                <p className="inline-flex items-center gap-2 text-sm text-rose-300">
                  <CircleAlert aria-hidden="true" size={14} />
                  {errorMessage}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="self-start rounded-full bg-foreground px-6 py-3 font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending…" : "Send message"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Field — small private helper for the repeating <label> + <input> pair.
 *
 * Lifted out so the form body stays scannable. Not exported — it's an
 * implementation detail of `ContactForm`.
 *
 * Concept: the parent passes `setX` (the state setter) directly as `onChange`.
 * We adapt it to the input event inside this component, so the parent
 * doesn't have to write `(e) => setX(e.target.value)` four times.
 */
function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  // `(next: string) => void` — we hand the parent the new string directly,
  // not the synthetic event. Less ceremony at every call site.
  onChange: (next: string) => void;
  placeholder?: string;
  type?: "text" | "email";
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      {/*
        `htmlFor` must match the input's `id`. This is what lets a screen
        reader announce the label when the user focuses the input, AND lets
        a sighted user click the label to focus the input.
      */}
      <label
        htmlFor={id}
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className="rounded-lg bg-white/5 px-3 py-2 text-sm text-foreground ring-1 ring-white/10 placeholder:text-foreground-muted focus:outline-none focus:ring-accent-cyan disabled:opacity-60"
      />
    </div>
  );
}
