import { Card } from "@/components/Card";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";
import { canAccessAdmin, getSessionSnapshot } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await getSessionSnapshot();
  const isAdmin = canAccessAdmin(session.role);

  return (
    <SiteShell>
      <Hero
        badge={isAdmin ? "Admin" : "Admin Preview"}
        title={
          <>
            BullProsperity <span className="gold">Control Center</span>
          </>
        }
        text="Der neue Admin-Bereich kann später Content, Lessons, Office Hours, Discord und Member-Signale zentral verwalten."
      />
      <section className="bp-grid">
        <Card badge="Lessons" title="Video Verwaltung" text="Vimeo IDs werden nicht mehr im HTML gesucht, sondern pro Lesson in Daten gepflegt." />
        <Card badge="Members" title="Member Tracking" text="Whop, Supabase und Aktivität laufen in einem zentralen Modell zusammen." />
        <Card badge="Discord" title="Kommunikation" text="Office Hours, Results und private Admin-Hinweise bleiben getrennte Webhook-Kanäle." />
      </section>
    </SiteShell>
  );
}
