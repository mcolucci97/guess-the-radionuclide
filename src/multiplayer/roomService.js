import {actionId, roomCode, createRoom, transition, initialPrivate, normalizeCode, validCode, seatOf, fail} from './stateMachine.js';
import {writtenQuestion, applyAnswer} from './questions.js';

// Transport contract: uid, create, transactRoom, transactPrivate, watchRoom, watchPrivate,
// watchPresence, connectPresence, watchConnection, readRoom, close. No Firebase types cross here.
export class RoomService {
  constructor(transport) { this.transport = transport; this.uid = transport.uid; }
  async create(config) {
    for (let attempt = 0; attempt < 8; attempt++) {
      const code = roomCode();
      if (await this.transport.create(code, createRoom(this.uid, config))) { await this.ensurePrivate(code); return code; }
    }
    fail('error');
  }
  async join(input) {
    const code = normalizeCode(input);
    if (!validCode(code)) fail('invalidCode');
    await this.dispatch(code, {type: 'join'}); await this.ensurePrivate(code); return code;
  }
  async resume(code) {
    const room = await this.transport.readRoom(code);
    if (!seatOf(room, this.uid)) fail('roomFull');
    await this.ensurePrivate(code); return code;
  }
  async ensurePrivate(code) {
    const room = await this.transport.readRoom(code);
    return this.transport.transactPrivate(code, board => board || initialPrivate(room));
  }
  dispatch(code, action) {
    const a = {id: actionId(), ...action};
    return this.transport.transactRoom(code, room => transition(room, this.uid, a));
  }
  async selectSecret(code, secretId) {
    const room = await this.transport.readRoom(code);
    if (!room.config.deckMap[secretId]) fail('stale');
    await this.transport.transactPrivate(code, board => {
      if (board.secretId && board.secretId !== secretId) fail('stale');
      return {...board, secretId};
    });
    // A refresh between these writes is repaired by the recovery effect.
    return this.markReady(code);
  }
  markReady(code) { return this.dispatch(code, {type: 'ready'}); }
  question(code, room, text, language, verbal = false) {
    return this.dispatch(code, {type: 'question', expectedSeq: room.seq,
      ...(verbal ? {kind: 'verbal', rawText: '', queryJson: '', language} : writtenQuestion(text, language))});
  }
  answer(code, room, yes, acceptedQuery = null) {
    return this.dispatch(code, {type: 'answer', expectedSeq: room.seq, questionId: room.event.id, yes, acceptedQuery});
  }
  end(code, room) { return this.dispatch(code, {type: 'end', expectedSeq: room.seq}); }
  guess(code, room, cardId) { return this.dispatch(code, {type: 'guess', expectedSeq: room.seq, cardId}); }
  resolveGuess(code, room, ownSecretId) {
    return this.dispatch(code, {type: 'resolveGuess', expectedSeq: room.seq, questionId: room.event.id, correct: room.event.cardId === ownSecretId});
  }
  setAssistance(code, enabled) { return this.transport.transactPrivate(code, board => ({...board, answerAssistance: enabled})); }
  toggleCard(code, id) {
    return this.transport.transactPrivate(code, board => {
      if (!(id in board.remaining)) fail('stale');
      const down = board.manuallyDown[id] || !board.remaining[id];
      return {...board, remaining: {...board.remaining, [id]: true}, manuallyDown: {...board.manuallyDown, [id]: !down}};
    });
  }
  applyAnswer(code, room, cards) {
    if (seatOf(room, this.uid) !== room.current) fail('stale');
    return this.transport.transactPrivate(code, board => applyAnswer(board, room, cards));
  }
}
