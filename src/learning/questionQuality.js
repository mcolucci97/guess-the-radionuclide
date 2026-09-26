import {learningValue} from './concepts.js';
export function classifyInformation(yesCount, noCount, unknownCount = 0) {
  if (unknownCount) return 'unavailable';
  const total = yesCount + noCount, smaller = Math.min(yesCount,noCount);
  if (!total || !smaller) return 'none';
  const ratio = smaller / total;
  return ratio >= .35 ? 'very' : ratio >= .15 ? 'useful' : 'weak';
}
export function questionQuality({yesCount, noCount, unknownCount = 0, conceptIds = []}) {
  return {informationValue:classifyInformation(yesCount,noCount,unknownCount),
    learningValue:learningValue(conceptIds), yesCount, noCount, unknownCount};
}
export function partitionCandidates(cards, query, evaluate) {
  const yesIds=[], noIds=[], unknownIds=[];
  for (const card of cards) {
    let result; try {result=evaluate(card,query);} catch {}
    if (result?.type !== 'ok' || typeof result.yes !== 'boolean') unknownIds.push(card.id);
    else (result.yes ? yesIds : noIds).push(card.id);
  }
  return {yesIds,noIds,unknownIds};
}
export function eliminationAssessment(candidateIds, selectedIds, expectedIds) {
  const selected = new Set(selectedIds.filter(id=>candidateIds.includes(id))), expected = new Set(expectedIds);
  const wronglyEliminated = [...selected].filter(id=>!expected.has(id));
  const missed = [...expected].filter(id=>!selected.has(id));
  return {correct:!wronglyEliminated.length&&!missed.length, wronglyEliminated, missed};
}
