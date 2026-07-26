# Day 3 Prompt — Database Schema & Seed Data

Paste the block below to start Day 3.

---

```
Continue the SAFF AI Football Hub project. Project root is D:\Saff AI.

Read these first:
- docs/01-architecture-day1.md  (architecture, v1.1 — section 8 has the entity plan)
- docs/DECISIONS.md             (ADR-001 through ADR-021)
- docs/02-foundation-day2.md    (what Day 2 built and how to verify it)

Day 2 delivered the Turborepo monorepo: apps/web on Next.js 16 + React 19 +
TypeScript 5.9 strict, Tailwind v4 with our design tokens in CSS, ESLint 10 flat
config with eslint-plugin-boundaries enforcing module layering, Husky +
lint-staged + commitlint, GitHub Actions CI, and packages/config,
packages/shared-types, packages/database (placeholder), packages/ai-core
(placeholder).

Today is DAY 3: Database Schema & Seed Data.

Complete ONLY these tasks:

1. Create the Neon project and wire DATABASE_URL. Make it REQUIRED in
   apps/web/src/env.ts (it is currently optional).
2. Install and configure Prisma in packages/database. Use the driver adapter for
   serverless Postgres and explain the connection-pooling choice for Neon.
3. Write the full Prisma schema for every entity in architecture section 8:
   - Core: Country, Competition, Season, Team, Venue, Player, Coach,
     TeamPlayerContract, Match, MatchLineup, MatchEvent, MatchPlayerStat,
     MatchTeamStat, PlayerSeasonStat, StandingsRow
   - AI: Prediction, ModelVersion, PredictionOutcome, PlayerRating,
     TacticalProfile, AiNarrative
   - Platform: User, AuditLog, DataSource, SyncJob, EntityMapping, Favorite
   Honour the four modelling decisions in section 8: TeamPlayerContract instead
   of player.team_id, EntityMapping from day one, stored derived aggregates, and
   versioned AI output.
   Do NOT create fantasy tables yet (ADR-011) — but confirm in writing that the
   schema you wrote supports adding them later without migrating existing tables.
4. Add provenance fields to every ingested entity per FR-3 (source, sourceId,
   lastSyncedAt, verifiedBy, confidence).
5. Indexes and constraints: think carefully about the queries from architecture
   section 6.4 and index for those. Add a pg_trgm index for fuzzy player/team
   search (FR-14). Explain every index.
6. Generate and run the first migration.
7. Seed script with real data: the 7 SAFF nations, the 2026 SAFF Championship
   competition and season, and a representative squad for at least Bangladesh,
   India and Nepal. Use real player names where you can verify them; mark
   anything uncertain with confidence "unverified".
8. Export a typed Prisma singleton from packages/database, safe for hot reload in
   development and for serverless connection reuse in production.
9. Update packages/shared-types where Prisma types should be shared, without
   leaking Prisma into the domain layer (ADR-001 — domain stays pure).

Requirements:
- Write files directly into D:\Saff AI
- Explain every schema decision, especially anything denormalised on purpose
- Pin exact dependency versions
- Append new ADR entries to docs/DECISIONS.md
- Write docs/03-database-day3.md summarising the schema and how to reset/reseed
- End with verification steps I can run
- Then write the Day 4 prompt to docs/day-prompts/day-04.md

Do not build UI or API endpoints today. Schema, migrations and seed only.
```

---

## Notes before you start Day 3

- **This is the most consequential day of the 15.** Retrofitting a schema after
  screens exist means rewriting both. Spend the time.
- Create the Neon project _today_, not earlier — the free tier's 100 compute-hours
  reset monthly.
- Use a Neon **database branch** for local development so a bad migration never
  touches the branch Vercel deploys from.
- When in doubt about a field, ask whether a human data entrant can realistically
  fill it in under the 10-minute-per-match budget (FR-23). If not, it should be
  nullable or derived.
