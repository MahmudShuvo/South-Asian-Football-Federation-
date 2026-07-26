# Day 2 — Project Foundation

**Date:** 26 July 2026 · **Status:** Complete and verified

---

## What exists now

A Turborepo monorepo that installs, formats, lints, typechecks and builds clean.

```
saff-ai-hub/
├── apps/
│   ├── web/                    Next.js 16.2.11, App Router, React 19.2.8
│   │   └── src/
│   │       ├── app/            layout + placeholder homepage
│   │       ├── styles/         globals.css — the design system, in CSS
│   │       ├── lib/            utils, fonts, validated env
│   │       ├── components/     ui/ + charts/ (shadcn target)
│   │       └── modules/        7 modules × 4 layers
│   └── mobile/                 reserved (Expo, 2027)
├── packages/
│   ├── config/                 ESLint + TS presets, incl. boundary rules
│   ├── shared-types/           cross-app types (branded IDs, provenance)
│   ├── database/               placeholder — Day 3
│   └── ai-core/                placeholder — Day 11
├── .github/workflows/ci.yml
├── .husky/                     pre-commit, commit-msg
└── docs/
```

Modules created with all four layers: `teams`, `players`, `matches`, `predictions`, `rankings`, `admin`, `fantasy` (reserved, ADR-011).

---

## Verification — run these

```bash
cd "D:\Saff AI"
git init                       # if not already a repo (Husky needs .git)
pnpm install
pnpm format:check              # expect: All matched files use Prettier code style
pnpm lint                      # expect: 3 successful
pnpm typecheck                 # expect: 3 successful
pnpm build                     # expect: ✓ Compiled, 3 static pages
pnpm dev                       # then open http://localhost:3000
```

The homepage should render dark, show a live countdown to 4 November 2026, and list all seven SAFF nations. If the countdown number is in a monospaced font and the background is near-black, the design tokens and both webfonts are wired correctly.

### Prove the architecture rules actually work

This is the part worth checking yourself, because a boundary rule that does not fire is worse than none — it creates false confidence.

```bash
# Should FAIL: domain reaching into infrastructure
cat > apps/web/src/modules/teams/domain/violation.ts <<'EOF'
import { x } from "../infrastructure/thing";
export const y = x;
EOF
pnpm --filter @saff/web lint
```

Expected:

```
error  There is no policy allowing dependencies from elements of type "domain"
and captured values: module="teams" to elements of type "infrastructure"
and captured values: module="teams"   boundaries/dependencies
```

```bash
# Should FAIL: one module reaching into another module's domain
cat > apps/web/src/modules/players/application/violation.ts <<'EOF'
import { assessConfidence } from "@/modules/predictions/domain/confidence";
export const y = assessConfidence;
EOF
pnpm --filter @saff/web lint
```

Both were verified failing during Day 2. The legal path — `matches/application` importing `predictions/application` — was verified passing. Delete the violation files afterwards.

### Commit conventions

```bash
git commit -m "bad message"                     # rejected by commitlint
git commit -m "feat(web): add team page"        # accepted
```

Allowed scopes are listed in `commitlint.config.mjs`.

---

## Decisions made today

Full reasoning in `DECISIONS.md`, ADR-014 through ADR-024. The four that matter most:

| Decision                                | Why                                                                                                                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **TypeScript 5.9.3, not 7.x**           | TS 7 is `latest`, but `typescript-eslint` caps at `<6.1.0`. Adopting it would cost us type-aware linting — including `no-floating-promises`, the rule most likely to catch a silent data-loss bug in the ingestion pipeline. Compile speed is not worth that on a codebase this size. |
| **Kept pnpm's release-age quarantine**  | pnpm offered to auto-exclude the three packages newer than 24h. Declined and pinned back one release instead (`next` 16.2.11, `lucide-react` 1.26.0, `globals` 17.7.0). Exclusions would disable supply-chain protection for exactly the packages most worth protecting.              |
| **Design tokens live in `globals.css`** | Tailwind v4 is CSS-first. Day 1's palette is now literal CSS custom properties mapped through `@theme inline`, so theming is a variable swap with no JS re-render and no flash of the wrong theme.                                                                                    |
| **Boundaries verified, not assumed**    | The rules were tested with deliberate violations. Notably, they silently do nothing useful without `eslint-import-resolver-typescript` — without it every target classifies as "unknown", which errors for the wrong reason and would misfire on legitimate code.                     |

---

## Three things that bit during the build

Worth recording because each cost real time and none was predictable from documentation.

1. **Next.js 16 removed the `eslint` key from `NextConfig`** along with `next lint`. `typescript: { ignoreBuildErrors }` still exists; `eslint: { ignoreDuringBuilds }` does not, and `tsc` rejects it. Linting is now a standalone step — which is better, since lint failures no longer block builds.

2. **`moduleResolution: "bundler"` requires extensionless relative imports.** The NodeNext-style `./primitives.js` form compiled fine under `tsc` but failed at build time with `module-not-found`, because Turbopack does not remap `.js` to `.ts`. Caught only by actually running `pnpm build`.

3. **`eslint-plugin-boundaries` element descriptors classify folders, not files.** A pattern like `src/modules/*/domain/**/*` looks right and is wrong; it must be `src/modules/*/domain`. This also forced `env.ts` from `src/` into `src/lib/`, since a lone file cannot be classified (ADR-023).

The plugin also moved to a new API in v7 — `policies` instead of `rules`, object selectors, `{{ }}` templates. The config here is written against v7.

---

## Deliberately not done today

- **No tRPC.** Day 4.
- **No Prisma schema, no Neon project.** Day 3 — and do not create the Neon project early, its free compute-hour allowance resets monthly.
- **No shadcn components installed.** `components.json` is configured so `pnpm dlx shadcn@latest add button` works, but the primitives land on Day 5 with the theme provider.
- **No test runner.** Day 14. `confidence.test.ts` contains real assertions written while the logic was fresh; Vitest will pick them up.
- **No CSP header.** Day 14, once the real set of script and image origins is known. A guessed CSP gets disabled in a panic.

---

## Deploy before Day 3

Worth 10 minutes now, because from this point there is always something shippable:

1. Push to GitHub. CI should go green on the first run.
2. Import the repo on Vercel. Set **Root Directory** to `apps/web`; Vercel detects the Turborepo layout.
3. Set `NEXT_PUBLIC_APP_URL` to the assigned `.vercel.app` URL.
4. Leave `DATABASE_URL` unset — it is optional until Day 3.

One caveat carried forward from `01-architecture-day1.md` §13.5: Vercel's Hobby tier is licensed for non-commercial use. Fine now; the migration path to Cloudflare Workers is noted there for when that changes.
