import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Static tag, e.g. an activity on the day panel ("skipped the gym"). */
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-pill bg-card px-3.5 py-1.5 text-[0.9rem] text-ink ${className}`}>
      {children}
    </span>
  );
}

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** for toggle chips; omit for plain quick-reply chips */
  selected?: boolean;
};

/** Tappable pill: quick replies in chat, choices in forms. 44px tall. */
export function Chip({ selected, className = "", type = "button", ...rest }: ChipProps) {
  const state =
    selected === undefined
      ? "border-blue text-blue hover:bg-blue/5"
      : selected
        ? "border-blue bg-blue text-white"
        : "border-line bg-card text-ink hover:border-ink";
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border-[1.5px] px-4 font-bold sm:px-5 transition-colors ${state} ${className}`}
      {...rest}
    />
  );
}
