# Day 2 Prompt — Project Foundation & Repository Setup

Paste the block below to start Day 2.

---

```
Continue the SAFF AI Football Hub project. The project root is D:\Saff AI and the
Day 1 architecture document is at docs/01-architecture-day1.md (v1.1) with the
decision log at docs/DECISIONS.md. Read both before starting.

Recap of the agreed architecture: modular monolith, Turborepo monorepo,
Next.js 16 App Router + TypeScript strict + Tailwind v4 + shadcn/ui + tRPC +
Prisma, PostgreSQL on Neon, and a Python ML library at packages/ai-core invoked
by GitHub Actions cron rather than an always-on service. Infrastructure must
stay at $0/month. Launch target is 20 October 2026, before the SAFF Championship
in Dhaka on 4 November.

Today is DAY 2: Project Foundation & Repository Setup.

Complete ONLY these tasks:

1. Turborepo monorepo scaffold with pnpm workspaces:
   apps/web, packages/database, packages/shared-types, packages/config,
   and placeholder directories for apps/mobile and packages/ai-core
2. Next.js 16 App Router app with TypeScript in strict mode
3. Tailwind CSS v4 + shadcn/ui initialised
4. ESLint + Prettier, including a module-boundary rule that prevents one module
   from importing another module's domain/ or infrastructure/ layers
5. Husky + lint-staged pre-commit hooks, plus commitlint
6. The full folder skeleton from the Day 1 document section 9, with .gitkeep or
   index files so the structure is committable
7. Environment variable setup with runtime validation (T3 Env or equivalent)
8. GitHub Actions CI workflow: install, lint, typecheck, build
9. A minimal placeholder homepage confirming the stack works
10. README updates and .gitignore

Requirements:
- Write the files directly into D:\Saff AI
- All config production-ready, no TODOs or placeholder comments
- Pin exact dependency versions
- Explain each config decision, and where there were options, say why you chose
  the one you did
- Append any new architectural decisions to docs/DECISIONS.md as ADR entries
- End with verification steps I can run to confirm everything works
- Then write the Day 3 prompt to docs/day-prompts/day-03.md

Do not build any features today — foundation only. No database schema yet;
that is Day 3.
```

---

## Notes for Day 2

- `packages/ai-core` is only a placeholder today. Real Python setup is Day 11.
- Do not create a Neon project yet — Day 3 needs it, and the free tier's
  compute-hour clock is worth not starting early.
- Vercel deploy at the end of Day 2 is worth doing even for a placeholder page:
  it means there is always something shippable from here on.
