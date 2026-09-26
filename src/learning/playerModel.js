import {canonicalConcept} from './concepts.js';
import {emptyEvidence, updateEvidence} from './evidence.js';
import {eventConcepts} from './conceptMapping.js';
import {learningLevel} from './levels.js';
export const PROFILE_VERSION = 1;
export const localId = () => globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
function restoreMatch(value) {
  if (!value || value.version !== 1 || typeof value.id !== 'string' ||
      !value.budget || !Number.isInteger(value.budget.used) || value.budget.used < 0 || value.budget.used > 3 ||
      !Number.isFinite(value.budget.lastQuestionIndex) || !Array.isArray(value.budget.actionIds) ||
      !Number.isInteger(value.questionIndex) || value.questionIndex < 0 ||
      !['encountered','seen','questions','assistedActions'].every(k=>Array.isArray(value[k])) ||
      !value.questions.every(q=>q && typeof q.actionId==='string' &&
        ['candidateIds','expectedIds','conceptIds','unknownIds','yesIds','noIds'].every(k=>Array.isArray(q[k])) && q.quality)) return null;
  return structuredClone({...value,level:learningLevel(value.level)});
}
export function createProfile() {
  return {schemaVersion:PROFILE_VERSION, playerProfileId:localId(), selectedLevel:'explorer',
    completedMatches:0, storageRevision:0, concepts:{}, interventionHistory:[], matchHistorySummary:[], activeMatch:null, lastUpdated:null};
}
export function migrateProfile(value) {
  const profile = createProfile();
  if (!value || typeof value !== 'object' || value.schemaVersion > PROFILE_VERSION) return profile;
  profile.playerProfileId = typeof value.playerProfileId === 'string' ? value.playerProfileId : profile.playerProfileId;
  profile.storageRevision = Math.max(0,Number(value.storageRevision)||0);
  profile.selectedLevel = learningLevel(value.selectedLevel || value.level);
  profile.completedMatches = Math.max(0, Number(value.completedMatches) || 0);
  for (const [key, record] of Object.entries(value.concepts || {})) {
    const id = canonicalConcept(key); if (!id || !record || typeof record !== 'object') continue;
    const clean = emptyEvidence();
    for (const field of Object.keys(clean)) if (Number.isFinite(record[field]) && record[field] >= 0) clean[field] = record[field];
    clean.misconceptionCounts=Object.fromEntries(Object.entries(record.misconceptionCounts||{}).filter(([id,count])=>/^misconception\.[a-z_]+$/.test(id)&&Number.isInteger(count)&&count>0).slice(0,9));
    if (record.errors && !record.mistakes) clean.mistakes = Number(record.errors) || 0;
    profile.concepts[id] = clean;
  }
  profile.interventionHistory = Array.isArray(value.interventionHistory) ? value.interventionHistory.slice(-100) : [];
  profile.matchHistorySummary = Array.isArray(value.matchHistorySummary) ? value.matchHistorySummary.slice(-50) : [];
  profile.activeMatch = restoreMatch(value.activeMatch);
  profile.lastUpdated = value.lastUpdated || null;
  return profile;
}
export function recordEvidence(profile, event) {
  const concepts = {...profile.concepts};
  for (const id of eventConcepts(event, profile.selectedLevel)) concepts[id] = updateEvidence(concepts[id], event);
  return {...profile, concepts, lastUpdated:event.at};
}
