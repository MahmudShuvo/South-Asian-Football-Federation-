# Decision Log

One entry per significant architectural decision. Append, never rewrite — the point is to remember _why_, including when we were wrong.

---

## ADR-001 — Modular monolith, not microservices

**Date:** 2026-07-26 · **Status:** Accepted

Microservices solve an organisational problem — multiple teams needing independent deploy cadence. We are one developer with a 14-week deadline. What we would actually get: distributed tracing we have no time to configure, network hops where function calls would do, eventual-consistency bugs, and six deploy pipelines.

A modular monolith gives the real benefit — enforced boundaries — at near-zero cost. Each domain module owns its data access and exposes a service interface. When a module genuinely needs independent scaling, the seam already exists.

**Enforced by:** ESLint module-boundary rule (Day 2). A convention nobody checks is a convention nobody follows.

---

## ADR-002 — Classical statistical models, not deep learning

**Date:** 2026-07-26 · **Status:** Accepted

With a few hundred SAFF matches, a neural network will overfit and produce confident nonsense we cannot debug. Dixon-Coles / Poisson regression is the academic standard for football scorelines, works with ~100 matches, and is interpretable — which we need because we publicly promised transparency.

Order of adoption: Elo baseline → Dixon-Coles → XGBoost for contextual features → deep learning only if data volume ever justifies it. The LLM _explains_ model output; it never computes the probability.

**Kept reversible by:** model selection sits behind an interface.

---

## ADR-003 — `TeamPlayerContract` join entity, not `player.team_id`

**Date:** 2026-07-26 · **Status:** Accepted

Players transfer. A direct foreign key destroys history — we could no longer answer "who was in the 2024 squad?" Slightly more join complexity buys permanently correct data.

---

## ADR-004 — `EntityMapping` table from day one

**Date:** 2026-07-26 · **Status:** Accepted

Maps our internal IDs to each provider's IDs. Without it, the second sync creates duplicate players with slightly different name spellings and we spend a weekend deduplicating by hand. This is the classic sports-data mistake.

---

## ADR-005 — Store derived aggregates instead of computing on read

**Date:** 2026-07-26 · **Status:** Accepted

`PlayerSeasonStat` and similar tables deliberately violate normalisation. Recomputing season aggregates on every page view is exactly the read-time work our cost ceiling forbids. Refresh on write; treat as a cache with a source of truth behind it.

---

## ADR-006 — No AI server; Python library + GitHub Actions cron

**Date:** 2026-07-26 · **Status:** Accepted · **Supersedes:** the FastAPI-on-Railway design in v1.0

**Context:** v1.0 specified an always-on FastAPI container (~$5/month). That was the only line item with no free tier. Reviewing it against our own principle — compute on write, serve on read — the service never handles a user request. Predictions are generated nightly and stored; the web app only reads them. It was a cron job wearing a web framework.

**Decision:** `packages/ai-core` is a plain Python library with no web framework. GitHub Actions scheduled workflows invoke its CLI entrypoints.

**Gains:** $0 hosting · no cold-start problem for a 300MB dependency tree · every run is a logged job with automatic failure email (better observability than we would have built) · every prediction ties to a commit SHA · no public endpoint to secure or rate-limit.

**Costs:** no on-demand inference (nothing in the MVP needs it) · GitHub cron is best-effort and can be delayed minutes (fine for 2am batch, unacceptable for live match updates) · the Phase-2 chatbot needs a request path, which should be a Next.js route handler, not a Python service.

**Reversible because:** the library has no framework dependency. Wrapping it in FastAPI is an afternoon's work if HTTP inference is ever needed.

---

## ADR-007 — Neon over Supabase for Postgres

**Date:** 2026-07-26 · **Status:** Accepted · **Supersedes:** Supabase choice in v1.0

Supabase's free tier pauses the entire project after ~7 days of inactivity — during a slow pre-launch stretch that means waking up to a dead site. Neon scales compute to zero while keeping the project live, and adds a database branch per pull request.

Trade-offs accepted: we lose Supabase's bundled auth (we use Auth.js regardless, per ADR-009) and its storage (Cloudflare R2 replaces it with better egress terms). We gain a cold start of up to ~1s, which ISR caching hides because cached pages never touch the database.

---

## ADR-008 — No Redis in the MVP

**Date:** 2026-07-26 · **Status:** Accepted · **Supersedes:** Upstash Redis in v1.0

Next.js `unstable_cache` with tag-based invalidation covers our access patterns. Adding Redis on day one means a service to operate, a bill to pay, and a failure mode to debug, for no measurable gain at our traffic. Add it when profiling proves the need — not before.

---

## ADR-009 — Auth.js over Clerk

**Date:** 2026-07-26 · **Status:** Accepted

Clerk has better DX but bills per monthly active user. We are building a consumer product targeting 25k MAU with no revenue — per-user pricing is the wrong shape. Auth.js is self-hosted and free at any scale.

---

## ADR-010 — Gemini Flash for narratives, behind a provider interface

**Date:** 2026-07-26 · **Status:** Accepted · **Supersedes:** Anthropic Claude API in v1.0

Narrative generation is low-stakes and low-volume (~10/day against a 1,500/day free limit). Gemini Flash's free tier covers it with 150x headroom.

Kept behind an `LlmProvider` interface so switching to Claude or OpenAI is a one-file change if output quality disappoints.

**Operational warning:** do not attach a billing account to the Google Cloud project. Doing so silently converts the free tier to pay-as-you-go.

---

## ADR-011 — Fantasy league deferred to Phase 2

**Date:** 2026-07-26 · **Status:** Accepted

A SAFF fantasy game is a strong retention play and needs nothing new from the football schema — it reads `MatchPlayerStat` and applies versioned `ScoringRule` rows. But it requires three things the MVP will not have: per-match player stats reliably available within hours of full-time, real user accounts with leagues and invites, and a scheduler for points calculation. Wrong fantasy scores permanently destroy trust.

**Launch gate:** player stats complete within 6h of full-time for 95% of matches.

**Legal constraint:** free-to-play only, no entry fees. Paid fantasy is regulated as gambling in several Indian states and legally unclear in Bangladesh and Pakistan.

**Architecture obligation now:** keep `Player`, `MatchPlayerStat` and `User` clean enough that fantasy is an additive module, never a refactor.

---

## ADR-012 — Not a betting product

**Date:** 2026-07-26 · **Status:** Accepted

No odds, no affiliate links, no tipster content. Strategic rather than moral: betting positioning destroys credibility with the federations, clubs and media outlets we need as partners, and creates regulatory exposure across seven jurisdictions with incompatible gambling law.

---

## ADR-013 — $0 infrastructure as a hard constraint

**Date:** 2026-07-26 · **Status:** Accepted

Every service must have a free tier we stay inside, and the architecture must _make that possible_ rather than merely hope for it.

The reason it works is not free-tier arbitrage — it is that no component needs to be always-on: static pages from cache, a database that sleeps when idle, compute on a schedule instead of on request. The same architecture absorbs a 10,000-user match-day spike. The cost constraint and the scale requirement have the same solution.

**Where this stops applying:** when free-tier engineering and good engineering diverge, choose good engineering and pay the bill. Documented breaking points are in the architecture doc §13.5.

**Non-negotiable safeguard:** never let a free tier hold the only copy of the data. The database is the moat. Nightly `pg_dump` to R2 from Day 11.

---

## ADR-014 — Turborepo monorepo with pnpm workspaces

**Date:** 2026-07-26 · **Status:** Accepted

A single app does not need a monorepo. Three things here do: `packages/shared-types` is consumed by both `apps/web` and the future Expo app, `packages/ai-core` is Python and needs its own toolchain, and `packages/config` centralises lint and TS presets so they cannot drift between packages.

pnpm over npm/yarn for the content-addressed store (fast, disk-efficient) and its strict `node_modules`, which makes an undeclared dependency fail locally instead of in CI. Turborepo for task orchestration and caching: `pnpm lint` skips packages whose inputs have not changed.

`save-exact=true` in `.npmrc`. Ranges mean two developers get different trees from the same commit; for a project whose correctness depends on a data pipeline, that is not a trade worth making.

---

## ADR-015 — Pin TypeScript 5.9.3, not 7.x

**Date:** 2026-07-26 · **Status:** Accepted · **Revisit:** when typescript-eslint supports TS 7

TypeScript 7.0.2 (the Go-based compiler) is the current `latest` tag. We are not using it.

`typescript-eslint@8.65.0` declares `typescript: ">=4.8.4 <6.1.0"`. Adopting TS 7 today means losing type-aware linting entirely — which would cost us `no-floating-promises` and `no-misused-promises`, the two rules most likely to catch a real bug in an ingestion pipeline. That is a far bigger loss than the compile-speed gain on a codebase this size.

TS 6.0.3 is also within range and would work. We chose 5.9.3 because Next.js 16.2's shipped types are built against 5.x and TS 6 adds deprecation-warning noise we do not need on Day 2.

**Upgrade trigger:** typescript-eslint publishing TS 7 support. Revisit then, not before.

---

## ADR-016 — Tailwind v4 CSS-first; design tokens live in globals.css

**Date:** 2026-07-26 · **Status:** Accepted

Tailwind v4 removes `tailwind.config.js` in favour of CSS `@theme`. Rather than fight that, we lean into it: the Day 1 design tokens (section 10.2) are now literal CSS custom properties in `apps/web/src/styles/globals.css`, mapped into Tailwind's utility namespace with `@theme inline`.

Two consequences worth stating:

- Token names are semantic (`--brand-primary`, not `--green`), so a rebrand is a token edit rather than a find-and-replace across components.
- Theming is a CSS variable swap under `.dark`, so there is no JS-driven re-render on theme change and no flash of the wrong theme.

`font-variant-numeric: tabular-nums` is set globally on `body`. Without it, stat columns jitter as digits change width — the single most common way a football site looks amateurish.

---

## ADR-017 — Module boundaries enforced by eslint-plugin-boundaries v7

**Date:** 2026-07-26 · **Status:** Accepted

ADR-001 promised enforced module boundaries. This is the enforcement.

`packages/config/eslint/boundaries.mjs` classifies every folder under `src/` as one of `domain`, `application`, `infrastructure`, `presentation`, `app`, or `shared`, capturing the module name so a policy can distinguish "same module" from "any other module". Policies then encode the two invariants: dependencies point inward, and cross-module access is allowed only to another module's `application` layer.

Verified with deliberate violations rather than assumed. `predictions/domain` importing its own `infrastructure` fails; `players/application` importing `predictions/domain` fails; `matches/application` importing `predictions/application` passes. The error messages name both modules and both layers.

**Non-obvious requirement:** without `eslint-import-resolver-typescript` configured, the plugin cannot follow `@/` aliases or extensionless imports and classifies every target as "unknown". That still errors — but for the wrong reason, and it would misfire on legitimate imports. The resolver is load-bearing, not optional.

---

## ADR-018 — Keep pnpm's release-age quarantine; pin past it

**Date:** 2026-07-26 · **Status:** Accepted

pnpm 11 quarantines very recently published versions, which is the cheapest available defence against a compromised maintainer account pushing a malicious patch release — the attack pattern behind the 2025 npm incidents. On first install it offered to auto-generate exclusions for every package newer than the window.

We declined. `minimumReleaseAge: 1440` (24 hours) stays, and we pinned the three affected packages back one release instead: `next` 16.2.12 → 16.2.11, `lucide-react` 1.27.0 → 1.26.0, `globals` 17.8.0 → 17.7.0.

Being a day behind the newest patch costs nothing. Running a poisoned `postinstall` during the tournament would cost everything. Exclusions would have disabled the protection for precisely the packages most worth protecting.

---

## ADR-019 — Install scripts are allowlisted

**Date:** 2026-07-26 · **Status:** Accepted

`allowBuilds` in `pnpm-workspace.yaml` names the only four packages permitted to run install scripts: `@tailwindcss/oxide`, `esbuild`, `sharp`, `unrs-resolver`. Everything else is blocked by default, so a malicious `postinstall` in a transitive dependency cannot execute. Same reasoning as ADR-018, different attack surface.

---

## ADR-020 — Type-aware linting; unused code warns, unhandled promises error

**Date:** 2026-07-26 · **Status:** Accepted

`recommendedTypeChecked` is slower than the syntactic preset. It is worth it for one rule in particular: `no-floating-promises`. An un-awaited write in an ingestion job fails silently and corrupts the dataset that is our entire moat (ADR-013).

Severity is deliberately split. Unhandled promises, misused promises and `await`-on-non-thenable are **errors**. Unused variables are **warnings** — blocking a commit over a temporarily unused variable is how you train people to use `--no-verify`, and a bypassed hook enforces nothing.

`no-explicit-any` is a warning today and should be raised to error on Day 3, once the Prisma-generated types exist and there is a correct type to use instead.

---

## ADR-021 — Pre-commit runs lint and format only; typecheck is CI's job

**Date:** 2026-07-26 · **Status:** Accepted

`lint-staged` runs ESLint and Prettier on staged files, so the hook finishes in about a second. Full `tsc` runs in CI.

The reasoning is behavioural, not technical: a pre-commit hook that takes fifteen seconds gets bypassed, and a bypassed hook is worse than no hook because it creates false confidence. Fast hook plus thorough CI catches the same problems with a workflow people actually keep using.

---

## ADR-022 — Next 16 removed `next lint`; ESLint is standalone

**Date:** 2026-07-26 · **Status:** Accepted (forced)

Next.js 16 dropped the `eslint` key from `NextConfig` along with the `next lint` command. Discovered by `tsc` failing on `eslint: { ignoreDuringBuilds: false }` during Day 2 verification.

Linting is now `eslint .` per package, orchestrated by Turborepo. This is better: lint failures no longer block a build, and ESLint's version is no longer coupled to Next's release cycle.

---

## ADR-023 — `env.ts` lives in `src/lib`, not `src/`

**Date:** 2026-07-26 · **Status:** Accepted

The T3 convention puts validated env at `src/env.ts`. We moved it to `src/lib/env.ts` because boundaries element descriptors classify **folders**, not individual files — a lone `src/env.ts` cannot be classified, which trips `no-unknown-files`.

Putting it in `src/lib` also states the right thing architecturally: validated config is shared infrastructure that every layer may read.

---

## ADR-024 — Relative imports are extensionless

**Date:** 2026-07-26 · **Status:** Accepted

With `moduleResolution: "bundler"`, relative imports must omit the extension. The `./foo.js` form is the NodeNext convention and Turbopack cannot resolve it — it surfaced as a `module-not-found` build failure from `packages/shared-types`.

Convention: extensionless relative imports everywhere, `@/` alias for anything crossing a folder in `apps/web`.

---

## ADR-025 — lint-staged delegates ESLint to each workspace package

**Date:** 2026-07-26 · **Status:** Accepted · **Fixes:** a real bug shipped on Day 2

**The bug:** `.lintstagedrc.mjs` originally ran a bare `eslint --fix`. ESLint is a devDependency of each package, not of the root, so the pre-commit hook failed with `'eslint' is not recognized`. Day 2 verification ran `pnpm lint` (which Turborepo executes _inside_ each package) but never exercised the hook itself, because the sandbox had no `.git`. Lesson recorded: a hook that has not been fired is not a hook that works.

**The obvious fix is wrong.** Adding `eslint` to the root and letting lint-staged run it from the repo root _appears_ to work — ESLint 10 does resolve the nearest `eslint.config.mjs`. But `tsconfigRootDir: process.cwd()` and the boundaries element patterns (`src/modules/*/domain`) resolve against the CWD. From the root they match nothing, so **the architecture rules pass silently on code that violates them.** Verified: a `domain → application` cross-module import was reported as an error when linted from `apps/web`, and reported nothing when linted from the root.

Silently wrong is worse than failing. Root ESLint is deliberately _not_ installed, so `eslint .` from the root fails loudly instead of lying.

**The fix:** `.lintstagedrc.mjs` is now a function that groups staged files by owning workspace and emits one `pnpm -C <workspace> exec eslint` per affected package. Files belonging to no linted workspace (root config files) get Prettier only.

**Verified with five cases against a real git repo:** valid commit succeeds · boundary violation blocks the commit with the correct message · non-conventional commit message blocks · unlisted scope blocks · a valid commit still works after the failures.

---

## ADR-026 — `.gitattributes` forces LF everywhere

**Date:** 2026-07-26 · **Status:** Accepted

Prettier is configured with `endOfLine: "lf"`, but Git on Windows checks files out as CRLF by default. The result: `pnpm format:check` fails on a freshly cloned repo, CI disagrees with local, and the cause is invisible in a diff.

`* text=auto eol=lf` means LF in the repository _and_ in the working tree on every OS. `.husky/*` is called out explicitly because CRLF in a shell script fails with an opaque "bad interpreter" error or silently does not run — the worst possible failure mode for a hook whose entire job is to catch mistakes.

`pnpm-lock.yaml` is marked `linguist-generated -diff`: a 6,000-line lockfile diff buries the change that actually needs review.

---

## ADR-027 — Every path in the pre-commit hook is relative

**Date:** 2026-07-26 · **Status:** Accepted · **Fixes:** a second real bug in the Day 2 hook

**The bug:** lint-staged passes **absolute** paths to commands, and it executes them without a shell, so arguments are split on whitespace. The repository lives at `D:\Saff AI`. Every generated command therefore became:

```
prettier --write D:/Saff AI/README.md ...
→ [error] No files matching the pattern were found: "D:/Saff".
→ [error] No files matching the pattern were found: "AI/README.md".
```

The ESLint commands already worked, because they were built relative to their workspace package — which strips the parent directory, and its space, from the argument. Prettier's were not.

**The fix:** all paths are relative. ESLint paths are relative to the package the command runs in; Prettier paths are relative to the repo root, which is Prettier's CWD. Quoting was rejected as the fix — without a shell there is nothing guaranteed to interpret the quotes, and relative paths remove the problem rather than escaping it.

**Why it was missed twice:** the sandbox used to verify Day 2 lived at `/tmp/saff` — no space. Fixed by re-testing at `/tmp/saff AI`, which reproduces the user's environment exactly. **Lesson for the remaining days: verification environments must reproduce the path, not just the toolchain.**

**Verified from a spaced path:** all 8 hook tasks pass · boundary violation blocks · bad commit message blocks · valid commit after failures succeeds · `format:check`, `lint` and `typecheck` all clean.

### Footnote, because it cost ten minutes

The first attempt at this fix did not parse. The doc comment contained the literal glob `src/modules/*/domain` — and `*/` closes a block comment. Any `*/` inside a `/* */` comment terminates it early. Written as `src/modules/<name>/domain` now.
