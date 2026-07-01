import { Card } from "@/components/Card";
import { CtaLink } from "@/components/CtaLink";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";

export default function HomePage() {
  return (
    <SiteShell active="Home" eyebrow="Next.js Migration">
      <Hero
        badge="BullProsperity OS"
        title={
          <>
            Trading Education mit <span className="gold">Struktur</span>
          </>
        }
        text="Die neue App-Struktur trennt Design, Daten, Login und Lessons sauber voneinander. Die aktuelle HTML-Seite bleibt stabil, während diese Version vorbereitet wird."
        actions={
          <>
            <CtaLink href="/hub">Member Bereich öffnen</CtaLink>
            <CtaLink href="/course" variant="secondary">
              Kurs ansehen
            </CtaLink>
          </>
        }
      />

      <section className="bp-grid" aria-label="Plattform Vorteile">
        <Card
          badge="Clean"
          title="Keine HTML-Pflege mehr"
          text="Lessons, Tools und Texte werden künftig aus Daten gerendert, statt jede Seite einzeln anzufassen."
        />
        <Card
          badge="Access"
          title="Login zentralisieren"
          text="Whop, Adminrechte und Member-Zugang bekommen eine gemeinsame Logik, damit Seitenwechsel flüssiger werden."
        />
        <Card
          badge="Scale"
          title="Bereit für Features"
          text="Performance Lab, Journal, Notifications und Discord-Workflows lassen sich als echte App-Funktionen ausbauen."
        />
      </section>
    </SiteShell>
  );
}
