import {reviewPriority} from './scheduler.js';
export function recapConcepts(encountered, profile, now=Date.now()) {
  return [...new Set(encountered)].sort((a,b)=>reviewPriority(profile.concepts[b],now)-reviewPriority(profile.concepts[a],now)).slice(0,3);
}
