import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  HandHeart,
  Home,
  ShieldPlus,
  ShieldCheck,
  Lock,
  Landmark,
  Heart,
  Leaf,
  Users,
  Building2,
} from "lucide-react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "GOS Work — Impact On The Ground | Grooming Souls",
  description:
    "Real, ethical and sustainable mental health interventions where they matter most — special-needs care, orphanages & shelters, and de-addiction, under RCI ethical guidelines.",
};

const GREEN = "#3f6b3a";

const PILLARS = [
  {
    n: "01",
    icon: HandHeart,
    tag: "Special & Rehabilitation Care",
    title: "Empowering\nSpecial Children",
    img: "/gos/pillar1.jpg",
    body: "We collaborate with specialized schools and centers to provide behavioral mapping, psychological screening, and burnout management workshops for caregivers and teachers handling disabled and exceptionally-abled children.",
  },
  {
    n: "02",
    icon: Home,
    tag: "Crisis & Emotional Healing",
    title: "Support for\nOrphanages & Shelters",
    img: "/gos/pillar2.jpg",
    body: "Healing trauma from the roots. Our clinical team conducts expressive art therapy, play therapy, and self-esteem building bootcamps for children in government and private orphanages to tackle abandonment anxiety.",
  },
  {
    n: "03",
    icon: ShieldPlus,
    tag: "Clinical Intervention",
    title: "De-Addiction &\nBehavior Modification",
    img: "/gos/pillar3.jpg",
    body: "Providing core clinical support under senior supervision at rehabilitation centers. We focus on structured counseling, recovery tracing, and cognitive behavioral adjustments for individuals battling severe substance abuse.",
  },
];

const GALLERY = [
  { img: "/gos/cam_art.jpg", caption: "Expressive Art Therapy Session" },
  { img: "/gos/cam_group.jpg", caption: "Group Counseling & Sharing Circle" },
  { img: "/gos/cam_self.jpg", caption: "Self-Esteem Building Bootcamp" },
  { img: "/gos/cam_letter.jpg", caption: "Appreciation Letter" },
  { img: "/gos/cam_note.jpg", caption: "Gratitude Note" },
];

const COMPLIANCE = [
  { icon: Landmark, title: "RCI Compliant", body: "All practices follow RCI ethical guidelines" },
  { icon: ShieldCheck, title: "100% Legal Compliance", body: "All programs are legally registered and documented" },
  { icon: Lock, title: "Strict Data Privacy", body: "Confidentiality of every individual is our priority" },
  { icon: HandHeart, title: "Zero Commercial Exploitation", body: "All initiatives are 100% pro-bono and welfare-driven" },
];

const STATS = [
  { icon: Users, value: "50+", label: "Camps Conducted" },
  { icon: Users, value: "5,000+", label: "Lives Impacted" },
  { icon: Building2, value: "100+", label: "Partner Institutions" },
  { icon: HandHeart, value: "100%", label: "Pro-bono Initiatives" },
];

/* small gold flourish: — ✿ — */
function Flourish() {
  return (
    <span className="inline-flex items-center gap-2 text-gold/70">
      <span className="h-px w-8 bg-gold/50" />
      <Leaf size={12} />
      <span className="h-px w-8 bg-gold/50" />
    </span>
  );
}

export default function GosWorkPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-cream">
        {/* ============ 1 · HERO ============ */}
        <section className="relative overflow-hidden pt-24 sm:pt-28">
          <div className="absolute inset-y-0 right-0 hidden w-[52%] lg:block">
            <Image
              src="/gos/hero.jpg"
              alt="A Grooming Souls GOS Work volunteer sitting with children on the ground"
              fill
              priority
              sizes="52vw"
              className="object-cover"
            />
            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-cream to-transparent" />
          </div>

          <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-2 lg:pb-24 lg:pt-16">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.24em]" style={{ color: GREEN }}>
                  GOS Work
                </span>
                <Flourish />
              </div>
              <h1 className="mt-6 font-display text-6xl leading-[0.98] tracking-tight text-ink sm:text-7xl">
                GOS WORK –
                <br />
                <span className="italic" style={{ color: GREEN }}>
                  Impact On The Ground
                </span>
              </h1>
              <span className="mt-6 block h-1 w-14 rounded-full bg-gold" />
              <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-ink-soft">
                Moving beyond textbooks. Delivering real, ethical, and
                sustainable mental health interventions where they matter the
                most.
              </p>
            </div>

            {/* mobile hero image */}
            <div className="lg:hidden">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src="/gos/hero.jpg" alt="GOS Work volunteer with children" fill sizes="100vw" className="object-cover" />
              </div>
            </div>
          </div>
        </section>

        {/* ============ 2 · PILLARS ============ */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gold/50" />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]" style={{ color: GREEN }}>
                  Our Key Pillars / Field of Work
                </span>
                <span className="h-px w-10 bg-gold/50" />
              </div>
              <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
                Where We Focus.{" "}
                <span className="italic" style={{ color: GREEN }}>
                  Who We Serve.
                </span>
              </h2>
              <p className="mt-3 text-ink-soft">
                Three core areas where our clinical expertise meets real-world impact.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <article
                    key={p.n}
                    className="flex flex-col overflow-hidden rounded-2xl border border-line bg-cream-deep/25"
                  >
                    <div className="relative">
                      <div className="relative aspect-[16/9]">
                        <Image src={p.img} alt={p.title.replace("\n", " ")} fill sizes="(min-width:768px) 33vw, 90vw" className="object-cover" />
                      </div>
                      <span
                        className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-lg font-display text-lg font-semibold text-cream"
                        style={{ backgroundColor: GREEN }}
                      >
                        {p.n}
                      </span>
                      <span className="absolute left-16 top-4 grid h-10 w-10 place-items-center text-gold">
                        <Icon size={22} strokeWidth={1.6} />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="text-sm font-semibold" style={{ color: GREEN }}>
                        {p.tag}
                      </div>
                      <span className="mt-2 block h-0.5 w-8 rounded-full bg-gold" />
                      <h3 className="mt-3 whitespace-pre-line font-display text-2xl leading-tight text-ink">
                        {p.title}
                      </h3>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                        {p.body}
                      </p>
                      <Link
                        href="/contact"
                        aria-label={`Learn more about ${p.title.replace("\n", " ")}`}
                        className="mt-5 grid h-10 w-10 place-items-center rounded-full text-cream transition-transform hover:translate-x-0.5"
                        style={{ backgroundColor: GREEN }}
                      >
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ 3 · GALLERY ============ */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-10 bg-gold/50" />
                <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]" style={{ color: GREEN }}>
                  Our Recent Footprints
                </span>
                <span className="h-px w-10 bg-gold/50" />
              </div>
              <h2 className="mt-4 font-display text-4xl text-ink sm:text-5xl">
                Real faces, real stories, real{" "}
                <span className="italic" style={{ color: GREEN }}>
                  transformation.
                </span>
              </h2>
              <p className="mt-3 text-ink-soft">
                Glimpses from our recent mental health camps and interventions in Meerut.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {/* Featured */}
              <div className="relative self-start overflow-hidden rounded-2xl border border-line">
                <Image
                  src="/gos/cam_big.jpg"
                  alt="Grooming Souls mental health camp in Meerut"
                  width={1142}
                  height={934}
                  className="h-auto w-full"
                  priority
                />
                {/* crisp HTML quote overlay (baked quote was cut off) */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-deep via-navy-deep/85 to-transparent px-5 pb-4 pt-14 sm:px-6 sm:pb-5">
                  <div className="flex gap-2 text-cream">
                    <span className="font-display text-2xl leading-none text-gold">&ldquo;</span>
                    <p className="text-[0.95rem] leading-snug sm:text-base">
                      Every session brings us closer to hope,&rdquo; healing, and a
                      brighter tomorrow.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right grid: 2 wide cards on top, 3 cards on the bottom row */}
              <div className="grid grid-cols-6 gap-4">
                {GALLERY.map((g, i) => (
                  <figure
                    key={g.caption}
                    className={`overflow-hidden rounded-2xl border border-line bg-cream ${
                      i < 2 ? "col-span-3" : "col-span-2"
                    }`}
                  >
                    <div className={`relative ${i < 2 ? "aspect-[16/10]" : "aspect-[3/4]"}`}>
                      <Image src={g.img} alt={g.caption} fill sizes="25vw" className="object-cover" />
                    </div>
                    <figcaption className="flex items-center gap-1.5 px-2.5 py-2 text-[0.72rem] text-ink-soft">
                      <Heart size={12} className="shrink-0 text-gold" />
                      <span className="truncate">{g.caption}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-ink/25 bg-cream px-7 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/50"
              >
                View More Moments
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ============ 4 · COMPLIANCE ============ */}
        <section className="px-5 py-10 sm:px-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-navy px-6 py-12 text-cream sm:px-12 sm:py-14">
            {/* faint leaf watermark, right */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/botanicals/corner-leaf.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-4 top-8 hidden h-64 w-auto opacity-[0.08] lg:block"
            />

            {/* Top: seal | divider | content */}
            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[auto_1px_1fr] lg:gap-12">
              <div className="mx-auto w-44 sm:w-52 lg:mx-0">
                <Image
                  src="/gos/seal.png"
                  alt="Grooming Souls Compliance Protocol seal"
                  width={292}
                  height={386}
                  className="h-auto w-full"
                />
              </div>
              <div className="hidden self-stretch bg-cream/15 lg:block" />
              <div>
                <div className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-gold" />
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-gold">
                    The Integrity Standards
                  </span>
                  <span className="hidden h-px w-16 bg-gold/40 sm:block" />
                  <Leaf size={13} className="hidden text-gold/70 sm:block" />
                </div>
                <h2 className="mt-4 font-display text-4xl leading-[1.08] text-cream sm:text-5xl">
                  The Grooming Souls
                  <br />
                  Compliance Protocol
                </h2>
                <span className="mt-4 block h-0.5 w-12 rounded-full bg-gold" />
                <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-cream/80">
                  Every camp, screening drive, and intervention executed under GOS
                  Work strictly adheres to the{" "}
                  <strong className="font-semibold text-gold">
                    Rehabilitation Council of India (RCI)
                  </strong>{" "}
                  ethical guidelines. We prioritize 100% legal compliance, strict
                  data privacy, and zero-commercial exploitation in all our
                  pro-bono welfare projects.
                </p>
              </div>
            </div>

            {/* Bottom: 4 items full width with dividers */}
            <div className="relative mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-gold/20">
              {COMPLIANCE.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="flex flex-col gap-2 lg:px-6 lg:first:pl-0">
                    <Icon size={24} className="text-gold" strokeWidth={1.6} />
                    <div className="mt-1 font-semibold text-cream">{c.title}</div>
                    <div className="text-xs leading-relaxed text-cream/65">{c.body}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============ 5 · PARTNER CTA ============ */}
        <section className="px-5 py-12 sm:px-8 sm:py-16">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-cream-deep/25">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left */}
              <div className="p-8 sm:p-12">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-gold/50" />
                  <Leaf size={12} className="text-gold/70" />
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.2em]" style={{ color: GREEN }}>
                    Partner With GOS Work
                  </span>
                </div>
                <h2 className="mt-5 font-display text-4xl leading-[1.05] text-ink sm:text-[2.7rem]">
                  Want to Sponsor or Host a{" "}
                  <span className="italic" style={{ color: GREEN }}>
                    Free
                  </span>{" "}
                  Mental Health Camp at Your Institute?
                </h2>
                <span className="mt-5 block h-0.5 w-12 rounded-full bg-gold" />
                <p className="mt-5 max-w-md text-pretty leading-relaxed text-ink-soft">
                  Join hands with us to create a healthier, more compassionate community.
                </p>
                <Link
                  href="/contact"
                  className="group mt-7 inline-flex items-center gap-3 rounded-full bg-navy px-7 py-4 text-sm font-semibold text-cream transition-colors hover:bg-navy-deep"
                >
                  <HandHeart size={18} className="text-gold" />
                  Partner With Us / Reach Out
                  <ArrowRight size={16} className="text-gold transition-transform group-hover:translate-x-1" />
                </Link>

                <div className="mt-9 grid grid-cols-2 gap-5 sm:grid-cols-4">
                  {STATS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.label} className="flex flex-col items-center text-center sm:items-start sm:text-left">
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-sage-soft/50" style={{ color: GREEN }}>
                          <Icon size={18} strokeWidth={1.7} />
                        </span>
                        <div className="mt-2 font-display text-2xl text-ink">{s.value}</div>
                        <div className="text-[0.7rem] uppercase tracking-[0.08em] text-ink-soft">{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right image + crisp quote card overlay */}
              <div className="relative min-h-[380px] lg:min-h-0">
                <Image
                  src="/gos/partner.jpg"
                  alt="A GOS Work volunteer in conversation with students"
                  fill
                  sizes="(min-width:1024px) 50vw, 100vw"
                  className="object-cover object-[center_top]"
                />
                <figure className="absolute inset-x-4 bottom-4 overflow-hidden rounded-2xl bg-cream/95 p-5 shadow-[0_18px_40px_-20px_rgba(1,32,87,0.4)] backdrop-blur sm:inset-x-auto sm:right-5 sm:max-w-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/botanicals/corner-leaf-green.svg"
                    alt=""
                    aria-hidden
                    className="pointer-events-none absolute -right-3 bottom-0 h-24 w-auto opacity-20"
                  />
                  <div className="relative flex gap-3">
                    <span className="font-display text-3xl leading-none text-gold">&ldquo;</span>
                    <p className="text-[1.05rem] leading-snug text-ink">
                      Your support today can heal a mind and{" "}
                      <span className="font-display italic" style={{ color: GREEN }}>
                        transform
                      </span>{" "}
                      a life.
                    </p>
                  </div>
                </figure>
              </div>
            </div>

            {/* trust strip */}
            <div className="flex flex-col items-center justify-center gap-4 border-t border-line px-6 py-4 text-sm text-ink-soft sm:flex-row sm:gap-10">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={15} style={{ color: GREEN }} /> Ethical &amp; Transparent
              </span>
              <span className="inline-flex items-center gap-2">
                <Lock size={15} style={{ color: GREEN }} /> Safe &amp; Confidential
              </span>
              <span className="inline-flex items-center gap-2">
                <Users size={15} style={{ color: GREEN }} /> Together for Mental Wellness
              </span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
