import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Terms & Conditions — Grooming Souls",
  description:
    "The rules of using Grooming Souls — therapy, psychometric testing, courses, and certificates.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms & Conditions"
      title={
        <>
          The fair print of our <span className="italic">working relationship.</span>
        </>
      }
      subtitle="These terms govern how you use Grooming Souls — our therapy services, free psychometric tests, paid courses, and physical certificates. By creating an account you agree to the points below."
      effectiveDate="Phase 8 (pending legal review)"
      sections={[
        {
          heading: "1. Accounts",
          body: (
            <p>
              You must be 16 or older to create an account. You agree to keep
              your password confidential and to provide accurate phone and
              email — both are used for service-critical alerts and (for paid
              video lessons) embedded as a tamper-resistant watermark.
            </p>
          ),
        },
        {
          heading: "2. Therapy services",
          body: (
            <p>
              Therapy bookings on Grooming Souls are facilitated reach-outs to
              verified independent clinicians on our panel. We are a Section 8
              NGO — we are not a clinical provider ourselves. Continued
              clinical care is governed by the agreement between you and the
              clinician you engage with.
            </p>
          ),
        },
        {
          heading: "3. Psychometric tests",
          body: (
            <p>
              The five standardised tests offered on our platform are for
              educational and self-reflection use. They are{" "}
              <strong>not</strong> a clinical diagnosis. If your results raise
              concerns we will connect you with a therapist for a proper
              consultation.
            </p>
          ),
        },
        {
          heading: "4. Course access & intellectual property",
          body: (
            <>
              <p>
                Paid courses on the Academy and Diploma pages come with a
                strict time-bound access window — 1 month, 3 months, or 6
                months from the purchase activation date depending on the
                course. Once the window ends, lesson playback automatically
                locks. You may purchase a new access window to renew.
              </p>
              <p>
                All video lessons, scripts, slides, and assessment items are
                the intellectual property of Grooming Souls. Recording,
                downloading, redistributing, or publicly sharing the content
                (including the watermarked stream) is prohibited and will lead
                to immediate account termination.
              </p>
            </>
          ),
        },
        {
          heading: "5. Certificates",
          body: (
            <p>
              Hardcopy certificates are issued only for diploma courses and
              only after manual verification of 100% completion by our team.
              Couriered to the address you provide; we do not issue digital
              PDF certificates.
            </p>
          ),
        },
        {
          heading: "6. Refunds",
          body: (
            <p>
              See our{" "}
              <a
                href="/refund"
                className="font-medium text-brand-brown hover:underline"
              >
                Refund &amp; Cancellation Policy
              </a>{" "}
              for the full window and process.
            </p>
          ),
        },
        {
          heading: "7. Limitation of liability",
          body: (
            <p>
              To the maximum extent permitted by Indian law, Grooming Souls
              shall not be liable for indirect or consequential damages
              arising from the use of the platform. Our aggregate liability
              for any direct claim is capped at the fees you paid in the 90
              days preceding the claim.
            </p>
          ),
        },
        {
          heading: "8. Changes to these terms",
          body: (
            <p>
              We may update these terms when laws change or features ship.
              Material changes will be highlighted on this page and (where
              required) sent to your registered email.
            </p>
          ),
        },
      ]}
      footnote="Final legally vetted wording lands with the Phase 8 launch."
    />
  );
}
