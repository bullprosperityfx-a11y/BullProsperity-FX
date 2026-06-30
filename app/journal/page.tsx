import { Card } from "@/components/Card";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";

export default function JournalPage() {
  return (
    <SiteShell active="Journal">
      <Hero
        badge="Trading Journal"
        title={
          <>
            Dokumentiere <span className="gold">Trades</span> sauber
          </>
        }
        text="Das Journal bleibt optisch clean, kann später aber direkt mit Supabase, Trade Result API, Screenshots und Weekly Reviews verbunden werden."
      />
      <section className="bp-grid">
        <Card badge="Entry" title="Trade dokumentieren" text="Markt, Richtung, Risiko, Emotion und Learning werden künftig als strukturierte Daten gespeichert." />
        <Card badge="Review" title="Fehler erkennen" text="Wiederkehrende Fehler wie FOMO, fehlender Stop-Loss oder Regelbruch werden automatisch gruppiert." />
        <Card badge="AI" title="Wochenbericht" text="OpenAI bleibt serverseitig und kann später aus Journal-Daten konkrete Learnings vorbereiten." />
      </section>
    </SiteShell>
  );
}
