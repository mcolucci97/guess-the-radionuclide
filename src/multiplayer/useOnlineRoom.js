import {useState, useEffect, useRef, useCallback} from 'react';
import {RoomService} from './roomService.js';
import {seatOf} from './stateMachine.js';
import {xe} from '../engine/advanced.js';
const storageKey = 'rn-online-resume-v1';
const readResume = () => { try { return JSON.parse(localStorage.getItem(storageKey)); } catch { return null; } };
const errorCode = error => {
  const code = error?.code || error?.message;
  if (/permission.denied/i.test(code)) return 'roomFull';
  if (/auth\//.test(code)) return 'configError';
  return ['configError','roomFull','invalidCode','missingRoom','stale','offline'].includes(code) ? code : 'error';
};

export function useOnlineRoom(invite) {
  const [service,setService] = useState(null), [code,setCode] = useState('');
  const [room,setRoom] = useState(null), [board,setBoard] = useState(null), [presence,setPresence] = useState({});
  const [connected,setConnected] = useState(false), [busy,setBusy] = useState(false), [error,setError] = useState(''), [attempt,setAttempt] = useState(0);
  const busyRef = useRef(false), resumed = useRef(false);
  const repairAttempt = useRef('');
  const report = useCallback(err => setError(errorCode(err)), []);
  const run = useCallback(async fn => {
    if (busyRef.current) return false;
    busyRef.current = true; setBusy(true); setError('');
    try { await fn(); return true; } catch (err) { report(err); return false; }
    finally { busyRef.current = false; setBusy(false); }
  }, [report]);
  useEffect(() => {
    let live = true, transport, stop;
    setError(''); setService(null); setConnected(false); resumed.current = false;
    repairAttempt.current = '';
    import('./firebaseTransport.js').then(m => m.createFirebaseTransport()).then(t => {
      transport = t;
      if (!live) { t.close(); return; }
      setService(new RoomService(t)); stop = t.watchConnection(value => live && setConnected(value));
    }).catch(err => live && report(err));
    return () => { live = false; stop?.(); transport?.close(); };
  }, [attempt, report]);
  useEffect(() => {
    if (!service || !connected || resumed.current || code) return;
    resumed.current = true;
    const previous = readResume();
    if (previous?.uid === service.uid && (!invite || invite === previous.code)) {
      run(async () => { await service.resume(previous.code); setCode(previous.code); });
    }
  }, [service, connected, code, invite, run]);
  useEffect(() => {
    if (!service || !code) return;
    setRoom(null); setBoard(null);
    const url = new URL(location.href); url.searchParams.set('room',code); history.replaceState(null,'',url);
    try { localStorage.setItem(storageKey, JSON.stringify({code,uid:service.uid})); } catch { /* Firebase auth still persists where supported. */ }
    const t = service.transport, stop = [t.watchRoom(code,setRoom,report),t.watchPrivate(code,setBoard,report),t.watchPresence(code,setPresence,report),t.connectPresence(code,report)];
    return () => stop.forEach(fn => fn());
  }, [service, code, report]);
  const seat = seatOf(room,service?.uid);
  const needsReady = room?.phase === 'select' && room.guestUid && board?.secretId && !room.ready['p'+seat];
  const needsAnswer = room?.phase === 'review' && room.current === seat && board && board.appliedEvent !== room.event.id;
  const needsGuess = room?.phase === 'guess' && room.current !== seat && board?.secretId;
  // Repair an interrupted private-secret/ready pair or apply a response exactly once after refresh.
  useEffect(() => {
    if (!connected) repairAttempt.current = '';
    if (!service || !connected || busy || !board || !room || !seat) return;
    const operation = needsReady ? 'ready' : needsAnswer ? 'answer' : needsGuess ? 'guess' : '';
    if (!operation) return;
    const key = `${code}:${room.seq}:${operation}`;
    // Resume once the user's current write finishes. A failed repair waits for
    // an explicit retry, a reconnect or a new revision instead of spinning.
    if (repairAttempt.current === key) return;
    repairAttempt.current = key;
    if (needsReady) run(() => service.markReady(code));
    else if (needsAnswer) run(() => service.applyAnswer(code,room,room.config.deckIds.map(id=>xe[id])));
    else if (needsGuess) run(() => service.resolveGuess(code,room,board.secretId));
  }, [service,connected,busy,room?.seq,board?.secretId,board?.appliedEvent,seat,code,needsReady,needsAnswer,needsGuess,run]);
  const open = fn => run(async () => { const next = await fn(); setCode(next); });
  const forgetRoom = () => { try { localStorage.removeItem(storageKey); } catch {} const url=new URL(location.href);url.searchParams.delete('room');history.replaceState(null,'',url);resumed.current=true;setCode('');setRoom(null);setBoard(null);setError(''); };
  return {service,code,room,board,presence,seat,connected,busy,error,run,open,forgetRoom,
    syncing: !!(needsReady || needsAnswer || needsGuess), retry: () => setAttempt(x=>x+1)};
}
