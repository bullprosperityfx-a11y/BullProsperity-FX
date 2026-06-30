import { Card } from "@/components/Card";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";

const checks = [
  "Supabase Server Keys nur API-seitig",
  "Whop Session zentral",
  "Vimeo Lessons datenbasiert",
  "Discord Webhooks serverseitig",
  "Legal Pages vorhanden"
];

export default function StatusPage() {
  return (
    <SiteShell>
      <Hero
        badge="Launch Readiness"
        title={
          <>
            Technischer <span className="gold">Status</span>
          </>
        }
        text="Diese Seite dient in der Migration als interne Übersicht für Launch-Checks und spätere Tests."
      />
      <section className="bp-grid">
        <Card badge="Checklist" title="Nächste Prüfung" text="Vor dem Cutover wird diese Liste mit echten API- und Login-Checks verbunden.">
          <div className="bp-list">
            {checks.map((check) => (
              <div className="bp-list-item" key={check}>
                <span>{check}</span>
                <span className="bp-muted">geplant</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}
