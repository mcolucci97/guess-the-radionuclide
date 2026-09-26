const PARTICIPANT_PREFIX = 'rn-research-participant:';
const ACTIVE_PREFIX = 'rn-research-active:';

const safeStorage = storage => ({
  get(key) { try { return storage?.getItem?.(key) ?? null; } catch { return null; } },
  set(key,value) { try { storage?.setItem?.(key,value); return true; } catch { return false; } },
  remove(key) { try { storage?.removeItem?.(key); return true; } catch { return false; } },
});

const bytesToBase64Url = bytes => {
  let binary=''; for(const b of bytes)binary+=String.fromCharCode(b);
  const encoded=typeof btoa==='function' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  return encoded.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
};

export function randomId(prefix='id') {
  const c=globalThis.crypto;
  if(c?.randomUUID)return `${prefix}_${c.randomUUID()}`;
  if(c?.getRandomValues){const bytes=new Uint8Array(16);c.getRandomValues(bytes);return `${prefix}_${bytesToBase64Url(bytes)}`;}
  // This fallback is only for obsolete/non-browser test environments; production browsers have Web Crypto.
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

export function randomToken() {
  const bytes=new Uint8Array(32);
  if(!globalThis.crypto?.getRandomValues)throw new Error('Secure random generation unavailable');
  globalThis.crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export async function sha256Hex(value) {
  if(!globalThis.crypto?.subtle)throw new Error('Web Crypto unavailable');
  const input=new TextEncoder().encode(String(value));
  const digest=await globalThis.crypto.subtle.digest('SHA-256',input);
  return [...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

function participantKey(studyId){return PARTICIPANT_PREFIX+studyId;}
function activeKey(studyId){return ACTIVE_PREFIX+studyId;}

export async function getOrCreateParticipantIdentity(studyId,{storage}={}) {
  if(!studyId)throw new TypeError('studyId required');
  if(storage===undefined)try{storage=globalThis.localStorage;}catch{storage=null;}
  const store=safeStorage(storage), existing=store.get(participantKey(studyId));
  if(existing){
    try {
      const parsed=JSON.parse(existing);
      if(parsed.participantId&&parsed.participantToken){
        return {...parsed,participantTokenHash:await sha256Hex(parsed.participantToken)};
      }
    } catch {/* replace malformed local state */}
  }
  const identity={participantId:randomId('p'),participantToken:randomToken(),createdAt:Date.now()};
  store.set(participantKey(studyId),JSON.stringify(identity));
  return {...identity,participantTokenHash:await sha256Hex(identity.participantToken)};
}

export function createSessionIdentity() {
  return {sessionId:randomId('s'),createdAt:Date.now()};
}

export function saveActiveResearchSession(studyId,value,{storage}={}) {
  if(storage===undefined)try{storage=globalThis.sessionStorage;}catch{storage=null;}
  return safeStorage(storage).set(activeKey(studyId),JSON.stringify(value));
}
export function loadActiveResearchSession(studyId,{storage}={}) {
  if(storage===undefined)try{storage=globalThis.sessionStorage;}catch{storage=null;}
  const raw=safeStorage(storage).get(activeKey(studyId)); if(!raw)return null;
  try { const value=JSON.parse(raw); return value?.studyId===studyId&&value?.sessionId&&value?.uploadToken?value:null; }
  catch { return null; }
}
export function clearActiveResearchSession(studyId,{storage}={}) {
  if(storage===undefined)try{storage=globalThis.sessionStorage;}catch{storage=null;}
  return safeStorage(storage).remove(activeKey(studyId));
}

export function ageBandIsMinor(ageBand) {
  return ageBand==='14-15'||ageBand==='16-17';
}
