import {semanticEvent,eventKey} from './events.js';
import {createProfile,migrateProfile,recordEvidence,localId} from './playerModel.js';
import {BrowserProfileStore} from './profileStore.js';
import {defaultResearchTransport} from './researchTransport.js';
import {learningLevel} from './levels.js';
import {emptyEvidence} from './evidence.js';
import {eventConcepts} from './conceptMapping.js';
import {explanationAllowed,reviewDue,predictionEligible} from './scheduler.js';
import {newBudget,chooseIntervention,spendIntervention} from './interventions.js';
import {eliminationAssessment} from './questionQuality.js';
import {recapConcepts} from './recap.js';
import {relationFor,corrections} from './content.js';

export class LearningEngine {
  constructor({store=new BrowserProfileStore(),research=defaultResearchTransport(),now=Date.now,slot='primary'}={}) {
    this.store=store;this.research=research;this.now=now;this.slot=slot;
    this.profile=createProfile();this.match=null;this.hydrated=false;this.early=[];this.saves=Promise.resolve();
    this.ready=Promise.resolve().then(()=>store.load(slot)).catch(()=>null).then(value=>{
      this.profile=migrateProfile(value);this.match=this.profile.activeMatch;
      this.hydrated=true; for(const fn of this.early.splice(0))fn();return this;
    });
  }
  persist() {
    this.profile.activeMatch=this.match;this.profile.lastUpdated=this.now();
    this.profile.storageRevision=(this.profile.storageRevision||0)+1;
    const value=structuredClone(this.profile);
    try {this.store.checkpoint?.(value,this.slot);} catch { /* Learning storage never blocks a turn. */ }
    this.saves=this.saves.catch(()=>{}).then(()=>this.store.save(value,this.slot)).catch(()=>{});
  }
  async flush() {await this.ready;await this.saves;}
  start({id=localId(),level='explorer',mode='solo',deckIds=[]}={}) {
    if(!this.hydrated){this.early.push(()=>this.start({id,level,mode,deckIds}));return id;}
    if(this.match?.id===id)return id;
    this.profile.selectedLevel=learningLevel(level);
    this.match={version:1,id,level:learningLevel(level),mode,budget:newBudget(),encountered:[],seen:[],
      questionIndex:0,questions:[],finished:false,recap:null,assistedActions:[]};
    this.emit('MATCH_STARTED','start',{level:this.match.level,mode,deckIds});
    this.research.startSession({sessionId:id,level:this.match.level,mode});return id;
  }
  emit(type,actionId,payload={},actor='player') {
    if(!this.hydrated){this.early.push(()=>this.emit(type,actionId,payload,actor));return false;}
    if(!this.match)return false;
    const event=semanticEvent(type,{matchId:this.match.id,actionId,actor,at:this.now(),payload}), key=eventKey(event);
    if(this.match.seen.includes(key))return false;
    this.match.seen=[...this.match.seen,key].slice(-600);
    this.match.encountered=[...new Set([...this.match.encountered,...eventConcepts(event,this.match.level)])];
    this.profile=recordEvidence(this.profile,event);this.research.recordEvent(event);this.persist();return true;
  }
  answer(description,schedule=true) {
    if(!this.hydrated){this.early.push(()=>this.answer(description,false));return null;}
    if(!this.match||this.match.finished)return null;
    const d=structuredClone(description);
    if(!this.emit('QUESTION_ASKED',d.actionId,{query:d.query,reliable:d.reliable,spontaneous:d.spontaneous,conceptIds:d.conceptIds,candidateIds:d.candidateIds}))return null;
    this.emit('ANSWER_RECEIVED',d.actionId,{query:d.query,answer:d.answer,conceptIds:d.conceptIds});
    this.match.questionIndex++;this.match.questions=[...this.match.questions,d].slice(-30);this.persist();
    return d.automatic&&schedule?this.plan(d,'answer'):null;
  }
  plan(d,stage,assessment=null) {
    if(!this.hydrated||!this.match||this.match.finished||!d.reliable||!d.conceptIds.length)return null;
    const conceptId=d.conceptIds[0], evidence=this.profile.concepts[conceptId];
    const cooldown=explanationAllowed(evidence,this.profile.completedMatches,this.now());
    const relation=relationFor(d.conceptIds,d.actionId,d.query);
    const relationCooldown=explanationAllowed(this.profile.concepts[relation?.conceptIds[0]],this.profile.completedMatches,this.now()).allowed;
    const proposals=[
      {type:'correction',eligible:stage==='review'&&assessment?.correct===false&&cooldown.allowed,assessment},
      {type:'retrieval',eligible:!!relation&&[...d.conceptIds,...relation.conceptIds].some(id=>reviewDue(this.profile.concepts[id],this.now())),item:relation},
      {type:'prediction',eligible:stage==='answer'&&predictionEligible({level:this.match.level,automatic:d.automatic,
        reliable:d.reliable,candidateCount:d.candidateIds.length,unknownCount:d.unknownIds.length,
        yesCount:d.yesIds.length,noCount:d.noIds.length,cooldown:cooldown.allowed})},
      {type:'selfExplanation',eligible:stage==='review'&&!!relation&&relationCooldown&&assessment?.correct!==false,item:relation},
      {type:'questionQuality',eligible:['weak','none'].includes(d.quality.informationValue)},
    ];
    const intervention=chooseIntervention(proposals,this.match.budget,{actionId:d.actionId,questionIndex:this.match.questionIndex});
    if(!intervention)return null;
    this.match.budget=spendIntervention(this.match.budget,intervention,this.match.questionIndex);
    this.profile.interventionHistory=[...this.profile.interventionHistory,{matchId:this.match.id,actionId:d.actionId,type:intervention.type,conceptId,at:this.now()}].slice(-100);
    const type={prediction:'PREDICTION_REQUESTED',retrieval:'RETRIEVAL_REQUESTED',selfExplanation:'SELF_EXPLANATION_REQUESTED'}[intervention.type];
    if(type)this.emit(type,d.actionId,{conceptIds:intervention.item?.conceptIds||d.conceptIds,interventionType:intervention.type});
    else this.feedback(d.actionId,d.conceptIds,intervention.type,intervention.type!=='questionQuality');
    this.persist();return {...intervention,description:d};
  }
  review(description, selectedIds, {automatic=false,assisted=false}={}) {
    if(!description||!this.match)return null;
    const d=description, assessment=d.reliable&&d.unknownIds.length===0?eliminationAssessment(d.candidateIds,selectedIds,d.expectedIds):null;
    this.emit('CARDS_SELECTED_FOR_ELIMINATION',d.actionId,{selectedIds,conceptIds:d.conceptIds});
    const fresh=this.emit('CARDS_ELIMINATED',d.actionId,{query:d.query,conceptIds:d.conceptIds,eliminatedIds:selectedIds,
      expectedIds:d.expectedIds,automatic,assisted:assisted||this.match.assistedActions.includes(d.actionId),correct:assessment?.correct});
    return fresh&&!automatic?this.plan(d,'review',assessment):null;
  }
  automatic(description) {
    this.review(description,description.expectedIds,{automatic:true});
  }
  lens(description) {
    if(!this.match)return;
    if(!this.match.assistedActions.includes(description.actionId))this.match.assistedActions.push(description.actionId);
    this.emit('BOARD_LENS_USED',description.actionId,{conceptIds:description.conceptIds,assisted:true});
  }
  feedback(actionId,conceptIds,type,explicit=true) {
    const fresh=this.emit('FEEDBACK_SHOWN',actionId,{conceptIds,interventionType:type});
    if(fresh&&explicit) for(const id of conceptIds) {
      const e=this.profile.concepts[id]||emptyEvidence();
      this.profile.concepts[id]={...e,lastExplicitExplanationAt:this.now(),lastInterventionMatchIndex:this.profile.completedMatches,lastExplicitExplanationMatchIndex:this.profile.completedMatches};
    }
    this.persist();
  }
  submit(intervention, response, {assisted=false}={}) {
    const d=intervention.description, item=intervention.item, actionId=intervention.actionId;
    const submissionType=intervention.type==='prediction'?'PREDICTION_SUBMITTED':intervention.type==='retrieval'?'RETRIEVAL_SUBMITTED':'SELF_EXPLANATION_SUBMITTED';
    if(this.match?.seen.includes(`player:${actionId}:${submissionType}`))return null;
    if(intervention.type==='prediction') {
      const assessment=eliminationAssessment(d.candidateIds,response,d.expectedIds);
      this.emit('PREDICTION_SUBMITTED',actionId,{conceptIds:d.conceptIds,selectedIds:response,expectedIds:d.expectedIds,correct:assessment.correct,assisted:true});
      this.feedback(actionId,d.conceptIds,'prediction');return assessment;
    }
    if(!item)return null;
    const option=item.options.find(o=>o.id===response);if(!option)return null;
    const correct=response===item.correctId;
    const conceptIds=correct?item.conceptIds:[...new Set([...item.conceptIds,...(corrections[option.misconceptionId]?[corrections[option.misconceptionId].concept]:[])])];
    const kind=intervention.type==='retrieval'?'RETRIEVAL_SUBMITTED':'SELF_EXPLANATION_SUBMITTED';
    this.emit(kind,actionId,{conceptIds,choiceId:response,correct,assisted,misconceptionId:correct?undefined:option.misconceptionId});
    // A diagnostic distractor is evidence; a generic card error is NOT a diagnosis.
    const correction=!correct&&corrections[option.misconceptionId];
    let explicit=false, corrective=null;
    if(correction) {
      const ev=this.profile.concepts[correction.concept];
      const repeated=(ev?.misconceptionCounts?.[option.misconceptionId]||0)>=2;
      const gate=explanationAllowed(ev,this.profile.completedMatches,this.now(),repeated);
      if(gate.allowed){explicit=true;corrective=correction.text;
        if(gate.override)ev.misconceptionOverrides=(ev.misconceptionOverrides||0)+1;}
    }
    const allowed=explanationAllowed(this.profile.concepts[item.conceptIds[0]],this.profile.completedMatches,this.now()).allowed;
    // Retrieval during cooldown is allowed; repeated explanations are omitted.
    this.feedback(actionId,conceptIds,intervention.type,explicit||allowed);
    return {correct,corrective,showExplanation:explicit||allowed};
  }
  finish(outcome) {
    if(!this.hydrated){this.early.push(()=>this.finish(outcome));return null;}
    if(!this.match)return null;
    if(this.match.finished)return this.match.recap;
    this.emit('MATCH_FINISHED','finish',{outcome});
    const ids=recapConcepts(this.match.encountered,this.profile,this.now());
    const question=ids.map(id=>this.match.questions.find(d=>d.reliable&&d.conceptIds.includes(id)&&relationFor(d.conceptIds,'',d.query))).find(Boolean);
    const item=question?relationFor(question.conceptIds,'recap:'+this.match.id,question.query):null;
    this.match.finished=true;
    this.match.recap={conceptIds:ids,retrieval:item?{type:'retrieval',actionId:'recap',item,description:question}:null,submitted:false};
    if(item)this.emit('RETRIEVAL_REQUESTED','recap',{conceptIds:item.conceptIds});
    this.profile.completedMatches++;
    this.profile.matchHistorySummary=[...this.profile.matchHistorySummary,{id:this.match.id,at:this.now(),conceptIds:ids,interventions:this.match.budget.used}].slice(-50);
    this.research.finishSession({sessionId:this.match.id,outcome});this.persist();return this.match.recap;
  }
}
