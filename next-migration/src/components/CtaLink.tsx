import Link from "next/link";
import type { ReactNode } from "react";

type CtaLinkProps = {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  variant?: "primary" | "secondary";
};

export function CtaLink({ href, children, secondary, variant = "primary" }: CtaLinkProps) {
  const isSecondary = secondary || variant === "secondary";

  return (
    <Link className={isSecondary ? "bp-button secondary" : "bp-button"} href={href}>
      {children}
    </Link>
  );
}
