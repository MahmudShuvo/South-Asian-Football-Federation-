# Git & GitHub Setup

Repo: <https://github.com/MahmudShuvo/South-Asian-Football-Federation->

The remote is empty, so this is a clean first push — nothing to merge or reconcile.

---

## First push

**Windows PowerShell 5.1 does not support `&&`** as a statement separator (that
arrived in PowerShell 7). Run one command per line. Copy the whole block — pasting
multiple lines into PowerShell works fine.

```powershell
cd "D:\Saff AI"

# A stale lock file may exist from an earlier init. Harmless if absent.
Remove-Item .git\index.lock -ErrorAction SilentlyContinue

git init
git branch -M main
git config user.name "Mahmud Shuvo"
git config user.email "your-github-email@example.com"

# Sanity check: expect .env.example ONLY. If .env or .env.local appears, stop.
git status --short | Select-String "env"

git add -A
git commit -m "chore: scaffold monorepo foundation"
git remote add origin https://github.com/MahmudShuvo/South-Asian-Football-Federation-.git
git push -u origin main
```

### If the commit fails in the pre-commit hook

Two bugs were found and fixed by running the hook from a path containing a space,
exactly like `D:\Saff AI`. If you see either symptom, your `.lintstagedrc.mjs` is
out of date — the current version handles both.

| Symptom                                               | Cause                                                                    | Fixed in |
| ----------------------------------------------------- | ------------------------------------------------------------------------ | -------- |
| `'eslint' is not recognized`                          | ESLint is a devDependency of each package, not the root                  | ADR-025  |
| `No files matching the pattern were found: "D:/Saff"` | Absolute paths joined with spaces, split on the space in the folder name | ADR-027  |

Then re-stage and retry:

```powershell
git add -A
git commit -m "chore: scaffold monorepo foundation"
```

**If you need to get unblocked right now**, `--no-verify` skips the hook for one
commit. Acceptable for the initial commit; do not make it a habit, since the hook
is what enforces the module boundaries.

```powershell
git commit -m "chore: scaffold monorepo foundation" --no-verify
```

### About the CRLF warnings

`warning: LF will be replaced by CRLF` on 58 files is expected on a first Windows
commit and harmless. `.gitattributes` now pins everything to LF (ADR-026), so it
will not recur after this commit — and it prevents `pnpm format:check` failing on a
fresh clone, which is the real problem those warnings were hinting at.

### If you prefer Git Bash

Everything in these docs is written in bash style, so Git Bash (installed with
Git for Windows) avoids this class of friction entirely — `&&`, `rm`, and heredocs
all work. Recommended for the remaining 13 days, since several later steps use
multi-line shell commands.

```bash
cd "/d/Saff AI"
rm -f .git/index.lock
git init && git branch -M main
git add -A && git commit -m "chore: scaffold monorepo foundation"
git remote add origin https://github.com/MahmudShuvo/South-Asian-Football-Federation-.git
git push -u origin main
```

### A longer first commit message

Optional, but the first commit is the one you will re-read in six months. In
PowerShell, use a here-string:

```powershell
$msg = @"
chore: scaffold monorepo foundation

Turborepo + pnpm workspaces, Next.js 16 App Router with TypeScript strict,
Tailwind v4 design tokens, ESLint module-boundary enforcement, Husky hooks,
commitlint and GitHub Actions CI.

Day 1-2 of the 15-day plan. See docs/ for architecture and decision log.
"@
git commit -m $msg
```

Note the commit message format — commitlint is active from the next commit
onward, so `git commit -m "stuff"` will be rejected. Allowed scopes are in
`commitlint.config.mjs`.

If `pnpm install` has not been run yet, run it before committing so Husky
installs its hooks (`prepare` script). Committing first is fine; the hooks just
will not fire on that one commit.

---

## The repo is public — that is load-bearing, not incidental

Worth understanding rather than changing by accident:

**Public repos get unlimited GitHub Actions minutes. Private repos get 2,000
minutes/month.**

Our entire AI pipeline runs on Actions (ADR-006): nightly predictions, data sync,
ratings recomputation, and database backups. Four scheduled workflows plus CI on
every push would consume a meaningful share of a 2,000-minute allowance. Public
keeps that at $0 forever, which is the ADR-013 constraint.

The moat is the **data**, not the code (architecture §1.3). A competitor reading
our repository still has no match database, no ingestion relationships, and no
manual-entry volunteers. Open code costs us little and buys credibility with the
developers and journalists we want reading our numbers.

### What public means you must never do

- **Never commit `.env` or `.env.local`.** Both are in `.gitignore`. Use GitHub
  Secrets for CI, which are safe in public repos and are not exposed to
  pull requests from forks.
- **Never commit a database dump.** `*.sql.gz`, `*.dump` and `backups/` are
  gitignored. Backups go to Cloudflare R2 (§13.3).
- **Never hardcode a provider API key**, even a free-tier one. Free keys still
  get abused, and Gemini quota exhaustion would silently stop match narratives.

Turn on **Secret scanning** and **Push protection** in
Settings → Code security. Both are free on public repos and will block a
committed key at push time rather than after it leaks.

---

## Licensing

The repo currently has no `LICENSE` file, which under copyright default means
**all rights reserved** — the code is readable but not legally reusable.

For something that may become a company, that is the correct default. Adding MIT
later is trivial; retracting it is not, because anyone who obtained the code
under MIT keeps that grant permanently.

Decide before the November launch, when the repo starts getting real attention.

---

## Branch protection (worth 2 minutes)

Settings → Branches → add a rule for `main`:

- Require status checks to pass → select the **`Lint, typecheck, build`** job
- Require branches to be up to date before merging

You are working solo, so this is not about reviewing other people's work. It is
about stopping _yourself_ from pushing a broken `main` at 1am in the week before a
tournament. CI takes about 90 seconds; a broken deploy takes longer to notice.

---

## Vercel

Import the repo at <https://vercel.com/new> and set:

| Setting               | Value                                 |
| --------------------- | ------------------------------------- |
| Root Directory        | `apps/web`                            |
| Framework             | Next.js (auto-detected)               |
| Build command         | leave default — Turborepo is detected |
| `NEXT_PUBLIC_APP_URL` | the assigned `.vercel.app` URL        |
| `DATABASE_URL`        | leave unset until Day 3               |

Vercel's Hobby tier is licensed for non-commercial use. That is fine now; the
migration path to Cloudflare Workers is in architecture §13.5 for when it is not.
