import { publishableConfidence } from "@/modules/predictions/application/get-confidence";

/** Legal: cross-module access goes through the other module's application layer. */
export function matchSummary() {
  return publishableConfidence({
    homeMatchesPlayed: 12,
    awayMatchesPlayed: 9,
    dataStalenessDays: 30,
  });
}
