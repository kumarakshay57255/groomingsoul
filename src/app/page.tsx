import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { CommitmentBand } from "@/components/CommitmentBand";
import { FoundersCorner } from "@/components/FoundersCorner";
import { FounderAchievements } from "@/components/FounderAchievements";
import { RootedInValues } from "@/components/RootedInValues";
import { EveryMind } from "@/components/EveryMind";
import { RealPeople } from "@/components/RealPeople";
import { CoreTeam } from "@/components/CoreTeam";
import { AdvisoryPanel } from "@/components/AdvisoryPanel";
import { Footer } from "@/components/Footer";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { fetchFoundationContent, fetchTeam } from "@/lib/team";
import { fetchAdvisory } from "@/lib/advisory";
import { fetchAchievements } from "@/lib/achievements";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [team, content, advisory, achievements] = await Promise.all([
    fetchTeam(),
    fetchFoundationContent(),
    fetchAdvisory(),
    fetchAchievements(),
  ]);
  const founder = team.find((m) => m.isFounder) ?? null;

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <CommitmentBand />
        <FoundersCorner founder={founder} content={content} />
        <FounderAchievements achievements={achievements} />
        <RootedInValues />
        <EveryMind />
        <RealPeople />
        <CoreTeam members={team} />
        <AdvisoryPanel members={advisory} />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
