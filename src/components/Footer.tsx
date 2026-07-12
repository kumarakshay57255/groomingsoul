import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  HandHeart,
  HeartHandshake,
  Leaf,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { InstagramIcon, LinkedinIcon } from "./SocialIcons";
import { Logo } from "./Logo";
import { site } from "@/lib/site";

const cols: {
  title: string;
  icon: LucideIcon;
  items: { label: string; href: string }[];
}[] = [
  {
    title: "Services",
    icon: HandHeart,
    items: [
      { label: "Therapy & Counselling", href: "/therapy" },
      { label: "Psychometric Tests", href: "/therapy/tests" },
      { label: "Psych Academy", href: "/academy" },
      { label: "Certified Diplomas", href: "/diploma" },
    ],
  },
  {
    title: "Foundation",
    icon: HeartHandshake,
    items: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "Founder's Books", href: "/books" },
      { label: "Advisory Panel", href: "/#advisory" },
      {
        label: "Careers / Internships",
        href: "mailto:hello@groomingsouls.org?subject=Internship%20enquiry",
      },
    ],
  },
  {
    title: "Legal",
    icon: ShieldCheck,
    items: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund & Cancellation", href: "/refund" },
      { label: "DPDP Compliance", href: "/privacy#dpdp" },
    ],
  },
];

export function Footer() {
  return (
    <footer>
      {/* ---- Main body (light) ---- */}
      <div className="relative overflow-hidden border-t border-line bg-cream">
        {/* faint gold botanical, left edge */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/botanicals/corner-leaf-green.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-8 top-1/4 hidden h-72 w-auto opacity-[0.12] lg:block"
        />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Brand */}
            <div className="lg:col-span-4">
              <Logo />
              <span className="mt-6 block h-0.5 w-10 rounded-full bg-gold" />
              <p className="mt-5 max-w-sm text-pretty text-sm leading-relaxed text-ink-soft">
                A Section 8 NGO blending professional psychological care, mental
                welfare, and high-standard academic excellence under one safe
                roof.
              </p>

              <div className="mt-6 space-y-2.5 text-sm text-ink-soft">
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-gold" />
                  <a href={`tel:${site.phoneRaw}`} className="hover:text-brand-brown">
                    {site.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="text-gold" />
                  <a href={`mailto:${site.email}`} className="hover:text-brand-brown">
                    {site.email}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-gold" />
                  <span>{site.address}</span>
                </div>
              </div>

              <span className="mt-6 block h-px w-16 bg-line" />

              <div className="mt-5 flex items-center gap-3">
                <SocialLink href={site.socials.instagram} label="Instagram">
                  <InstagramIcon className="h-4 w-4" />
                </SocialLink>
                <SocialLink href={site.socials.linkedin} label="LinkedIn">
                  <LinkedinIcon className="h-4 w-4" />
                </SocialLink>
              </div>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-8">
              {cols.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title}>
                    <Icon size={22} strokeWidth={1.5} className="text-sage-deep" />
                    <div className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
                      {c.title}
                    </div>
                    <span className="mt-3 block h-0.5 w-8 rounded-full bg-gold" />
                    <ul className="mt-5 space-y-3.5 text-sm">
                      {c.items.map((it) => (
                        <li key={it.label}>
                          <Link
                            href={it.href}
                            className="group flex items-center justify-between gap-2 text-ink-soft transition-colors hover:text-brand-brown"
                          >
                            <span>{it.label}</span>
                            <ChevronRight
                              size={15}
                              className="text-gold/70 transition-transform group-hover:translate-x-0.5"
                            />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Bottom bar (navy) ---- */}
      <div className="relative overflow-hidden bg-navy text-cream">
        {/* faint gold botanical, right */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/botanicals/corner-leaf.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-6 top-1/2 hidden h-40 w-auto -translate-y-1/2 rotate-90 opacity-30 lg:block"
        />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-5 px-5 py-6 text-xs text-cream/70 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Leaf size={16} className="text-gold" />
            <span className="h-6 w-px bg-cream/20" />
            <span>
              © {new Date().getFullYear()} Grooming Souls Mental Health &amp;
              Welfare Foundation. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <BadgeCheck size={16} className="text-gold" />
            <span>Registered Section 8 NGO · Govt. of India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-cream-deep/60 text-brand-brown transition-colors hover:bg-brand-brown hover:text-cream"
    >
      {children}
    </a>
  );
}
