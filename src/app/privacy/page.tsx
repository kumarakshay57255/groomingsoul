import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Privacy Policy — Grooming Souls",
  description:
    "How Grooming Souls collects, stores, and protects your personal and clinical data under India's DPDP Act 2023.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy Policy"
      title={
        <>
          Your data. Treated with <span className="italic">clinical care.</span>
        </>
      }
      subtitle="This page summarises what we collect, how we use it, and what rights you have. Final wording is under review by our legal counsel ahead of public launch."
      effectiveDate="Phase 8 (pending legal review)"
      sections={[
        {
          heading: "1. Information we collect",
          body: (
            <>
              <p>
                <strong>Account data.</strong> Full name, email, contact number
                (used as your sign-in identifier and inside our anti-piracy
                video watermark), and a securely hashed password.
              </p>
              <p>
                <strong>Therapy intake.</strong> Name, age, contact details,
                preferred time slot, and any notes you choose to share when
                booking a session.
              </p>
              <p>
                <strong>Psychometric responses.</strong> Raw answers to any of
                the five standardised assessments (Big Five, Cognitive
                Aptitude, Sentence Completion, Perceived Stress, Emotional
                Intelligence). These are reviewed only by trained interns
                supervised by our Advisory Panel.
              </p>
              <p>
                <strong>Course access.</strong> Purchase receipt screenshots,
                course progress, and lesson playback events used to enforce
                validity windows.
              </p>
            </>
          ),
        },
        {
          heading: "2. How we use it",
          body: (
            <>
              <p>
                Strictly to deliver the services you request — connecting you
                with a therapist, returning your psychometric report,
                unlocking your course library, dispatching your hardcopy
                certificate, and improving the platform internally.
              </p>
              <p>
                We do <strong>not</strong> sell, lease, or share your data with
                third-party advertisers.
              </p>
            </>
          ),
        },
        {
          heading: "3. DPDP Act 2023 compliance",
          body: (
            <p id="dpdp">
              Grooming Souls operates as a Data Fiduciary under the Digital
              Personal Data Protection Act 2023. You have the right to access,
              correct, or request deletion of your personal data at any time —
              email us with the registered email of your account and we&apos;ll
              action the request within 30 days.
            </p>
          ),
        },
        {
          heading: "4. Where data lives",
          body: (
            <p>
              All clinical and account data sits in encrypted Postgres
              databases hosted in India-friendly regions. Lesson videos are
              served through encrypted streaming URLs. Receipt screenshots are
              stored in private file storage accessible only to authorised
              admin staff.
            </p>
          ),
        },
        {
          heading: "5. Cookies & session storage",
          body: (
            <p>
              We use a single HTTP-only session cookie to keep you signed in.
              No third-party tracking, ad pixels, or marketing analytics
              scripts are loaded on the site.
            </p>
          ),
        },
      ]}
      footnote="This is a working draft for the launch. The legally vetted final version will replace this page in Phase 8."
    />
  );
}
