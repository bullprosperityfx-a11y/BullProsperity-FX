import { Card } from "@/components/Card";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";

const features = [
  ["Live Session Planner", "London/New York Tagesplan mit News, Bias und Risiko."],
  ["Trading Streaks", "Belohnt saubere Routinen statt Gewinne."],
  ["Mistake Pattern Engine", "Erkennt wiederkehrende Fehler automatisch."],
  ["Rulebook Lock", "Vor dem Trade eigene Regeln bestätigen."],
  ["Emotion Heatmap", "Zeigt, wann Stress oder FOMO zu Fehlern führen."],
  ["Discipline Shield", "Sperrt neue Pläne nach erreichtem Tageslimit."]
];

export default function PerformanceLabPage() {
  return (
    <SiteShell active="Operating System">
      <Hero
        badge="Performance Lab"
        title={
          <>
            Qualität vor <span className="gold">Ergebnis</span>
          </>
        }
        text="Das Performance Lab wird der App-Bereich, der BullProsperity klar von normalen Trading-Kursen abhebt: Prozess, Review, Routine und Accountability."
      />
      <section className="bp-grid">
        {features.map(([title, text]) => (
          <Card key={title} badge="OS Feature" title={title} text={text} />
        ))}
      </section>
    </SiteShell>
  );
}
