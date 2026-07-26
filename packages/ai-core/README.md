# @saff/ai-core

**Python ML library — deliberately not a web service (ADR-006).**

Populated on **Day 11**. Invoked by GitHub Actions scheduled workflows, not by HTTP:

```
.github/workflows/nightly-predictions.yml
  → uv sync → python -m ai.jobs.generate_predictions
  → reads Neon, computes, writes predictions + model_version
```

Planned layout:

```
ai/
├── features/     feature extraction from Postgres
├── models/       elo.py, dixon_coles.py, rating.py
├── jobs/         CLI entrypoints (one per scheduled workflow)
├── llm/          provider interface + gemini adapter
└── evaluation/   log-loss, Brier, backtesting
tests/
pyproject.toml
```

No web framework here. If HTTP inference is ever needed (the Phase-2 chatbot does
not need it — that belongs in a Next.js route handler), wrapping this library in
FastAPI is an afternoon's work. Keeping the library boundary is what makes ADR-006
cheap to reverse.

Model choice is classical, not deep learning: Elo baseline, then Dixon-Coles /
Poisson regression, then XGBoost for contextual features. See ADR-002 for why a
neural network on a few hundred SAFF matches would be worse _and_ undebuggable.
