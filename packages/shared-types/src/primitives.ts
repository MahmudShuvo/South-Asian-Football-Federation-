/** SAFF member associations covered at launch. */
export const SAFF_COUNTRIES = ["BAN", "IND", "PAK", "NEP", "BHU", "MDV", "SRI"] as const;

export type SaffCountryCode = (typeof SAFF_COUNTRIES)[number];

/** Result of a match from the perspective of one team. */
export type MatchOutcome = "W" | "D" | "L";

/**
 * How much of a record we actually know. Surfaced in the UI as a data-quality
 * badge — section 10.4 of the architecture doc commits us to showing coverage
 * gaps openly rather than hiding thin data.
 */
export type DataConfidence = "complete" | "partial" | "unverified";

/**
 * Provenance carried by every ingested record (FR-3). Manual entry outranks API
 * data on conflict, because a human who watched the match is a better source
 * than a provider with patchy SAFF coverage.
 */
export interface Provenance {
  readonly source: "manual" | "provider" | "derived";
  readonly sourceId: string | null;
  readonly lastSyncedAt: Date | null;
  readonly verifiedBy: string | null;
  readonly confidence: DataConfidence;
}

/** Branded IDs stop a TeamId ever being passed where a PlayerId is expected. */
export type Brand<T, B extends string> = T & { readonly __brand: B };
export type TeamId = Brand<string, "TeamId">;
export type PlayerId = Brand<string, "PlayerId">;
export type MatchId = Brand<string, "MatchId">;
export type CompetitionId = Brand<string, "CompetitionId">;
export type SeasonId = Brand<string, "SeasonId">;
