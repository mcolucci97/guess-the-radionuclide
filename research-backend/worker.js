const EVENT_TYPES=new Set([
  'match_started','match_finished','question_asked_structured','question_answered','verbal_question_used',
  'manual_elimination','automatic_elimination','prediction_prompted','prediction_submitted',
  'self_explanation_prompted','self_explanation_submitted','feedback_shown','board_lens_used',
  'guess_made','recap_shown','retrieval_submitted'
]);
const AGE_BANDS=new Set(['14-15','16-17','18-20','21-25','26-39','40+']);
const AGE_MIN={'14-15':14,'16-17':16,'18-20':18,'21-25':21,'26-39':26,'40+':40};
const EVENT_DATA_FIELDS=new Set(['actor','conceptIds','structuredQuery','deckIds','eliminatedCardIds','selectedIds','answer','correct','assisted','spontaneous','automatic','misconceptionId','interventionType','outcome','cardId','choiceId','reliable','candidateCountBefore','candidateCountAfter','yesCount','noCount','informationValueCategory','learningValueCategory']);
const QUERY_FIELDS=new Set(['type','queryType','negated','conceptId','property','operator','value','min','max','unit','language']);
const ID=/^[A-Za-z0-9._:-]{3,160}$/;
const now=()=>new Date().toISOString();
const json=(value,status=200,headers={})=>new Response(JSON.stringify(value),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...headers}});
const error=(code,status=400,headers={})=>json({error:code},status,headers);
const textEncoder=new TextEncoder();
async function sha256(value){const d=await crypto.subtle.digest('SHA-256',textEncoder.encode(String(value)));return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,'0')).join('');}
function randomToken(bytes=32){const a=new Uint8Array(bytes);crypto.getRandomValues(a);let s='';for(const b of a)s+=String.fromCharCode(b);return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function studies(env){try{const value=JSON.parse(env.RESEARCH_STUDIES_JSON||'[]');return Array.isArray(value)?value:[];}catch{return [];}}
function studyOf(env,id,{includeInactive=false}={}){const study=studies(env).find(x=>x?.studyId===id)||null;return study&&(includeInactive||study.active!==false)?study:null;}
function allowedOrigin(study,request){const origin=request.headers.get('Origin');if(!origin)return null;const allowed=study?.allowedOrigins||[];return allowed.includes(origin)||allowed.includes('*')?origin:null;}
function cors(study,request){const origin=allowedOrigin(study,request);return origin?{'access-control-allow-origin':origin,'vary':'Origin','access-control-allow-headers':'content-type,x-research-session-token,x-participant-token','access-control-allow-methods':'GET,POST,OPTIONS'}:{};}
function publicStudy(study){
  const {studyId,title,participantInformationVersion,minimumAge=14,ageBands=['14-15','16-17','18-20','21-25','26-39','40+'],requiresParticipantConfirmation=true,requiresParentalAuthorizationUnder18=false,requiresMinorAssent=false,minorParticipationEnabled=false,parentalAuthorizationMode='none',allowRemoteParticipation=false,accessCodeRequired=false,information={}}=study;
  return {studyId,title,participantInformationVersion,minimumAge,ageBands,requiresParticipantConfirmation,requiresParentalAuthorizationUnder18,requiresMinorAssent,minorParticipationEnabled,parentalAuthorizationMode,allowRemoteParticipation,accessCodeRequired,information};
}
async function body(request,max=128000){const length=Number(request.headers.get('content-length')||0);if(length>max)throw new Error('payload_too_large');const value=await request.json();return value&&typeof value==='object'?value:{};}
function isMinor(ageBand){return ageBand==='14-15'||ageBand==='16-17';}
function validId(v){return typeof v==='string'&&ID.test(v);}
async function sessionAuth(env,request,sessionId){
  const token=request.headers.get('x-research-session-token');if(!token)return null;const hash=await sha256(token);
  return env.DB.prepare('SELECT session_id,study_id,participant_id,status FROM research_sessions WHERE session_id=? AND upload_token_hash=?').bind(sessionId,hash).first();
}
function ensureCors(study,request){const origin=request.headers.get('Origin');if(origin&&!allowedOrigin(study,request))return false;return true;}
function sanitizeEventData(value){const input=value&&typeof value==='object'?value:{},out={};for(const [k,v] of Object.entries(input)){if(!EVENT_DATA_FIELDS.has(k))continue;if(k==='structuredQuery'&&v&&typeof v==='object'){out[k]=Object.fromEntries(Object.entries(v).filter(([q])=>QUERY_FIELDS.has(q)));continue;}if(['conceptIds','deckIds','eliminatedCardIds','selectedIds'].includes(k)){out[k]=Array.isArray(v)?v.filter(x=>typeof x==='string').slice(0,100):[];continue;}if(typeof v==='string')out[k]=v.slice(0,160);else if(typeof v==='boolean'||typeof v==='number'||v===null)out[k]=v;}return out;}
function safeData(value){const raw=JSON.stringify(sanitizeEventData(value));if(raw.length>20000)throw new Error('event_data_too_large');return raw;}
function boolInt(v){return v===true?1:v===false?0:null;}

async function createSession(request,env,study,headers){
  let b;try{b=await body(request,32000);}catch(e){return error(e.message==='payload_too_large'?e.message:'invalid_json',400,headers);}
  if(!validId(b.participantId)||!validId(b.sessionId)||!/^[a-f0-9]{64}$/i.test(b.participantTokenHash||''))return error('invalid_identity',400,headers);
  if(!AGE_BANDS.has(b.ageBand)||!(study.ageBands||[...AGE_BANDS]).includes(b.ageBand))return error('age_band_not_allowed',403,headers);
  if(AGE_MIN[b.ageBand]<(Number(study.minimumAge)||14))return error('minimum_age_not_met',403,headers);
  if(study.allowRemoteParticipation===false&&!study.accessCodeRequired)return error('controlled_participation_not_configured',503,headers);
  if(study.requiresParticipantConfirmation!==false&&b.participantConfirmed!==true)return error('participant_confirmation_required',403,headers);
  if(study.accessCodeRequired){if(!study.accessCodeSha256)return error('study_access_not_configured',503,headers);if(await sha256(b.accessCode||'')!==study.accessCodeSha256)return error('invalid_study_code',403,headers);}
  const minor=isMinor(b.ageBand);
  if(minor&&study.minorParticipationEnabled!==true)return error('minor_participation_disabled',403,headers);
  if(minor&&study.requiresMinorAssent&&b.minorAssent!==true)return error('minor_assent_required',403,headers);
  let parental='not_required';
  if(minor&&study.requiresParentalAuthorizationUnder18){
    if(study.parentalAuthorizationMode!=='code'||!study.parentalAuthorizationCodeSha256)return error('minor_authorization_not_configured',503,headers);
    if(await sha256(b.parentalAuthorizationCode||'')!==study.parentalAuthorizationCodeSha256)return error('parental_authorization_not_verified',403,headers);
    parental='verified_by_study_code';
  }
  if(b.participantInformationVersion!==study.participantInformationVersion)return error('participant_information_version_mismatch',409,headers);
  const authId='a_'+crypto.randomUUID(),uploadToken=randomToken(),uploadHash=await sha256(uploadToken),stamp=now();
  try{
    await env.DB.batch([
      env.DB.prepare('INSERT OR IGNORE INTO research_participants(study_id,participant_id,age_band,gate_version,created_at) VALUES(?,?,?,?,?)').bind(study.studyId,b.participantId,b.ageBand,study.participantInformationVersion,stamp),
      env.DB.prepare('INSERT INTO authorization_records(authorization_record_id,study_id,participant_token_hash,participant_information_version,participant_confirmation,parental_authorization_status,minor_assent_status,created_at) VALUES(?,?,?,?,?,?,?,?)').bind(authId,study.studyId,b.participantTokenHash,study.participantInformationVersion,1,parental,minor?(b.minorAssent?'assented':'not_assented'):'not_required',stamp),
      env.DB.prepare('INSERT INTO research_sessions(session_id,study_id,participant_id,authorization_record_id,upload_token_hash,status,language,game_version,learning_engine_version,started_at,last_seen_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)').bind(b.sessionId,study.studyId,b.participantId,authId,uploadHash,'active',String(b.language||'').slice(0,8),String(b.gameVersion||'').slice(0,64),String(b.learningEngineVersion||'').slice(0,64),stamp,stamp)
    ]);
  }catch(e){return error(String(e).includes('UNIQUE')?'session_exists':'database_error',409,headers);}
  return json({sessionId:b.sessionId,uploadToken,startedAt:Date.parse(stamp)},201,headers);
}

async function addEvents(request,env,session,headers){
  let b;try{b=await body(request,256000);}catch{return error('invalid_json',400,headers);}const events=Array.isArray(b.events)?b.events:[];
  if(!events.length||events.length>50)return error('invalid_event_batch',400,headers);const stamp=now(),stmts=[];
  try{
    for(const e of events){
      if(!validId(e.eventId)||e.studyId!==session.study_id||e.participantId!==session.participant_id||e.sessionId!==session.session_id||!EVENT_TYPES.has(e.eventType))return error('invalid_event',400,headers);
      const idx=Number(e.clientEventIndex),rel=Number(e.relativeTimeMs);if(!Number.isInteger(idx)||idx<0||!Number.isFinite(rel)||rel<0)return error('invalid_event_timing',400,headers);
      stmts.push(env.DB.prepare('INSERT OR IGNORE INTO research_events(event_id,study_id,participant_id,session_id,client_event_index,relative_time_ms,event_type,game_version,learning_engine_version,level,mode,data_json,received_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(e.eventId,session.study_id,session.participant_id,session.session_id,idx,Math.round(rel),e.eventType,String(e.gameVersion||'').slice(0,64),String(e.learningEngineVersion||'').slice(0,64),e.level?String(e.level).slice(0,32):null,e.mode?String(e.mode).slice(0,32):null,safeData(e.data),stamp));
    }
    stmts.push(env.DB.prepare('UPDATE research_sessions SET last_seen_at=? WHERE session_id=?').bind(stamp,session.session_id));await env.DB.batch(stmts);
  }catch{return error('database_error',500,headers);}return json({accepted:events.length},202,headers);
}

async function addResponses(request,env,session,phase,headers){
  let b;try{b=await body(request,128000);}catch{return error('invalid_json',400,headers);}const version=String(b.testVersion||'').slice(0,80),responses=Array.isArray(b.responses)?b.responses:[];
  if(!version||!responses.length||responses.length>100)return error('invalid_responses',400,headers);const stamp=now(),stmts=[];
  for(const r of responses){if(!validId(r.itemId))return error('invalid_item_id',400,headers);const payload=JSON.stringify(r.response??null);if(payload.length>12000)return error('response_too_large',400,headers);stmts.push(env.DB.prepare('INSERT INTO research_responses(response_id,study_id,participant_id,session_id,test_version,phase,item_id,response_json,correct,score,response_time_ms,submitted_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind('r_'+crypto.randomUUID(),session.study_id,session.participant_id,session.session_id,version,phase,r.itemId,payload,boolInt(r.correct),Number.isFinite(r.score)?r.score:null,Number.isFinite(r.responseTimeMs)?Math.round(r.responseTimeMs):null,stamp));}
  try{await env.DB.batch(stmts);}catch{return error('database_error',500,headers);}return json({accepted:responses.length},201,headers);
}

async function finish(request,env,session,headers){let b={};try{b=await body(request,16000);}catch{/* optional */}const stamp=now();await env.DB.prepare("UPDATE research_sessions SET status='finished',finished_at=?,last_seen_at=?,finish_data_json=? WHERE session_id=? AND status='active'").bind(stamp,stamp,JSON.stringify(b||{}).slice(0,12000),session.session_id).run();return json({status:'finished'},200,headers);}

async function withdraw(request,env,study,participantId,headers){
  const raw=request.headers.get('x-participant-token');if(!raw)return error('participant_token_required',401,headers);const hash=await sha256(raw);
  const auth=await env.DB.prepare('SELECT a.authorization_record_id FROM authorization_records a JOIN research_sessions s ON s.authorization_record_id=a.authorization_record_id WHERE a.study_id=? AND a.participant_token_hash=? AND a.revoked_at IS NULL AND s.participant_id=? LIMIT 1').bind(study.studyId,hash,participantId).first();if(!auth)return error('invalid_participant_token',403,headers);const stamp=now();
  await env.DB.batch([env.DB.prepare('UPDATE authorization_records SET revoked_at=? WHERE study_id=? AND participant_token_hash=? AND revoked_at IS NULL').bind(stamp,study.studyId,hash),env.DB.prepare("UPDATE research_sessions SET status='withdrawn',finished_at=?,last_seen_at=? WHERE study_id=? AND participant_id=? AND status='active'").bind(stamp,stamp,study.studyId,participantId)]);
  return json({status:'withdrawn'},200,headers);
}

export {sanitizeEventData,publicStudy};

export default {async fetch(request,env){
  const url=new URL(request.url),parts=url.pathname.split('/').filter(Boolean);
  if(parts[0]!=='v1')return error('not_found',404);
  const withdrawalPath=parts[1]==='studies'&&parts[2]&&parts[3]==='participants'&&parts[4]&&parts[5]==='withdraw';
  let study=null;if(parts[1]==='studies')study=studyOf(env,parts[2],{includeInactive:withdrawalPath});
  if(request.method==='OPTIONS'){
    if(!study&&parts[1]==='sessions'&&parts[2]){const row=await env.DB.prepare('SELECT study_id FROM research_sessions WHERE session_id=?').bind(parts[2]).first();study=row?studyOf(env,row.study_id):null;}
    return new Response(null,{status:204,headers:study?cors(study,request):{}});
  }
  if(parts[1]==='studies'&&parts[2]){
    if(!study)return error('study_not_found',404);const headers=cors(study,request);if(!ensureCors(study,request))return error('origin_not_allowed',403,headers);
    if(request.method==='GET'&&parts.length===3)return json(publicStudy(study),200,headers);
    if(request.method==='POST'&&parts[3]==='sessions')return createSession(request,env,study,headers);
  }
  if(parts[1]==='sessions'&&parts[2]){
    const session=await sessionAuth(env,request,parts[2]);if(!session)return error('invalid_session_token',401);study=studyOf(env,session.study_id);if(!study)return error('study_not_found',404);const headers=cors(study,request);if(!ensureCors(study,request))return error('origin_not_allowed',403,headers);
    if(request.method==='GET'&&parts.length===3)return json({sessionId:session.session_id,status:session.status,studyId:session.study_id},200,headers);
    if(session.status!=='active')return error('session_not_active',409,headers);
    if(request.method==='POST'&&parts[3]==='resume'){await env.DB.prepare('UPDATE research_sessions SET last_seen_at=? WHERE session_id=?').bind(now(),session.session_id).run();return json({status:'active'},200,headers);}
    if(request.method==='POST'&&parts[3]==='events')return addEvents(request,env,session,headers);
    if(request.method==='POST'&&parts[3]==='pretest')return addResponses(request,env,session,'pre',headers);
    if(request.method==='POST'&&parts[3]==='posttest')return addResponses(request,env,session,'post',headers);
    if(request.method==='POST'&&parts[3]==='finish')return finish(request,env,session,headers);
  }
  if(parts[1]==='studies'&&parts[2]&&parts[3]==='participants'&&parts[4]&&parts[5]==='withdraw'&&request.method==='POST'){
    study=studyOf(env,parts[2],{includeInactive:true});if(!study)return error('study_not_found',404);const headers=cors(study,request);if(!ensureCors(study,request))return error('origin_not_allowed',403,headers);return withdraw(request,env,study,parts[4],headers);
  }
  return error('not_found',404);
}};
