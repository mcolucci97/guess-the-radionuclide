export const MAX_INTERVENTIONS = 3;
export const PRIORITIES = Object.freeze(['correction','retrieval','prediction','selfExplanation','questionQuality']);
export const newBudget = () => ({used:0,actionIds:[],lastQuestionIndex:-2});
export function chooseIntervention(proposals, budget, {actionId, questionIndex = 0} = {}) {
  if (budget.used >= MAX_INTERVENTIONS || budget.actionIds.includes(actionId)) return null;
  for (const type of PRIORITIES) {
    const candidate=proposals.find(p=>p.type===type&&p.eligible);
    if (!candidate) continue;
    // Leave a whole question between ordinary prompts; reserve the third slot for errors.
    if (type !== 'correction' && (budget.used >= 2 || questionIndex-budget.lastQuestionIndex < 2)) continue;
    return {...candidate,actionId};
  }
  return null;
}
export function spendIntervention(budget, intervention, questionIndex) {
  if (!intervention || budget.used >= MAX_INTERVENTIONS || budget.actionIds.includes(intervention.actionId)) return budget;
  return {used:budget.used+1,actionIds:[...budget.actionIds,intervention.actionId],lastQuestionIndex:questionIndex};
}
