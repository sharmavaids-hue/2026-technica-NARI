import type { ElementType, ReactNode } from "react";

type Tone =
  | "paper" // default surface: card fill + hairline border
  | "peach" // day detail panel, landing peach section
  | "blue" // pattern note, "built on a chart doctors already trust"
  | "ink" // get help now: the only dark card
  | "sage"
  | "blush";

const tones: Record<Tone, string> = {
  paper: "bg-card border border-line text-ink",
  peach: "bg-peach text-ink",
  blue: "bg-blue text-white on-dark",
  ink: "bg-ink text-white on-dark",
  sage: "bg-sage text-ink",
  blush: "bg-blush text-ink",
};

type CardProps = {
  tone?: Tone;
  /** halftone dot texture: colored cards only */
  halftone?: boolean;
  /** fully rounded top ("how it works" arch cards) */
  arch?: boolean;
  as?: ElementType;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>;

export function Card({ tone = "paper", halftone = false, arch = false, as: Tag = "div", className = "", children, ...rest }: CardProps) {
  const texture = halftone ? (tone === "blue" || tone === "ink" ? "halftone-light" : "halftone") : "";
  const shape = arch ? "arch" : "rounded-card";
  return (
    <Tag className={`${tones[tone]} ${texture} ${shape} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
