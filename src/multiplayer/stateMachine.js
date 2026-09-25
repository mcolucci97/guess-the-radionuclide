import {be} from '../engine/advanced.js';
import {safeQuery} from './questions.js';

export const SCHEMA_VERSION = 1;
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const normalizeCode = code => String(code).trim().toUpperCase();
export const validCode = code => /^[A-HJ-NP-Z2-9]{6}$/.test(code);
export const seatOf = (room, uid) => room?.hostUid === uid ? 1 : room?.guestUid === uid ? 2 : 0;
export const uidOf = (room, seat) => seat === 1 ? room.hostUid : room.guestUid;
export const actionId = () => globalThis.crypto.randomUUID();
export function roomCode() {
  const bytes = new Uint8Array(6); globalThis.crypto.getRandomValues(bytes);
  return [...bytes].map(n => CODE_ALPHABET[n % CODE_ALPHABET.length]).join('');
}
export function fail(code) { throw Object.assign(new Error(code), {code}); }
const emptyEvent = () => ({id: '', kind: 'none', rawText: '', language: 'it', queryJson: '', answer: 'pending', acceptedQueryJson: '', cardId: '', correct: false});

export function canonicalConfig(config) {
  const ids = config.deckIds;
  if (!Array.isArray(ids) || ids.length < 2 || ids.length > be.length || new Set(ids).size !== ids.length || ids.some(id => !be.some(c => c.id === id))) fail('configError');
  if (!['child', 'adult'].includes(config.audience) || !['base', 'intermediate', 'expert'].includes(config.level) || !['manual', 'assisted'].includes(config.assist)) fail('configError');
  return {deckIds: ids, deckMap: Object.fromEntries(ids.map(id => [id, true])), deckSize: ids.length, audience: config.audience, level: config.level, assist: config.assist};
}

export function createRoom(uid, config, now = Date.now()) {
  return {schemaVersion: SCHEMA_VERSION, gameVersion: '3', hostUid: uid, guestUid: '', config: canonicalConfig(config),
    ready: {p1: false, p2: false}, phase: 'select', seq: 0, turn: 1, current: 1, winner: 0,
    event: emptyEvent(), lastActionId: '', createdAt: now};
}

export function initialPrivate(room) {
  return {secretId: '', answerAssistance: true, remaining: {...room.config.deckMap},
    manuallyDown: Object.fromEntries(room.config.deckIds.map(id => [id, false])), appliedEvent: ''};
}

export function transition(room, uid, action) {
  if (!room) fail('missingRoom');
  if (room.schemaVersion !== SCHEMA_VERSION) fail('configError');
  const seat = seatOf(room, uid);
  if (room.lastActionId === action.id && seat) return room;
  if (action.type === 'join') {
    if (seat) return room;
    if (room.guestUid || room.phase !== 'select') fail('roomFull');
    return {...room, guestUid: uid, seq: room.seq + 1, lastActionId: action.id};
  }
  if (!seat) fail('roomFull');
  if (action.type === 'ready' && room.ready['p' + seat]) return room;
  if (room.phase === 'finished') fail('stale');
  // Readiness is commutative; all other moves compare the exact observed revision.
  if (action.type !== 'ready' && action.expectedSeq !== room.seq) fail('stale');
  const next = structuredClone(room);
  next.seq++; next.lastActionId = action.id;
  const isCurrent = seat === room.current;
  switch (action.type) {
    case 'ready':
      if (room.phase !== 'select' || !room.guestUid) fail('stale');
      next.ready['p' + seat] = true;
      if (next.ready.p1 && next.ready.p2) next.phase = 'ask';
      break;
    case 'question':
      if (!isCurrent || room.phase !== 'ask') fail('stale');
      if (!['written', 'verbal'].includes(action.kind) || !['it', 'en', 'fr'].includes(action.language)) fail('invalidQuestion');
      if (typeof action.rawText !== 'string' || action.rawText.length > 4000 || action.kind === 'written' && !action.rawText.trim()) fail('invalidQuestion');
      next.event = {...emptyEvent(), id: action.id, kind: action.kind,
        rawText: action.kind === 'verbal' ? '' : action.rawText, language: action.language,
        queryJson: action.kind === 'written' && safeQuery(action.queryJson) ? JSON.stringify(safeQuery(action.queryJson)) : ''};
      next.phase = 'answer';
      break;
    case 'answer':
      if (isCurrent || room.phase !== 'answer' || action.questionId !== room.event.id || typeof action.yes !== 'boolean') fail('stale');
      next.event.answer = action.yes ? 'yes' : 'no';
      next.event.acceptedQueryJson = room.event.kind === 'written' && safeQuery(action.acceptedQuery) ? JSON.stringify(safeQuery(action.acceptedQuery)) : '';
      next.phase = 'review';
      break;
    case 'end':
      if (!isCurrent || room.phase !== 'review') fail('stale');
      next.current = 3 - seat; next.turn++; next.phase = 'ask';
      break;
    case 'guess':
      if (!isCurrent || room.phase !== 'ask' || !room.config.deckMap[action.cardId]) fail('stale');
      next.event = {...emptyEvent(), id: action.id, kind: 'guess', cardId: action.cardId};
      next.phase = 'guess';
      break;
    case 'resolveGuess':
      if (isCurrent || room.phase !== 'guess' || action.questionId !== room.event.id || typeof action.correct !== 'boolean') fail('stale');
      next.event.correct = action.correct;
      if (action.correct) { next.winner = room.current; next.phase = 'finished'; }
      else { next.current = seat; next.turn++; next.phase = 'ask'; }
      break;
    default: fail('stale');
  }
  return next;
}
