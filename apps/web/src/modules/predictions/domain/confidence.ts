/**
 * Prediction confidence as a domain concept.
 *
 * Pure by construction — no Prisma, no React, no fetch. That is what the
 * `domain` boundary rule enforces, and it is why these rules can be unit tested
 * without a database and reused unchanged by the Python pipeline's contract.
 *
 * FR-19 commits us to refusing to predict when the data is too thin. Encoding
 * that as a domain rule rather than a UI check means it cannot be bypassed by
 * adding a new screen.
 */

/** Minimum completed matches per team before a prediction is publishable. */
export const MIN_MATCHES_FOR_PREDICTION = 5;

export type ConfidenceLevel = "high" | "medium" | "low" | "insufficient";

export interface PredictionInputs {
  readonly homeMatchesPlayed: number;
  readonly awayMatchesPlayed: number;
  /** Days since the older of the two teams' most recent recorded match. */
  readonly dataStalenessDays: number;
}

/**
 * Grade how much we trust a prediction, given how much we know.
 *
 * Returns `insufficient` rather than guessing when either side is below the
 * threshold. The UI must render that as a refusal, not as a 33/33/33 split —
 * a fabricated even split reads as a real forecast.
 */
export function assessConfidence(inputs: PredictionInputs): ConfidenceLevel {
  const { homeMatchesPlayed, awayMatchesPlayed, dataStalenessDays } = inputs;

  const leastKnown = Math.min(homeMatchesPlayed, awayMatchesPlayed);
  if (leastKnown < MIN_MATCHES_FOR_PREDICTION) return "insufficient";

  if (leastKnown >= 20 && dataStalenessDays <= 90) return "high";
  if (leastKnown >= 10 && dataStalenessDays <= 270) return "medium";
  return "low";
}

/** True when a prediction may be shown publicly at all (FR-19). */
export function isPublishable(level: ConfidenceLevel): boolean {
  return level !== "insufficient";
}
