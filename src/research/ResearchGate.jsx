import React,{useEffect,useMemo,useState} from 'react';
import {ageBandIsMinor} from './identity.js';
import {beginResearchSession,declineResearch,fetchStudyConfig,loadResearchClientConfig,restoreResearchSession} from './api.js';

const TEXT={
  it:{heading:'Partecipazione allo studio',loading:'Caricamento delle informazioni dello studio…',unavailable:'La raccolta di ricerca non è configurata su questa versione del gioco.',normal:'Continua senza partecipare alla ricerca',age:'Fascia di età',choose:'Seleziona…',confirm:'Ho letto le informazioni dello studio e scelgo volontariamente di partecipare.',assent:'Voglio partecipare allo studio.',parentCode:'Codice di autorizzazione fornito dagli organizzatori',accessCode:'Codice dello studio',join:'Partecipa e continua',decline:'Non partecipare alla ricerca',privacy:'Il gioco normale resta disponibile anche senza partecipare. La raccolta di ricerca è disattivata finché non completi questa pagina.',resume:'Riprendo la sessione di studio già avviata…',error:'Non è stato possibile avviare la sessione di ricerca.',minorUnavailable:'Questa configurazione dello studio non abilita la partecipazione dei minori.',minorNotConfigured:'La procedura di autorizzazione per i minori non è configurata per questo studio.'},
  en:{heading:'Research study participation',loading:'Loading study information…',unavailable:'Research collection is not configured in this version of the game.',normal:'Continue without research participation',age:'Age band',choose:'Choose…',confirm:'I have read the study information and voluntarily choose to participate.',assent:'I want to take part in the study.',parentCode:'Authorization code provided by the study organizers',accessCode:'Study code',join:'Participate and continue',decline:'Do not participate in research',privacy:'Normal play remains available without taking part. Research collection stays off until this page is completed.',resume:'Resuming the research session already started…',error:'The research session could not be started.',minorUnavailable:'This study configuration does not enable participation by minors.',minorNotConfigured:'The authorization procedure for minors is not configured for this study.'},
  fr:{heading:'Participation à l’étude',loading:'Chargement des informations de l’étude…',unavailable:'La collecte de recherche n’est pas configurée dans cette version du jeu.',normal:'Continuer sans participer à la recherche',age:'Tranche d’âge',choose:'Sélectionner…',confirm:'J’ai lu les informations de l’étude et je choisis volontairement d’y participer.',assent:'Je souhaite participer à l’étude.',parentCode:'Code d’autorisation fourni par les organisateurs',accessCode:'Code de l’étude',join:'Participer et continuer',decline:'Ne pas participer à la recherche',privacy:'Le jeu normal reste disponible sans participer. La collecte de recherche reste désactivée tant que cette page n’est pas complétée.',resume:'Reprise de la session de recherche déjà commencée…',error:'Impossible de démarrer la session de recherche.',minorUnavailable:'Cette configuration de l’étude ne permet pas la participation des mineurs.',minorNotConfigured:'La procédure d’autorisation des mineurs n’est pas configurée pour cette étude.'},
};
const DEFAULT_AGE_BANDS=['14-15','16-17','18-20','21-25','26-39','40+'];

function infoFor(study,lang){return study?.information?.[lang]||study?.information?.en||study?.information?.it||{};}

export function ResearchGate({studyId,lang='it',engine,onAccepted,onDeclined}) {
  const t=TEXT[lang]||TEXT.en;
  const [state,setState]=useState({phase:'loading',client:null,study:null,error:null});
  const [ageBand,setAgeBand]=useState(''),[confirmed,setConfirmed]=useState(false),[assent,setAssent]=useState(false),[parentCode,setParentCode]=useState(''),[accessCode,setAccessCode]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{let live=true;(async()=>{
    const client=await loadResearchClientConfig();if(!live)return;
    if(!client){setState({phase:'unavailable',client:null,study:null,error:null});return;}
    try{
      const study=await fetchStudyConfig(client.endpoint,studyId);if(!live)return;
      setState({phase:'resume',client,study,error:null});
      const restored=await restoreResearchSession({studyId,endpoint:client.endpoint});if(!live)return;
      if(restored){engine.setResearchTransport(restored.transport);onAccepted?.(restored.active);return;}
      setState({phase:'ready',client,study,error:null});
    }catch(error){if(live)setState({phase:'error',client,study:null,error:error.message});}
  })();return()=>{live=false;};},[studyId,engine]);
  const minor=ageBandIsMinor(ageBand), study=state.study, info=infoFor(study,lang), ages=study?.ageBands?.length?study.ageBands:DEFAULT_AGE_BANDS;
  const unsupportedMinor=minor&&study?.requiresParentalAuthorizationUnder18&&study?.parentalAuthorizationMode!=='code';
  const eligible=useMemo(()=>{
    if(!study||!ageBand||!confirmed)return false;
    if(minor&&study.minorParticipationEnabled===false)return false;
    if(minor&&study.requiresMinorAssent&&!assent)return false;
    if(minor&&study.requiresParentalAuthorizationUnder18&&(study.parentalAuthorizationMode!=='code'||!parentCode.trim()))return false;
    if(study.accessCodeRequired&&!accessCode.trim())return false;
    return true;
  },[study,ageBand,confirmed,minor,assent,parentCode,accessCode]);
  const decline=()=>{engine.setResearchTransport();declineResearch(studyId);onDeclined?.();};
  const submit=async()=>{if(!eligible||busy)return;setBusy(true);setState(s=>({...s,error:null}));try{
    const result=await beginResearchSession({endpoint:state.client.endpoint,study,ageBand,participantConfirmed:confirmed,minorAssent:assent,parentalAuthorizationCode:parentCode,accessCode,language:lang});
    engine.setResearchTransport(result.transport);onAccepted?.(result.active);
  }catch(error){setState(s=>({...s,error:error.message||t.error}));}finally{setBusy(false);}};
  if(state.phase==='loading'||state.phase==='resume')return <main className="research-shell"><section className="research-card"><h1>{t.heading}</h1><p role="status">{state.phase==='resume'?t.resume:t.loading}</p></section></main>;
  if(state.phase==='unavailable')return <main className="research-shell"><section className="research-card"><h1>{t.heading}</h1><p>{t.unavailable}</p><button className="research-primary" onClick={decline}>{t.normal}</button></section></main>;
  if(state.phase==='error'&&!study)return <main className="research-shell"><section className="research-card"><h1>{t.heading}</h1><p role="alert">{t.error} {state.error}</p><button className="research-primary" onClick={decline}>{t.normal}</button></section></main>;
  return <main className="research-shell"><section className="research-card">
    <div className="research-kicker">{study.studyId}</div><h1>{info.title||study.title||t.heading}</h1>
    {(info.paragraphs||[]).map((p,i)=><p key={i}>{p}</p>)}
    {(info.dataItems||[]).length>0&&<ul>{info.dataItems.map((x,i)=><li key={i}>{x}</li>)}</ul>}
    <p className="research-note">{t.privacy}</p>
    <label className="research-field"><span>{t.age}</span><select value={ageBand} onChange={e=>setAgeBand(e.target.value)}><option value="">{t.choose}</option>{ages.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
    {minor&&study.minorParticipationEnabled===false&&<p role="alert" className="research-error">{t.minorUnavailable}</p>}
    {unsupportedMinor&&<p role="alert" className="research-error">{t.minorNotConfigured}</p>}
    {study.accessCodeRequired&&<label className="research-field"><span>{t.accessCode}</span><input value={accessCode} autoComplete="one-time-code" onChange={e=>setAccessCode(e.target.value)}/></label>}
    {minor&&study.requiresParentalAuthorizationUnder18&&study.parentalAuthorizationMode==='code'&&<label className="research-field"><span>{t.parentCode}</span><input value={parentCode} autoComplete="one-time-code" onChange={e=>setParentCode(e.target.value)}/></label>}
    <label className="research-check"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/><span>{t.confirm}</span></label>
    {minor&&study.requiresMinorAssent&&<label className="research-check"><input type="checkbox" checked={assent} onChange={e=>setAssent(e.target.checked)}/><span>{t.assent}</span></label>}
    {state.error&&<p role="alert" className="research-error">{t.error} {state.error}</p>}
    <div className="research-actions"><button onClick={submit} disabled={!eligible||busy} className="research-primary">{busy?t.loading:t.join}</button><button onClick={decline} className="research-secondary">{t.decline}</button></div>
  </section></main>;
}
