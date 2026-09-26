import {HttpResearchTransport} from '../learning/researchTransport.js';
import {createSessionIdentity,getOrCreateParticipantIdentity,saveActiveResearchSession,loadActiveResearchSession,clearActiveResearchSession} from './identity.js';

const CLIENT_CONFIG_URL='./research-config.json';
const safeJson=async response=>{try{return await response.json();}catch{return null;}};
const trimEndpoint=value=>String(value||'').trim().replace(/\/$/,'');

export async function loadResearchClientConfig(fetchImpl=globalThis.fetch) {
  if(typeof fetchImpl!=='function')return null;
  try {
    const response=await fetchImpl(CLIENT_CONFIG_URL,{cache:'no-store'});
    if(!response.ok)return null;
    const value=await safeJson(response), endpoint=trimEndpoint(value?.endpoint);
    if(!endpoint||value?.enabled===false)return null;
    const url=new URL(endpoint,globalThis.location?.href||'https://example.invalid/');
    if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))return null;
    return {endpoint};
  } catch { return null; }
}

export async function fetchStudyConfig(endpoint,studyId,fetchImpl=globalThis.fetch) {
  const response=await fetchImpl(`${trimEndpoint(endpoint)}/v1/studies/${encodeURIComponent(studyId)}`,{headers:{accept:'application/json'},cache:'no-store'});
  const body=await safeJson(response);
  if(!response.ok)throw new Error(body?.error||`study_config_${response.status}`);
  return body;
}

export async function beginResearchSession({endpoint,study,ageBand,participantConfirmed,minorAssent=false,parentalAuthorizationCode='',accessCode='',language='it',gameVersion='3.0.0',learningEngineVersion='1',fetchImpl=globalThis.fetch}={}) {
  const identity=await getOrCreateParticipantIdentity(study.studyId), session=createSessionIdentity();
  const payload={
    participantId:identity.participantId,participantTokenHash:identity.participantTokenHash,sessionId:session.sessionId,
    ageBand,participantInformationVersion:study.participantInformationVersion,participantConfirmed:!!participantConfirmed,
    minorAssent:!!minorAssent,parentalAuthorizationCode:parentalAuthorizationCode||undefined,accessCode:accessCode||undefined,
    language,gameVersion,learningEngineVersion,
  };
  const response=await fetchImpl(`${trimEndpoint(endpoint)}/v1/studies/${encodeURIComponent(study.studyId)}/sessions`,{
    method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(payload),
  });
  const body=await safeJson(response);
  if(!response.ok)throw new Error(body?.error||`session_start_${response.status}`);
  const active={studyId:study.studyId,participantId:identity.participantId,sessionId:session.sessionId,uploadToken:body.uploadToken,
    startedAt:body.startedAt||Date.now(),endpoint:trimEndpoint(endpoint),gameVersion,learningEngineVersion,participantInformationVersion:study.participantInformationVersion};
  saveActiveResearchSession(study.studyId,active);
  return {active,transport:new HttpResearchTransport({...active,fetchImpl})};
}

export async function restoreResearchSession({studyId,endpoint,fetchImpl=globalThis.fetch}={}) {
  const active=loadActiveResearchSession(studyId); if(!active||trimEndpoint(active.endpoint)!==trimEndpoint(endpoint))return null;
  const transport=new HttpResearchTransport({...active,fetchImpl});
  const status=await transport.status().catch(()=>null);
  if(!status||status.status==='finished'||status.status==='withdrawn'){transport.dispose();clearActiveResearchSession(studyId);return null;}
  return {active,transport,status};
}

export async function finishActiveResearchSession(studyId,transport,data={}) {
  try {await transport?.finishSession?.(data);} finally {clearActiveResearchSession(studyId);}
}

export function declineResearch(studyId) { clearActiveResearchSession(studyId); }
