# SAFF AI Football Hub

## Software Architecture & Product Definition Document

**Version:** 1.1 (Day 1 — revised for $0 infrastructure, see §7.2 and §13)
**Date:** 26 July 2026
**Author:** Mahmudul Shuvo
**Status:** Draft for internal review

---

## 0. The Deadline That Shapes Everything

Before any architecture: **the 2026 SAFF Championship is being hosted in Dhaka from 4–17 November 2026.** That is roughly 14 weeks from today.

This is not a detail — it is the single most important input to every decision in this document. A South Asian football analytics platform launching _during_ the region's flagship tournament, in the host country, has an organic-traffic window that will not repeat for two years. Everything below is optimised for **being live, stable, and impressive by 20 October 2026** (two weeks of buffer before kickoff).

Consequence for the 15-day plan: Days 1–15 must deliver a **publicly deployable MVP**, not a scaffold. We defer anything that does not survive the question _"does this help us look credible on 4 November?"_

---

## 1. Product Vision

### 1.1 Vision Statement

> **SAFF AI Football Hub is the definitive analytics platform for South Asian football — giving fans, journalists, and coaches the depth of insight that Europe's leagues take for granted, and that our region has never had.**

### 1.2 The Problem

South Asian football (Bangladesh, India, Pakistan, Nepal, Bhutan, Maldives, Sri Lanka — plus SAFF associate interest) is followed passionately by a combined population of ~1.8 billion, yet it is analytically invisible:

| Gap                   | Reality today                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data availability** | No public xG, no pass maps, no possession chains for SAFF fixtures. Commercial providers cover the Bangladesh Premier League and Indian Super League inconsistently and the SAFF Championship barely at all. |
| **Fan experience**    | Coverage is text-based Facebook posts and newspaper match reports. Zero interactive visualisation.                                                                                                           |
| **Journalism**        | Reporters have no numbers to write with, so coverage stays anecdotal.                                                                                                                                        |
| **Coaching**          | Domestic clubs and youth academies cannot afford Wyscout/StatsBomb tiers (thousands of USD per seat).                                                                                                        |
| **Discovery**         | A talented 19-year-old in Sylhet or Pokhara has no analytical footprint that a scout could ever find.                                                                                                        |

### 1.3 The Insight

The absence of data is usually treated as a blocker. **It is actually the moat.** Any competitor entering this market faces the same cold-start problem. Whoever builds the ingestion pipeline, the manual-entry tooling, and the historical archive _first_ owns the only structured dataset for South Asian football. Models can be copied; a three-year proprietary match database cannot.

So the product strategy is deliberately two-layered:

1. **The visible layer** — a beautiful, fast, AI-powered analytics product that fans use for free.
2. **The invisible layer** — a data asset that compounds daily and becomes the licensable core of the business.

### 1.4 Positioning

> "Understat for South Asia, with an AI analyst built in."

We are not competing with Opta on data volume. We compete on **being the only serious option in our region**, and on **explanation quality** — AI that tells you _why_ Bangladesh conceded from the left channel, not just that they did.

### 1.5 Success Criteria (12 months)

| Horizon           | Metric                                                   | Target                 |
| ----------------- | -------------------------------------------------------- | ---------------------- |
| Launch (Nov 2026) | Monthly active users during SAFF Championship            | 25,000                 |
| Launch            | Median page load (South Asian 4G)                        | < 2.0s LCP             |
| 3 months          | Registered users                                         | 5,000                  |
| 6 months          | Match-prediction accuracy vs. bookmaker-implied baseline | Beat baseline log-loss |
| 6 months          | Media citations of our numbers                           | 10+ published articles |
| 12 months         | Paying B2B pilots (club / federation / broadcaster)      | 3                      |
| 12 months         | Matches in proprietary database                          | 1,200+                 |

### 1.6 Explicit Non-Goals

Stating these prevents scope creep later:

- **Not a betting product.** No odds, no affiliate links, no tipster content. This decision is strategic, not moral: betting positioning destroys credibility with federations, clubs, and media — the exact partners we need — and creates regulatory exposure across seven jurisdictions with incompatible gambling laws.
- **Not a live-streaming platform.** Rights costs are prohibitive and the moat is data, not video.
- **Fantasy league: planned, but NOT in the MVP.** A SAFF fantasy game is a strong retention play and fits our data perfectly (we already need player stats + fixtures + a scoring engine). It becomes Phase 2, right after launch, because it needs three things the MVP won't have yet: reliable per-match player stats within hours of full-time, real user accounts with leagues/invites, and a job scheduler for points calculation. Building it on shaky data would produce wrong scores and burn user trust permanently. Architecture note: keep `Player`, `MatchPlayerStat`, and `User` entities clean enough that fantasy is an additive module (`fantasy_teams`, `fantasy_leagues`, `scoring_rules`), never a refactor. **Important legal line:** free-to-play with prizes only, no entry fees — paid fantasy is regulated as gambling in several Indian states and is legally murky in Bangladesh and Pakistan.
- **Not global coverage at launch.** Depth in SAFF beats shallow worldwide coverage. Breadth is the year-two expansion path.

---

## 2. User Personas

Five personas, ordered by MVP priority. Each includes the _one_ job-to-be-done that must work flawlessly.

### Persona 1 — Rafiq, The Passionate Fan (PRIMARY)

- **Age / location:** 24, Dhaka. Also: Kathmandu, Kochi, Karachi, Malé.
- **Device:** Android mid-range (Redmi/Realme), 4G, often throttled. **Roughly 85% of our traffic will be mobile.**
- **Behaviour:** Follows Bangladesh national team religiously. Argues about squad selection in Facebook groups and on X. Consumes football content in bursts around fixtures.
- **Job to be done:** _"Before and after a match, show me something I can screenshot and win an argument with."_
- **Pain:** Everything he knows is vibes. He has no numbers.
- **What he needs from us:** Fast-loading match pages, prediction with a clear confidence figure, shareable player-comparison graphics, form guides.
- **Design implication:** Mobile-first is not a slogan — it is the primary target. Every chart must be legible at 360px wide and every key view must produce a shareable image.

### Persona 2 — Nabila, The Sports Journalist (PRIMARY)

- **Age / location:** 31, Dhaka — works for a national daily and a YouTube channel.
- **Behaviour:** Writes 3–5 football pieces weekly on tight deadlines. Currently sources numbers by hand from Wikipedia and Soccerway.
- **Job to be done:** _"Give me a defensible statistic and a chart I can publish within 10 minutes of the whistle."_
- **Pain:** No citable regional data. Cannot produce data-driven journalism, so her work looks less authoritative than international coverage.
- **What she needs:** Export-ready charts (PNG/SVG with our watermark), clear methodology notes, historical head-to-head, player season aggregates.
- **Why she matters disproportionately:** She is our distribution channel. Every chart she publishes is a branded impression in front of exactly our audience. **Journalist tooling is a growth feature, not a nice-to-have.** Treat watermarked chart export as a launch requirement.

### Persona 3 — Coach Sanjay, The Domestic / Academy Coach (SECONDARY — MVP-lite)

- **Age / location:** 43, coaches a second-division club in Kolkata; equivalents across Nepal and Bangladesh.
- **Behaviour:** Analyses opponents from memory and whatever video he can find. Priced out of professional tools.
- **Job to be done:** _"Tell me the shape and weakness of the team I play on Saturday."_
- **What he needs:** Opponent tactical profile, formation tendencies, set-piece patterns, player heat maps.
- **MVP treatment:** Ship a read-only tactical profile page. Deep video-based analysis is post-MVP — it requires event data we will not have on day one. Do not promise what the data cannot support.

### Persona 4 — Farhan, The Analytics Enthusiast / Fantasy Player (SECONDARY)

- **Age / location:** 28, software engineer in Bengaluru.
- **Behaviour:** Reads FiveThirtyEight-style analysis, understands xG, will interrogate our methodology in public.
- **Job to be done:** _"Let me query the data myself and check whether your model is any good."_
- **What he needs:** Advanced metrics, model transparency, historical prediction accuracy, eventually API access.
- **Why he matters:** He is both our harshest critic and our credibility multiplier. A public "how our model performed" page converts skeptics into evangelists. **Publish our prediction track record, including the misses.** Nothing builds trust faster than visible honesty about a wrong call.

### Persona 5 — Ms. Karim, Federation / Sponsor Analyst (FUTURE — B2B)

- **Role:** Works at a national federation or a brand sponsoring football.
- **Job to be done:** _"Show me measurable engagement and player-development trends to justify budget."_
- **What she needs:** Aggregate dashboards, exports, white-label reports, data licensing.
- **MVP treatment:** Out of scope for the 15 days, but this is the revenue persona. Keep the architecture multi-tenant-capable so a private club dashboard is a permissions change, not a rewrite.

### 2.1 Persona-to-Priority Summary

| Persona             | MVP priority | Primary value to business                  |
| ------------------- | ------------ | ------------------------------------------ |
| Rafiq (Fan)         | P0           | Volume, retention, ad/affiliate-free brand |
| Nabila (Journalist) | P0           | Distribution and credibility               |
| Sanjay (Coach)      | P1           | Proof of B2B demand                        |
| Farhan (Enthusiast) | P1           | Technical credibility, API demand signal   |
| Ms. Karim (B2B)     | P2           | Revenue                                    |

---

## 3. Feature Prioritization

MoSCoW, scoped against the November deadline.

### MVP — Must Have (ship by 20 Oct 2026)

| #   | Feature                                                    | Why it's MVP                                       |
| --- | ---------------------------------------------------------- | -------------------------------------------------- |
| M1  | Team pages: squad, form, results, basic stats              | The core browse loop                               |
| M2  | Player profiles: bio, season stats, position, radar chart  | Second-most-visited page type on any football site |
| M3  | Fixtures & results calendar                                | Reason to return                                   |
| M4  | Match detail page: lineups, timeline, score                | Anchor for prediction + sharing                    |
| M5  | **AI match prediction** (win/draw/loss % + confidence)     | The headline differentiator                        |
| M6  | **AI player ranking** (composite score, position-adjusted) | Generates arguments = generates traffic            |
| M7  | Head-to-head comparison (team vs team, player vs player)   | Highest share-rate feature on comparable sites     |
| M8  | Charts: form line, radar, bar comparisons                  | The visual identity of the product                 |
| M9  | Admin CMS for manual data entry                            | **Non-negotiable.** Without this there is no data. |
| M10 | Shareable/exportable watermarked chart images              | Nabila's growth loop                               |
| M11 | Responsive mobile-first UI + dark mode                     | 85% mobile traffic                                 |
| M12 | Model transparency page (methodology + accuracy log)       | Credibility with Farhan                            |

### Should Have (Nov–Dec 2026, post-launch)

| #   | Feature                                                                       |
| --- | ----------------------------------------------------------------------------- |
| S1  | **Fantasy league v1** — pick 11, weekly points, private leagues, free-to-play |
| S2  | Live match center (polling-based score/event updates)                         |
| S3  | User accounts, favourites, follow-a-team                                      |
| S4  | AI chatbot over our own data (RAG)                                            |
| S5  | Tactical analysis: formation tendencies, zone heat maps                       |
| S6  | Push/email notifications for followed teams                                   |

### Could Have (2027)

Public API tier • Mobile app (React Native/Expo) • Bengali/Hindi/Nepali localisation • Video clip tagging • Scout/transfer module • White-label club dashboards • Fantasy v2 (chips, transfers, mini-league monetisation)

### Won't Have

Betting odds/tips • Live streaming • Social feed/comments (moderation cost across 7 countries is unaffordable at our size) • Paid-entry fantasy contests

### Prioritisation Logic

Three questions decided every row above:

1. **Does it work with the data we can realistically have by October?** (kills live event-level tactical analysis)
2. **Does a fan screenshot it?** (promotes comparison + prediction, demotes admin-facing depth)
3. **Does skipping it now cost us a rewrite later?** (kept the data model and auth boundaries in MVP even where the UI isn't)

---

## 4. Functional Requirements

Written as verifiable statements. `FR-x` numbering carries into the ticket tracker.

**Data & Ingestion**

- FR-1 System ingests fixtures, results, squads and player data from at least one external provider on a schedule.
- FR-2 System supports manual creation/editing of every entity via admin UI, and manual data always wins over API data on conflict (provider coverage of SAFF is unreliable; a human who watched the match is the better source).
- FR-3 Every record stores its provenance (`source`, `source_id`, `last_synced_at`, `verified_by`).
- FR-4 Ingestion is idempotent — re-running a sync never duplicates records.
- FR-5 Failed syncs are logged and retried with backoff without blocking the app.

**Public Product**

- FR-6 Users browse teams (7 national + domestic clubs), with squad, recent form, and aggregate stats.
- FR-7 Users view a player profile: bio, current club, position, season stats, radar chart, form trend.
- FR-8 Users browse fixtures/results filtered by competition and date.
- FR-9 Users view a match page: lineups, score, event timeline, pre-match prediction, post-match summary.
- FR-10 Users compare two teams or two players side by side.
- FR-11 Users see AI-generated win/draw/loss probabilities with a confidence indicator and plain-language reasoning.
- FR-12 Users see a ranked player leaderboard, filterable by position, country, and competition.
- FR-13 Users export any chart as a watermarked PNG.
- FR-14 Search returns teams and players with fuzzy matching and ≤300ms perceived latency.
- FR-15 All pages render on mobile at 360px without horizontal scroll.

**AI**

- FR-16 Predictions are versioned — every stored prediction records the model version that produced it, so accuracy can be attributed.
- FR-17 A public page shows historical prediction accuracy including incorrect calls.
- FR-18 Every AI output is visibly labelled as a model estimate.
- FR-19 When data is insufficient for a reliable prediction, the system says so rather than guessing.

**Admin**

- FR-20 Role-based access: `admin`, `editor`, `viewer`.
- FR-21 All admin write actions are audit-logged (who, what, when, before/after).
- FR-22 Admin can trigger a manual data sync and see its result.
- FR-23 Admin can enter a full match (lineups, events, player stats) in under 10 minutes. **This is a hard usability requirement, not an aspiration — data-entry speed is the bottleneck on the entire product.**

---

## 5. Non-Functional Requirements

| Category            | Requirement                                                                     | Target                                                                | Why this number                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Performance**     | LCP on mid-range Android, South Asian 4G                                        | < 2.0s                                                                | Regional network reality; 3s+ and Rafiq leaves                                                                                                 |
|                     | API p95 response                                                                | < 300ms                                                               | Keeps interactions feeling instant                                                                                                             |
|                     | AI prediction generation                                                        | Batch, nightly — **never in a request**                               | Removes latency from the user path entirely (see §7.2)                                                                                         |
|                     | Database cold start (Neon scale-to-zero)                                        | < 1s, and masked by ISR                                               | Cached pages don't touch the DB, so users rarely see it                                                                                        |
| **Scalability**     | Concurrent users during a Bangladesh match                                      | 10,000 without degradation                                            | Traffic will be extremely spiky — 50x baseline for 2 hours, then flat                                                                          |
|                     | Architecture                                                                    | Stateless services, horizontally scalable                             | Spiky load demands it                                                                                                                          |
| **Availability**    | Uptime                                                                          | 99.5% general, 99.9% on match days                                    | Match-day downtime is reputationally fatal                                                                                                     |
| **Security**        | Auth                                                                            | Hashed credentials, short-lived tokens, HTTP-only cookies             |                                                                                                                                                |
|                     | Transport                                                                       | HTTPS enforced, HSTS                                                  |                                                                                                                                                |
|                     | Input                                                                           | Validated at every boundary (Zod client/edge, Pydantic in AI service) |                                                                                                                                                |
|                     | Secrets                                                                         | Env-injected, never committed                                         |                                                                                                                                                |
|                     | Rate limiting                                                                   | Per-IP on public API, stricter on AI endpoints                        | AI calls cost money; abuse is a billing risk                                                                                                   |
| **Accessibility**   | WCAG 2.1 AA: contrast, keyboard nav, alt text, no colour-only encoding          |                                                                       | Colour-blind users must read our charts                                                                                                        |
| **Observability**   | Structured logs, error tracking (Sentry), uptime alerts, model-drift monitoring |                                                                       | You cannot fix what you cannot see                                                                                                             |
| **Maintainability** | Type-safe end to end, ≥60% coverage on business logic, CI on every PR           |                                                                       | Small team, no capacity for regressions                                                                                                        |
| **Cost**            | **Infra = $0/month pre-revenue**                                                | Hard constraint                                                       | Bootstrapped. Every service must have a free tier we stay inside, and the architecture must make that possible rather than merely hope for it. |
| **Data quality**    | Every public stat traceable to a source; confidence badge on partial data       |                                                                       | Our credibility is the product                                                                                                                 |
| **Compliance**      | GDPR-shaped consent handling, no PII in logs, respect provider ToS              |                                                                       | Cheap now, expensive to retrofit                                                                                                               |

**The three that most constrain design:** the $0 cost ceiling, the 10k-concurrent match-day spike, and the 2s mobile LCP. Together they mandate aggressive caching, static generation wherever possible, and zero always-on compute. Notice these three constraints are not in tension — they all point at the same answer, which is a good sign the architecture is sound.

---

## 6. High-Level Architecture

### 6.1 Shape: Modular Monolith + Separate AI Service

```
┌──────────────────────────────────────────────────────────┐
│  CLIENTS                                                 │
│  Web (Next.js, mobile-first)   ·   Future: Expo app      │
└───────────────────────┬──────────────────────────────────┘
                        │ HTTPS / tRPC + REST
┌───────────────────────▼──────────────────────────────────┐
│  APPLICATION LAYER — Next.js 16 on Vercel                │
│  ┌────────────┬────────────┬────────────┬─────────────┐  │
│  │ Public web │ Admin CMS  │ API layer  │ Auth        │  │
│  │ (RSC/ISR)  │ (client)   │ (tRPC)     │ (Auth.js)   │  │
│  └────────────┴────────────┴────────────┴─────────────┘  │
│  Domain modules: teams · players · matches · stats ·     │
│                  predictions · rankings · admin           │
└──────────────────────┬───────────────────────────────────┘
                       │ Prisma
       ┌───────────────▼────────────────┐
       │  DATA LAYER                    │
       │  Postgres (Neon, scale-to-zero)│
       │  Object storage (Cloudflare R2)│
       │  Cache: Next.js ISR / edge     │
       └───────────▲────────────────────┘
                   │ writes only (no HTTP service)
   ┌───────────────┴───────────────────────────────────┐
   │  BATCH LAYER — GitHub Actions scheduled workflows │
   │                                                   │
   │  nightly-predictions  → packages/ai-core          │
   │                          · Elo + Dixon-Coles      │
   │                          · player rating engine   │
   │                          · tactical features      │
   │  sync-data            → provider adapter → upsert │
   │  recompute-ratings    → aggregates refresh        │
   │  backup-db            → pg_dump → R2              │
   └──────────────────────┬────────────────────────────┘
                          │
                 ┌────────▼──────────────┐
                 │  Gemini Flash (free)  │
                 │  narrative generation │
                 └───────────────────────┘
```

Note what is **not** in this diagram: any always-on backend service. The web layer reads precomputed rows; the batch layer writes them. Nothing computes during a request. That is what makes it both free and spike-proof.

### 6.2 Why Modular Monolith, Not Microservices

The instinct for a "production-grade, scalable" system is microservices. **That would be a mistake here**, and this is the most important architectural decision in the document.

Microservices solve an _organisational_ problem — many teams needing independent deploy cadence. You are one person with a 14-week deadline. What microservices would actually buy you: distributed tracing you don't have time to set up, network calls where a function call would do, eventual-consistency bugs, and 6 deploy pipelines instead of 2.

A **modular monolith** gives the real benefit — enforced boundaries — at near-zero cost. Each domain module owns its data access and exposes a service interface; nothing imports another module's internals. When a module genuinely needs independent scaling, it lifts out cleanly because the seam already exists.

**The one exception is the AI service, and it's split for concrete reasons, not aesthetics:**

1. **Language.** The ML ecosystem (scikit-learn, XGBoost, pandas, statsmodels) is Python. Reimplementing Poisson regression in TypeScript is masochism.
2. **Resource profile.** Model training is CPU-heavy and long-running; web requests are I/O-bound and short. Co-locating them means one starves the other.
3. **Deploy cadence.** Retraining a model should not require redeploying the website.
4. **Cold starts.** Serverless functions with a 300MB ML dependency tree start slowly. Keeping the web layer light preserves the 2s LCP target.

### 6.3 Layering Inside Each Module (Clean Architecture)

```
Presentation   → React components, route handlers      (knows HTTP/JSX)
Application    → use cases, orchestration              (knows the workflow)
Domain         → entities, business rules, value types (knows nothing external)
Infrastructure → Prisma, HTTP clients, cache, storage  (knows the outside world)
```

Dependencies point **inward only**. Domain logic never imports Prisma. This is what makes the code testable without a database and portable if we ever swap providers.

**Where I'll pragmatically bend it:** for simple read paths (fetch a team page), a server component calling a repository directly is fine — inserting a use-case class that just forwards the call is ceremony, not architecture. Full layering applies where there is real logic: prediction, ranking, ingestion, scoring.

### 6.4 Key Data Flows

**Fan opens a match page (read-heavy, must be fast)**
`Request → Vercel edge cache → RSC → Redis check → Postgres on miss → render → ISR cache`
Prediction is read from the `predictions` table, _precomputed_, never generated on request. Predicting inside the request would blow the 2s budget and the cost ceiling.

**Nightly prediction generation (write-heavy, latency-tolerant)**
`Cron 02:00 → find upcoming fixtures → AI service computes → store with model_version → invalidate cache`

**Admin enters a match**
`Form → Zod validate → tRPC mutation → transaction (match + events + player stats) → audit log → recompute aggregates → invalidate cache → queue re-ranking`

**Design principle throughout: compute on write, serve on read.** Every expensive operation runs on a schedule or a mutation, never in a user's request path. This single principle is what lets a **$0/month** setup absorb a 10,000-user match-day spike.

---

## 7. Recommended Technology Stack

| Layer           | Choice                                                          | Version (July 2026) | Why this, not the alternative                                                                                                                                                                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Web framework   | **Next.js (App Router)**                                        | 16.2.x              | RSC means charts and stats render on the server → tiny JS payload → hits our 2s mobile LCP. Alternative (Vite SPA) ships more JS and has no built-in ISR.                                                                                                                                                                                                       |
| Language        | **TypeScript** (strict)                                         | 5.x                 | Non-negotiable. Football data is deeply nested; types are the cheapest bug prevention available.                                                                                                                                                                                                                                                                |
| Styling         | **Tailwind CSS + shadcn/ui**                                    | v4 / latest         | Utility CSS keeps bundle small; shadcn gives accessible primitives we _own_ (copied in, not a dependency) so we can theme freely. Alternative (MUI) is heavier and fights custom design.                                                                                                                                                                        |
| Charts          | **Recharts** (+ D3 for pitch maps)                              | latest              | Recharts covers 90% of needs declaratively; raw D3 for heat maps/pitch visuals where we need full control. Chart.js is canvas-based — harder to export as crisp SVG for journalists.                                                                                                                                                                            |
| API layer       | **tRPC**                                                        | v11                 | End-to-end type safety with zero codegen; refactor a field name and the frontend fails at compile time. Alternative (REST + OpenAPI) needs a generation step and drifts. _We still expose thin REST routes for the future mobile app and public API._                                                                                                           |
| ORM             | **Prisma**                                                      | v6                  | Best-in-class TS types and migration DX. Alternative (Drizzle) is faster and lighter — a legitimate choice; Prisma wins on Studio (a free admin data browser, genuinely useful on day one) and maturity.                                                                                                                                                        |
| Database        | **PostgreSQL via Neon**                                         | 17                  | Football data is inherently relational (team↔player↔match↔event). Postgres also gives JSONB for irregular provider payloads and `pg_trgm` for fuzzy search — no separate search service needed. Neon over Supabase: its free tier scales to zero instead of _pausing the project_ after a week of inactivity, and DB branching gives every PR its own database. |
| Cache           | **Next.js `unstable_cache` + ISR only**                         | —                   | **No Redis in MVP.** Next.js's built-in cache covers our access patterns; adding Redis on day one is a service to operate, a bill to pay, and a failure mode to debug, for no measurable gain at our traffic. Add it when profiling proves we need it.                                                                                                          |
| Object storage  | **Cloudflare R2**                                               | —                   | Team crests and OG images. 10GB free, and zero egress fees — which matters because images are our only bandwidth-heavy asset.                                                                                                                                                                                                                                   |
| Auth            | **Auth.js (NextAuth) v5**                                       | —                   | Free, self-hosted, no per-MAU billing. Clerk is nicer DX but costs per user — wrong shape for a consumer product targeting 25k MAU.                                                                                                                                                                                                                             |
| AI layer        | **Python 3.12 batch worker** (no server)                        | —                   | See §7.2 — the biggest revision to the original design. Pydantic for validation, `uv` for fast dependency install in CI.                                                                                                                                                                                                                                        |
| ML              | **scikit-learn, XGBoost, pandas, statsmodels**                  | —                   | Classical models. See §7.1.                                                                                                                                                                                                                                                                                                                                     |
| LLM             | **Google Gemini Flash** (free tier) behind a provider interface | —                   | 1,500 requests/day free is ~100x what we need for ~10 match narratives daily. Kept behind an `LlmProvider` interface so swapping to Claude or OpenAI later is one file.                                                                                                                                                                                         |
| Hosting (web)   | **Vercel Hobby** → Cloudflare when commercial                   | —                   | Vercel for DX now. Note its Hobby tier is licensed non-commercial only, so keep the app Docker-buildable and OpenNext-compatible. Cloudflare Workers' free tier explicitly permits commercial use at 100k requests/day.                                                                                                                                         |
| Hosting (AI)    | **GitHub Actions scheduled workflows**                          | —                   | Free. No server to pay for, patch, or monitor.                                                                                                                                                                                                                                                                                                                  |
| CI/CD           | **GitHub Actions**                                              | —                   | Lint, typecheck, test, migrate on PR. Public repo = unlimited minutes.                                                                                                                                                                                                                                                                                          |
| Monitoring      | **Sentry + Vercel Analytics**                                   | —                   | Free tiers sufficient at our scale.                                                                                                                                                                                                                                                                                                                             |
| Testing         | **Vitest, Playwright, pytest**                                  | —                   | Unit, E2E, and Python-side respectively.                                                                                                                                                                                                                                                                                                                        |
| Package manager | **pnpm + Turborepo**                                            | —                   | Monorepo with shared types between web and future mobile app.                                                                                                                                                                                                                                                                                                   |

**Estimated monthly cost pre-revenue: $0.** See §13 for the full free-tier plan and its breaking points.

### 7.2 The Revision That Makes $0 Possible: No AI Server

The original design had FastAPI running as an always-on container. That was the only line item that could not be free — and on reflection it was also unnecessary.

Go back to the core principle in §6.4: **compute on write, serve on read.** Predictions are generated nightly and stored in the `predictions` table. The web app _reads_ them. It never calls the AI service during a request. So what is the always-on server actually for?

Nothing. It's a cron job wearing a web framework.

**Replace it with a Python package invoked by a GitHub Actions scheduled workflow:**

```
.github/workflows/nightly-predictions.yml
  cron: '0 20 * * *'   (02:00 Dhaka)
  → checkout → uv install → python -m ai.jobs.generate_predictions
  → reads Postgres, computes, writes predictions + model_version
```

What this buys:

- **$0 hosting.** No container, no idle cost.
- **No cold starts** — irrelevant for a batch job, whereas they'd have hurt a serverless HTTP service badly with a 300MB ML dependency tree.
- **Free observability.** Every run is a logged GitHub Actions job with output you can read, and failures email you automatically. That's better monitoring than I'd have set up manually.
- **Reproducibility.** Every prediction run is tied to a commit SHA.
- **Simpler security.** No public AI endpoint to authenticate or rate-limit.

What it costs:

- **No on-demand inference.** Nothing can be predicted in real time. Acceptable — nothing in the MVP needs it.
- **The chatbot (S4) will eventually need a request/response path.** That's Phase 2, and it should be a Next.js route handler calling the LLM directly, not a Python service — no ML libraries are involved in a RAG chatbot over our own Postgres.
- **GitHub Actions cron is best-effort** and can be delayed several minutes under load. Fine for a 2am batch job; would not be fine for live match updates.

**Migration path back to a server:** the model code lives in `packages/ai-core` as a plain Python library with no framework dependency. If we ever need HTTP inference, we wrap it in FastAPI in an afternoon. The library boundary is what keeps this decision cheap to reverse — which is the real test of a good early architectural choice.

### 7.1 The Most Important Stack Decision: Don't Use Deep Learning

The temptation with "AI-powered" is neural networks. For match prediction with SAFF-sized data (hundreds of matches, not hundreds of thousands), **that is the wrong tool.**

Use instead, in this order:

1. **Poisson / Dixon-Coles regression** — the academic standard for football scorelines. Models attack and defence strength per team, handles low-scoring sports correctly, and works with ~100 matches. Interpretable, which matters because we promised transparency.
2. **Elo-style rating** — cheap, robust, excellent baseline for team strength.
3. **XGBoost** — layer on contextual features (home advantage, rest days, travel, squad availability) once we have volume.
4. **LLM** — for _explaining_ model output in natural language, never for computing the probability itself.

A neural net on 300 matches will overfit spectacularly and produce confident nonsense we cannot debug. Dixon-Coles will be more accurate _and_ explainable. **We can add deep learning in year two when the data justifies it** — the architecture keeps model selection behind an interface, so upgrading is a swap, not a rewrite.

---

## 8. Database Entity Planning

Entities and relationships only — no schema until Day 3.

### Core entities

| Entity               | Purpose                                                   | Key relationships                                            |
| -------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| `Country`            | Bangladesh, India, Nepal…                                 | has many Teams, Players, Venues                              |
| `Competition`        | SAFF Championship, BPL, ISL, friendlies                   | has many Seasons                                             |
| `Season`             | 2026 edition of a competition                             | has many Matches, StandingsRows                              |
| `Team`               | National teams + domestic clubs                           | belongs to Country; has many Players (via contract), Matches |
| `Venue`              | Stadium                                                   | belongs to Country; has many Matches                         |
| `Player`             | Individual footballer                                     | belongs to Country; many Teams over time                     |
| `Coach`              | Manager                                                   | belongs to Country; many Teams over time                     |
| `TeamPlayerContract` | Player's spell at a team (join with dates + shirt number) | resolves the many-to-many properly                           |
| `Match`              | A fixture or result                                       | belongs to Season, Venue; two Teams (home/away)              |
| `MatchLineup`        | Starting XI + bench per team per match                    | belongs to Match, Team                                       |
| `MatchEvent`         | Goal, card, sub, penalty — with minute                    | belongs to Match, Player                                     |
| `MatchPlayerStat`    | Per-player per-match numbers                              | belongs to Match, Player                                     |
| `MatchTeamStat`      | Per-team per-match numbers (possession, shots)            | belongs to Match, Team                                       |
| `PlayerSeasonStat`   | **Derived aggregate**, refreshed on write                 | belongs to Player, Season                                    |
| `StandingsRow`       | League table position                                     | belongs to Season, Team                                      |

### AI entities

| Entity              | Purpose                                         | Notes                                                           |
| ------------------- | ----------------------------------------------- | --------------------------------------------------------------- |
| `Prediction`        | Stored pre-match probabilities                  | must store `model_version`, `generated_at`, `features_snapshot` |
| `ModelVersion`      | Registry of trained models                      | name, algorithm, trained_at, metrics, is_active                 |
| `PredictionOutcome` | Actual result joined to prediction              | powers the public accuracy page                                 |
| `PlayerRating`      | Composite AI score, point-in-time               | versioned like predictions                                      |
| `TacticalProfile`   | Derived formation/style summary per team-season |                                                                 |
| `AiNarrative`       | LLM-generated match summary                     | cached; store the prompt version too                            |

### Platform entities

| Entity          | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `User`          | Account (admin + future public users), with `role`                      |
| `AuditLog`      | Who changed what, when, before/after                                    |
| `DataSource`    | Provider registry (name, base URL, credentials ref)                     |
| `SyncJob`       | Ingestion run: status, records touched, errors                          |
| `EntityMapping` | Maps our IDs to each provider's IDs — **critical for idempotent syncs** |
| `Favorite`      | User follows a team/player (Phase 2)                                    |

### Fantasy entities (Phase 2 — planned now so the core model doesn't need changing)

`FantasyGameweek` · `FantasySquad` (user's 11 + bench for a gameweek) · `FantasySquadPlayer` · `FantasyLeague` (private, invite code) · `FantasyLeagueMember` · `ScoringRule` (points per goal/assist/clean sheet, versioned) · `FantasyPoints` (computed per player per gameweek)

Note that fantasy needs _nothing new_ from the football side — it reads `MatchPlayerStat` and applies `ScoringRule`. That's the payoff of getting the core entities right first.

### Four modelling decisions worth flagging

1. **`TeamPlayerContract` instead of `player.team_id`.** Players transfer. A direct foreign key destroys history — you could no longer answer "who was in the 2024 squad?" Slightly more join complexity, permanently correct data.
2. **Store derived aggregates (`PlayerSeasonStat`) rather than computing on read.** Violates normalisation on purpose: recomputing a season aggregate on every page view is exactly the kind of read-time work our cost ceiling forbids. Refresh on write, treat as a cache with a source of truth behind it.
3. **`EntityMapping` from day one.** Without it, the second sync creates duplicate players with slightly different name spellings, and you will spend a weekend deduplicating by hand. Ask me how I know this is the classic sports-data mistake.
4. **Version every AI output.** A prediction without a model version is unauditable — you can never tell whether accuracy improved or the data just got easier. This is the difference between an AI product and an AI demo.

---

## 9. Folder Structure Planning

Turborepo monorepo — shares types with the future mobile app.

```
saff-ai-hub/
├── apps/
│   ├── web/                      # Next.js 16
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (public)/     # teams, players, matches, rankings
│   │       │   ├── (admin)/      # CMS, protected by middleware
│   │       │   ├── api/          # tRPC handler + REST for mobile
│   │       │   └── layout.tsx
│   │       ├── modules/          # ◄ the important part
│   │       │   ├── teams/
│   │       │   │   ├── domain/          # entities, rules — zero deps
│   │       │   │   ├── application/     # use cases
│   │       │   │   ├── infrastructure/  # prisma repository
│   │       │   │   └── presentation/    # components, hooks
│   │       │   ├── players/
│   │       │   ├── matches/
│   │       │   ├── predictions/
│   │       │   ├── rankings/
│   │       │   ├── fantasy/      # Phase 2 — folder reserved
│   │       │   └── admin/
│   │       ├── components/ui/    # shadcn primitives
│   │       ├── components/charts/
│   │       ├── lib/              # trpc, prisma, redis, auth clients
│   │       └── styles/
│   └── mobile/                   # reserved for Expo
├── packages/
│   ├── database/                 # prisma schema, migrations, seeds
│   ├── shared-types/             # types used by web + mobile + AI contracts
│   ├── ai-core/                  # ◄ Python library, NOT a server (§7.2)
│   │   ├── ai/
│   │   │   ├── features/         # feature extraction from Postgres
│   │   │   ├── models/           # elo.py, dixon_coles.py, rating.py
│   │   │   ├── jobs/             # generate_predictions.py, retrain.py,
│   │   │   │                     #   recompute_ratings.py — CLI entrypoints
│   │   │   ├── llm/              # provider interface + gemini adapter
│   │   │   └── evaluation/       # log-loss, Brier, backtesting
│   │   ├── tests/
│   │   └── pyproject.toml
│   ├── ui/                       # cross-app components (later)
│   └── config/                   # eslint, tsconfig, tailwind presets
├── docs/                         # this document lives here
├── .github/workflows/
│   ├── ci.yml                    # lint, typecheck, test, build
│   ├── nightly-predictions.yml   # cron 02:00 Dhaka
│   ├── sync-data.yml             # cron, provider ingestion
│   ├── recompute-ratings.yml     # cron, player ranking refresh
│   └── backup-db.yml             # cron, pg_dump → R2 (see §13.3)
└── turbo.json
```

**The rule that makes this work:** a module may import from `shared-types`, `lib`, and `components/ui`. It may **not** import another module's `domain/` or `infrastructure/`. Cross-module needs go through the other module's `application/` layer. Enforce it with an ESLint boundary rule on Day 2 — a convention nobody checks is a convention nobody follows.

---

## 10. UI/UX Inspiration & Design System

### 10.1 References and what to take from each

| Source               | Take this                                                                   |
| -------------------- | --------------------------------------------------------------------------- |
| **FotMob**           | Match page information hierarchy. Best-in-class mobile football UX.         |
| **Understat**        | Data density without clutter; xG visual language.                           |
| **The Athletic**     | Editorial typography — makes stats feel like journalism, not a spreadsheet. |
| **Linear**           | Dark-mode craft, motion restraint, keyboard-first admin feel.               |
| **Vercel dashboard** | Clean data cards, generous whitespace.                                      |
| **Stripe docs**      | How to present complex information calmly.                                  |

**Direction: dark-first, editorial-analytical.** Dark mode because football is consumed at night in this region, it reduces OLED battery drain on mid-range Androids, and charts pop against dark backgrounds. Light mode ships too, but dark is the design source of truth.

### 10.2 Design tokens

**Colour**

```
Background      #0A0E14  (near-black, slight blue)
Surface         #131820
Surface raised  #1C2333
Border          #252D3D
Text primary    #F3F5F9
Text secondary  #94A3B8
Text muted      #64748B

Brand primary   #00D46A  (pitch green — energy, "live")
Brand accent    #7C5CFF  (violet — AI/prediction features)

Win  #00D46A   Draw #94A3B8   Loss #FF4757
Positive #22C55E   Warning #F59E0B   Negative #EF4444
Data series: #00D46A #7C5CFF #38BDF8 #FBBF24 #FB7185 #34D399
```

Semantic naming (`--color-brand-primary`, not `--green`) so rebranding is a token change. All text/background pairs verified at 4.5:1 minimum. **Never encode win/draw/loss by colour alone** — always pair with a letter or icon, since red-green colour blindness affects ~8% of men and our audience is heavily male.

**Typography**

- UI + headings: **Inter** (variable) — excellent at small sizes, wide language coverage
- Numbers/stats: **JetBrains Mono** or Inter tabular figures — **critical**: tabular numerals stop stat columns from jittering
- Bengali/Devanagari later: **Noto Sans Bengali / Devanagari**
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 px

**Spacing:** 4px base — 4, 8, 12, 16, 24, 32, 48, 64
**Radius:** sm 6 · md 10 · lg 14 · full 9999
**Elevation:** subtle borders over heavy shadows (shadows read poorly on dark)
**Motion:** 150ms micro-interactions, 250ms transitions, `ease-out`. Respect `prefers-reduced-motion`. No decorative animation — it costs battery and load time.

### 10.3 Component inventory for MVP

_Primitives:_ Button, Input, Select, Tabs, Dialog, Sheet, Tooltip, Badge, Avatar, Skeleton, Table, Toast
_Football-specific:_ TeamCrest, PlayerAvatar, FormGuide (W-D-L pills), ScoreCard, MatchTimeline, LineupPitch, StatBar (comparative), RadarChart, PredictionGauge, RankingTable, CountryFlag, ConfidenceBadge, DataQualityBadge, ShareableChartFrame

### 10.4 Five UX principles for this product

1. **Mobile-first, literally.** Design at 360px, then expand. Not the reverse.
2. **Skeletons, never spinners.** On slow connections a skeleton communicates structure and feels twice as fast.
3. **Label AI honestly.** Predictions carry a confidence badge and an "AI estimate" marker. Overstating certainty is how analytics products lose credibility permanently.
4. **Show data gaps openly.** A "limited data" badge builds more trust than a silently thin page. Our coverage _will_ be uneven at launch; own it.
5. **Every insight is shareable.** A share button on every chart. Growth in this market happens in Facebook groups and WhatsApp, not on Product Hunt.

---

## 11. 15-Day Development Roadmap

| Day    | Focus                       | Deliverable                                                                                                                                                            |
| ------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | Architecture & planning ✅  | This document                                                                                                                                                          |
| **2**  | Repo foundation             | Turborepo + Next.js 16 + TS strict + Tailwind + shadcn, ESLint module boundaries, Prettier, Husky, GitHub Actions CI, folder skeleton, first deploy to Vercel          |
| **3**  | Database                    | Full Prisma schema for all core entities, migrations, `EntityMapping`, seed script with the 7 SAFF nations + squads                                                    |
| **4**  | Data layer & API            | Repository pattern per module, tRPC router setup, Zod validation, `unstable_cache` wrappers with tag-based invalidation, error handling                                |
| **5**  | Design system in code       | Tokens, theme provider, dark/light, all UI primitives, football-specific components, Storybook-lite showcase page                                                      |
| **6**  | Teams & players (public)    | Team list/detail, player list/detail, squad view, form guide, fuzzy search — real data from seed                                                                       |
| **7**  | Matches & fixtures          | Fixtures calendar, match detail page, lineups, event timeline, standings table                                                                                         |
| **8**  | Charts & comparison         | Recharts wrappers, radar, form line, StatBar, team-vs-team and player-vs-player compare pages, PNG export with watermark                                               |
| **9**  | Admin CMS                   | Auth.js with roles, protected routes, CRUD for all entities, fast match-entry form (the 10-minute requirement), audit log                                              |
| **10** | Data ingestion              | Provider adapter interface, one concrete adapter, normaliser, idempotent upsert, GitHub Actions cron, SyncJob logging, manual-wins conflict rule                       |
| **11** | AI core scaffold            | `packages/ai-core` Python library, `uv` setup, feature extraction from Postgres, first GitHub Actions cron workflow proving the pattern end to end, DB backup workflow |
| **12** | Prediction model            | Elo baseline + Dixon-Coles/Poisson, training script, evaluation (log-loss, Brier), ModelVersion registry, nightly generation job writing to `predictions`              |
| **13** | Player ranking + narratives | Position-adjusted composite rating, ranking leaderboard UI, Gemini-generated match summaries behind an `LlmProvider` interface, PredictionGauge wired to real output   |
| **14** | Quality & performance       | Vitest unit tests, Playwright E2E on critical paths, Lighthouse pass to hit 2s LCP, SEO metadata + OG images, sitemap, Sentry, accessibility audit                     |
| **15** | Launch prep                 | Public methodology/accuracy page, landing page, production env config, backups, runbook, README, Phase-2 backlog (fantasy league spec, live center)                    |

**Sequencing logic:** data model before UI (Days 3–4 before 6–8), because retrofitting a schema after building screens means rewriting both. AI last (11–13) because models are worthless without data to train on, and the seed + ingestion work has to land first. Testing and performance get a dedicated day rather than being sprinkled — concentrated effort on a real, complete app finds more than piecemeal checks on fragments.

**If a day slips**, cut in this order: chart export → tactical profile → narratives → ingestion adapter (fall back to admin-only entry). Never cut Days 3, 9, or 12 — the schema, the data-entry tool, and the prediction model are the product.

---

## 12. Risks & Mitigations

| #   | Risk                                                    | Likelihood | Impact   | Mitigation                                                                                                                                                                                                                                          |
| --- | ------------------------------------------------------- | ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | **No reliable SAFF data source** — the existential risk | High       | Critical | Admin CMS as first-class product (Day 9), not an afterthought. Pluggable adapter interface so any provider can be added. Recruit 2–3 volunteer data entrants from fan communities before launch. Seed historical data manually from public records. |
| R2  | Provider API changes or revokes access                  | Medium     | High     | Adapter pattern isolates the blast radius to one file. Never depend on a single source. Cache raw payloads.                                                                                                                                         |
| R3  | Model produces embarrassing predictions                 | Medium     | High     | Confidence intervals shown always. Refuse to predict below a data threshold (FR-19). Public accuracy page frames us as honest rather than infallible. Interpretable models we can actually debug.                                                   |
| R4  | Match-day traffic spike takes the site down             | Medium     | High     | Compute-on-write + ISR + edge cache means most traffic never touches the database. Load-test on Day 14. Vercel autoscales.                                                                                                                          |
| R5  | Solo developer burnout / illness                        | Medium     | High     | 15-day plan has explicit cut-order (above). Deploy from Day 2 so there's always something shippable. Document as you go — this file is step one.                                                                                                    |
| R6  | LLM API costs spiral                                    | Low        | Medium   | Gemini free tier, no billing account attached — impossible to be charged. Cache every narrative; generate on write only. Never call an LLM in a user request path.                                                                                  |
| R6b | **Free tier suspended or provider kills it**            | Medium     | High     | Nightly `pg_dump` to R2 + a monthly copy elsewhere (§13.3). Every provider is swappable: Prisma abstracts the DB, `LlmProvider` abstracts the model, Next.js self-hosts via Docker. Never store the only copy of the data on a free tier.           |
| R7  | Scope creep (esp. fantasy, live center, chatbot)        | **High**   | High     | §1.6 and §3 are the contract. Anything new goes to the Phase-2 backlog, not the current sprint. Revisit only after 4 November.                                                                                                                      |
| R8  | Federation or provider objects to data usage            | Low        | High     | Cite sources, respect robots.txt and ToS, no wholesale republication. Approach BFF/SAFF as partners early — being useful to them is better than being invisible.                                                                                    |
| R9  | Nobody uses it                                          | Medium     | Critical | Journalist-first distribution (Nabila persona). Ship shareable graphics. Seed content into fan Facebook groups pre-tournament. Launch timed to the one moment regional attention peaks.                                                             |
| R10 | Data quality errors published as fact                   | Medium     | Medium   | Provenance on every record, audit log, DataQualityBadge, correction workflow, two-person review for headline stats.                                                                                                                                 |
| R11 | Fantasy league launched on unreliable stats             | Medium     | High     | Explicitly deferred to Phase 2 for exactly this reason. Gate its launch on a data-freshness SLA: player stats complete within 6h of full-time for 95% of matches.                                                                                   |
| R12 | Legal exposure from fantasy prizes                      | Low        | High     | Free-to-play only, no entry fees. Get local counsel before any monetised contest.                                                                                                                                                                   |
| R13 | Vendor lock-in (Vercel/Neon)                            | Low        | Medium   | Both are managed layers over open standards (Node, Postgres). Prisma abstracts the DB; Next.js self-hosts via Docker or deploys to Cloudflare via OpenNext. Acceptable trade for the velocity.                                                      |
| R14 | Prisma/Next.js breaking changes mid-build               | Low        | Medium   | Pin exact versions. Upgrade only between phases, never mid-sprint.                                                                                                                                                                                  |

**The three that deserve real attention: R1, R7, R9.** Everything else is ordinary engineering risk. Those three are where this project actually dies — no data, no focus, or no audience.

---

## Appendix: Open Questions for Day 2+

1. Which data provider gets evaluated first — API-Football, SportMonks, or Football-Data.org? (Coverage test needed: query each for a 2024 SAFF fixture and compare.)
2. Do we commit to Bengali localisation at launch or Phase 2?
3. Domain name and brand mark — needed by Day 14 for OG images.
4. Can we recruit volunteer data entrants before Day 9, so the CMS is tested by real users?

---

_End of Day 1 document._

---

## 13. Zero-Cost Deployment Plan

Added after review: the $0 infrastructure requirement is a hard constraint, not a target.

### 13.1 The full stack at $0

| Service                 | Free tier                                             | What we use it for                                       | Headroom                                                                                |
| ----------------------- | ----------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Vercel Hobby**        | 100GB bandwidth/mo                                    | Web app, ISR, edge cache                                 | Comfortable — ISR means most requests are cached HTML                                   |
| **Neon Postgres**       | 0.5GB storage, 100 CU-hours/mo/project, scale-to-zero | All application data                                     | 0.5GB is ~2,000 matches with full event detail. Scale-to-zero means idle costs nothing. |
| **GitHub Actions**      | Unlimited on public repos; 2,000 min/mo private       | CI + all cron jobs (predictions, sync, ratings, backups) | Our jobs are minutes, not hours                                                         |
| **Cloudflare R2**       | 10GB storage, **zero egress**                         | Crests, OG images, DB backups                            | Crests are a few MB total                                                               |
| **Google Gemini Flash** | ~1,500 requests/day, 10 RPM                           | Match narratives                                         | We need ~10/day. 150x headroom.                                                         |
| **Auth.js**             | Self-hosted, no per-user fee                          | Admin + future user auth                                 | Unlimited by design — this is why we chose it over Clerk                                |
| **Sentry**              | 5k errors/mo                                          | Error tracking                                           | Fine unless something is very wrong                                                     |
| **Cloudflare DNS/CDN**  | Free                                                  | DNS, caching, DDoS protection                            | —                                                                                       |
| **Total**               |                                                       |                                                          | **$0/month**                                                                            |

### 13.2 The four changes from the original design

1. **AI service: FastAPI container → Python library + GitHub Actions cron.** Detailed in §7.2. Saves $5/mo and is architecturally cleaner.
2. **Database: Supabase → Neon.** Supabase's free tier _pauses the entire project_ after 7 days of inactivity, which during a slow pre-launch stretch means waking up to a dead site. Neon scales compute to zero but keeps the project live, and adds per-branch databases for preview deploys. We lose Supabase's bundled auth (we use Auth.js anyway) and storage (R2 replaces it, with better egress terms).
3. **Redis: removed entirely.** Next.js `unstable_cache` with tag-based invalidation covers our patterns. This is a genuine simplification, not a compromise — one fewer service, one fewer failure mode.
4. **LLM: Claude → Gemini Flash free tier, behind an interface.** Narrative generation is a low-stakes, high-volume-tolerant task. If output quality disappoints, the `LlmProvider` interface makes switching a one-file change. **Do not attach a billing account to the Google project** — that converts the free tier to paid silently, which is a well-known trap.

### 13.3 The one thing you must not skip

Free tiers can be suspended, rate-limited, or discontinued. **Never let a free tier hold the only copy of the data**, because the database is the entire moat (§1.3).

`backup-db.yml`: nightly `pg_dump`, gzip, upload to R2 with a 30-day rolling retention, plus a monthly snapshot kept for a year. Costs nothing, takes 20 minutes to write on Day 11, and is the difference between a bad week and losing the company.

### 13.4 The one unavoidable cost

A domain is roughly **$10–15/year** — call it $1/month. Until you buy one, `saff-ai-hub.vercel.app` works fine and even gives you HTTPS for free. Buy the real domain by **Day 14**, because OG images and social sharing want a stable canonical URL before launch.

### 13.5 What breaks first, and when

Ordered by which limit you'll hit soonest. Knowing this list means no surprise bills and no surprise outages.

| Trigger                                     | Limit hit                               | Fix                                                                                                                  | Cost         |
| ------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------ |
| You monetise (ads, sponsors, subscriptions) | Vercel Hobby is licensed non-commercial | Vercel Pro, **or** migrate to Cloudflare Workers via OpenNext — its free tier permits commercial use at 100k req/day | $20/mo or $0 |
| Ship the AI chatbot                         | Gemini 10 requests/**minute**           | Queue + per-user rate limit, or pay-as-you-go                                                                        | ~$5/mo       |
| ~2,000+ matches with full event data        | Neon 0.5GB                              | Neon Launch tier                                                                                                     | $19/mo       |
| Sustained heavy traffic                     | Neon 100 CU-hours/mo                    | Longer ISR windows first, then upgrade                                                                               | $19/mo       |
| Viral match day                             | Vercel 100GB bandwidth                  | Put Cloudflare in front (free) — it absorbs most of it                                                               | $0           |

**The honest read:** the first real bill arrives when you start making money or ship the chatbot. Both are good problems. Everything in the 15-day MVP fits inside free tiers with room to spare.

### 13.6 The principle worth keeping

The reason $0 is achievable is not clever free-tier arbitrage. It's that **no component needs to be always-on.** Static pages served from cache, a database that sleeps when nobody's asking, and compute that runs on a schedule instead of on request. That's the same architecture that survives a 10,000-user match-day spike — the cost constraint and the scale requirement have the same solution.

Free-tier engineering and good engineering are pointing in the same direction here. When they diverge, choose good engineering and pay the bill.
