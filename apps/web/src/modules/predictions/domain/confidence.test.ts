/**
 * Test scaffold. The runner (Vitest) is installed on Day 14; these assertions are
 * written now because the rules they cover are the ones FR-19 depends on, and
 * writing them while the logic is fresh is cheaper than reconstructing intent later.
 */
import { assessConfidence, isPublishable } from "./confidence";

export const cases = [
  {
    name: "refuses when either team is below the match threshold",
    input: { homeMatchesPlayed: 30, awayMatchesPlayed: 2, dataStalenessDays: 10 },
    expected: "insufficient" as const,
  },
  {
    name: "high confidence with deep, fresh data",
    input: { homeMatchesPlayed: 25, awayMatchesPlayed: 22, dataStalenessDays: 14 },
    expected: "high" as const,
  },
  {
    name: "downgrades to low when data is stale",
    input: { homeMatchesPlayed: 25, awayMatchesPlayed: 22, dataStalenessDays: 400 },
    expected: "low" as const,
  },
];

export function runCases(): void {
  for (const c of cases) {
    const actual = assessConfidence(c.input);
    if (actual !== c.expected) {
      throw new Error(`${c.name}: expected ${c.expected}, got ${actual}`);
    }
  }
  if (isPublishable("insufficient")) {
    throw new Error("insufficient predictions must never be publishable");
  }
}
