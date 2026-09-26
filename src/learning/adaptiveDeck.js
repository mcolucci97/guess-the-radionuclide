import anchors from './data/anchors.json' with {type:'json'};
import {reviewDue} from './scheduler.js';
import {conceptsForQuery} from './conceptMapping.js';
export const ANCHORS = Object.freeze(anchors.anchors.map(a=>a.id));
export const MAX_WEIGHT = 1.5, UNIFORM_FRACTION = .8;
export function cardWeight(card, profile, now = Date.now()) {
  const ids = [...new Set((card.concepts || []).flatMap(conceptId=>conceptsForQuery({type:'parsed',queryType:'concept',conceptId},'scientist')))];
  const modeIds={alpha:'decay.alpha','beta-':'decay.beta_minus','beta+':'decay.beta_plus',ec:'decay.electron_capture',gamma:'radiation.gamma'};
  ids.push(...(card.modes||[]).map(m=>modeIds[m]).filter(Boolean),'half_life.concept');
  const records=ids.map(id=>profile?.concepts?.[id]).filter(Boolean);
  return Math.min(MAX_WEIGHT,1+(ANCHORS.includes(card.id)?.15:0)+
    (records.some(e=>reviewDue(e,now))?.2:0)+(records.some(e=>e.mistakes>=2)?.15:0));
}
export function selectDeck(cards, count, {profile, mode='solo', rng=Math.random, now=Date.now()} = {}) {
  const pool=[...cards], deck=[], size=Math.min(pool.length,Math.max(0,Math.floor(count)));
  // Online never consumes a personal profile. Only the host calls this, once per room.
  const localProfile=mode==='online'?null:profile;
  const uniformCount=Math.ceil(size*UNIFORM_FRACTION);
  while(deck.length<size) {
    const weights=pool.map(card=>deck.length<uniformCount?1:cardWeight(card,localProfile,now));
    let draw=Math.min(.999999999,Math.max(0,rng()))*weights.reduce((a,b)=>a+b,0), index=0;
    while(index<weights.length-1 && (draw-=weights[index])>=0)index++;
    deck.push(pool.splice(index,1)[0]);
  }
  // Uniformly shuffle order too: weighted positions never become visible anchors.
  for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.min(.999999999,Math.max(0,rng()))*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
  return deck;
}
