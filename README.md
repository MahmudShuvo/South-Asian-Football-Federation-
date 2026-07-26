# SAFF AI Football Hub

AI-powered football analytics for South Asian football — Bangladesh, India, Pakistan, Nepal, Bhutan, Maldives, Sri Lanka.

**Target launch:** 20 October 2026, ahead of the 2026 SAFF Championship in Dhaka (4–17 November 2026).

---

## Status

|                     |                                                   |
| ------------------- | ------------------------------------------------- |
| Phase               | Day 2 of 15 — foundation complete                 |
| Next                | Day 3 — database schema and seed data             |
| Infrastructure cost | $0/month (see `docs/01-architecture-day1.md` §13) |

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Requires Node 22.12+ and pnpm 11+. Copy `.env.example` to `.env.local` first.

| Command          | Does                                          |
| ---------------- | --------------------------------------------- |
| `pnpm dev`       | Run the web app                               |
| `pnpm lint`      | ESLint, including architecture boundary rules |
| `pnpm typecheck` | `tsc --noEmit` across all packages            |
| `pnpm build`     | Production build                              |
| `pnpm format`    | Prettier write                                |

## Documentation

- [`docs/01-architecture-day1.md`](docs/01-architecture-day1.md) — architecture & product definition (v1.1)
- [`docs/02-foundation-day2.md`](docs/02-foundation-day2.md) — what Day 2 built, and how to verify it
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — decision log (ADR-001 … ADR-024)
- [`docs/GIT-SETUP.md`](docs/GIT-SETUP.md) — first push, branch protection, Vercel, why the repo is public
- [`docs/day-prompts/`](docs/day-prompts/) — the prompt for each build day

## Stack

**Web** Next.js 16.2 (App Router) · React 19.2 · TypeScript 5.9 strict · Tailwind v4 · shadcn/ui · tRPC _(Day 4)_ · Prisma _(Day 3)_
**Data** PostgreSQL on Neon _(Day 3)_ · Cloudflare R2
**AI** Python library (`packages/ai-core`) run by GitHub Actions cron _(Day 11)_ · Elo + Dixon-Coles · Gemini Flash for narratives
**Hosting** Vercel Hobby → Cloudflare Workers when commercial

Architecture: modular monolith, no always-on backend service. Everything expensive is computed on write and served from cache.

## Repository layout

```
apps/web                 Next.js application
  src/app                routes (composition root)
  src/modules/<name>      domain · application · infrastructure · presentation
  src/components          ui/ (shadcn) + charts/
  src/lib                 utils, fonts, validated env
  src/styles/globals.css  the design system, as CSS custom properties
apps/mobile              reserved for Expo (2027)
packages/config          shared ESLint + TypeScript presets
packages/shared-types    types crossing app boundaries
packages/database        Prisma schema, migrations, seeds (Day 3)
packages/ai-core         Python ML library, not a server (Day 11)
docs                     planning documents and decision log
.github/workflows        CI + scheduled jobs
```

## Ground rules

- Modules may not import another module's `domain/` or `infrastructure/`. Cross-module access goes through `application/`. **Enforced by ESLint — `pnpm lint` will fail.**
- `domain/` stays pure: no Prisma, no React, no fetch. It must be testable without a database.
- Never compute in a user request path. Batch jobs write; the web layer reads.
- Every AI output stores its `model_version`.
- Every data record stores its provenance. Manual entry beats API data on conflict.
- $0 infrastructure is a hard constraint, not a target.
- Relative imports are extensionless; use the `@/` alias across folders.
- Conventional Commits, enforced by commitlint. Scopes are listed in `commitlint.config.mjs`.
