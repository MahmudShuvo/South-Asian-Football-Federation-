import { assessConfidence, isPublishable } from "../domain/confidence";
import type { PredictionInputs } from "../domain/confidence";

/** Legal: application reads its own module's domain. */
export function publishableConfidence(inputs: PredictionInputs) {
  const level = assessConfidence(inputs);
  return { level, publishable: isPublishable(level) };
}
