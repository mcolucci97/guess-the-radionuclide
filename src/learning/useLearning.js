import {useEffect,useRef,useState} from 'react';
import {LearningEngine} from './engine.js';
import {localId} from './playerModel.js';
let sharedEngine;
export const browserLearningEngine = () => sharedEngine ||= new LearningEngine();
export function useLearning() {
  const engine=browserLearningEngine(), [,refresh]=useState(0), [panel,setPanel]=useState(null), [lens,setLens]=useState(false), [recap,setRecap]=useState(null);
  const current=useRef(null), continuation=useRef(null), continuationStage=useRef(null), mounted=useRef(true);
  const complete=()=>{const fn=continuation.current;continuation.current=null;continuationStage.current=null;fn?.();};
  useEffect(()=>{mounted.current=true;engine.ready.then(()=>{if(mounted.current)refresh(n=>n+1);});return()=>{mounted.current=false;complete();};},[engine]);
  const safePanel=value=>{if(mounted.current)setPanel(value);};
  const show=(intervention,next,stage)=>{continuation.current=next;continuationStage.current=stage;safePanel({intervention,result:null});};
  const start=config=>{complete();current.current=null;setLens(false);setPanel(null);setRecap(null);return engine.start(config);};
  const prepare=(description,next=()=>{})=>{
    complete();setPanel(null);setLens(false);current.current=description;
    const intervention=engine.answer(description);
    if(intervention)show(intervention,next,'answer');else next();
  };
  const observe=description=>{current.current=description;engine.answer(description,false);refresh(n=>n+1);};
  const submit=response=>{
    if(!panel?.intervention)return;
    const result=engine.submit(panel.intervention,response,{assisted:engine.match?.assistedActions.includes(panel.intervention.actionId)});
    safePanel({...panel,result:result||{correct:true}});complete();
  };
  const skip=()=>{setPanel(null);complete();};
  const review=(selectedIds,next)=>{
    if(continuationStage.current==='review'){skip();return;}
    complete();const d=current.current;setLens(false);
    if(!d){setPanel(null);next();return;}
    const intervention=d.automatic?null:engine.review(d,selectedIds);
    if(intervention)show(intervention,next,'review');else{setPanel(null);next();}
  };
  const markAssisted=()=>{const d=current.current;if(d&&engine.match&&!engine.match.assistedActions.includes(d.actionId)){engine.match.assistedActions.push(d.actionId);engine.persist();}};
  const toggleLens=()=>{const d=current.current;if(d&&!lens)engine.lens(d);setLens(!lens);};
  const finish=outcome=>{complete();setPanel(null);setLens(false);setRecap(engine.finish(outcome));};
  const submitRecap=response=>{
    if(!recap?.retrieval||recap.submitted)return;
    const result=engine.submit(recap.retrieval,response);
    const next={...recap,submitted:true,result};engine.match.recap=next;engine.persist();setRecap(next);
  };
  const verbal=(candidateIds,eliminatedIds,actor='player')=>{
    const actionId=localId();
    engine.emit('QUESTION_ASKED',actionId,{reliable:false,candidateIds},actor);
    engine.emit('ANSWER_RECEIVED',actionId,{reliable:false},actor);
    engine.emit('CARDS_SELECTED_FOR_ELIMINATION',actionId,{selectedIds:eliminatedIds},actor);
    engine.emit('CARDS_ELIMINATED',actionId,{eliminatedIds,automatic:false},actor);
  };
  return {engine,start,prepare,observe,review,submit,skip,finish,verbal,markAssisted,toggleLens,lens,panel,recap,submitRecap,
    current:current.current,ready:engine.hydrated,active:!!continuation.current};
}
