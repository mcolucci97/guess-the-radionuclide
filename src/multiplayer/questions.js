// Multiplayer never needs the optional LLM. Keep the existing deterministic -> semantic priority.
import {ze, validQuery, Ge, formatQuery} from '../engine/advanced.js';

export function safeQuery(value) {
  try {
    const q = typeof value === 'string' ? JSON.parse(value) : value;
    if (!validQuery(q) || q.language && !['it', 'en', 'fr'].includes(q.language)) return null;
    if (q.confidence !== undefined && (!Number.isFinite(q.confidence) || q.confidence < 0.30)) return null;
    // Copy only the fields understood by our evaluator. Never retain arbitrary backend objects.
    const keys = ['type', 'queryType', 'negated', 'conceptId', 'property', 'operator', 'value', 'min', 'max', 'unit', 'language'];
    return Object.fromEntries(keys.filter(k => q[k] !== undefined).map(k => [k, q[k]]));
  } catch { return null; }
}

export function interpret(rawText, language) {
  try { return safeQuery(ze(rawText, language)); } catch { return null; }
}

export function writtenQuestion(rawText, language) {
  // Do not trim, reword, or reject text because parsing failed.
  const structuredQuery = interpret(rawText, language);
  return {kind: 'written', rawText, language, queryJson: structuredQuery ? JSON.stringify(structuredQuery) : ''};
}

export function answerSuggestion(event, ownSecret, enabled, language) {
  if (!enabled || event.kind !== 'written') return {manual: true, query: null};
  const q = safeQuery(event.queryJson) || interpret(event.rawText, event.language || language);
  if (!q || !ownSecret) return {failed: true, query: null};
  try {
    const result = Ge(ownSecret, q, event.language || language);
    if (result.type !== 'ok' || typeof result.yes !== 'boolean') return {failed: true, query: null};
    return {query: q, yes: result.yes, label: formatQuery(q, language)};
  } catch { return {failed: true, query: null}; }
}

export function applyAnswer(board, room, cards) {
  const event = room.event;
  if (room.phase !== 'review' || !event.id || board.appliedEvent === event.id) return board;
  const query = safeQuery(event.acceptedQueryJson);
  const remaining = {...board.remaining};
  if (room.config.assist === 'assisted' && query) {
    for (const card of cards) {
      try {
        const result = Ge(card, query, event.language);
        if (result.type === 'ok' && result.yes !== (event.answer === 'yes')) remaining[card.id] = false;
      } catch { /* Unknown values never eliminate a card. */ }
    }
  }
  return {...board, remaining, appliedEvent: event.id};
}
