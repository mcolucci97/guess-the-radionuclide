import * as old from './legacy.js';
import model from '../data/intent-model.json' with {type:'json'};
import {classify} from './semantic.js';
import nuclear from '../data/nuclear-overlay.json' with {type:'json'};
export * from './legacy.js';
export const Te={...old.Te,'space.application':{...old.Te['space.application'],label:{it:'Ha applicazioni spaziali?',en:'Does it have space applications?',fr:'A-t-il des applications spatiales ?'}}};
function displayModes(r,d){const map={A:['alpha'],'B-':['beta-'],'B+':['beta+'],EC:['ec'],'EC+B+':['ec','beta+'],IT:['it'],SF:['sf']};const modes=[...new Set(d.branches.filter(b=>b.percent>=1).flatMap(b=>b.mode==='EC+B+'&&d.ecBetaEvidence?.available?[...(d.ecBetaEvidence.electronCaptureIntensitySum>=1?['ec']:[]),...(d.ecBetaEvidence.positronIntensitySum>=1?['beta+']:[])]:map[b.mode]||[]))];if(r.modes.includes('gamma'))modes.push('gamma');return modes.length?modes:r.modes;}
export const be=old.be.map(r=>({...r,modes:displayModes(r,nuclear[r.id]),seconds:nuclear[r.id].halfLifeSeconds,nuclear:nuclear[r.id],physics:{...r.physics,halfLifeSeconds:nuclear[r.id].halfLifeSeconds}}));
export const xe=Object.fromEntries(be.map(r=>[r.id,r]));
const numericProperties=['Z','A','N','halfLifeSeconds','meanLifeSeconds','meltingPointC','thermalNeutronCaptureBarn','principalGammaKeV'];
export function validQuery(q){
 if(!q||q.type!=='parsed'||typeof q.negated!=='boolean')return false;
 if(q.queryType==='concept')return !!old.Te[q.conceptId];
 if(q.queryType==='numeric')return numericProperties.includes(q.property)&&['<','>','<=','>=','=='].includes(q.operator)&&typeof q.value==='number'&&Number.isFinite(q.value)&&(q.property==='meltingPointC'||q.value>=0);
 if(q.queryType==='text')return ['nameStartsWith','nameEndsWith','symbolStartsWith'].includes(q.property)&&/^[a-z]$/i.test(q.value);
 if(q.queryType==='timeOrder')return ['second','minute','hour','day','month','year','million_year'].includes(q.unit);
 if(q.queryType==='range')return numericProperties.includes(q.property)&&Number.isFinite(q.min)&&Number.isFinite(q.max)&&q.min<=q.max;
 return false;
}
export function preprocess(text){
 const nums={un:1,uno:1,una:1,une:1,one:1,due:2,deux:2,two:2,tre:3,trois:3,three:3,quattro:4,quatre:4,four:4,cinque:5,cinq:5,five:5,sei:6,six:6,dieci:10,dix:10,ten:10};
 return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[−–⁻]/g,'-').replace(/⁺/g,'+').replace(/β/g,'beta').replace(/α/g,'alpha').replace(/γ/g,'gamma').replace(/[’‘]/g,"'").toLowerCase()
 .replace(/\b(\d+(?:[.,]\d+)?)\s*(?:x|\*)\s*10\s*\^\s*([+-]?\d+)/g,(_,a,b)=>String(Number(a.replace(',','.'))*10**Number(b)))
 .replace(/\b(\d+(?:[.,]\d+)?)e([+-]?\d+)\b/g,(_,a,b)=>String(Number(a.replace(',','.'))*10**Number(b)))
 .replace(/\b(un|uno|una|une|one|due|deux|two|tre|trois|three|quattro|quatre|four|cinque|cinq|five|sei|six|dieci|dix|ten)\b(?=\s+(?:ann|an\b|ans\b|year|giorn|day|jour|or[ae]\b|hour|heure|second|minut|milion|million))/g,w=>nums[w])
 .replace(/\b(\d+(?:[.,]\d+)?)\s*(million[si]?|milioni|milione|milliard[si]?|miliardi|billion[si]?)\b/g,(_,v,u)=>String(Number(v.replace(',','.'))*(/billion|milliard|miliard/.test(u)?1e9:1e6)))
 .replace(/(\d),(\d)/g,'$1.$2').replace(/\bsecondes?\b/g,'seconds').replace(/demi[- ]?vie/g,'periode').replace(/depass(?:e|e-t-il|e-t-elle)/g,'superieur').replace(/shorter than/g,'less than').replace(/\bsupera\b/g,'maggiore di').replace(/piu brev[ea] di/g,'meno di').replace(/beta\s*-(?!\w)/g,'beta minus').replace(/b[eê]ta moins/g,'beta minus');
}
export function ze(text,lang='it'){
 if(typeof text!=='string'||text.length>400)return {type:'invalid',reason:'too_long'};
 const s=preprocess(text);
 const key=s.replace(/[?!.]/g,'').trim();const exact=Object.entries(Te).filter(([id,c])=>!id.startsWith('identity.')&&!id.startsWith('time.')&&preprocess(c.label[lang]).replace(/[?!.]/g,'').trim()===key);
 if(exact.length===1)return {type:'parsed',queryType:'concept',conceptId:exact[0][0],negated:false,original:text,language:lang};
 if(/^(?:e falso che|is it false that|est-il faux que)\s*:/.test(s)){const q=ze(text.slice(text.indexOf(':')+1),lang);return q.type==='parsed'?{...q,negated:!q.negated,original:text}:q;}

 if(/ignore|system prompt|istruzioni|instructions|rivela|reveal|secret|segreto/.test(s))return {type:'invalid',reason:'instruction'};
 if(/^(?:quale|qual|quel|quelle|what|which|how|come|comment|pourquoi|perche)\b/.test(s))return {type:'invalid',reason:'open_question'};
 if(/\bbeta\b/.test(s)&&!/(beta\s*(?:[+-]|minus|plus|meno|piu)|elettron.*beta|beta.*elettron|beta.*electron)/.test(s))return {type:'clarify',reason:'beta_ambiguous'};
 if(/\b(?:solo|soltanto|only|seulement|exclusivement|pure|puro)\b/.test(s))return {type:'clarify',reason:'exclusive_decay'};
 if(/(?:mean life|vita media|vie moyenne)/.test(s)&&/(?:emivita|half.?life|periode)/.test(s))return {type:'clarify',reason:'two_quantities'};
 // A conjunction cannot silently discard a second clause. Ranges are supported separately.
 if(/\b(?:tra|fra|between|entre)\b/.test(s)){
  const m=s.match(/(?:tra|fra|between|entre)\s+(\d+(?:[.,]\d+)?)\s+(?:e|and|et)\s+(\d+(?:[.,]\d+)?)\s+(.+)/);
  if(!m)return {type:'unsupported',reason:'range_units'};
  const prefix=s.slice(0,m.index),suffix=m[3];
  let a=old.ze(prefix+' maggiore di '+m[1]+' '+suffix,lang),b=old.ze(prefix+' maggiore di '+m[2]+' '+suffix,lang);
  if(a.queryType==='numeric'&&b.queryType==='numeric'&&a.value<=b.value)return {type:'parsed',queryType:'range',property:a.property,min:a.value,max:b.value,negated:old.Pe(prefix),original:text,language:lang};
  return {type:'unsupported',reason:'range'};
 }
 if(/\s(?:e|o|and|et|oppure|or|ou)\s/.test(text.toLowerCase())&&!/(?:maggiore o uguale|minore o uguale|greater or equal|less or equal|superieur ou egal|inferieur ou egal)/.test(s))return {type:'unsupported',reason:'compound_question'};
 if(/(?:riga gamma (?:piu intensa|principale)|(?:strongest|principal|most intense) gamma (?:line|ray)|raie gamma (?:la plus intense|principale))/.test(s)){
 const m=s.match(/(\d+(?:\.\d+)?)\s*(kev|mev)/),op=/(?:maggiore|superiore|greater|above|over|superieur)/.test(s)?'>':/(?:minore|inferiore|less|below|under|inferieur)/.test(s)?'<':null;
 return m&&op?{type:'parsed',queryType:'numeric',property:'principalGammaKeV',operator:op,value:Number(m[1])*(m[2]==='mev'?1000:1),negated:old.Pe(s),original:text,language:lang}:{type:'clarify',reason:'gamma_comparison'};}
 if(/gamma.*(?:kev|mev)|(?:kev|mev).*gamma|auger|conversion electron|elettron.*conversion|section.*absorp|cross section.*absorp/.test(s))return {type:'unsupported',reason:'unavailable_quantity'};
 const specific=[[/tomograf.*positron|positron.*tomograph|tomograph.*posit(?:r)?on/,'medical.pet'],[/alcalino[- ]?terr|alkaline[- ]?earth/,'chemistry.alkaline_earth_metal'],[/post[- ]?(?:transizion|transition)/,'chemistry.post_transition_metal'],[/(?:natur.*(?:cibo|food|aliment)|(?:cibo|food|aliment).*natur)/,'nature.in_food'],[/(?:catena.*radon|radon.*chain|chaine.*radon)/,'nature.radon_chain'],[/orologio naturale|natural clock|horloge naturelle/,'earth.dating'],[/radiograph.*industr|radiograf.*industr/,'industry.radiography']].find(([re])=>re.test(s));
 if(specific)return {type:'parsed',queryType:'concept',conceptId:specific[1],negated:old.Pe(s),original:text,language:lang};
 let q=old.ze(s,lang);
 if(q.type==='parsed')return {...q,original:text,language:lang};
 if(q.type==='unknown'){const scores=classify(s,model);if(scores[0]?.score>=.83&&scores[0].score-(scores[1]?.score||0)>=.15)return {type:'parsed',queryType:'concept',conceptId:scores[0].label,negated:old.Pe(s),original:text,language:lang,confidence:scores[0].score,via:'trained-intent'};}
 return q;
}
export function Ue(card,q,lang='it'){
 if(q?.type!=='parsed')return q||{type:'unknown'};
 if(!validQuery(q))return {type:'unsupported',reason:'invalid_query'};
 if(q.queryType==='numeric'&&q.property==='principalGammaKeV'){const v=card.nuclear?.gammaLines?.[0]?.keV;if(!Number.isFinite(v))return {type:'unsupported',reason:'missing_gamma_line'};const yes=({'<':v<q.value,'>':v>q.value,'<=':v<=q.value,'>=':v>=q.value,'==':v===q.value})[q.operator];return {type:'ok',yes:q.negated?!yes:yes,query:q,explanation:old.je(lang),confidence:1};}
 if(q.queryType==='range'){
  const lo=Ue(card,{...q,queryType:'numeric',operator:'>=',value:q.min,negated:false},lang),hi=Ue(card,{...q,queryType:'numeric',operator:'<=',value:q.max,negated:false},lang);
  if(lo.type!=='ok'||hi.type!=='ok')return {type:'unsupported',reason:'missing_data'};
  return {...lo,yes:q.negated?!(lo.yes&&hi.yes):lo.yes&&hi.yes,query:q};
 }
 if(q.queryType==='concept'&&q.conceptId.startsWith('physics.')&&q.conceptId!=='physics.gamma'&&card.nuclear){
  const mode={"physics.alpha":'A',"physics.beta_minus":'B-',"physics.beta_plus":'B+',"physics.electron_capture":'EC',"physics.isomeric_transition":'IT',"physics.spontaneous_fission":'SF'}[q.conceptId];
  if(mode){if(['EC','B+'].includes(mode)&&card.nuclear.branches.some(b=>b.mode==='EC+B+')){const evidence=card.nuclear.ecBetaEvidence;if(!evidence?.available)return {type:'unsupported',reason:'combined_branch'};const yes=mode==='EC'?evidence.electronCaptureObserved:evidence.positronObserved;return {type:'ok',yes:q.negated?!yes:yes,query:q,concept:q.conceptId,explanation:old.je(lang),confidence:1};}const yes=card.nuclear.branches.some(b=>b.mode===mode||b.mode==='EC+B+'&&['EC','B+'].includes(mode));return {type:'ok',yes:q.negated?!yes:yes,query:q,concept:q.conceptId,explanation:old.je(lang),confidence:q.confidence||1};}
 }
 return old.Ue(card,q,q.language||lang);
}
export const We=(card,text,lang='it')=>Ue(card,ze(text,lang),lang);
export const Ge=(card,q,lang='it')=>Ue(card,q,lang);
export function formatQuery(q,lang='it'){
 const not={it:'NON: ',en:'NOT: ',fr:'NON : '};let s='';
 if(q.queryType==='concept')s=old.Te[q.conceptId]?.label[lang]||q.conceptId;
 else if(q.queryType==='text')s=({it:{nameStartsWith:'Il nome in italiano inizia con',nameEndsWith:'Il nome in italiano finisce con',symbolStartsWith:'Il simbolo inizia con'},en:{nameStartsWith:'The English name starts with',nameEndsWith:'The English name ends with',symbolStartsWith:'The symbol starts with'},fr:{nameStartsWith:'Le nom français commence par',nameEndsWith:'Le nom français finit par',symbolStartsWith:'Le symbole commence par'}})[q.language||lang][q.property]+' '+q.value.toUpperCase();
 else if(q.queryType==='timeOrder')s=old.Te[q.conceptId]?.label[lang]||q.unit;
 else {let labels={it:{halfLifeSeconds:'Emivita (s)',meanLifeSeconds:'Vita media (s)',Z:'Protoni',A:'Numero di massa',N:'Neutroni',meltingPointC:'Fusione dell’elemento (°C)',thermalNeutronCaptureBarn:'Cattura (n,γ), 2200 m/s (barn)'},en:{halfLifeSeconds:'Half-life (s)',meanLifeSeconds:'Mean life (s)',Z:'Protons',A:'Mass number',N:'Neutrons',meltingPointC:'Element melting point (°C)',thermalNeutronCaptureBarn:'Capture (n,γ), 2200 m/s (barn)'},fr:{halfLifeSeconds:'Période (s)',meanLifeSeconds:'Vie moyenne (s)',Z:'Protons',A:'Nombre de masse',N:'Neutrons',meltingPointC:'Fusion de l’élément (°C)',thermalNeutronCaptureBarn:'Capture (n,γ), 2200 m/s (barn)'}};s=(q.property==='principalGammaKeV'?({it:'Riga gamma documentata più intensa, I ≥ 1% (keV)',en:'Strongest documented gamma line, I ≥ 1% (keV)',fr:'Raie gamma documentée la plus intense, I ≥ 1% (keV)'})[lang]:labels[lang][q.property])+' '+(q.queryType==='range'?`∈ [${q.min}; ${q.max}]`:`${q.operator} ${q.value}`);}
 return (q.negated?not[lang]:'')+s;
}
// Computer sees only remaining candidates, never a secret card. Questions are translated.
export function Qe(cards,easy=false,audience='adult',level='base',lang='it'){
 const allowed=Object.entries(Te).filter(([id])=>level==='expert'||!id.startsWith('expert.'));
 const choices=allowed.map(([id,v])=>({text:v.label[lang],query:{type:'parsed',queryType:'concept',conceptId:id,negated:false}})).filter(x=>!x.query.conceptId.startsWith('identity.')&&!x.query.conceptId.startsWith('time.'));
 const scored=choices.map(x=>{let ys=0,ns=0,us=0;for(const r of cards){const a=Ue(r,x.query,lang);a.type!=='ok'?us++:a.yes?ys++:ns++;}return {...x,score:Math.min(ys,ns)-us,usable:ys>0&&ns>0&&us===0};}).filter(x=>x.usable&&ze(x.text,lang).conceptId===x.query.conceptId).sort((a,b)=>b.score-a.score);
 return scored.length?scored[easy?Math.floor(Math.random()*Math.min(8,scored.length)):0].text:null;
}
export function tt(){let failed=[];for(const [lang,id,text,answer,concept]of old.$e){const r=We(xe[id],text,lang);if(r.type!=='ok'||r.yes!==answer||r.concept!==concept)failed.push({question:text,result:r});}for(const[lang,text,type]of old.et){if(ze(text,lang).type!==type)failed.push({question:text});}return {total:old.$e.length+old.et.length,failed};}

export function Se(seconds,lang='it'){const y=Number(seconds)/31557600;for(const[scale,a,b]of[[1e9,'Ga','Gyr'],[1e6,'Ma','Myr'],[1e4,'ka','kyr']])if(y>=scale)return (y/(scale===1e4?1e3:scale)).toLocaleString(lang,{maximumSignificantDigits:3})+' '+(lang==='en'?b:a);return old.Se(Number(seconds),lang);}
export const Xe=count=>old.Xe(count).map(card=>xe[card.id]);
