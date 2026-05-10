/**
 * GalleryLightbox — modal viewer for project gallery items.
 *
 * Triggered when the user clicks a gallery thumbnail in StickyCaseStudy.
 * Renders the full-resolution image OR a video with native browser
 * controls. Escape closes; click backdrop closes; arrow keys navigate
 * between items in the same gallery.
 *
 * Why a portal-style fixed overlay instead of `<dialog>`?
 *   `<dialog>` is great for forms but its default backdrop styling and
 *   positioning fight Tailwind. A plain `position: fixed inset-0` with
 *   `role="dialog" aria-modal="true"` gives the same a11y semantics with
 *   less CSS friction. We close on Escape via a `useEffect` listener.
 *
 * Concept showcase:
 *  - **Discriminated-union narrowing in JSX** — the `item.kind === "video"`
 *    branch lets TS know `item` has the video shape (no `alt`, with
 *    `poster`).
 *  - **`useEffect` for keyboard listener + cleanup** — Escape + arrow keys.
 *  - **`document.body.style.overflow`** — locks page scroll while modal is
 *    open so the user can't accidentally scroll the page behind the
 *    lightbox.
 *  - **Fullscreen API** — clicking the FS button calls
 *    `videoEl.requestFullscreen()` which is the browser-native way to go
 *    truly fullscreen with hardware-accelerated playback on mobile.
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { GalleryItem } from "@/data/ecosystem";

interface Props {
  items: readonly GalleryItem[];
  /** Index into `items` of the currently open lightbox slide. -1 = closed. */
  index: number;
  onClose: () => void;
  onChange: (next: number) => void;
}

export function GalleryLightbox({ items, index, onClose, onChange }: Props) {
  const open = index >= 0 && index < items.length;
  const item = open ? items[index] : null;

  // Ref to the video so we can call `.requestFullscreen()` imperatively.
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stable handlers for the keyboard listener.
  const goPrev = useCallback(() => {
    if (!open) return;
    onChange((index - 1 + items.length) % items.length);
  }, [open, index, items.length, onChange]);

  const goNext = useCallback(() => {
    if (!open) return;
    onChange((index + 1) % items.length);
  }, [open, index, items.length, onChange]);

  // Keyboard: Escape closes; ←/→ navigate.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  // Lock page scroll while modal is open. Restore on close/unmount.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          // Backdrop — clicking it (but not the inner card) closes the modal.
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery viewer"
          onClick={onClose}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
        >
          {/* Inner stage — `stopPropagation` so clicks on media don't close. */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-full w-full max-w-6xl flex-col items-center justify-center"
          >
            {/* Top toolbar — close button + counter */}
            <div className="absolute right-0 top-0 z-10 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">
                {index + 1} / {items.length}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close viewer"
                className="glass inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/15"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            {/* Prev / Next nav buttons — only shown when there's more than one item */}
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous item"
                  className="glass absolute left-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-white/15 sm:left-0"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next item"
                  className="glass absolute right-2 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-white/15 sm:right-0"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </>
            )}

            {/* Media stage — `flex-1` + min-h-0 so the media stays within the viewport */}
            <div className="flex h-full w-full min-h-0 flex-col items-center justify-center px-12 py-12 sm:px-16">
              {item.kind === "image" ? (
                <div className="relative h-full w-full">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(min-width: 640px) 80vw, 100vw"
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <video
                    ref={videoRef}
                    src={item.src}
                    poster={item.poster}
                    controls
                    autoPlay
                    playsInline
                    // `object-contain` so portrait videos letterbox cleanly
                    // instead of cropping. `max-h-full max-w-full` keeps the
                    // video inside the available stage.
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              {/* Caption + fullscreen button row */}
              <div className="mt-3 flex w-full items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-foreground-muted">
                  {item.caption ?? (item.kind === "image" ? item.alt : "Video")}
                </span>
                {item.kind === "video" && (
                  <button
                    type="button"
                    onClick={() => videoRef.current?.requestFullscreen()}
                    aria-label="Fullscreen"
                    className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition hover:bg-white/15"
                  >
                    <Maximize2 className="h-3 w-3" aria-hidden />
                    Fullscreen
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
