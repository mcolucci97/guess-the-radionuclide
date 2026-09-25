// Test-only deterministic hub. Not imported by the production application.
import {seatOf, fail} from './stateMachine.js';
const clone = x => x == null ? null : structuredClone(x);
export function createMemoryHub() {
  const rooms = new Map(), privateData = new Map(), presence = new Map(), listeners = new Map();
  const emit = key => { for (const fn of listeners.get(key) || []) fn(); };
  const listen = (key, fn) => { if (!listeners.has(key)) listeners.set(key, new Set()); listeners.get(key).add(fn); queueMicrotask(fn); return () => listeners.get(key).delete(fn); };
  return {
    connect(uid) {
      let connected = true;
      const connectionListeners = new Set();
      const member = code => { if (!seatOf(rooms.get(code), uid)) fail('roomFull'); };
      const online = () => { if (!connected) fail('offline'); };
      return {
        uid,
        async create(code, room) { online(); if (rooms.has(code)) return false; if (room.hostUid !== uid) fail('roomFull'); rooms.set(code, clone(room)); emit(code); return true; },
        async readRoom(code) { const r = rooms.get(code); if (!r) fail('missingRoom'); if (r.guestUid && !seatOf(r, uid)) fail('roomFull'); return clone(r); },
        async transactRoom(code, fn) { online(); const next = fn(clone(rooms.get(code))); rooms.set(code, clone(next)); emit(code); return clone(next); },
        async transactPrivate(code, fn) { online(); member(code); const key = code + '/' + uid, old = privateData.get(key), next = fn(clone(old)); if (old?.secretId && old.secretId !== next.secretId) fail('stale'); privateData.set(key, clone(next)); emit(key); return clone(next); },
        async readPrivate(code, targetUid = uid) { member(code); if (targetUid !== uid) fail('permission-denied'); return clone(privateData.get(code + '/' + uid)); },
        watchRoom(code, fn) { member(code); return listen(code, () => { if (connected) fn(clone(rooms.get(code))); }); },
        watchPrivate(code, fn) { member(code); const key = code + '/' + uid; return listen(key, () => { if (connected) fn(clone(privateData.get(key))); }); },
        watchPresence(code, fn) { member(code); return listen('presence/' + code, () => fn(clone(presence.get(code) || {}))); },
        connectPresence(code) { member(code); const p = presence.get(code) || {}; p[uid] = {test: true}; presence.set(code, p); emit('presence/' + code); return () => { delete p[uid]; emit('presence/' + code); }; },
        watchConnection(fn) { connectionListeners.add(fn); fn(connected); return () => connectionListeners.delete(fn); },
        setConnected(value) { connected = value; for (const fn of connectionListeners) fn(value); for (const [code, p] of presence) { if (seatOf(rooms.get(code), uid)) { if (value) p[uid] = {test: true}; else delete p[uid]; emit('presence/' + code); emit(code); emit(code + '/' + uid); } } },
        close() {},
      };
    },
  };
}
