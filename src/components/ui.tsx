import Link from "next/link";
import type { Level } from "@/data";

const LEVEL_STYLE: Record<Level, string> = {
  A1: "bg-ok-soft text-ok",
  A2: "bg-brand-soft text-brand",
  B1: "bg-violet-soft text-violet",
};

export function LevelBadge({ level }: { level: Level }) {
  return <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${LEVEL_STYLE[level]}`}>{level}</span>;
}

export function PageHeader({
  eyebrow,
  title,
  children,
  back,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="rise mb-8">
      {back && (
        <Link href={back.href} className="mb-4 inline-block text-sm text-muted hover:text-brand">
          ← {back.label}
        </Link>
      )}
      {eyebrow && <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>}
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {children && <div className="mt-3 max-w-2xl text-muted">{children}</div>}
    </header>
  );
}

export function SectionTitle({ n, title, children }: { n?: number; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {n !== undefined && (
        <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-sm font-bold text-brand-ink">
          {n}
        </span>
      )}
      <h2 className="text-xl font-bold">{title}</h2>
      {children && <span className="text-sm text-muted">{children}</span>}
    </div>
  );
}
