/** The puffy white pad from the hero: soft, inflatable, with wings. Decorative only. */
export function PuffyPad({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 230" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="pad-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf9f5" />
          <stop offset="0.55" stopColor="#efe9e0" />
          <stop offset="1" stopColor="#d9d0c2" />
        </linearGradient>
        <radialGradient id="pad-wing" cx="0.45" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#faf7f2" />
          <stop offset="1" stopColor="#ddd5c8" />
        </radialGradient>
        <linearGradient id="pad-core" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ece6dc" />
          <stop offset="1" stopColor="#f6f2ec" />
        </linearGradient>
        <filter id="pad-soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* wings */}
      <ellipse cx="210" cy="48" rx="62" ry="46" fill="url(#pad-wing)" />
      <ellipse cx="210" cy="182" rx="62" ry="46" fill="url(#pad-wing)" />
      {/* body */}
      <rect x="4" y="50" width="412" height="130" rx="65" fill="url(#pad-body)" />
      {/* soft rim shading */}
      <rect x="4" y="50" width="412" height="130" rx="65" fill="none" stroke="#cfc5b5" strokeOpacity="0.45" strokeWidth="2" />
      {/* quilted core with dashed stitching */}
      <rect x="52" y="78" width="316" height="74" rx="37" fill="url(#pad-core)" />
      <rect x="52" y="78" width="316" height="74" rx="37" fill="none" stroke="#c4b8a6" strokeWidth="2" strokeDasharray="6 5" />
      {/* gloss */}
      <ellipse cx="135" cy="94" rx="80" ry="10" fill="#ffffff" opacity="0.9" filter="url(#pad-soft)" />
    </svg>
  );
}
