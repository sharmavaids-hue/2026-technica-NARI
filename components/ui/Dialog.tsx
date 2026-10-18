"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "./icons";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  /** visible heading, also the dialog's accessible name */
  title: ReactNode;
  /** "sheet" slides up from the bottom (phones); "center" is a centered card */
  variant?: "sheet" | "center";
  tone?: "paper" | "peach" | "ink";
  children: ReactNode;
};

const tones = {
  paper: "bg-card text-ink",
  peach: "bg-peach text-ink",
  ink: "bg-ink text-white on-dark",
};

/**
 * Native <dialog> with showModal(): focus is trapped, Esc closes, and focus
 * returns to the button that opened it.
 */
export function Dialog({ open, onClose, title, variant = "center", tone = "paper", children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const shape =
    variant === "sheet"
      ? "sheet mt-auto mb-0 w-full max-w-none rounded-t-[28px] max-h-[88dvh]"
      : "m-auto w-[min(34rem,calc(100%-2rem))] rounded-card max-h-[90dvh]";

  return (
    <dialog
      ref={ref}
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(e) => {
        // tapping the dimmed backdrop closes it
        if (e.target === ref.current) onClose();
      }}
      className={`${shape} ${tones[tone]} overflow-y-auto p-0 backdrop:bg-ink/45`}
    >
      <div className="flex flex-col gap-4 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {variant === "sheet" && <span aria-hidden="true" className="mx-auto -mt-2 h-1.5 w-12 rounded-pill bg-ink/20" />}
        <div className="flex items-start justify-between gap-4">
          <h2 id="dialog-title" className="font-serif text-3xl leading-tight">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="close"
            className="-mr-2 -mt-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-ink/5"
          >
            <CloseIcon size={22} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
