import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,learningLevel,legacyLevel,normalConfig,onlineConfig,semanticEvent,CONCEPTS,
 conceptsForQuery,evidenceStrength,updateEvidence,createProfile,migrateProfile,recordEvidence,
 MemoryProfileStore,BrowserProfileStore,defaultResearchTransport,DisabledResearchTransport} from '../src/learning/index.js';
const q=id=>({type:'parsed',queryType:'concept',conceptId:id,negated:false});
const event=(type,payload={})=>semanticEvent(type,{matchId:'match',actionId:'action',at:100,payload});
test('Exactly two normal levels and explicit legacy round trips',()=>{
 assert.deepEqual(LEVELS,['explorer','scientist']);
 for(const old of ['base','intermediate'])assert.equal(learningLevel(old),'explorer');
 assert.equal(learningLevel('expert'),'scientist');assert.equal(legacyLevel('explorer'),'intermediate');
 assert.equal(legacyLevel('scientist'),'expert');
 assert.deepEqual(normalConfig({level:'expert',audience:'child',assist:'assisted'}),{level:'scientist',audience:'adult',assist:'manual'});
 assert.equal(onlineConfig(normalConfig({level:'explorer'})).level,'intermediate');
});
test('Semantic contract rejects unknown events and excludes raw questions/secrets',()=>{
 assert.throws(()=>event('NOT_AN_EVENT'));
 const e=event('QUESTION_ASKED',{query:{...q('physics.alpha'),original:'private text'},rawText:'secret text',secretId:'F-18'});
 assert.equal(e.version,1); assert(!JSON.stringify(e).includes('private text'));assert(!JSON.stringify(e).includes('secret'));
});
test('Canonical concepts map exact properties without inferring unrelated knowledge',()=>{
 assert.equal(Object.keys(CONCEPTS).length,46);
 assert.deepEqual(conceptsForQuery(q('physics.alpha')),['decay.alpha']);
 assert.deepEqual(conceptsForQuery(q('medical.pet')),['medical.pet']);
 assert.deepEqual(conceptsForQuery(q('expert.ngatlas_capture_data')),[]);
 assert.deepEqual(conceptsForQuery(q('environment.monitoring')),['application.environment']);
 assert(conceptsForQuery(q('nature.natural')).includes('application.natural_radioactivity'));
 assert.deepEqual(conceptsForQuery({type:'parsed',queryType:'numeric',property:'N'},'scientist'),['nuclide.N','nuclide.N_equals_A_minus_Z']);
});
test('Exposure is not mastery, assistance is weaker, verbal actions cannot be graded',()=>{
 const exposure=updateEvidence(null,event('CARDS_ELIMINATED',{automatic:true}));
 assert.equal(exposure.independentSuccesses,0);assert.equal(evidenceStrength(exposure),0);
 const assisted=updateEvidence(null,event('PREDICTION_SUBMITTED',{correct:true}));
 const independent=updateEvidence(null,event('CARDS_ELIMINATED',{correct:true}));
 assert(evidenceStrength(independent)>evidenceStrength(assisted));
 assert.equal(updateEvidence(null,event('BOARD_LENS_USED')).independentSuccesses,0);
 assert.equal(updateEvidence(null,event('CARDS_ELIMINATED')).mistakes,0);
 assert.equal(updateEvidence(null,event('QUESTION_ASKED',{reliable:true,spontaneous:true})).spontaneousUses,1);
});
test('Mistakes affect only mapped concepts and schema migration preserves compatible evidence',()=>{
 const p=recordEvidence(createProfile(),event('CARDS_ELIMINATED',{query:q('physics.alpha'),correct:false}));
 assert.equal(p.concepts['decay.alpha'].mistakes,1);assert.equal(p.concepts['decay.beta_plus'],undefined);
 const m=migrateProfile({level:'expert',concepts:{'nucleus.atomic_number':{errors:2}}});
 assert.equal(m.selectedLevel,'scientist');assert.equal(m.concepts['nuclide.Z'].mistakes,2);
 assert.equal(migrateProfile({schemaVersion:999}).completedMatches,0);
});
test('Storage round trip and blocked browser storage degrade safely',async()=>{
 for(const store of [new MemoryProfileStore(),new BrowserProfileStore({indexedDB:null,localStorage:{getItem(){throw Error();},setItem(){throw Error();}}})]){
  const p=createProfile();await store.save(p);const loaded=await store.load();assert.equal(loaded.playerProfileId,p.playerProfileId);loaded.selectedLevel='scientist';assert.equal((await store.load()).selectedLevel,'explorer');
 }
});
test('Disabled research transport is default and has no network side effects',()=>{
 const t=defaultResearchTransport();assert(t instanceof DisabledResearchTransport);assert.equal(t.enabled,false);
 const old=globalThis.fetch;globalThis.fetch=()=>{throw Error('Unexpected network');};
 try{for(const m of ['startSession','recordEvent','submitPreTest','submitPostTest','finishSession'])t[m]({});}finally{globalThis.fetch=old;}
});

import {classifyInformation,questionQuality,reviewPriority,explanationAllowed,predictionEligible,DAY,
 newBudget,chooseIntervention,spendIntervention,MAX_WEIGHT,UNIFORM_FRACTION,cardWeight,selectDeck,ANCHORS,
 LearningEngine} from '../src/learning/index.js';
import {describeQuestion,lensAllowed} from '../src/learning/gameplay.js';
import {conceptLabels,corrections} from '../src/learning/content.js';
import {be,xe,Ge} from '../src/engine/advanced.js';
const seed=n=>()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};
const description=(id='q1',query=q('physics.beta_plus'),level='explorer',automatic=true)=>describeQuestion({query,cards:be,answer:true,level,automatic,spontaneous:true,actionId:id,language:'en'});
async function engineFixture(level='explorer',store=new MemoryProfileStore(),clock=()=>100*DAY){const e=new LearningEngine({store,now:clock});await e.ready;e.start({id:'match1',level,mode:'solo',deckIds:be.map(c=>c.id)});return e;}
test('Every canonical concept has IT/EN/FR labels and all nine misconception targets are supported',()=>{
 for(const id of Object.keys(CONCEPTS))for(const lang of ['it','en','fr'])assert(conceptLabels[id]?.[lang]);
 assert.equal(Object.keys(corrections).length,9);
});
test('Candidate split yields qualitative information independently from learning value',()=>{
 for(const [yes,no,expected] of [[10,10,'very'],[3,17,'useful'],[1,19,'weak'],[0,20,'none'],[0,0,'none']])assert.equal(classifyInformation(yes,no),expected);
 assert.equal(classifyInformation(10,10,1),'unavailable');
 const core=questionQuality({yesCount:1,noCount:19,conceptIds:['decay.alpha']});
 const secondary=questionQuality({yesCount:1,noCount:19,conceptIds:['chemistry.family']});
 assert.equal(core.informationValue,secondary.informationValue);assert.equal(core.learningValue,'core');assert.equal(secondary.learningValue,'secondary');assert(!('score' in core));
});
test('Priority, same-action guard, ordinary two-prompt target and hard three maximum',()=>{
 const proposals=['questionQuality','selfExplanation','prediction','retrieval','correction'].map(type=>({type,eligible:true}));
 let budget=newBudget();assert.equal(chooseIntervention(proposals,budget,{actionId:'a'}).type,'correction');
 for(let i=0;i<3;i++){const p=chooseIntervention(proposals,budget,{actionId:String(i),questionIndex:i});budget=spendIntervention(budget,p,i);assert.equal(chooseIntervention(proposals,budget,{actionId:String(i),questionIndex:10}),null);}
 assert.equal(budget.used,3);assert.equal(chooseIntervention(proposals,budget,{actionId:'more',questionIndex:100}),null);
 assert.equal(chooseIntervention([],newBudget(),{actionId:'a'}),null);
 const p=chooseIntervention(proposals.filter(p=>p.type!=='correction'),newBudget(),{actionId:'a'});assert.equal(p.type,'retrieval');
 assert.equal(chooseIntervention([{type:'prediction',eligible:true}],{used:2,actionIds:[],lastQuestionIndex:0},{actionId:'b',questionIndex:5}),null);
});
test('Explanation cooldown requires matches AND time, or seven days; misconception override only once',()=>{
 const e={lastExplicitExplanationAt:10*DAY,lastExplicitExplanationMatchIndex:2,mistakes:2};
 assert.equal(explanationAllowed(e,5,10*DAY+1).allowed,false);assert.equal(explanationAllowed(e,4,12*DAY).allowed,false);
 assert.equal(explanationAllowed(e,5,11*DAY).allowed,true);assert.equal(explanationAllowed(e,2,17*DAY).allowed,true);
 assert.deepEqual(explanationAllowed(e,2,10*DAY+1,true),{allowed:true,override:true});
 assert.equal(explanationAllowed({...e,misconceptionOverrides:1},2,10*DAY+1,true).allowed,false);
 assert.equal(explanationAllowed({...e,mistakes:1},2,10*DAY+1,true).allowed,false);
});
test('Spacing rises at seven, thirty and ninety days without treating exposure as success',()=>{
 const e={exposures:2,lastSeenAt:0,lastIndependentSuccessAt:0,independentSuccesses:1};
 const scores=[0,6,7,30,90].map(day=>reviewPriority(e,day*DAY));
 assert.equal(scores[0],scores[1]);assert(scores[1]<scores[2]&&scores[2]<scores[3]&&scores[3]<scores[4]);
 assert.equal(reviewPriority(null),0);
});
test('Prediction requires Explorer, reliable complete split and at least four candidates',()=>{
 const input={level:'explorer',automatic:true,reliable:true,candidateCount:8,unknownCount:0,yesCount:4,noCount:4};
 assert(predictionEligible(input));for(const change of [{level:'scientist'},{automatic:false},{reliable:false},{candidateCount:3},{unknownCount:1},{yesCount:0},{cooldown:false}])assert.equal(predictionEligible({...input,...change}),false);
});
test('Only secondary chemistry supports board lens',()=>{
 assert(lensAllowed(q('chemistry.metal')));assert(lensAllowed({property:'meltingPointC'}));
 for(const query of [q('physics.alpha'),q('medical.pet'),{property:'N'},{property:'halfLifeSeconds'}])assert(!lensAllowed(query));
});
test('Bounded adaptive weights and at least 80 percent uniform slots; anchors unchanged',()=>{
 assert.equal(MAX_WEIGHT,1.5);assert.equal(UNIFORM_FRACTION,.8);assert.equal(ANCHORS.length,13);assert(!ANCHORS.includes('Tb-149'));
 const profile=createProfile();for(const id of Object.keys(CONCEPTS))profile.concepts[id]={exposures:10,mistakes:100,lastSeenAt:0};
 for(const c of be)assert(cardWeight(c,profile,100*DAY)>=1&&cardWeight(c,profile,100*DAY)<=1.5);
 assert.equal(cardWeight(xe['F-18'],null),1.15);
 const decks=new Set();const counts={};
 for(let i=1;i<=500;i++){const deck=selectDeck(be,12,{profile,rng:seed(i),now:100*DAY});assert.equal(new Set(deck.map(c=>c.id)).size,12);decks.add(deck.map(c=>c.id).join(','));for(const c of deck)counts[c.id]=(counts[c.id]||0)+1;}
 assert(decks.size>490);assert.equal(Object.keys(counts).length,59);assert(Math.max(...Object.values(counts))<200,'no card dominates the seeded simulations');
});
test('Online deck ignores personal profiles and is compatible with the unchanged canonical room',()=>{
 const a=selectDeck(be,18,{mode:'online',profile:createProfile(),rng:seed(5)});
 const p=createProfile();p.concepts['medical.pet']={exposures:50,mistakes:90,lastSeenAt:0};
 const b=selectDeck(be,18,{mode:'online',profile:p,rng:seed(5)});assert.deepEqual(a,b);
});
test('Explorer prediction is before automation; automation only gives exposure',async()=>{
 const e=await engineFixture(),d=description(),prompt=e.answer(d);assert.equal(prompt.type,'prediction');
 assert.equal(e.profile.concepts['decay.beta_plus'].independentSuccesses,1);
 const result=e.submit(prompt,d.expectedIds);assert(result.correct);e.automatic(d);
 assert.equal(e.profile.concepts['decay.beta_plus'].independentSuccesses,1);
 assert.equal(e.profile.concepts['decay.beta_plus'].assistedSuccesses,1);
 assert.equal(e.match.budget.used,1);e.automatic(d);assert.equal(e.profile.concepts['decay.beta_plus'].assistedSuccesses,1);
});
test('Scientist mistakes remain possible and are assessed only on completed manual review',async()=>{
 const e=await engineFixture('scientist'),d=description('manual',q('physics.alpha'),'scientist',false);
 assert.equal(e.answer(d),null);assert.equal(e.profile.concepts['decay.alpha'].mistakes,0);
 const wrong=d.yesIds.slice(0,1);const feedback=e.review(d,wrong);assert.equal(feedback.type,'correction');assert.equal(e.profile.concepts['decay.alpha'].mistakes,1);
 assert.equal(e.review(d,wrong),null);assert.equal(e.match.budget.used,1);
});
test('Correct manual review is strong; a lens/details make it assisted',async()=>{
 for(const assisted of [false,true]){
  const e=await engineFixture('scientist'),d=description('manual',q('chemistry.metal'),'scientist',false);e.answer(d);
  const before=e.profile.concepts['chemistry.metallicity'].independentSuccesses;
  if(assisted)e.lens(d);e.review(d,d.expectedIds);
  assert.equal(e.profile.concepts['chemistry.metallicity'].independentSuccesses,before+(assisted?0:1));
 }
});
test('Uninterpretable, unknown and spoken turns are never classified as scientific mistakes',async()=>{
 const e=await engineFixture('scientist'),d=describeQuestion({query:null,cards:be,answer:true,level:'scientist',actionId:'spoken'});
 assert.equal(e.answer(d),null);assert.equal(e.review(d,['F-18']),null);assert.deepEqual(e.profile.concepts,{});
});
test('Self-explanation uses deterministic keys and a diagnostic distractor supplies misconception evidence',async()=>{
 const e=await engineFixture('scientist'),d=description('self',q('physics.beta_plus'),'scientist',false);e.answer(d);
 const prompt=e.review(d,d.expectedIds);assert.equal(prompt.type,'selfExplanation');
 const wrong=prompt.item.options.find(o=>o.misconceptionId);const result=e.submit(prompt,wrong.id);
 assert.equal(result.correct,false);assert(result.corrective.en.includes('positron'));
 assert.equal(e.profile.concepts['concept.decay_mode_vs_radiation'].mistakes,1);
});
test('Due retrieval outranks prediction and can occur during explanation cooldown',async()=>{
 const e=await engineFixture();e.profile.concepts['decay.beta_plus']={exposures:5,mistakes:2,lastSeenAt:100*DAY,lastExplicitExplanationAt:100*DAY,lastExplicitExplanationMatchIndex:0};
 const prompt=e.answer(description());assert.equal(prompt.type,'retrieval');
 const result=e.submit(prompt,prompt.item.correctId);assert(result.correct);assert.equal(result.showExplanation,false);
 assert.equal(e.profile.concepts['decay.beta_plus'].retrievalSuccesses,1);
});
test('Local persistence restores budget and semantic dedupe across reload',async()=>{
 const store=new MemoryProfileStore(),e=await engineFixture('explorer',store),d=description();e.answer(d);await e.flush();
 const resumed=new LearningEngine({store,now:()=>100*DAY});await resumed.ready;
 resumed.start({id:'match1',level:'explorer'});assert.equal(resumed.match.budget.used,1);assert.equal(resumed.answer(d),null);
 assert.equal(resumed.profile.concepts['decay.beta_plus'].spontaneousUses,1);
});
test('Recap contains only encountered concepts, at most three, with one optional retrieval; finish is idempotent',async()=>{
 const e=await engineFixture('scientist');for(const [i,id]of ['physics.alpha','physics.gamma','medical.pet','medical.spect'].entries())e.answer(description(String(i),q(id),'scientist',false));
 const recap=e.finish('won');assert(recap.conceptIds.length<=3);for(const id of recap.conceptIds)assert(e.match.encountered.includes(id));
 assert(recap.retrieval);assert.equal(e.profile.completedMatches,1);e.finish('won');assert.equal(e.profile.completedMatches,1);
 assert(e.match.budget.used<=3);
});
test('Full normal learning session does not invoke any network facility',async()=>{
 const old=globalThis.fetch;globalThis.fetch=()=>{throw Error('Research network forbidden');};
 try{const e=await engineFixture();const d=description();const p=e.answer(d);e.submit(p,d.expectedIds);e.automatic(d);e.finish('won');await e.flush();}finally{globalThis.fetch=old;}
});

test('Duplicate prediction/recap submissions cannot add evidence twice',async()=>{
 const e=await engineFixture(),d=description(),prompt=e.answer(d);
 e.submit(prompt,d.expectedIds);assert.equal(e.submit(prompt,d.expectedIds),null);
 assert.equal(e.profile.concepts['decay.beta_plus'].assistedSuccesses,1);
 const recap=e.finish('won');e.submit(recap.retrieval,recap.retrieval.item.correctId);
 assert.equal(e.submit(recap.retrieval,recap.retrieval.item.correctId),null);
 assert.equal(e.profile.concepts['decay.beta_plus'].retrievalSuccesses,1);
});
test('Malformed active snapshot is discarded while valid concept evidence survives',()=>{
 const p=migrateProfile({schemaVersion:1,concepts:{'decay.alpha':{mistakes:2}},activeMatch:{version:1,id:'broken'}});
 assert.equal(p.activeMatch,null);assert.equal(p.concepts['decay.alpha'].mistakes,2);
});
test('Rejected storage and an early turn do not block play or spend invisible interventions',async()=>{
 const e=new LearningEngine({store:{load:async()=>{throw Error('blocked');},checkpoint:()=>{throw Error('blocked');},save:async()=>{throw Error('blocked');}}});
 e.start({id:'early'});assert.equal(e.answer(description()),null);
 await e.flush();assert.equal(e.match.budget.used,0);assert.equal(e.match.questions.length,1);
 assert.equal(e.profile.concepts['decay.beta_plus'].spontaneousUses,1);
 e.finish('won');await e.flush();assert.equal(e.profile.completedMatches,1);
});

test('Isotope and irradiation diagnostics arise only from relevant property questions',async()=>{
 const cases=[
  [{type:'parsed',queryType:'numeric',property:'Z',operator:'>',value:20,negated:false},'nuclide.element_vs_isotope'],
  [q('industry.sterilisation'),'radioactivity.irradiation_vs_contamination'],
 ];
 for(const [query,concept] of cases){
  const e=await engineFixture('scientist'),d=description('context',query,'scientist',false);e.answer(d);
  assert.equal(e.profile.concepts[concept],undefined,'property question alone is not evidence of a related mechanism');
  const p=e.review(d,d.expectedIds);assert.equal(p.type,'selfExplanation');assert.deepEqual(p.item.conceptIds,[concept]);
  const wrong=p.item.options.find(o=>o.misconceptionId);assert(e.submit(p,wrong.id).corrective);
  assert.equal(e.profile.concepts[concept].misconceptionCounts[wrong.misconceptionId],1);
 }
});

test('All nine correction targets have a diagnostic choice; generic mistakes cannot override cooldown',async()=>{
 const {relations,relationFor}=await import('../src/learning/content.js');
 const reachable=new Set(Object.values(relations).flat().map(o=>o.misconceptionId).filter(Boolean));
 assert.deepEqual([...reachable].sort(),Object.keys(corrections).sort());
 const e=await engineFixture('scientist'),id='misconception.beta_plus_equals_gamma',concept=corrections[id].concept;
 e.profile.concepts[concept]={exposures:10,mistakes:10,lastExplicitExplanationAt:100*DAY,lastExplicitExplanationMatchIndex:0};
 for(let i=1;i<=3;i++){
  const d=description('diagnostic'+i),item=relationFor(['decay.beta_plus'],d.actionId);
  const p={type:'selfExplanation',actionId:d.actionId,description:d,item};
  const result=e.submit(p,item.options.find(o=>o.misconceptionId===id).id);
  assert.equal(!!result.corrective,i===2,'only a second specific diagnostic error may override, once');
 }
 assert.equal(e.profile.concepts[concept].misconceptionOverrides,1);
 assert.equal(e.profile.concepts[concept].misconceptionCounts[id],3);
 await e.flush();const restored=new LearningEngine({store:e.store});await restored.ready;
 assert.equal(restored.profile.concepts[concept].misconceptionCounts[id],3);
});
