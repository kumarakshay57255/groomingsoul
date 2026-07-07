import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — Grooming Souls",
  description:
    "When and how Grooming Souls processes refunds for therapy bookings and paid courses.",
};

export default function RefundPage() {
  return (
    <InfoPage
      eyebrow="Refund & Cancellation"
      title={
        <>
          Clear, fair, and{" "}
          <span className="italic">no fine-print surprises.</span>
        </>
      }
      subtitle="This page summarises how cancellations and refunds work across Grooming Souls services. Final policy text is under review by our legal team — exact percentages may shift before launch."
      effectiveDate="Phase 8 (pending legal review)"
      sections={[
        {
          heading: "1. Therapy sessions (free reach-outs)",
          body: (
            <p>
              The first reach-out via the <em>Book a free session</em> CTA is
              always free. If a follow-up paid session is arranged directly
              with a clinician, refund terms are governed by that
              clinician&apos;s policy. We will connect you with them to
              resolve any dispute.
            </p>
          ),
        },
        {
          heading: "2. Psychometric tests",
          body: (
            <p>
              All five psychometric tests on our platform are free. No payment,
              no refund.
            </p>
          ),
        },
        {
          heading: "3. Academy & Diploma courses — 7-day window",
          body: (
            <>
              <p>
                A full refund is available <strong>within 7 calendar days</strong>{" "}
                of payment confirmation, provided you have watched{" "}
                <strong>less than 20%</strong> of the course content. Refund
                requests after that window or above that consumption threshold
                are reviewed case-by-case at the foundation&apos;s discretion.
              </p>
              <p>
                Requests must be sent from the email registered on the account
                to <strong>hello@groomingsouls.org</strong> with the order
                reference and a brief reason.
              </p>
            </>
          ),
        },
        {
          heading: "4. Receipts rejected during verification",
          body: (
            <p>
              If our team is unable to verify your QR-payment receipt
              (mismatched amount, illegible screenshot, duplicate
              transaction), the purchase is marked Rejected and{" "}
              <strong>your bank refund must be initiated directly with your
              UPI app</strong> — Grooming Souls does not hold the funds
              because the QR flow is direct bank-to-bank.
            </p>
          ),
        },
        {
          heading: "5. Hardcopy certificates",
          body: (
            <p>
              Hardcopy diploma certificates are non-refundable once dispatched
              (the courier ID will be shared with you). If a certificate is
              lost in transit, write to us within 14 days of dispatch and we
              will reprint and re-dispatch at no extra cost.
            </p>
          ),
        },
        {
          heading: "6. Processing time",
          body: (
            <p>
              Approved refunds are credited back to the originating UPI / bank
              account within <strong>7–10 working days</strong> of the
              decision. The actual settlement timeline depends on your bank.
            </p>
          ),
        },
        {
          heading: "7. Disputes",
          body: (
            <p>
              All disputes are governed by the laws of India and the
              jurisdiction of the courts in the city of our registered office.
            </p>
          ),
        },
      ]}
      footnote="These percentages and windows are working drafts. The final policy is being reviewed by our legal counsel ahead of the Phase 8 launch."
    />
  );
}
