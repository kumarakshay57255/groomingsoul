import type { Metadata } from "next";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { InfoPage } from "@/components/InfoPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Grooming Souls",
  description:
    "Speak to the Grooming Souls foundation team — phone, WhatsApp, email, and our registered office address.",
};

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Get in touch"
      title={
        <>
          We&apos;d love to <span className="italic">hear from you.</span>
        </>
      }
      subtitle="Therapy bookings, course queries, partnership conversations, or simply a hello — pick whichever channel works for you and we'll reply within one working day."
      topCard={
        <div className="grid gap-4 sm:grid-cols-3">
          <a
            href={`tel:${site.phoneRaw}`}
            className="group rounded-2xl border border-line bg-cream p-5 transition-colors hover:border-clinical/60"
          >
            <Phone size={18} className="text-clinical" />
            <div className="mt-3 text-[0.7rem] uppercase tracking-[0.16em] text-sage-deep">
              Call us
            </div>
            <div className="mt-1 font-display text-xl text-brand-brown">
              {site.phone}
            </div>
            <div className="mt-1 text-[0.78rem] text-ink-soft">
              Mon–Sat · 10 AM – 7 PM IST
            </div>
          </a>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-line bg-cream p-5 transition-colors hover:border-sage/60"
          >
            <MessageCircle size={18} className="text-sage-deep" />
            <div className="mt-3 text-[0.7rem] uppercase tracking-[0.16em] text-sage-deep">
              WhatsApp
            </div>
            <div className="mt-1 font-display text-xl text-brand-brown">
              Chat with the team
            </div>
            <div className="mt-1 text-[0.78rem] text-ink-soft">
              Usually replies within minutes
            </div>
          </a>
          <a
            href={`mailto:${site.email}`}
            className="group rounded-2xl border border-line bg-cream p-5 transition-colors hover:border-coral/60"
          >
            <Mail size={18} className="text-coral" />
            <div className="mt-3 text-[0.7rem] uppercase tracking-[0.16em] text-sage-deep">
              Email
            </div>
            <div className="mt-1 font-display text-xl text-brand-brown">
              {site.email}
            </div>
            <div className="mt-1 text-[0.78rem] text-ink-soft">
              For partnerships and press
            </div>
          </a>
        </div>
      }
      sections={[
        {
          heading: "Registered office",
          body: (
            <>
              <div className="flex items-start gap-3">
                <MapPin
                  size={18}
                  className="mt-1 shrink-0 text-sage-deep"
                  strokeWidth={1.6}
                />
                <p>
                  Grooming Souls Mental Health &amp; Welfare Foundation
                  <br />
                  India · Full registered address to be published with the
                  Phase 8 launch.
                </p>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-dashed border-line bg-cream-deep/40 p-10 text-center text-sm text-ink-soft">
                Google Maps embed will appear here once the registered office
                address is finalised.
              </div>
            </>
          ),
        },
        {
          heading: "Therapy bookings",
          body: (
            <>
              <p>
                The fastest way to book is via our therapist directory — every
                profile has a <em>Book a free session</em> button that opens a
                zero-cost lead-capture form. The team reaches out within 24
                hours to confirm the slot.
              </p>
              <p>
                <a
                  href="/therapy"
                  className="font-medium text-brand-brown hover:underline"
                >
                  Browse therapists →
                </a>
              </p>
            </>
          ),
        },
        {
          heading: "Press & partnerships",
          body: (
            <p>
              For CSR collaborations, media coverage, or interview requests for
              our founder &amp; advisory panel, please email{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-medium text-brand-brown hover:underline"
              >
                {site.email}
              </a>{" "}
              with a brief about the engagement.
            </p>
          ),
        },
      ]}
    />
  );
}
