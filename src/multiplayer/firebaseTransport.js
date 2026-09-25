import {ref, get, onValue, runTransaction, set, remove, onDisconnect, serverTimestamp, push} from 'firebase/database';
import {firebaseClient} from './firebaseClient.js';
import {fail} from './stateMachine.js';
export async function createFirebaseTransport() { return firebaseTransport(await firebaseClient()); }
export function firebaseTransport({database, uid}) {
  const roomRef = code => ref(database, `rooms/${code}`), privateRef = code => ref(database, `private/${code}/${uid}`);
  let connected = false;
  const requireOnline = () => { if (!connected) fail('offline'); };
  const stopConnection = onValue(ref(database, '.info/connected'), snap => { connected = snap.val() === true; });
  const transaction = async (reference, fn) => {
    requireOnline(); const initial = (await get(reference)).val();
    let unchanged;
    const result = await runTransaction(reference, cached => {
      unchanged = undefined;
      // get() does not keep a live cache. Seed a null first callback; the server's
      // compare-and-set still retries against the authoritative value on conflict.
      const old = cached ?? initial;
      const next = fn(old);
      if (next === old && old) { unchanged = old; return undefined; }
      return next;
    }, {applyLocally: false});
    if (!result.committed) { if (unchanged) return unchanged; fail('stale'); }
    return result.snapshot.val();
  };
  return {
    uid,
    async create(code, room) {
      requireOnline();
      const result = await runTransaction(roomRef(code), old => old ? undefined : room, {applyLocally: false});
      return result.committed;
    },
    async readRoom(code) { const snap = await get(roomRef(code)); if (!snap.exists()) fail('missingRoom'); return snap.val(); },
    transactRoom: (code, fn) => transaction(roomRef(code), value => value ? fn(value) : undefined),
    transactPrivate: (code, fn) => transaction(privateRef(code), fn),
    watchRoom: (code, callback, error) => onValue(roomRef(code), snap => callback(snap.val()), error),
    watchPrivate: (code, callback, error) => onValue(privateRef(code), snap => callback(snap.val()), error),
    watchPresence: (code, callback, error) => onValue(ref(database, `presence/${code}`), snap => callback(snap.val() || {}), error),
    watchConnection: callback => onValue(ref(database, '.info/connected'), snap => callback(snap.val() === true)),
    connectPresence(code, onError) {
      const connection = push(ref(database, `presence/${code}/${uid}`));
      let disposed = false;
      const stop = onValue(ref(database, '.info/connected'), async snap => {
        if (!snap.val() || disposed) return;
        try {
          await onDisconnect(connection).remove();
          if (disposed) { await onDisconnect(connection).cancel(); return; }
          await set(connection, {connectedAt: serverTimestamp()});
          if (disposed) await remove(connection);
        } catch (error) { if (!disposed) onError?.(error); }
      });
      return () => { disposed = true; stop(); remove(connection).catch(() => {}); onDisconnect(connection).cancel().catch(() => {}); };
    },
    close() { stopConnection(); },
  };
}
