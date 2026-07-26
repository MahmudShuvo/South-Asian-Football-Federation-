import { SAFF_COUNTRIES } from "@saff/shared-types";

const COUNTRY_NAMES: Record<string, string> = {
  BAN: "Bangladesh",
  IND: "India",
  PAK: "Pakistan",
  NEP: "Nepal",
  BHU: "Bhutan",
  MDV: "Maldives",
  SRI: "Sri Lanka",
};

const KICKOFF = new Date("2026-11-04T00:00:00+06:00");

function daysUntilKickoff(): number {
  const ms = KICKOFF.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/**
 * Day 2 placeholder. Its only job is to prove the stack renders: RSC, workspace
 * package imports, design tokens, and both fonts.
 */
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col justify-center gap-10 px-5 py-16">
      <header className="space-y-4">
        <p className="text-sm font-medium tracking-widest text-brand-primary uppercase">
          Day 2 · Foundation
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">SAFF AI Football Hub</h1>
        <p className="max-w-xl text-lg text-foreground-secondary">
          AI-powered analytics for South Asian football. Built for the fans, journalists and coaches
          the data industry forgot.
        </p>
      </header>

      <section className="rounded-lg border border-border bg-surface p-6">
        <h2 className="text-xs font-semibold tracking-widest text-foreground-muted uppercase">
          2026 SAFF Championship · Dhaka
        </h2>
        <p className="mt-3 flex items-baseline gap-3">
          <span className="stat-figure text-5xl font-bold text-brand-primary">
            {daysUntilKickoff()}
          </span>
          <span className="text-sm text-foreground-secondary">days to kickoff</span>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold tracking-widest text-foreground-muted uppercase">
          Coverage at launch
        </h2>
        <ul className="flex flex-wrap gap-2">
          {SAFF_COUNTRIES.map((code) => (
            <li
              key={code}
              className="rounded-md border border-border bg-surface-raised px-3 py-1.5 text-sm text-foreground-secondary"
            >
              <span className="mr-2 stat-figure text-xs text-foreground">{code}</span>
              {COUNTRY_NAMES[code]}
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-border pt-6 text-sm text-foreground-muted">
        Next: Day 3 — database schema and seed data.
      </footer>
    </main>
  );
}
