export const DAY = 86400000;
export function reviewPriority(evidence, now = Date.now()) {
  if (!evidence?.exposures) return 0;
  const age = Math.max(0,now-(evidence.lastIndependentSuccessAt ?? evidence.lastSeenAt ?? now))/DAY;
  const spacing = age >= 90 ? 6 : age >= 30 ? 4 : age >= 7 ? 2 : 0;
  return spacing + Math.min(4,(evidence.mistakes || 0)*2) + (evidence.independentSuccesses ? 0 : 1);
}
export function reviewDue(evidence, now) { return reviewPriority(evidence,now) >= 2; }
export function explanationAllowed(evidence, completedMatches, now = Date.now(), repeatedMisconception = false) {
  if (evidence?.lastExplicitExplanationAt == null) return {allowed:true,override:false};
  const elapsed = now-evidence.lastExplicitExplanationAt;
  const matches = completedMatches-(evidence.lastExplicitExplanationMatchIndex ?? evidence.lastInterventionMatchIndex ?? completedMatches);
  if (elapsed >= 7*DAY || elapsed >= DAY && matches >= 3) return {allowed:true,override:false};
  const override = repeatedMisconception && evidence.mistakes >= 2 && !evidence.misconceptionOverrides;
  return {allowed:!!override,override:!!override};
}
export function predictionEligible({level, automatic, reliable, candidateCount, unknownCount, yesCount, noCount, cooldown = true}) {
  return level === 'explorer' && automatic && reliable && candidateCount >= 4 &&
    unknownCount === 0 && yesCount > 0 && noCount > 0 && cooldown;
}
