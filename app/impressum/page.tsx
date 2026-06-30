import { Card } from "@/components/Card";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";

export default function ImpressumPage() {
  return (
    <SiteShell>
      <Hero badge="Rechtliches" title="Impressum" text="Angaben zum Betreiber und Kontakt der Plattform." />
      <section className="bp-grid">
        <Card badge="Betreiber" title="BullProsperity" text="Kontakt: Bullprosperityfx@gmail.com. Anfragen können über die BullProsperity Discord-Kanäle weitergeleitet werden; sensible Anliegen gehen an einen privaten Admin-Kanal." />
      </section>
    </SiteShell>
  );
}
