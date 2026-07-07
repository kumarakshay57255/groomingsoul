import type { Metadata } from "next";
import { InfoPage } from "@/components/InfoPage";

export const metadata: Metadata = {
  title: "About — Grooming Souls",
  description:
    "Grooming Souls is a Section 8 mental-health NGO blending professional psychological care with high-standard academic excellence.",
};

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="About the Foundation"
      title={
        <>
          A safe space to <span className="italic">evolve, heal, and excel.</span>
        </>
      }
      subtitle="Grooming Souls is an India-based Section 8 NGO blending professional psychological care, mental welfare, and high-standard academic excellence under one roof."
      sections={[
        {
          heading: "Who we are",
          body: (
            <>
              <p>
                Grooming Souls Mental Health &amp; Welfare Foundation was
                founded to bridge the gap between academic mental-health
                knowledge and real-world compassionate care. Our team includes
                clinical psychologists, counsellors, faculty, and advisory
                doctors who supervise both our therapy services and our
                psychology academy.
              </p>
              <p>
                Every rupee generated through the academy or diploma courses is
                structurally reinvested into mental-health welfare programmes —
                free counselling outreach, intern training, and community camps.
              </p>
            </>
          ),
        },
        {
          heading: "Legal credentials",
          body: (
            <>
              <p>
                <strong>Registered Section 8 NGO</strong> under the Ministry of
                Corporate Affairs, Government of India. The Section 8
                designation legally restricts profit distribution and ensures
                every rupee re-enters welfare or operational programmes.
              </p>
              <p>
                <strong>12A &amp; 80G compliance</strong> initiated for
                CSR-grade tax-exempt status. Our financial books are audited and
                structured to collaborate on large-scale mental-health CSR
                projects.
              </p>
            </>
          ),
        },
        {
          heading: "Our vision",
          body: (
            <p>
              A stigma-free India where mental-health resources are accessible,
              professional guidance is transparent, and the next generation of
              psychology students is empowered with cutting-edge academic
              training to become elite future professionals.
            </p>
          ),
        },
        {
          heading: "Our mission",
          body: (
            <>
              <p>
                <strong>Accessible welfare.</strong> Seamless, zero-cost initial
                counselling reach-outs and standard psychometric testing to
                anyone in need of mental clarity.
              </p>
              <p>
                <strong>Academic rigour.</strong> Top-tier, structured
                e-learning modules for competitive psychology examinations
                (Class 11–12, CUET-UG, CUET-PG, UGC NET-JRF) delivered with
                clarity and secure tech tracking.
              </p>
              <p>
                <strong>Ethical grooming.</strong> Train dynamic mental-health
                professionals and interns under the guidance of our Advisory
                Panel of accomplished doctors and psychologists.
              </p>
            </>
          ),
        },
      ]}
      footnote="Full registration certificates and a downloadable annual report will be added here as our Phase 8 launch documentation is finalised."
    />
  );
}
