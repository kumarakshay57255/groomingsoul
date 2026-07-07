"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, HandHeart, ShieldCheck, User, Users, X } from "lucide-react";
import { teamPhotoUrl, type TeamCategory, type TeamMember } from "@/lib/team";

type Props = {
  members: TeamMember[];
};

const TABS: { key: "all" | TeamCategory; label: string; icon: typeof Users }[] = [
  { key: "all", label: "All Team", icon: Users },
  { key: "leadership", label: "Leadership", icon: ShieldCheck },
  { key: "clinical", label: "Clinical Team", icon: Brain },
  { key: "associate", label: "Mental Health Advocates", icon: HandHeart },
];

const CATEGORY_LABEL: Record<TeamCategory, string> = {
  leadership: "Leadership",
  clinical: "Clinical Team",
  associate: "Mental Health Advocate",
};

const INITIAL_COUNT = 6;

export function CoreTeam({ members }: Props) {
  const [tab, setTab] = useState<"all" | TeamCategory>("all");
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState<TeamMember | null>(null);

  const filtered = useMemo(
    () => (tab === "all" ? members : members.filter((m) => m.category === tab)),
    [members, tab]
  );

  if (members.length === 0) return null;

  const visible = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);
  const hasMore = filtered.length > INITIAL_COUNT;

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Decorative gold leaf — top right */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/botanicals/corner-leaf.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 top-8 hidden h-64 w-auto rotate-[8deg] opacity-40 lg:block"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header (left-aligned) */}
        <div className="flex items-center gap-3">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em] text-terracotta">
            Our Expert Team
          </p>
          <span className="h-px w-10 bg-gold/60" />
        </div>
        <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[1.05] text-ink sm:text-5xl">
          Compassionate professionals.
          <br />
          <span className="italic text-sage-deep">Dedicated to your well-being.</span>
        </h2>
        <span className="mt-4 block h-1 w-10 rounded-full bg-gold" />
        <p className="mt-5 max-w-md text-pretty leading-relaxed text-ink-soft">
          Our team of psychologists, therapists and educators are here to
          support, guide and empower you.
        </p>

        {/* Tabs */}
        <div className="mt-10 flex flex-wrap items-stretch border-b border-line">
          {TABS.map((t, i) => {
            const activeTab = tab === t.key;
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => {
                  setTab(t.key);
                  setExpanded(false);
                }}
                className={`group relative flex items-center gap-2 px-4 py-3 text-sm font-medium tracking-wide transition-colors sm:px-6 ${
                  i > 0 ? "border-l border-line" : ""
                } ${
                  activeTab
                    ? "text-brand-brown"
                    : "text-ink-soft/70 hover:text-brand-brown"
                }`}
              >
                <Icon
                  size={16}
                  strokeWidth={1.7}
                  className={activeTab ? "text-sage-deep" : ""}
                />
                <span className="uppercase tracking-[0.1em]">{t.label}</span>
                {activeTab && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-gold" />
                )}
              </button>
            );
          })}
        </div>

        {/* Cards */}
        {visible.length === 0 ? (
          <p className="mt-14 text-sm text-ink-soft">
            No team members in this category yet.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((m, i) => {
              const photo = teamPhotoUrl(m);
              const num = String(i + 1).padStart(2, "0");
              return (
                <motion.article
                  key={m.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: (i % 3) * 0.07 }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-cream"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
                    {photo ? (
                      <Image
                        src={photo}
                        alt={m.name}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-brand-brown/25">
                        <User size={72} strokeWidth={1} />
                      </div>
                    )}
                    {m.isFounder && (
                      <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-navy">
                        Founder
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="text-[0.72rem] font-medium uppercase tracking-[0.14em]">
                      <span className="text-ink-soft/60">{num}</span>
                      <span className="text-ink-soft/40"> / </span>
                      <span className="text-sage-deep">
                        {CATEGORY_LABEL[m.category] ?? "Team"}
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-2xl text-ink">{m.name}</h3>
                    <div className="mt-1 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-sage-deep">
                      {m.role}
                    </div>
                    {m.bio && (
                      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-soft">
                        {m.bio}
                      </p>
                    )}
                    <span className="mt-4 block h-0.5 w-8 rounded-full bg-gold" />
                    <button
                      type="button"
                      onClick={() => setActive(m)}
                      className="group/vp mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-brown"
                    >
                      View profile
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover/vp:translate-x-1"
                      />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded((s) => !s)}
              className="inline-flex items-center gap-2 rounded-full border border-navy/25 bg-cream px-8 py-3 text-sm font-medium text-navy transition-colors hover:border-navy/60 hover:bg-cream-deep"
            >
              {expanded ? "View Less" : "View More"}
            </button>
          </div>
        )}
      </div>

      {active && <ProfileModal member={active} onClose={() => setActive(null)} />}
    </section>
  );
}

function ProfileModal({
  member,
  onClose,
}: {
  member: TeamMember;
  onClose: () => void;
}) {
  const photo = teamPhotoUrl(member);
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-cream shadow-2xl">
        <div className="relative aspect-[16/10] bg-cream-deep">
          {photo ? (
            <Image src={photo} alt={member.name} fill sizes="512px" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-brand-brown/25">
              <User size={72} strokeWidth={1} />
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-cream/90 text-brand-brown hover:bg-cream"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-7">
          <div className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-sage-deep">
            {CATEGORY_LABEL[member.category] ?? "Team"}
          </div>
          <h3 className="mt-1.5 font-display text-3xl text-ink">{member.name}</h3>
          <div className="mt-1 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-sage-deep">
            {member.role}
          </div>
          {member.bio && (
            <p className="mt-4 text-pretty leading-relaxed text-ink-soft">
              {member.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
