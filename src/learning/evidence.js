export const emptyEvidence = () => ({exposures:0, independentSuccesses:0, assistedSuccesses:0,
  spontaneousUses:0, retrievalSuccesses:0, mistakes:0, lastSeenAt:null,
  lastIndependentSuccessAt:null, lastExplicitExplanationAt:null, lastInterventionMatchIndex:null,
  lastExplicitExplanationMatchIndex:null, misconceptionOverrides:0, misconceptionCounts:{}});
export function evidenceKind(event) {
  const p = event.payload;
  if (['FEEDBACK_SHOWN','BOARD_LENS_USED'].includes(event.type)) return 'exposure';
  if (event.type === 'QUESTION_ASKED') return p.reliable && p.spontaneous && !p.assisted ? 'spontaneous' : 'exposure';
  if (event.type === 'CARDS_ELIMINATED' && p.automatic) return 'exposure';
  if (!['CARDS_ELIMINATED','PREDICTION_SUBMITTED','SELF_EXPLANATION_SUBMITTED','RETRIEVAL_SUBMITTED'].includes(event.type)) return null;
  if (typeof p.correct !== 'boolean') return null; // Verbal/uninterpretable actions cannot be graded.
  if (!p.correct) return 'mistake';
  if (p.assisted || ['PREDICTION_SUBMITTED','SELF_EXPLANATION_SUBMITTED'].includes(event.type)) return 'assisted';
  return event.type === 'RETRIEVAL_SUBMITTED' ? 'retrieval' : 'independent';
}
export function updateEvidence(previous, event) {
  const next = {...emptyEvidence(), ...previous}, kind = evidenceKind(event);
  if (!kind) return next;
  next.exposures++; next.lastSeenAt = event.at;
  if (kind === 'mistake') {
    next.mistakes++;
    const id=event.payload.misconceptionId;
    if(id)next.misconceptionCounts={...next.misconceptionCounts,[id]:(next.misconceptionCounts?.[id]||0)+1};
  }
  if (kind === 'assisted') next.assistedSuccesses++;
  if (['spontaneous','retrieval','independent'].includes(kind)) {
    next.independentSuccesses++; next.lastIndependentSuccessAt = event.at;
    if (kind === 'spontaneous') next.spontaneousUses++;
    if (kind === 'retrieval') next.retrievalSuccesses++;
  }
  return next;
}
// Internal ordinal evidence, never a user-facing mastery percentage.
export const evidenceStrength = e => (e?.independentSuccesses || 0) * 3 + (e?.assistedSuccesses || 0);
