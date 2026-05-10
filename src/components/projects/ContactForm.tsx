/**
 * ContactForm — controlled form that POSTs to `/api/contact`.
 *
 * Why this is a CLIENT component:
 *  - It uses `useState`, `useRef`, `useEffect`, and DOM event handlers. Hooks
 *    can only run in the browser, so React requires the file to start with
 *    the `"use client"` directive.
 *  - The directive is a *boundary marker*, not a per-component flag. Every
 *    component exported from a `"use client"` file is a Client Component;
 *    anything they import that doesn't itself say `"use client"` is still
 *    rendered server-side at build/request time.
 *
 * Concepts demonstrated (read top to bottom):
 *  - **Controlled inputs** — React state is the single source of truth for
 *    each field. `value={name}` + `onChange={(e) => setName(e.target.value)}`
 *    keeps the DOM and React in sync.
 *  - **`useState<T>(...)`** — generic type parameter pins the state's type.
 *  - **`useRef<T>(initial)`** — a mutable container that survives re-renders
 *    WITHOUT causing them. We use it to remember `mountedAt` (epoch ms when
 *    the form first appeared in the browser) so the server can reject
 *    suspiciously fast bot submissions.
 *  - **`useEffect(() => {…}, [])`** — runs ONCE after the component mounts.
 *    Why not capture the timestamp at render time? React 19 strict purity
 *    rules: render must be pure, no `Date.now()` / `Math.random()`.
 *    `useEffect` runs AFTER render, so it's the safe place for side effects
 *    that touch the clock.
 *  - **Literal-union state machine** — `Status` is `"idle" | "submitting" |
 *    "success" | "error"`. Invalid states unrepresentable.
 *  - **`fetch` error handling** — `fetch` only rejects on NETWORK failure;
 *    HTTP 4xx/5xx still resolve. We must check `res.ok` ourselves AND
 *    inspect `res.status` to map 429 → friendly rate-limit message.
 *  - **`AnimatePresence` + `motion`** — Framer Motion's pair for entry +
 *    EXIT animations. Without `AnimatePresence`, removing a node from the
 *    tree skips the exit animation entirely.
 *  - **Honeypot field** — visually-hidden input named `company` that real
 *    users never see. Bots auto-fill every input → server silent-rejects.
 *  - **Inline validation** — `onBlur` (not `onChange`) so we don't shout at
 *    the user while they're still typing. Validate when they leave the
 *    field.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
// Note on icon names: lucide-react v1.x uses `CircleCheck` / `CircleAlert`
// (the older `CheckCircle2` / `AlertCircle` names were removed). Verified
// these exist in node_modules/lucide-react/dist/lucide-react.d.ts.
import { CircleCheck, CircleAlert } from "lucide-react";

/**
 * The four states this form can be in. Literal union → invalid states
 * unrepresentable. TS will yell on a typo like `setStatus("loading")`.
 */
type Status = "idle" | "submitting" | "success" | "error";

/**
 * Same email regex the server uses. Duplicated on purpose: client-side
 * is for instant feedback, server-side is for trust. Never trust client
 * validation alone.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Soft cap where we surface the counter; hard cap matches the API. */
const MESSAGE_SOFT_THRESHOLD = 800;
const MESSAGE_HARD_MAX = 4000;
/** Minimum useful message length — also enforced server-side. */
const MESSAGE_MIN = 10;

export function ContactForm(): React.JSX.Element {
  // ─── Field state ──────────────────────────────────────────────────────
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  // Honeypot — should always stay "". If a bot fills it, the server
  // silent-rejects (returns ok:true so the bot moves on).
  const [company, setCompany] = useState<string>("");

  // ─── Validation state ─────────────────────────────────────────────────
  // Only set after the user blurs the email field — avoids shouting while
  // they're still typing the @ sign.
  const [emailError, setEmailError] = useState<string>("");

  // ─── Lifecycle state ──────────────────────────────────────────────────
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  /**
   * `useRef<number>(0)` — a mutable box that survives re-renders without
   * triggering them. We stash the millisecond epoch when this form first
   * mounted, then submit it as `_t` so the server can verify a real human
   * spent at least ~1.5s on the page before submitting.
   *
   * Why ref instead of state? State updates re-render. We only READ this
   * value in `handleSubmit`; nothing in the UI depends on it.
   */
  const mountedAtRef = useRef<number>(0);

  /**
   * Capture the mount timestamp ONCE, after first render.
   *
   * React 19 purity rules: `Date.now()` is not pure (different value each
   * call), so it can't go in the render body. Effects run after render →
   * safe place for clock reads.
   */
  useEffect(() => {
    mountedAtRef.current = Date.now();
  }, []);

  /**
   * Submit handler.
   *
   * Type note: `FormEvent<HTMLFormElement>` is React's typed wrapper around
   * the native browser `submit` event. The generic narrows
   * `event.currentTarget` to `HTMLFormElement`.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          // Honeypot + time-trap → server uses these to filter bots.
          company,
          _t: mountedAtRef.current,
        }),
      });

      // `fetch` only rejects on NETWORK failure (offline, DNS, CORS). A 400
      // or 500 status STILL resolves the Promise. We have to check `res.ok`
      // (true for 200–299) ourselves.
      if (!res.ok) {
        // Map the 429 rate-limit specifically — the server's generic message
        // doesn't tell the user the wait time. We do.
        if (res.status === 429) {
          throw new Error(
            "You're sending fast — wait 5 seconds and try again.",
          );
        }
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(
          data.error ?? `Request failed with status ${res.status}`,
        );
      }

      // Success path — clear fields and flip to the success card.
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setCompany("");
      setEmailError("");
      setStatus("success");
    } catch (err) {
      const text = err instanceof Error ? err.message : "Something went wrong.";
      setErrorMessage(text);
      setStatus("error");
    }
  }

  /**
   * Email blur handler — runs once when the user tabs/clicks away from the
   * email field. Empty is OK at this stage (let the submit-disable logic
   * handle "field required"); we only flag malformed values.
   */
  function handleEmailBlur(): void {
    const trimmed = email.trim();
    if (trimmed.length === 0) {
      setEmailError("");
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setEmailError("That doesn't look like a valid email address.");
    } else {
      setEmailError("");
    }
  }

  // Convenience flags — clearer at the call site than long expressions.
  const isSubmitting = status === "submitting";
  const messageLength = message.length;
  // Submit is disabled when ANY of these are true. Mirrors the server
  // validation so the user can't even attempt an invalid submit.
  const canSubmit =
    !isSubmitting &&
    name.trim().length > 0 &&
    EMAIL_REGEX.test(email.trim()) &&
    message.trim().length >= MESSAGE_MIN &&
    messageLength <= MESSAGE_HARD_MAX;

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
              Thanks — I&apos;ll reply within 24 hours. For urgent inquiries,
              email or call directly.
            </p>
            {/*
              Cross-link to /projects so the user has somewhere to go while
              they wait. `Link` is Next.js's prefetching client-side router
              link — feels instant compared to a plain <a>.
            */}
            <Link
              href="/projects"
              className="mt-1 inline-flex items-center gap-1 text-sm text-accent-cyan underline-offset-4 hover:underline"
            >
              While you wait, see the projects
              <span aria-hidden="true">→</span>
            </Link>
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
            // bubbles — we surface validation via our own UI + aria-live.
            noValidate
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            {/*
              ── HONEYPOT FIELD ──
              Bots auto-fill every input they see. Real users don't because:
                1. It's visually hidden via `sr-only` (Tailwind utility:
                   absolute, 1px, clipped — invisible but technically present).
                2. `tabIndex={-1}` removes it from the keyboard tab order.
                3. `aria-hidden` hides it from screen readers.
                4. `autoComplete="off"` discourages browser autofill.
              The wrapping <div aria-hidden> ensures even the label is hidden
              from assistive tech. Server checks `body.company` and silent-
              rejects (returns ok:true) when it's non-empty.
            */}
            <div className="sr-only" aria-hidden="true">
              <label htmlFor="company">Company (leave blank)</label>
              <input
                id="company"
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            {/* Name + Email row: side-by-side at sm+ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id="name"
                label="Name"
                helper="Your name as you'd like me to address you."
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
                helper="We never share this — used only to reply."
                value={email}
                onChange={setEmail}
                onBlur={handleEmailBlur}
                placeholder="you@company.com"
                autoComplete="email"
                // `inputMode="email"` hints to mobile browsers to show the
                // email keyboard layout (with @ key) on phones/tablets.
                inputMode="email"
                required
                disabled={isSubmitting}
                error={emailError}
              />
            </div>

            <Field
              id="subject"
              label="Subject (optional)"
              helper="A short hint about what this is — role, project, intro, etc."
              value={subject}
              onChange={setSubject}
              placeholder="IT Manager / Software Engineer role at …"
              disabled={isSubmitting}
            />

            {/* Message — multiline, so it gets a <textarea>, not <input>. */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <label
                  htmlFor="message"
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted"
                >
                  Message
                </label>
                {/*
                  Character counter — only visible past the soft threshold so
                  it doesn't clutter the UI for short messages. Goes amber/
                  rose as it approaches / crosses the hard cap. The
                  `tabular-nums` utility keeps digit widths uniform so the
                  counter doesn't jiggle as numbers change.
                */}
                {messageLength > MESSAGE_SOFT_THRESHOLD && (
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      messageLength > MESSAGE_HARD_MAX
                        ? "text-rose-300"
                        : "text-foreground-muted"
                    }`}
                  >
                    {messageLength.toLocaleString()} / {MESSAGE_HARD_MAX.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-foreground-muted">
                A few sentences is plenty — share the role, team size, timeline.
              </p>
              <textarea
                id="message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting}
                rows={5}
                // `maxLength` is a NATIVE browser cap — the input simply
                // refuses to accept more characters. Belt + suspenders with
                // the server's check.
                maxLength={MESSAGE_HARD_MAX}
                placeholder="Hi Shamar — we're hiring for…"
                className="resize-y rounded-lg bg-white/5 px-3 py-2 text-sm text-foreground ring-1 ring-white/10 placeholder:text-foreground-muted focus:outline-none focus:ring-accent-cyan disabled:opacity-60"
              />
            </div>

            {/*
              Status region — `aria-live="polite"` tells screen readers to
              announce updates without interrupting current speech.
            */}
            <div aria-live="polite" className="min-h-[1.25rem]">
              {status === "error" && (
                <p className="inline-flex items-center gap-2 text-sm text-rose-300">
                  <CircleAlert aria-hidden="true" size={14} />
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-2">
              <button
                type="submit"
                disabled={!canSubmit}
                // Visual: primary action wears the cyan accent so it reads
                // as "the thing to click". `bg-accent-cyan/90` softens it
                // slightly; full hover restores 100%.
                className="rounded-full bg-accent-cyan/90 px-6 py-3 font-medium text-background transition-opacity hover:bg-accent-cyan disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending…" : "Send message"}
              </button>
              {/*
                Privacy micro-note — sets expectations and reduces friction.
                Tiny, muted, sits directly under the submit button.
              */}
              <p className="text-[11px] text-foreground-muted">
                Used only to reply — never stored, never shared.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Field — small private helper for the repeating <label> + <input> pair.
 *
 * Lifted out so the form body stays scannable. Not exported — implementation
 * detail of `ContactForm`.
 *
 * Concepts:
 *  - The parent passes `setX` (the state setter) directly as `onChange`.
 *    We adapt it to the input event here so call sites stay short.
 *  - Optional `helper` paragraph shows below the label, normal-cased.
 *    Keeps labels mono-uppercase for visual identity, while still teaching
 *    the user what the field is for in plain language.
 *  - Optional `error` string shows below the input in rose. When set, the
 *    input also gets `aria-invalid="true"` so screen readers announce it.
 *  - `inputMode` is forwarded so callers can hint mobile keyboards
 *    (e.g. `inputMode="email"`).
 */
function Field({
  id,
  label,
  helper,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  autoComplete,
  inputMode,
  error,
}: {
  id: string;
  label: string;
  helper?: string;
  value: string;
  // `(next: string) => void` — we hand the parent the new string directly,
  // not the synthetic event. Less ceremony at every call site.
  onChange: (next: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  type?: "text" | "email";
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  // The browser's `inputMode` attribute — controls mobile virtual keyboard.
  inputMode?: "text" | "email" | "tel" | "url" | "numeric" | "decimal" | "search";
  error?: string;
}): React.JSX.Element {
  const hasError = Boolean(error && error.length > 0);
  // ARIA wiring: link the input to its error message via aria-describedby
  // so screen readers read the error after the label.
  const errorId = hasError ? `${id}-error` : undefined;

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
      {helper && (
        <p className="text-xs text-foreground-muted">{helper}</p>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={hasError || undefined}
        aria-describedby={errorId}
        className={`rounded-lg bg-white/5 px-3 py-2 text-sm text-foreground ring-1 placeholder:text-foreground-muted focus:outline-none disabled:opacity-60 ${
          hasError
            ? "ring-rose-300/50 focus:ring-rose-300"
            : "ring-white/10 focus:ring-accent-cyan"
        }`}
      />
      {hasError && (
        <p
          id={errorId}
          className="inline-flex items-center gap-1.5 text-xs text-rose-300"
        >
          <CircleAlert aria-hidden="true" size={12} />
          {error}
        </p>
      )}
    </div>
  );
}
