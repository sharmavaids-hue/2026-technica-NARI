import type { ResultState } from "@/lib/types";
import { AlertIcon, CheckIcon, EyeIcon, TalkIcon } from "./icons";

// Result states: always an icon + words, never color alone, never alarm-red.
const STYLES: Record<ResultState, { cls: string; Icon: typeof CheckIcon }> = {
  typical: { cls: "bg-mustard-tint text-mustard", Icon: CheckIcon },
  watch: { cls: "bg-peach text-ink", Icon: EyeIcon },
  doctor: { cls: "bg-blue text-white", Icon: TalkIcon },
  urgent: { cls: "bg-ink text-white", Icon: AlertIcon },
};

type StatusPillProps = {
  state: ResultState;
  label: string;
  /** "inline" = bare icon + words (score card); "pill" = tinted pill (pad check) */
  variant?: "inline" | "pill";
  className?: string;
};

export function StatusPill({ state, label, variant = "pill", className = "" }: StatusPillProps) {
  const { cls, Icon } = STYLES[state];
  if (variant === "inline") {
    const color = state === "typical" ? "text-mustard" : state === "watch" ? "text-ink" : "text-blue";
    return (
      <span className={`inline-flex items-center gap-1.5 font-bold ${color} ${className}`}>
        <Icon size={16} strokeWidth={2.25} />
        {label}
      </span>
    );
  }
  return (
    <span className={`inline-flex min-h-9 items-center gap-1.5 rounded-pill px-4 py-1.5 font-bold ${cls} ${className}`}>
      <Icon size={16} strokeWidth={2.25} />
      {label}
    </span>
  );
}
