import { Card } from "@/components/Card";
import { CtaLink } from "@/components/CtaLink";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";
import { toolCards } from "@/data/navigation";

export default function ToolsPage() {
  return (
    <SiteShell active="Tools">
      <Hero
        badge="Trading Werkzeuge"
        title={
          <>
            Tools für <span className="gold">Prozess</span> und Disziplin
          </>
        }
        text="Die Tool-Seite wird im neuen Aufbau aus einer zentralen Liste erzeugt. Neue Tools lassen sich dadurch später schnell ergänzen."
      />
      <section className="bp-grid">
        {toolCards.map((tool) => (
          <Card key={tool.href} badge="Tool" title={tool.title} text={tool.text}>
            <CtaLink href={tool.href} variant="secondary">
              Öffnen
            </CtaLink>
          </Card>
        ))}
      </section>
    </SiteShell>
  );
}
