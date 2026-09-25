import {test,before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {initializeTestEnvironment,assertFails,assertSucceeds} from '@firebase/rules-unit-testing';
import {ref,get,set,update,remove} from 'firebase/database';
import {createRoom,initialPrivate,transition} from '../src/multiplayer/stateMachine.js';
import {firebaseTransport} from '../src/multiplayer/firebaseTransport.js';
import {RoomService} from '../src/multiplayer/roomService.js';
// RTDB's Node websocket client ignores NO_PROXY. These tests contact loopback emulators only.
delete process.env.HTTP_PROXY; delete process.env.http_proxy;
const config={deckIds:['H-3','F-18','C-14','Rn-222'],audience:'adult',level:'base',assist:'assisted'};
const code='ABC234',path='rooms/'+code;
let env;
const db=uid=>env.authenticatedContext(uid).database();
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-radionuclide',database:{host:'127.0.0.1',port:9000,rules:await fs.readFile('database.rules.json','utf8')}});});
beforeEach(()=>env.clearDatabase());
after(()=>env.cleanup());
async function fixture() {
 let room=createRoom('host',config);
 await assertSucceeds(set(ref(db('host'),path),room));
 room=transition(room,'guest',{id:'join',type:'join'});
 await assertSucceeds(set(ref(db('guest'),path),room));
 const a={...initialPrivate(room),secretId:'H-3'},b={...initialPrivate(room),secretId:'F-18'};
 await assertSucceeds(set(ref(db('host'),`private/${code}/host`),a));
 await assertSucceeds(set(ref(db('guest'),`private/${code}/guest`),b));
 for(const uid of ['host','guest']){room=transition(room,uid,{id:'ready-'+uid,type:'ready'});await assertSucceeds(set(ref(db(uid),path),room));}
 return room;
}
const move=async(room,uid,action)=>{const next=transition(room,uid,{id:crypto.randomUUID(),expectedSeq:room.seq,...action});await assertSucceeds(set(ref(db(uid),path),next));return next;};
test('Real rules: own private reads only; no parent/shared secret leak or room listing',async()=>{
 await fixture();
 await assertSucceeds(get(ref(db('host'),`private/${code}/host`)));
 await assertFails(get(ref(db('guest'),`private/${code}/host`)));
 for(const p of [undefined, 'rooms', 'private', `private/${code}`])await assertFails(get(ref(db('host'),p)));
 await assertFails(get(ref(db('intruder'),path)));
 const shared=(await get(ref(db('guest'),path))).val();assert(!JSON.stringify(shared).includes('secretId'));
 await assertFails(get(ref(env.unauthenticatedContext().database(),path)));
});
test('Real rules: seat replacement, secret changes/deletion, config mutation and extra fields denied',async()=>{
 const r=await fixture();
 await assertFails(update(ref(db('intruder'),path),{guestUid:'intruder'}));
 await assertFails(update(ref(db('host'),path),{guestUid:'intruder'}));
 await assertFails(update(ref(db('host'),`private/${code}/host`),{secretId:'C-14'}));
 await assertFails(remove(ref(db('host'),`private/${code}/host/secretId`)));
 await assertFails(remove(ref(db('host'),`private/${code}/host`)));
 await assertFails(set(ref(db('host'),`private/${code}/guest`),initialPrivate(r)));
 const q=transition(r,'host',{id:'q',expectedSeq:r.seq,type:'question',kind:'verbal',rawText:'',language:'en'});
 for(const corrupt of [x=>{x.config.deckIds[0]='Rn-222';},x=>{x.config.level='expert';},x=>{delete x.config.deckMap['H-3'];},x=>{x.secretId='H-3';},x=>{x.current=2;},x=>{x.ready.p2=false;}]){
  const bad=structuredClone(q);corrupt(bad);await assertFails(set(ref(db('host'),path),bad));
 }
 await assertSucceeds(set(ref(db('host'),path),q));
});
test('Real rules: no fake ready without secret; nonmembers cannot seize or write',async()=>{
 let r=createRoom('host',config);await set(ref(db('host'),path),r);
 const joined=transition(r,'guest',{id:'j',type:'join'});
 await assertFails(set(ref(db('intruder'),path),joined));await assertSucceeds(set(ref(db('guest'),path),joined));
 const ready=transition(joined,'host',{id:'ready',type:'ready'});await assertFails(set(ref(db('host'),path),ready));
 await assertFails(set(ref(db('intruder'),`private/${code}/intruder`),initialPrivate(joined)));
});
test('Real rules: complete written/verbal turns; cannot submit for opponent or repeat stale action',async()=>{
 let r=await fixture();r=await move(r,'host',{type:'question',kind:'written',rawText:'Something unparsed?',queryJson:'',language:'en'});
 const answer=transition(r,'guest',{id:'answer',expectedSeq:r.seq,type:'answer',questionId:r.event.id,yes:true});
 await assertFails(set(ref(db('host'),path),answer));await assertSucceeds(set(ref(db('guest'),path),answer));
 r=await move(answer,'host',{type:'end'});await assertFails(set(ref(db('guest'),path),answer));
 r=await move(r,'guest',{type:'question',kind:'verbal',rawText:'',language:'fr'});
 r=await move(r,'host',{type:'answer',questionId:r.event.id,yes:false});assert.equal(r.event.answer,'no');
 r=await move(r,'guest',{type:'end'});assert.equal(r.current,1);assert.equal(r.turn,3);
});
test('Real rules: guesses validated against private secret, finished state immutable',async()=>{
 let r=await fixture();r=await move(r,'host',{type:'guess',cardId:'C-14'});
 const falseWin=transition(r,'guest',{id:'cheat',expectedSeq:r.seq,type:'resolveGuess',questionId:r.event.id,correct:true});
 await assertFails(set(ref(db('guest'),path),falseWin));
 r=await move(r,'guest',{type:'resolveGuess',questionId:r.event.id,correct:false});
 r=await move(r,'guest',{type:'guess',cardId:'H-3'});
 r=await move(r,'host',{type:'resolveGuess',questionId:r.event.id,correct:true});
 for(const uid of ['host','guest','intruder'])await assertFails(update(ref(db(uid),path),{phase:'ask',winner:0,seq:r.seq+1}));
});
test('Real rules: presence is member-visible and connection writes owned',async()=>{
 await fixture();await assertSucceeds(set(ref(db('host'),`presence/${code}/host/tab`),{connectedAt:Date.now()}));
 await assertSucceeds(get(ref(db('guest'),`presence/${code}`)));
 await assertFails(set(ref(db('guest'),`presence/${code}/host/tab`),{connectedAt:Date.now()}));
 await assertFails(get(ref(db('intruder'),`presence/${code}`)));
 await assertSucceeds(remove(ref(db('host'),`presence/${code}/host/tab`)));
});
test('Real adapter uses transactions for create/join/ready and resume is idempotent',async()=>{
 const transports=['a','b','c'].map(uid=>firebaseTransport({uid,database:db(uid)}));
 try {
  await Promise.all(transports.map(t=>new Promise(resolve=>{let stop;stop=t.watchConnection(connected=>{if(connected){queueMicrotask(()=>stop());resolve();}});}))); 
  const [a,b,c]=transports.map(t=>new RoomService(t));const roomCode=await a.create(config);
  const joins=await Promise.allSettled([b.join(roomCode),c.join(roomCode)]);assert.equal(joins.filter(x=>x.status==='fulfilled').length,1,JSON.stringify(joins.map(x=>({status:x.status,error:x.reason?.message}))));
  const guest=joins[0].status==='fulfilled'?b:c;
  await Promise.all([a.selectSecret(roomCode,'H-3'),guest.selectSecret(roomCode,'F-18')]);
  const r=await a.transport.readRoom(roomCode);assert.equal(r.phase,'ask');assert.equal(r.current,1);
  await guest.join(roomCode);await a.resume(roomCode);assert.deepEqual(await a.transport.readRoom(roomCode),r);
 } finally {transports.forEach(t=>t.close());}
});
