import { buttonClass } from "./Button";
import { PhoneIcon } from "./icons";

/**
 * Calm urgent-care info (CDC / ACOG red flags). Shown on an ink surface.
 * Used in the Pad Check dialog, the chat get-help card, and when the rapid-pads rule fires.
 */
export function GetHelpContent({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {!compact && <p className="text-white/90">get care now if any of these are true:</p>}
      <ul className="flex list-disc flex-col gap-1.5 pl-5 text-white/90 marker:text-peach">
        <li>soaking through a pad every hour for a few hours in a row</li>
        <li>feeling dizzy, faint, or like you might pass out</li>
        <li>severe pain that doesn&apos;t ease</li>
        <li>bleeding when you might be pregnant</li>
      </ul>
      <div className="flex flex-wrap gap-3">
        <a href="tel:911" className={buttonClass("light", "md")}>
          <PhoneIcon size={18} />
          call 911
        </a>
        <a href="tel:+13013148184" className={buttonClass("outline", "md", "border-white text-white hover:bg-white/10")}>
          <PhoneIcon size={18} />
          UMD Health Center
        </a>
      </div>
      <p className="text-sm text-white/80">
        911 or the nearest ER if it&apos;s happening now. the UMD Health Center (301.314.8184) if it can wait a few hours.
      </p>
    </div>
  );
}
