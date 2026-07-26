# fantasy

**Phase 2 — deliberately empty (ADR-011).**

A SAFF fantasy game needs nothing new from the football schema: it reads
`MatchPlayerStat` and applies versioned `ScoringRule` rows. It is gated on a data
freshness SLA — player stats complete within 6h of full-time for 95% of matches —
because wrong fantasy scores destroy user trust permanently.

Free-to-play only, no entry fees. Paid fantasy is regulated as gambling in several
Indian states and legally unclear in Bangladesh and Pakistan.
