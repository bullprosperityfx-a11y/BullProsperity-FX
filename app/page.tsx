import type { CSSProperties } from "react";
import { Card } from "@/components/Card";
import { CtaLink } from "@/components/CtaLink";
import { Hero } from "@/components/Hero";
import { SiteShell } from "@/components/SiteShell";

export default function HomePage() {
  return (
    <SiteShell active="Home" eyebrow="BullProsperity Plattform">
      <Hero
        badge="Trading Education & Community"
        title={
          <>
            Trading Education mit <span className="gold">Struktur</span>, Prozess und Klarheit
          </>
        }
        text="BullProsperity verbindet Marktstruktur, Risiko, Journal, Setups und Community in einer ruhigen Oberfläche, die Mitglieder sauber durch ihren Lernprozess führt."
        actions={
          <>
            <CtaLink href="/hub">Member Bereich öffnen</CtaLink>
            <CtaLink href="/course" variant="secondary">
              Kurs ansehen
            </CtaLink>
          </>
        }
      />

      <section className="bp-market-showcase" aria-label="BullProsperity Marktansicht">
        <div className="bp-market-copy">
          <div className="bp-badge small">Clean Market View</div>
          <h2>Fokus auf Prozess statt Lärm.</h2>
          <p>
            Die Plattform soll wie ein Trading Operating System wirken: klare Bereiche, dezente
            Smart-Money-Begriffe, schnelle Orientierung und kein unnötiger visueller Druck.
          </p>
          <div className="bp-kpi-row">
            <div>
              <strong>SMC</strong>
              <span>Struktur</span>
            </div>
            <div>
              <strong>Risk</strong>
              <span>Kontrolle</span>
            </div>
            <div>
              <strong>Review</strong>
              <span>Wachstum</span>
            </div>
          </div>
        </div>
        <div className="bp-chart-card" aria-hidden="true">
          <div className="bp-chart-top">
            <span>XAUUSD</span>
            <span>London Session</span>
          </div>
          <div className="bp-chart-grid">
            {[
              ["bull", 74, 118],
              ["bear", 48, 92],
              ["bull", 84, 136],
              ["bull", 58, 110],
              ["bear", 62, 102],
              ["bull", 96, 154],
              ["bear", 52, 96],
              ["bull", 112, 176],
              ["bull", 70, 130]
            ].map(([type, body, wick], index) => (
              <span
                key={index}
                className={`bp-candle ${type}`}
                style={{ "--body": `${body}px`, "--wick": `${wick}px` } as CSSProperties}
              />
            ))}
          </div>
          <span className="bp-smc-tag tag-hh">HH</span>
          <span className="bp-smc-tag tag-liq">Liquidity</span>
          <span className="bp-smc-tag tag-bos">BOS</span>
        </div>
      </section>

      <section className="bp-grid" aria-label="Plattform Vorteile">
        <Card
          badge="Education"
          title="Kurs mit rotem Faden"
          text="Lektionen, Modelle und Wiederholungen werden so aufgebaut, dass Mitglieder nicht springen, sondern Schritt für Schritt verstehen."
        />
        <Card
          badge="Tools"
          title="Rechner, Journal und Review"
          text="Lot Size, Journal, Checklisten und Performance Lab halten den Fokus auf Risiko, Dokumentation und saubere Entscheidungen."
        />
        <Card
          badge="Community"
          title="Discord als Begleitung"
          text="Austausch, Office Hours und Updates laufen über die Community, während die Website den strukturierten Lernpfad vorgibt."
        />
      </section>

      <section className="bp-card full bp-process-card">
        <div className="bp-badge small">Launch Fokus</div>
        <h2>Warum diese Plattform?</h2>
        <div className="bp-list">
          <div className="bp-list-item">
            <span>Klare Module statt Informationschaos.</span>
            <strong>01</strong>
          </div>
          <div className="bp-list-item">
            <span>Tools für Risiko, Journal und Umsetzung.</span>
            <strong>02</strong>
          </div>
          <div className="bp-list-item">
            <span>Praxisbereiche für Setups und Marktideen.</span>
            <strong>03</strong>
          </div>
          <div className="bp-list-item">
            <span>Transparente Hinweise ohne unnötige Abschreckung.</span>
            <strong>04</strong>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
