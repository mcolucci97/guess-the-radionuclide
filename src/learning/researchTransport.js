const EVENT_MAP = Object.freeze({
  MATCH_STARTED:'match_started', MATCH_FINISHED:'match_finished',
  QUESTION_ASKED:'question_asked_structured', ANSWER_RECEIVED:'question_answered',
  CARDS_ELIMINATED:'manual_elimination', PREDICTION_REQUESTED:'prediction_prompted',
  PREDICTION_SUBMITTED:'prediction_submitted', SELF_EXPLANATION_REQUESTED:'self_explanation_prompted',
  SELF_EXPLANATION_SUBMITTED:'self_explanation_submitted', FEEDBACK_SHOWN:'feedback_shown',
  BOARD_LENS_USED:'board_lens_used', GUESS_MADE:'guess_made',
  RETRIEVAL_SUBMITTED:'retrieval_submitted',
});
const QUERY_FIELDS=['type','queryType','negated','conceptId','property','operator','value','min','max','unit','language'];
const ID_ARRAY_FIELDS=['deckIds','eliminatedIds','selectedIds'];
const SIMPLE_FIELDS=['answer','correct','assisted','spontaneous','automatic','misconceptionId','interventionType','outcome','cardId','choiceId','reliable'];

const clone = value => value===undefined?undefined:structuredClone(value);
const safeStore = storage => ({
  get(k){try{return storage?.getItem?.(k)||null;}catch{return null;}},
  set(k,v){try{storage?.setItem?.(k,v);return true;}catch{return false;}},
  remove(k){try{storage?.removeItem?.(k);return true;}catch{return false;}},
});
const cleanIds=value=>Array.isArray(value)?value.filter(x=>typeof x==='string').slice(0,100):undefined;
const cleanConcepts=value=>Array.isArray(value)?value.filter(x=>typeof x==='string').slice(0,20):undefined;
const cleanQuery=query=>query&&typeof query==='object'?Object.fromEntries(QUERY_FIELDS.filter(k=>query[k]!==undefined).map(k=>[k,query[k]])):undefined;
const id=()=>globalThis.crypto?.randomUUID?.()||`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function researchEventFromSemantic(event,context,index=0) {
  if(!event||!EVENT_MAP[event.type]||!context?.studyId||!context?.participantId||!context?.sessionId)return null;
  const p=event.payload||{}, eventType=event.type==='QUESTION_ASKED'&&p.reliable===false?'verbal_question_used':
    event.type==='CARDS_ELIMINATED'&&p.automatic?'automatic_elimination':EVENT_MAP[event.type];
  const data={actor:event.actor};
  if(p.conceptIds)data.conceptIds=cleanConcepts(p.conceptIds);
  if(p.query)data.structuredQuery=cleanQuery(p.query);
  for(const key of ID_ARRAY_FIELDS)if(p[key]!==undefined)data[key==='eliminatedIds'?'eliminatedCardIds':key]=cleanIds(p[key]);
  for(const key of SIMPLE_FIELDS)if(p[key]!==undefined)data[key]=p[key];
  if(Number.isFinite(p.candidateCountBefore))data.candidateCountBefore=p.candidateCountBefore;
  if(Number.isFinite(p.candidateCountAfter))data.candidateCountAfter=p.candidateCountAfter;
  if(Number.isFinite(p.yesCount))data.yesCount=p.yesCount;
  if(Number.isFinite(p.noCount))data.noCount=p.noCount;
  if(typeof p.informationValueCategory==='string')data.informationValueCategory=p.informationValueCategory;
  if(typeof p.learningValueCategory==='string')data.learningValueCategory=p.learningValueCategory;
  return {
    studyId:context.studyId, participantId:context.participantId, sessionId:context.sessionId,
    eventId:`e_${id()}`, clientEventIndex:index,
    relativeTimeMs:Math.max(0,(Number(event.at)||Date.now())-(Number(context.startedAt)||Date.now())),
    gameVersion:context.gameVersion||'unknown', learningEngineVersion:context.learningEngineVersion||'1',
    level:p.level||context.level||null, mode:p.mode||context.mode||null, eventType, data,
  };
}

export class DisabledResearchTransport {
  enabled = false;
  startSession() {} recordEvent() {} submitPreTest() {} submitPostTest() {} finishSession() {}
  async flush() {}
}

export class InMemoryResearchTransport {
  enabled = true;
  records = [];
  startSession(data) { this.records.push({type:'startSession', data:clone(data)}); }
  recordEvent(data) { this.records.push({type:'recordEvent', data:clone(data)}); }
  submitPreTest(data) { this.records.push({type:'submitPreTest', data:clone(data)}); }
  submitPostTest(data) { this.records.push({type:'submitPostTest', data:clone(data)}); }
  finishSession(data) { this.records.push({type:'finishSession', data:clone(data)}); }
  async flush() {}
}

export class HttpResearchTransport {
  enabled = true;
  constructor({endpoint,studyId,participantId,sessionId,uploadToken,startedAt=Date.now(),gameVersion='3.0.0',learningEngineVersion='1',fetchImpl=globalThis.fetch,storage,batchSize=12,flushDelayMs=700}={}) {
    if(!endpoint||!studyId||!participantId||!sessionId||!uploadToken||typeof fetchImpl!=='function')throw new TypeError('Incomplete research transport configuration');
    if(storage===undefined)try{storage=globalThis.sessionStorage;}catch{storage=null;}
    this.endpoint=String(endpoint).replace(/\/$/,''); this.studyId=studyId;this.participantId=participantId;this.sessionId=sessionId;this.uploadToken=uploadToken;
    this.startedAt=startedAt;this.gameVersion=gameVersion;this.learningEngineVersion=learningEngineVersion;this.fetchImpl=fetchImpl;
    this.store=safeStore(storage);this.batchSize=batchSize;this.flushDelayMs=flushDelayMs;this.index=0;this.timer=null;this.flushing=null;this.closed=false;
    this.queueKey=`rn-research-queue:${sessionId}`;this.indexKey=`rn-research-index:${sessionId}`;this.queue=[];
    try{const old=JSON.parse(this.store.get(this.queueKey)||'[]');if(Array.isArray(old))this.queue=old.slice(0,300);}catch{/* ignore malformed queue */}
    this.index=Math.max(Number(this.store.get(this.indexKey))||0,this.queue.reduce((m,e)=>Math.max(m,Number(e.clientEventIndex)||0),0));
    if(typeof addEventListener==='function'){
      this.onlineHandler=()=>this.flush(); addEventListener('online',this.onlineHandler);
      this.visibilityHandler=()=>{if(globalThis.document?.visibilityState==='hidden')this.flush({keepalive:true});};addEventListener('visibilitychange',this.visibilityHandler);
    }
  }
  context(extra={}) {return {studyId:this.studyId,participantId:this.participantId,sessionId:this.sessionId,startedAt:this.startedAt,gameVersion:this.gameVersion,learningEngineVersion:this.learningEngineVersion,...extra};}
  headers(){return {'content-type':'application/json','x-research-session-token':this.uploadToken};}
  async post(path,body,{keepalive=false}={}) {
    const response=await this.fetchImpl(this.endpoint+path,{method:'POST',headers:this.headers(),body:JSON.stringify(body),keepalive});
    if(!response.ok){const detail=await response.text().catch(()=>String(response.status));throw new Error(`Research backend ${response.status}: ${detail.slice(0,160)}`);}return response.status===204?null:response.json().catch(()=>null);
  }
  startSession(data={}) { return this.post(`/v1/sessions/${encodeURIComponent(this.sessionId)}/resume`,{client:clone(data)}).catch(()=>null); }
  recordEvent(event) {
    if(this.closed)return;
    if(event?.type==='MATCH_STARTED'){this.level=event.payload?.level||this.level;this.mode=event.payload?.mode||this.mode;}
    const item=researchEventFromSemantic(event,this.context({level:this.level,mode:this.mode}),++this.index);if(!item)return;this.store.set(this.indexKey,String(this.index));
    this.queue.push(item);if(this.queue.length>300)this.queue=this.queue.slice(-300);this.persistQueue();
    if(this.queue.length>=this.batchSize)this.flush();else this.schedule();
  }
  persistQueue(){this.store.set(this.queueKey,JSON.stringify(this.queue));}
  schedule(){if(this.timer||this.closed)return;this.timer=setTimeout(()=>{this.timer=null;this.flush();},this.flushDelayMs);}
  async flush({keepalive=false}={}) {
    if(this.flushing)return this.flushing;if(!this.queue.length||this.closed)return;
    const batch=this.queue.slice(0,this.batchSize);
    this.flushing=this.post(`/v1/sessions/${encodeURIComponent(this.sessionId)}/events`,{events:batch},{keepalive}).then(()=>{
      const sent=new Set(batch.map(x=>x.eventId));this.queue=this.queue.filter(x=>!sent.has(x.eventId));this.persistQueue();
    }).catch(()=>{this.schedule();}).finally(()=>{this.flushing=null;if(this.queue.length)this.schedule();});
    return this.flushing;
  }
  async submitPreTest(data){await this.flush();return this.post(`/v1/sessions/${encodeURIComponent(this.sessionId)}/pretest`,data);}
  async submitPostTest(data){await this.flush();return this.post(`/v1/sessions/${encodeURIComponent(this.sessionId)}/posttest`,data);}
  async finishSession(data={}) {await this.flush();if(this.queue.length)throw new Error('Research events are still pending upload');const result=await this.post(`/v1/sessions/${encodeURIComponent(this.sessionId)}/finish`,data);this.closed=true;this.store.remove(this.queueKey);this.store.remove(this.indexKey);this.dispose();return result;}
  async status(){const response=await this.fetchImpl(this.endpoint+`/v1/sessions/${encodeURIComponent(this.sessionId)}`,{headers:{'x-research-session-token':this.uploadToken}});if(!response.ok)return null;return response.json().catch(()=>null);}
  dispose(){if(this.timer)clearTimeout(this.timer);if(typeof removeEventListener==='function'){if(this.onlineHandler)removeEventListener('online',this.onlineHandler);if(this.visibilityHandler)removeEventListener('visibilitychange',this.visibilityHandler);}}
}

export const defaultResearchTransport = () => new DisabledResearchTransport();
