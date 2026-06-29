import type { ReactNode } from "react";

type CardProps = {
  badge?: string;
  title: string;
  text: string;
  children?: ReactNode;
};

export function Card({ badge, title, text, children }: CardProps) {
  return (
    <article className="bp-card">
      {badge ? <div className="bp-badge small">{badge}</div> : null}
      <h2>{title}</h2>
      <p>{text}</p>
      {children}
    </article>
  );
}
