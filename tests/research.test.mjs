import test from 'node:test';
import assert from 'node:assert/strict';
import {semanticEvent} from '../src/learning/events.js';
import {DisabledResearchTransport,HttpResearchTransport,researchEventFromSemantic} from '../src/learning/researchTransport.js';
import {createSessionIdentity,getOrCreateParticipantIdentity,sha256Hex} from '../src/research/identity.js';

class MemoryStorage {
  map=new Map();
  getItem(k){return this.map.has(k)?this.map.get(k):null;}
  setItem(k,v){this.map.set(k,String(v));}
  removeItem(k){this.map.delete(k);}
}

test('participant identity is pseudonymous and stable per study; sessions are distinct',async()=>{
  const storage=new MemoryStorage();
  const a=await getOrCreateParticipantIdentity('pilot',{storage});
  const b=await getOrCreateParticipantIdentity('pilot',{storage});
  assert.equal(a.participantId,b.participantId);
  assert.equal(a.participantTokenHash,b.participantTokenHash);
  assert.match(a.participantId,/^p_/);
  assert.match(a.participantTokenHash,/^[a-f0-9]{64}$/);
  assert.notEqual(createSessionIdentity().sessionId,createSessionIdentity().sessionId);
});

test('research event projection keeps structured science but strips raw text, secret and auth identifiers',()=>{
  const event=semanticEvent('QUESTION_ASKED',{matchId:'m1',actionId:'q1',payload:{
    query:{type:'parsed',queryType:'boolean',property:'halfLifeSeconds',operator:'<',value:3600,language:'it',rawText:'secret free text'},
    reliable:true,spontaneous:true,conceptIds:['half_life.comparison'],candidateIds:['F-18','C-14'],candidateCountBefore:2,yesCount:1,noCount:1,
    rawText:'do not upload me',secretCardId:'F-18',uid:'firebase-user'
  }});
  const projected=researchEventFromSemantic(event,{studyId:'study1',participantId:'p_abc',sessionId:'s_abc',startedAt:event.at-20,gameVersion:'3',learningEngineVersion:'1'},1);
  assert.equal(projected.eventType,'question_asked_structured');
  assert.equal(projected.data.candidateCountBefore,2);
  assert.deepEqual(projected.data.conceptIds,['half_life.comparison']);
  assert(!JSON.stringify(projected).includes('do not upload me'));
  assert(!JSON.stringify(projected).includes('secret free text'));
  assert(!JSON.stringify(projected).includes('firebase-user'));
  assert(!('candidateIds' in projected.data));
});

test('unreliable spoken question is classified without uploading natural language',()=>{
  const event=semanticEvent('QUESTION_ASKED',{matchId:'m1',actionId:'q2',payload:{reliable:false,candidateIds:['A','B']}});
  const projected=researchEventFromSemantic(event,{studyId:'study1',participantId:'p_abc',sessionId:'s_abc',startedAt:event.at},2);
  assert.equal(projected.eventType,'verbal_question_used');
  assert(!('structuredQuery' in projected.data));
});

test('HTTP transport batches only after explicit research configuration and retries through its local queue',async()=>{
  const storage=new MemoryStorage(),calls=[];
  const fetchImpl=async(url,options={})=>{calls.push({url,options});return new Response(JSON.stringify({accepted:1,status:'active'}),{status:202,headers:{'content-type':'application/json'}});};
  const t=new HttpResearchTransport({endpoint:'https://research.example',studyId:'study1',participantId:'p_abc',sessionId:'s_abc',uploadToken:'token',startedAt:1000,fetchImpl,storage,batchSize:1,flushDelayMs:5});
  const event=semanticEvent('MATCH_STARTED',{matchId:'m1',actionId:'start',at:1010,payload:{level:'explorer',mode:'solo',deckIds:['F-18']}});
  t.recordEvent(event);await t.flush();
  assert.equal(calls.length,1);
  assert.equal(calls[0].url,'https://research.example/v1/sessions/s_abc/events');
  assert.equal(calls[0].options.headers['x-research-session-token'],'token');
  const sent=JSON.parse(calls[0].options.body).events[0];
  assert.equal(sent.level,'explorer');assert.equal(sent.mode,'solo');assert.deepEqual(sent.data.deckIds,['F-18']);
  t.dispose();
});

test('disabled transport remains a true no-network default',()=>{
  const t=new DisabledResearchTransport();assert.equal(t.enabled,false);
  for(const method of ['startSession','recordEvent','submitPreTest','submitPostTest','finishSession'])assert.doesNotThrow(()=>t[method]({}));
});

test('SHA-256 helper is deterministic',async()=>assert.equal(await sha256Hex('abc'),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'));

test('backend event sanitizer rejects arbitrary/free-text fields even from a modified client',async()=>{
  const {sanitizeEventData}=await import('../research-backend/worker.js');
  const clean=sanitizeEventData({actor:'player',rawText:'my name is X',secretCardId:'F-18',uid:'firebase',structuredQuery:{type:'parsed',property:'Z',rawText:'hidden'},conceptIds:['nuclide.Z']});
  assert.deepEqual(clean,{actor:'player',structuredQuery:{type:'parsed',property:'Z'},conceptIds:['nuclide.Z']});
});
