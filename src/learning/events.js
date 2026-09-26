export const EVENT_VERSION = 1;
export const EVENT_TYPES = Object.freeze([
  'MATCH_STARTED', 'QUESTION_ASKED', 'ANSWER_RECEIVED',
  'CARDS_SELECTED_FOR_ELIMINATION', 'CARDS_ELIMINATED', 'GUESS_MADE', 'MATCH_FINISHED',
  'PREDICTION_REQUESTED', 'PREDICTION_SUBMITTED', 'SELF_EXPLANATION_REQUESTED',
  'SELF_EXPLANATION_SUBMITTED', 'FEEDBACK_SHOWN', 'BOARD_LENS_USED',
  'RETRIEVAL_REQUESTED', 'RETRIEVAL_SUBMITTED',
]);
// No raw question, secret, auth UID or transport objects in this contract.
const fields = ['level','mode','deckIds','query','reliable','conceptIds','candidateIds',
  'eliminatedIds','selectedIds','expectedIds','answer','correct','assisted','spontaneous',
  'automatic','misconceptionId','interventionType','outcome','cardId','choiceId',
  'candidateCountBefore','candidateCountAfter','yesCount','noCount','informationValueCategory','learningValueCategory'];
const queryFields = ['type','queryType','negated','conceptId','property','operator','value','min','max','unit','language'];
export function semanticEvent(type, {matchId, actionId, actor = 'player', at = Date.now(), payload = {}}) {
  if (!EVENT_TYPES.includes(type) || !matchId || !actionId) throw new TypeError('Invalid semantic event');
  const clean = Object.fromEntries(fields.filter(k => payload[k] !== undefined).map(k => [k, payload[k]]));
  if (clean.query) clean.query = Object.fromEntries(queryFields.filter(k => clean.query[k] !== undefined).map(k => [k, clean.query[k]]));
  return {version: EVENT_VERSION, type, matchId, actionId, actor, at, payload: structuredClone(clean)};
}
export const eventKey = event => `${event.actor}:${event.actionId}:${event.type}`;
