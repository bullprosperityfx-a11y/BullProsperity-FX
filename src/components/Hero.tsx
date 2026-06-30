import type { ReactNode } from "react";

type HeroProps = {
  badge: string;
  title: ReactNode;
  text: string;
  actions?: ReactNode;
};

export function Hero({ badge, title, text, actions }: HeroProps) {
  return (
    <section className="bp-hero">
      <div className="bp-badge">{badge}</div>
      <h1>{title}</h1>
      <p>{text}</p>
      {actions ? <div className="bp-actions">{actions}</div> : null}
    </section>
  );
}
