import Image from "next/image";

type LogoProps = {
  className?: string;
  withWordmark?: boolean;
  /** Render the wordmark in cream tones for dark backgrounds (e.g. the footer). */
  light?: boolean;
};

/** Icon-only mark (hands + brain + sunflower) — cropped from the official logo. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Image
        src="/logo-mark-t.png"
        alt="Grooming Souls mark"
        fill
        sizes="80px"
        priority
        className="object-contain"
      />
    </div>
  );
}

/** Full lockup (mark + wordmark) — used in the nav and footer. */
export function Logo({ className, withWordmark = true, light = false }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="h-11 w-11 shrink-0" />
      {withWordmark && (
        <div className="leading-none">
          <div
            className={`font-display text-[1.35rem] tracking-tight ${
              light ? "text-cream" : "text-brand-brown"
            }`}
          >
            Grooming Souls
          </div>
          <div
            className={`text-[0.62rem] uppercase tracking-[0.18em] ${
              light ? "text-cream/55" : "text-sage-deep"
            }`}
          >
            Mental Health &amp; Welfare
          </div>
        </div>
      )}
    </div>
  );
}

/** The full original lockup image (mark + script + tag) — for hero use. */
export function LogoFull({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Image
        src="/logo.jpeg"
        alt="Grooming Souls — Mental Health & Welfare"
        fill
        sizes="(min-width: 768px) 360px, 240px"
        priority
        className="object-contain"
      />
    </div>
  );
}
