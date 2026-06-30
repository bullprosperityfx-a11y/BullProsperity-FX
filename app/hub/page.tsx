import { Card } from "@/components/Card";
import { CtaLink } from "@/components/CtaLink";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";
import { canAccessMemberArea, getSessionSnapshot } from "@/lib/auth";

export default async function HubPage() {
  const session = await getSessionSnapshot();
  const hasAccess = canAccessMemberArea(session.role);

  return (
    <SiteShell active="Hub">
      <Hero
        badge={hasAccess ? "Member Dashboard" : "Access Preview"}
        title={
          <>
            Dein <span className="gold">BullProsperity Hub</span>
          </>
        }
        text="Der Hub bündelt Fortschritt, nächste Schritte, Alerts und persönliche Plattformdaten. Im Next-Aufbau wird der Zugang serverseitig vorbereitet, damit kein kurzer Locked-Flash mehr sichtbar ist."
        actions={
          <>
            <CtaLink href="/course">Weiterlernen</CtaLink>
            <CtaLink href="/journal" variant="secondary">
              Journal öffnen
            </CtaLink>
          </>
        }
      />

      <section className="bp-grid">
        <Card badge="Onboarding" title="Dein Plan" text="Einmal erledigte Schritte sollen dauerhaft verschwinden und nicht bei jedem Login neu nerven.">
          <div className="bp-list">
            <div className="bp-list-item">
              <span>Profil prüfen</span>
              <span className="bp-muted">gespeichert</span>
            </div>
            <div className="bp-list-item">
              <span>Discord verbinden</span>
              <span className="bp-muted">optional</span>
            </div>
            <div className="bp-list-item">
              <span>Broker Setup prüfen</span>
              <span className="bp-muted">Workflow</span>
            </div>
          </div>
        </Card>
        <Card badge="Status" title="Deine Übersicht" text="Fortschritt, letzte Lesson, Notizen und gespeicherte Setups kommen später aus Supabase.">
          <div className="bp-stats">
            <div>
              <strong>{hasAccess ? "Aktiv" : "Preview"}</strong>
              <span>Zugang</span>
            </div>
            <div>
              <strong>2</strong>
              <span>Videos online</span>
            </div>
          </div>
        </Card>
      </section>
    </SiteShell>
  );
}
