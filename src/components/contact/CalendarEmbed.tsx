/**
 * CalendarEmbed — placeholder card linking to a Cal.com booking page.
 *
 * Why a placeholder instead of a real embed?
 *  - The owner hasn't set up Cal.com yet. Rather than block the redesign on
 *    that task, we ship a styled link card now — when the booking page is
 *    live, swap the inner JSX for the real `<Cal>` embed (or just keep the
 *    link card; both work).
 *  - Zero new dependencies. We're not pulling in `@calcom/embed-react` for
 *    a button that opens a URL.
 *
 * Server vs Client:
 *  - This is a SERVER component. No state, no event handlers, no hooks. The
 *    button is a plain `<a>` to an external URL — the browser handles the
 *    click natively.
 *
 * Props (none yet):
 *  - The Cal.com URL is a constant for now. If we ever need multiple
 *    booking pages, lift it to a prop.
 *
 * Concepts demonstrated:
 *  - Server Component composing a glass card with a single CTA.
 *  - `target="_blank" rel="noreferrer"` outbound-link hygiene.
 *  - lucide icons rendered inside a colored "chip" per the site's pattern.
 */

import { Calendar } from "lucide-react";

/**
 * Placeholder URL — the OWNER will replace this once Cal.com is set up.
 * Keep it as a constant so there's exactly one place to swap when the time
 * comes.
 *
 * Format reminder: Cal.com URLs follow `https://cal.com/<username>/<event>`,
 * e.g. `https://cal.com/jane/15min`.
 */
const CAL_URL = "https://cal.com/shamarpatnett2000/15min";

export function CalendarEmbed(): React.JSX.Element {
  return (
    <div className="glass flex flex-col gap-4 rounded-2xl p-5 sm:p-6">
      <div className="flex items-start gap-4">
        {/*
          Icon chip — same visual language as the contact rows on the left
          column. `bg-accent-cyan/10` + `ring-1 ring-accent-cyan/20` gives
          the "soft frosted square" look.
        */}
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-cyan/10 text-accent-cyan ring-1 ring-accent-cyan/20">
          <Calendar size={18} aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground-muted">
            15 minutes
          </span>
          <h3 className="text-base font-semibold text-foreground sm:text-lg">
            Prefer a 15-min call?
          </h3>
          <p className="mt-1 text-sm text-foreground-muted">
            Pick a slot — I&apos;ll dial in. Faster than email for quick
            scoping or culture-fit chats.
          </p>
        </div>
      </div>

      {/*
        External booking link.
        - `target="_blank"` opens in a new tab so the user doesn't lose your
          site.
        - `rel="noreferrer"` blocks the new tab from reaching back into ours
          via `window.opener` (the standard outbound-link safety net).
        - The pill matches the submit button visually so it reads as a
          primary action.
      */}
      <a
        href={CAL_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex w-fit items-center gap-2 rounded-full bg-accent-cyan/90 px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:bg-accent-cyan"
      >
        Book a 15-min call
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}
