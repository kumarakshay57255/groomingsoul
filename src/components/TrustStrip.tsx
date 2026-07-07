import { ShieldCheck, BadgeCheck, Lock, HeartHandshake } from "lucide-react";
import { trustBadges } from "@/lib/site";

const icons = [ShieldCheck, BadgeCheck, Lock, HeartHandshake];

export function TrustStrip() {
  return (
    <section className="relative border-y border-line bg-cream-deep/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-8 sm:px-8 md:grid-cols-4">
        {trustBadges.map((b, i) => {
          const Icon = icons[i];
          return (
            <div
              key={b.title}
              className="flex items-center gap-3 text-left"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-sage/30 bg-cream text-sage-deep">
                <Icon size={18} />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-brand-brown">
                  {b.title}
                </div>
                <div className="text-[0.78rem] text-ink-soft">{b.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
