import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary" // glossy watermelon pill: one per screen
  | "outline" // ink outline pill
  | "outline-blue" // blue outline pill (calendar actions)
  | "solid-blue"
  | "light"; // white pill on blue (footer)

type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill font-sans font-bold leading-tight " +
  "transition-[filter,background-color,transform] duration-150 active:scale-[0.98] " +
  "disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 text-center";

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-[0.95rem]",
  lg: "min-h-14 px-8 text-[1.05rem]",
};

const variants: Record<Variant, string> = {
  primary: "btn-gloss text-white",
  outline: "border-[1.5px] border-ink text-ink bg-transparent hover:bg-ink/5",
  "outline-blue": "border-[1.5px] border-blue text-blue bg-transparent hover:bg-blue/5",
  "solid-blue": "bg-blue text-white hover:bg-[#1f2c78]",
  light: "bg-white text-blue hover:bg-peach",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className = "") {
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({ variant = "primary", size = "md", className = "", type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  external?: boolean;
};

export function ButtonLink({ href, variant = "primary", size = "md", className = "", children, external }: ButtonLinkProps) {
  const cls = buttonClass(variant, size, className);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
