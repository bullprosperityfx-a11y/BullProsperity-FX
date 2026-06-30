import { Card } from "@/components/Card";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";

export default function DatenschutzPage() {
  return (
    <SiteShell>
      <Hero badge="Datenschutz" title="Datenschutz" text="Informationen zur Verarbeitung von Plattform-, Kontakt- und Kommunikationsdaten." />
      <section className="bp-grid">
        <Card badge="Kontakt" title="Kommunikation" text="Kontaktanfragen können per E-Mail an Bullprosperityfx@gmail.com oder über BullProsperity Discord-Kanäle erfolgen. Private Anliegen werden nur für die Bearbeitung genutzt." />
        <Card badge="Daten" title="Plattformdaten" text="Login-, Fortschritts-, Journal- und Benachrichtigungsdaten werden nur für Zugang, Plattformbetrieb und Mitgliederfunktionen verarbeitet." />
      </section>
    </SiteShell>
  );
}
