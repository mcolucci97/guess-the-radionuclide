import React,{useState,useEffect} from 'react';
import {formatQuery,xe} from '../engine/advanced.js';
import {propertyText,lensAllowed} from './gameplay.js';
import {learningText} from './i18n.js';
import {conceptLabel} from './content.js';
function Feedback({intervention,result,lang}) {
 const t=learningText[lang],d=intervention.description,assessment=result||intervention.assessment;
 if(intervention.type==='questionQuality')return <><strong>{t[d.quality.informationValue]}</strong><p>{t.qualityHint}</p></>;
 if(intervention.item){const item=intervention.item;return <><p>{result?.correct?t.correct:t.review}</p>{result?.corrective?<p>{result.corrective[lang]}</p>:result?.showExplanation!==false&&<p>{item.options.find(o=>o.id===item.correctId)?.text[lang]}</p>}</>;}
 const id=assessment?.wronglyEliminated?.[0]||assessment?.missed?.[0];
 return <><p>{assessment?.correct?t.matching:t.review}</p>{id&&<p><b>{id}</b> · {propertyText(xe[id],d.query,lang)}<br/>{d.expectedIds.includes(id)?t.incompatible:t.compatible}</p>}
 {!id&&d.query&&<p>{formatQuery(d.query,lang)} → {d.answer?t.yes:t.no}</p>}</>;
}
export function LearningPanel({learning,lang}) {
 const t=learningText[lang],panel=learning.panel,[selected,setSelected]=useState([]);
 useEffect(()=>setSelected([]),[panel?.intervention.actionId,panel?.intervention.type]);
 const p=panel?.intervention,d=p?.description;
 return <>
 {panel&&<section className="learning-panel" data-testid="learning-panel" aria-label={t.feedback}>
  <h3>{panel.result||p.type==='correction'?t.feedback:p.type==='prediction'?t.prediction:p.type==='questionQuality'?t.quality:p.type==='retrieval'?t.retrieval:t.relation}</h3>
  {d.query&&!panel.result&&p.type!=='correction'&&<p>{formatQuery(d.query,lang)} · {t.answer}: <b>{d.answer?t.yes:t.no}</b></p>}
  {panel.result||['correction','questionQuality'].includes(p.type)?<>
   <div role="status"><Feedback intervention={p} result={panel.result} lang={lang}/></div>
   <button onClick={learning.skip}>{learning.active?t.continue:t.close}</button>
  </>:<>
   {p.type==='prediction'?<><p>{t.predictHint}</p><div className="learning-prediction" data-testid="prediction-cards">
    {d.candidateIds.map(id=><button key={id} aria-pressed={selected.includes(id)} onClick={()=>setSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])}>{id}</button>)}
    </div><p>{selected.length} {t.selected}</p><button onClick={()=>learning.submit(selected)}>{t.submit}</button></>:
    <div className="learning-options">{p.item.options.map(o=><button key={o.id} onClick={()=>learning.submit(o.id)}>{o.text[lang]}</button>)}</div>}
   <button className="learning-skip" onClick={learning.skip}>{t.skip}</button>
  </>}
 </section>}
 {learning.current&&lensAllowed(learning.current.query)&&<button className="learning-lens-toggle" aria-pressed={learning.lens} onClick={learning.toggleLens}>{learning.lens?t.hideLens:t.lens}</button>}
 </>;
}
export function LearningRecap({learning,lang}) {
 const recap=learning.recap,t=learningText[lang];if(!recap)return null;
 return <section className="learning-recap" data-testid="learning-recap"><h2>{t.recap}</h2>
 {recap.conceptIds.length?<ul>{recap.conceptIds.map(id=><li key={id}>{conceptLabel(id,lang)}</li>)}</ul>:<p>{t.emptyRecap}</p>}
 {recap.retrieval&&<details><summary>{t.optional}</summary>
  {recap.submitted?<Feedback intervention={recap.retrieval} result={recap.result} lang={lang}/>:<><p>{conceptLabel(recap.retrieval.item.conceptIds[0],lang)}</p><div className="learning-options">{recap.retrieval.item.options.map(o=><button key={o.id} onClick={()=>learning.submitRecap(o.id)}>{o.text[lang]}</button>)}</div></>}
 </details>}<p className="learning-local">{t.local}</p></section>;
}
