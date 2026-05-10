/**
 * utils.ts — small shared helpers used across the app.
 *
 * Concept showcase:
 *  - `import type` (TS-only import, erased at runtime — nothing ships in the JS bundle)
 *  - Rest parameters (`...inputs`) collect any number of arguments into an array
 *  - Type aliases re-exported from libraries (`ClassValue`)
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * `cn` (short for "className") — the canonical utility for combining Tailwind
 * classes safely.
 *
 *  - `clsx(inputs)` flattens strings / arrays / objects into one space-separated
 *    class string, dropping falsy values:
 *        clsx("a", false && "b", { c: true, d: false })  // "a c"
 *
 *  - `twMerge(...)` resolves Tailwind *conflicts* — later classes win:
 *        twMerge("p-2 p-4")        // "p-4"
 *        twMerge("text-sm text-lg") // "text-lg"
 *
 *  Combined, `cn` lets us write conditional classes without ending up with
 *  duplicate or fighting utilities.
 *
 * The `...inputs: ClassValue[]` syntax is a TS *rest parameter* typed as an
 * array of `ClassValue` (clsx's accepted input shape).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
