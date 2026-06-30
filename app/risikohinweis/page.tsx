import { Card } from "@/components/Card";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";

export default function RisikohinweisPage() {
  return (
    <SiteShell>
      <Hero badge="Risikohinweis" title="Keine Gewinnversprechen" text="BullProsperity vermittelt Bildung, Struktur und Prozess. Trading bleibt mit Risiko verbunden." />
      <section className="bp-grid">
        <Card badge="Eigenverantwortung" title="Risiko verstehen" text="Inhalte sollen beim strukturierten Lernen und bei der Vorbereitung helfen. Ergebnisse können nicht garantiert werden." />
        <Card badge="Transparenz" title="Klare Erwartungen" text="Die Plattform arbeitet mit Regeln, Review und Dokumentation, nicht mit Versprechen über sichere Gewinne." />
      </section>
    </SiteShell>
  );
}
