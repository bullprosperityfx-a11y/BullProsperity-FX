import Link from "next/link";
import type { ReactNode } from "react";
import { footerNavigation, publicNavigation } from "@/data/navigation";

type SiteShellProps = {
  children: ReactNode;
  active?: string;
  eyebrow?: string;
};

export function SiteShell({ children, active, eyebrow }: SiteShellProps) {
  return (
    <div className="bp-page">
      <header className="bp-nav">
        <Link className="bp-logo" href="/">
          BullProsperity
        </Link>
        <nav className="bp-nav-links" aria-label="Hauptnavigation">
          {publicNavigation.map((item) => (
            <Link key={item.href} className={active === item.label ? "is-active" : ""} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {eyebrow ? <div className="bp-eyebrow">{eyebrow}</div> : null}
      {children}

      <footer className="bp-footer">
        <div>
          <strong>BullProsperity</strong>
          <span>Bildung, Struktur, Prozess und Community. Keine Gewinnversprechen.</span>
        </div>
        <nav aria-label="Rechtliches">
          {footerNavigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  );
}
