import React, {useState} from 'react';
import {TUTORIAL_ASSETS, assetCandidates} from './assets.js';
import {TRANSFORMATIONS, PET_DECAY, ANNIHILATION, remainingFraction, STRATEGIES, matchesStrategy} from './science.js';

export function Artwork({name, lang, labels, asset=TUTORIAL_ASSETS[name]}) {
  const paths=assetCandidates(asset,lang);
  const [failed,setFailed]=useState([]);
  const src=paths.find(path=>!failed.includes(path));
  return src ? <img className={`tv3-art tv3-art-${name}`} src={src} alt={labels[name+'Alt']} width={name==='nucleus'?1000:1200} height={name==='nucleus'?667:600} loading="lazy" decoding="async" onError={()=>setFailed(prev=>[...prev,src])}/> : <p className="tv3-art-fallback" role="img" aria-label={labels[name+'Alt']}>{labels[name+'Alt']}</p>;
}
function Particle({symbol,kind}) { return <span className={`tv3-particle tv3-particle-${kind}`} aria-hidden="true">{symbol}</span>; }
function ParticleKey({l}) {return <div className="tv3-particle-key"><span><Particle symbol="p" kind="p"/> {l.proton}</span><span><Particle symbol="n" kind="n"/> {l.neutron}</span></div>;}
function CardVisual({cards,lang,l}) {
  const c=cards.find(c=>c.id==='K-40');
  if(!c)return null;
  const modes={'beta-':'β−','beta+':'β+','ec':'EC','gamma':'γ','alpha':'α','it':'IT','sf':'SF'};
  return <figure className="tv3-card-figure">
    <figcaption className="tv3-eyebrow">{l.cardCaption}</figcaption>
    <div className="tv3-specimen"><div className="tv3-specimen-top"><span>{c.id}</span><span>Z = {c.Z}</span></div>
      <div className="tv3-nuclide"><span className="tv3-mass">{c.A}</span><span>{c.symbol}</span></div>
      <h2>{c.name[lang]}</h2>
      <dl className="tv3-card-data">
        <div><dt><span>01</span>{l.element}</dt><dd>{c.element[lang]}</dd></div>
        <div><dt><span>02</span>{l.mass}</dt><dd>{c.A}</dd></div>
        <div><dt><span>03</span>{l.halfLife}</dt><dd>{c.nuclear.halfLifeDisplay}</dd></div>
        <div><dt><span>04</span>{l.symbols}</dt><dd>{c.modes.map(m=>modes[m]||m).join(' · ')}</dd></div>
      </dl><p className="tv3-card-story"><b>{l.context}</b>{c.story[lang]}</p>
    </div><p className="tv3-caption">{l.cardSymbolNote}</p>
  </figure>;
}
function Isotopes({lang,l}) {return <figure><Artwork name="nucleus" lang={lang} labels={l}/><ParticleKey l={l}/><div className="tv3-isotope-pair">
  <div><b>¹H</b><div><Particle symbol="p" kind="p"/></div><span>1 {l.proton} · 0 {l.neutrons}</span></div>
  <div><b>²H</b><div><Particle symbol="p" kind="p"/><Particle symbol="n" kind="n"/></div><span>1 {l.proton} · 1 {l.neutron}</span></div>
  </div><figcaption className="tv3-caption">{l.sameElement}<br/>{l.differentIsotope}</figcaption></figure>;}
function ZAN({cards,l}) {return <div><div className="tv3-formula tv3-formula-hero">N = A − Z</div><div className="tv3-isotope-pair tv3-uranium">{['U-235','U-238'].map(id=>{const c=cards.find(c=>c.id===id);return c&&<div key={id}><div className="tv3-isotope-symbol"><span><sup>{c.A}</sup><sub>{c.Z}</sub></span>{c.symbol}</div><b>{id}</b><dl><div><dt>Z · {l.protons}</dt><dd>{c.Z}</dd></div><div><dt>A · {l.nucleons}</dt><dd>{c.A}</dd></div><div><dt>N · {l.neutrons}</dt><dd>{c.A-c.Z}</dd></div></dl></div>;})}</div><p className="tv3-caption">{l.sameElement}<br/>{l.differentIsotope}</p></div>;}
function Transformations({l,advanced}) {return <div className="tv3-transformations">{TRANSFORMATIONS.map(t=><div className={`tv3-transformation tv3-${t.id}`} key={t.id}>
  <span className="tv3-mode" aria-hidden="true">{t.symbol}</span><div><h2>{t.symbol} · {l[t.id]}</h2><p className="tv3-formula">{t.equation}</p><p>{l[t.id+'Note']}</p>
  {advanced&&<div className="tv3-deltas"><span>A {t.deltaA===0?l.unchanged:`→ A − ${-t.deltaA}`}</span><span>Z {t.deltaZ===0?l.unchanged:`→ Z ${t.deltaZ>0?'+':'−'} ${Math.abs(t.deltaZ)}`}</span></div>}</div>
  </div>)}<p className="tv3-caption">{l.reactionNote}</p></div>;}
function Neutrinos({l}) {return <div><div className="tv3-neutrino-pair"><div><span>ν̄e</span><b>{l.antineutrino}</b><small>β−</small></div><div><span>νe</span><b>{l.neutrino}</b><small>β+ · EC</small></div></div><div className="tv3-equation-stack">{TRANSFORMATIONS.filter(t=>['minus','plus','capture'].includes(t.id)).map(t=><p className="tv3-formula" key={t.id}>{t.equation}</p>)}</div><p className="tv3-balance">{l.conservation}</p><p className="tv3-caption">{l.neutrinoBalance}</p></div>;}
function AnnihilationDiagram({l}) {return <figure className="tv3-annihilation"><svg viewBox="0 0 420 138" role="img" aria-label={l.petAlt}>
  <rect x="14" y="25" width="26" height="90" rx="10" fill="#52789c"/><rect x="380" y="25" width="26" height="90" rx="10" fill="#52789c"/>
  <path d="M202 70H47m0 0 13-8m-13 8 13 8M218 70h155m0 0-13-8m13 8-13 8" stroke="#946517" strokeWidth="3" fill="none"/>
  <circle cx="204" cy="69" r="9" fill="#c85868"/><circle cx="218" cy="69" r="9" fill="#426b9a"/>
  <text x="108" y="47" textAnchor="middle" fill="#704e12" fontSize="19">≈ 511 keV</text><text x="310" y="47" textAnchor="middle" fill="#704e12" fontSize="19">≈ 511 keV</text>
  <text x="210" y="115" textAnchor="middle" fill="#263b55" fontSize="18">e+ + e−</text>
  </svg><div className="tv3-detectors"><span>{l.detector}</span><span>{l.detector}</span></div><figcaption className="tv3-caption">{l.photons}</figcaption></figure>;}
function PET({l,full=false}) {return <div className="tv3-pet"><div className="tv3-pet-step"><span className="tv3-step-number">1</span><div><h3>{l.petBranch}</h3><p className="tv3-formula">{PET_DECAY}</p></div></div><div className="tv3-pet-step"><span className="tv3-step-number">2</span><div><h3>{l.slowing}</h3><span className="tv3-positron-track" aria-hidden="true">e+ <i/> e+</span></div></div><div className="tv3-pet-step"><span className="tv3-step-number">3</span><div><h3>{l.annihilation}</h3><p className="tv3-formula">{ANNIHILATION}</p></div></div><AnnihilationDiagram l={l}/>{full&&<div className="tv3-coincidence">4 · {l.coincidence}</div>}</div>;}
function Emissions({l}) {return <div className="tv3-emissions"><div className="tv3-example"><h2>I-131</h2><div className="tv3-nuclear-chain"><p><small>{l.nuclearStep} · β−</small>¹³¹I → ¹³¹Xe* + e− + ν̄e</p><p><small>{l.emissionStep}</small>¹³¹Xe* → ¹³¹Xe + γ</p></div><p>{l.iodineCaption}</p></div><div className="tv3-example"><h2>Tc-99m → Tc-99</h2><p>{l.technetiumCaption}</p></div><PET l={l}/></div>;}
function DecayCurve({l,advanced,value}) {
  const points=Array.from({length:101},(_,i)=>{const t=3.3*i/100;return `${50+t*96},${200-remainingFraction(t)*166}`;}).join(' ');
  const tau=1/Math.LN2;
  return <svg className="tv3-decay-curve" viewBox="0 0 410 255" role="img" aria-label={l.graphAlt}>
    <path d="M50 24V200H376" stroke="#8295a6" fill="none"/>
    {[0,1,2,3].map(t=><g key={t}><path d={`M${50+t*96} 200V${200-remainingFraction(t)*166}`} stroke="#9baaba" strokeDasharray="3 4"/><circle cx={50+t*96} cy={200-remainingFraction(t)*166} r="5" fill="#2a7590"/><text x={50+t*96} y="225" textAnchor="middle" fontSize="16" fill="#293e51">{t===0?'0':`${t===1?'':t}T½`}</text></g>)}
    {[1,.5,.25].map(f=><text key={f} x="42" y={205-f*166} textAnchor="end" fontSize="15" fill="#465e72">{f*100}%</text>)}
    <polyline points={points} fill="none" stroke="#2a7590" strokeWidth="3"/>
    {advanced&&<g><path d={`M${50+tau*96} 200V${200-166/Math.E}`} stroke="#785496" strokeDasharray="5 3"/><text x={50+tau*96} y="246" textAnchor="middle" fontSize="18" fill="#6c428e">τ</text><circle cx={50+value*96} cy={200-remainingFraction(value)*166} r="7" fill="#785496" stroke="white" strokeWidth="2"/></g>}
  </svg>;
}
function HalfLife({l,advanced,lang}) {
  const [value,setValue]=useState(1);
  const number=n=>new Intl.NumberFormat(lang,{maximumFractionDigits:1}).format(n);
  return <div>{!advanced&&<div className="tv3-half-steps">{[8,4,2,1].map((n,i)=><div key={n}><b>{n}</b><div className="tv3-nuclei-dots" aria-hidden="true">{Array.from({length:8},(_,k)=><i key={k} className={k<n?'':'tv3-decayed'}/>)}</div><span>{i===0?'0':`${i===1?'':i}T½`}</span></div>)}</div>}
    {advanced&&<div className="tv3-formulas"><p>N(t) = N₀ exp(−λt)</p><p>A(t) = A₀ exp(−λt)</p><p>T½ = ln(2) / λ</p><p>τ = 1 / λ</p></div>}
    <DecayCurve l={l} advanced={advanced} value={value}/>
    {advanced?<><label className="tv3-slider" htmlFor="tv3-time">{l.elapsed}: <b>{number(value)} T½</b><input id="tv3-time" type="range" min="0" max="3" step="0.1" value={value} onChange={e=>setValue(Number(e.target.value))}/></label><output className="tv3-output" htmlFor="tv3-time">{l.remaining}: <b>{number(remainingFraction(value)*100)}%</b></output><p className="tv3-caption">{l.meanLife}</p><p className="tv3-caption">{l.formulaNote}</p></>:<><p className="tv3-caption">{l.ensemble}</p><div className="tv3-time-scales">{l.timeScales.map((x,i)=><span key={x}><b>0{i+1}</b>{x}</span>)}</div></>}
  </div>;
}
function Contexts({chapter,lang,l}) {return <figure><Artwork name="contexts" lang={lang} labels={l}/><div className="tv3-context-grid">{chapter.contexts.map(([title,text],i)=><div key={title}><span aria-hidden="true">{['PET','γ','α / β−','K','Rn','T½','⚙','λ','★'][i]}</span><h2>{title}</h2><p>{text}</p></div>)}</div></figure>;}
function Person({contaminated,l}) {return <svg viewBox="0 0 200 148" role="img" aria-label={contaminated?l.contaminationCaption:l.exposureCaption}>
  <circle cx="132" cy="28" r="17" fill="#adc2d1" stroke="#4f6b82" strokeWidth="2"/><path d="M107 135V76L87 100 78 92 108 54H154L171 91 160 97 150 74V135H132V100H127V135Z" fill="#dbe7ed" stroke="#4f6b82" strokeWidth="2"/>
  {!contaminated?<><rect x="13" y="64" width="25" height="34" rx="8" fill="#7b689b"/><path d="M43 61 74 44M44 80H76M43 100 73 115" stroke="#b58127" strokeWidth="3"/><path d="m69 42 6 2-2 6M71 76l6 4-6 4m0 25 3 7-7-1" fill="none" stroke="#b58127" strokeWidth="2"/></>:<>{[[106,59],[127,77],[145,108],[151,54]].map(([x,y])=><g key={x}><circle cx={x} cy={y} r="7" fill="#7b689b" stroke="white" strokeWidth="2"/><path d={`M${x-3} ${y}h6M${x} ${y-3}v6`} stroke="white"/></g>)}</>}
 </svg>;}
function Risk({l,advanced}) {return <div><div className="tv3-risk-pair">{[false,true].map(c=><figure key={String(c)}><h2>{c?l.contamination:l.exposure}</h2><Person contaminated={c} l={l}/><figcaption>{c?l.contaminationCaption:l.exposureCaption}</figcaption></figure>)}</div>{advanced&&<div className="tv3-activation"><h3>{l.activation}</h3><div className="tv3-chips">{l.activationFactors.map(x=><span key={x}>{x}</span>)}</div></div>}<div className="tv3-chips tv3-risk-factors">{l.riskFactors.map(x=><span key={x}>{x}</span>)}</div></div>;}
function Medicine({l}) {return <div className="tv3-medicine"><PET l={l} full/><div className="tv3-spect"><h2>SPECT / TEMP</h2><svg viewBox="0 0 400 135" aria-hidden="true"><circle cx="60" cy="70" r="18" fill="#7b689b"/>{[40,60,80,100].map(y=><path key={y} d={`M${175} ${y}H255`} stroke="#516b80" strokeWidth="7"/>)}<path d="M82 70H299M82 70 175 48" stroke="#b58127" strokeWidth="3"/><rect x="300" y="30" width="25" height="80" rx="8" fill="#52789c"/></svg><p>{l.spectNote}</p></div><div className="tv3-therapy"><h2>α / β−</h2><div className="tv3-track tv3-track-alpha" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></div><p>{l.therapyAlpha}</p><div className="tv3-track tv3-track-beta" aria-hidden="true"><i/><i/><i/><i/><i/></div><p>{l.therapyBeta}</p><small>{l.therapyScale}</small></div></div>;}
function Chemistry({l}) {return <div className="tv3-chemistry"><div className="tv3-periodic-tile"><span>19</span><b>K</b></div><div className="tv3-chemistry-columns"><div><h2>{l.chemistry}</h2>{l.chemicalProperties.map(x=><p key={x}>{x}</p>)}</div><div><h2>{l.nuclear}</h2>{l.nuclearProperties.map(x=><p key={x}>{x}</p>)}</div></div><p className="tv3-balance">{l.chemistryEquation}</p></div>;}
function Strategy({cards,l}) {
  const [ids,setIds]=useState(()=>cards.map(c=>c.id));
  const [question,setQuestion]=useState(STRATEGIES[0]);
  const remaining=cards.filter(c=>ids.includes(c.id));
  const yes=remaining.filter(c=>matchesStrategy(c,question));
  const no=remaining.filter(c=>!matchesStrategy(c,question));
  return <div className="tv3-strategy"><ol className="tv3-strategy-flow">{l.strategyFlow.map(x=><li key={x}>{x}</li>)}</ol><label htmlFor="tv3-question">{l.strategyQuestion}</label><select id="tv3-question" value={question} onChange={e=>setQuestion(e.target.value)}>{STRATEGIES.map(q=><option key={q} value={q}>{l[q]}</option>)}</select><div className="tv3-split" aria-live="polite"><b>{remaining.length} {l.candidates}</b><div className="tv3-split-bar" aria-hidden="true"><i style={{flex:yes.length||0.001}}/><i style={{flex:no.length||0.001}}/></div><div className="tv3-answer-buttons"><button disabled={!yes.length} onClick={()=>setIds(yes.map(c=>c.id))}>{l.yes} · {yes.length}</button><button disabled={!no.length} onClick={()=>setIds(no.map(c=>c.id))}>{l.no} · {no.length}</button></div></div><div className="tv3-candidate-chips" aria-live="polite">{remaining.map(c=><span key={c.id}>{c.id}</span>)}{!remaining.length&&<p>{l.strategyEmpty}</p>}</div><button className="tv3-reset" onClick={()=>setIds(cards.map(c=>c.id))}>{l.reset}</button><p className="tv3-caption">{l.strategyCaption}</p></div>;
}
export default function Visuals({chapter,level,lang,labels:l,cards,deck}) {
  const props={l,lang,cards,chapter,advanced:level==='scientist'};
  const scenes={card:CardVisual,isotopes:Isotopes,zan:ZAN,transformations:Transformations,neutrinos:Neutrinos,emissions:Emissions,halfLife:HalfLife,contexts:Contexts,risk:Risk,medicine:Medicine,chemistry:Chemistry,strategy:Strategy};
  const Scene=scenes[chapter.visual];
  return <div className={`tv3-visual tv3-visual-${chapter.visual}`} data-tutorial-visual={chapter.visual}><Scene {...props} cards={chapter.visual==='strategy'&&deck?.length?deck:cards}/></div>;
}
