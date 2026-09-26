import React, {useEffect,useRef,useState} from 'react';
import it from '../data/tutorial-it.json';
import en from '../data/tutorial-en.json';
import fr from '../data/tutorial-fr.json';
import {LEVELS} from '../learning/levels.js';
import Visuals, {Artwork} from './Visuals.jsx';
const content={it,en,fr};
const references=[
 ['IAEA · Nuclear Medicine Physics','https://www-pub.iaea.org/MTCD/Publications/PDF/Pub1617web-1294055.pdf'],
 ['CDC · Contamination / exposure','https://www.cdc.gov/radiation-emergencies/infographic/contamination-versus-exposure.html'],
 ['NRC · Radiation basics','https://www.nrc.gov/facilities-safety/radiation-protection/radiation-and-its-health-effects/radiation-basics'],
 ['CERN · Neutrinos','https://home.cern/the-puzzle-of-neutrinos-seventy-years-on/'],
];
export default function Tutorial({lang='it',level=null,setLevel,close,start,cards,deck}) {
  const language=content[lang]?lang:'en',d=content[language],u=d.ui;
  const [selected,setSelected]=useState(LEVELS.includes(level)?level:null);
  const [index,setIndex]=useState(0);
  const [contents,setContents]=useState(false);
  const heading=useRef(null),first=useRef(true);
  useEffect(()=>{if(LEVELS.includes(level)&&level!==selected){setSelected(level);setIndex(0);}},[level]);
  useEffect(()=>{if(first.current){first.current=false;return;}heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:'start',behavior:'instant'});},[index,selected]);
  const chapters=selected?d.paths[selected].chapters:[],chapter=chapters[index];
  const choose=path=>{setSelected(path);setIndex(0);setContents(false);setLevel(path);};
  const go=i=>{setIndex(Math.min(chapters.length-1,Math.max(0,i)));setContents(false);};
  const keyboard=e=>{if(e.altKey||e.ctrlKey||e.metaKey||['INPUT','SELECT','TEXTAREA','BUTTON','A'].includes(e.target.tagName))return;if(e.key==='ArrowRight'){e.preventDefault();go(index+1);}if(e.key==='ArrowLeft'){e.preventDefault();go(index-1);}};
  return <main className={`tv3 ${selected==='scientist'?'tv3-scientist':''}`} lang={language} data-testid="tutorial-v3" data-tutorial-path={selected||'choose'} onKeyDown={keyboard}>
    <link rel="stylesheet" href="./tutorial/v3/tutorial.css"/>
    <div className="tv3-top"><span className="tv3-eyebrow"><span aria-hidden="true">✦</span> {u.badge}</span><button className="tv3-back" onClick={close}>← {u.back}</button></div>
    {!selected?<><div className="tv3-intro"><div><p className="tv3-kicker">EXPLORER / SCIENTIST</p><h1 ref={heading} tabIndex="-1">{u.introTitle}</h1><p>{u.introText}</p></div><Artwork name="nucleus" lang={language} labels={d.labels}/></div><div className="tv3-paths" aria-label={u.choose}>{LEVELS.map((path,i)=><button key={path} className={`tv3-path tv3-path-${path}`} data-tutorial-choice={path} onClick={()=>choose(path)}><span className="tv3-path-number">0{i+1}</span><span className="tv3-path-title">{u[path]} <span aria-hidden="true">↗</span></span><span>{u[path+'Description']}</span><small>{u[path+'Meta']}</small></button>)}</div></>:<>
      <div className="tv3-path-bar"><div className="tv3-path-tabs" aria-label={u.switch}>{LEVELS.map(path=><button key={path} data-tutorial-choice={path} aria-pressed={path===selected} onClick={()=>choose(path)}>{u[path]}</button>)}</div><button className="tv3-contents-button" aria-expanded={contents} aria-controls="tv3-contents" onClick={()=>setContents(!contents)}>{u.contents} {contents?'−':'+'}</button></div>
      <nav id="tv3-contents" className="tv3-contents" aria-label={u.contents} hidden={!contents}>{chapters.map((c,i)=><button key={c.id} aria-current={i===index?'step':undefined} onClick={()=>go(i)}><span>{String(i+1).padStart(2,'0')}</span>{c.title}</button>)}</nav>
      <div className="tv3-heading"><p className="tv3-kicker">{u[selected]} <span aria-hidden="true">/</span> {u.chapter} {String(index+1).padStart(2,'0')} {u.of} {chapters.length}</p><h1 ref={heading} tabIndex="-1" id="tv3-heading">{chapter.title}</h1><p>{chapter.subtitle}</p></div>
      <article className="tv3-lesson" aria-labelledby="tv3-heading" data-tutorial-chapter={chapter.id}><Visuals key={`${selected}-${chapter.id}`} chapter={chapter} level={selected} lang={language} labels={d.labels} cards={cards} deck={deck}/><div className="tv3-explanation">{chapter.blocks.map((b,i)=><section key={i}><span className="tv3-block-number" aria-hidden="true">0{i+1}</span><div><h2>{b.title}</h2><p>{b.text}</p></div></section>)}<aside className="tv3-takeaway"><h2>{u.takeaway}</h2><p>{chapter.takeaway}</p></aside></div></article>
      <nav className="tv3-navigation" aria-label={u.badge}><button className="tv3-prev" disabled={index===0} onClick={()=>go(index-1)}>← {u.previous}</button><div className="tv3-progress"><span role="status">{u.chapter} {index+1} {u.of} {chapters.length}</span><div>{chapters.map((c,i)=><button key={c.id} aria-label={`${u.chapter} ${i+1}: ${c.title}`} aria-current={i===index?'step':undefined} onClick={()=>go(i)}><span/></button>)}</div></div>{index<chapters.length-1?<button className="tv3-next" onClick={()=>go(index+1)}>{u.next} →</button>:<button className="tv3-next" onClick={start}>{u.play} →</button>}</nav>
    </>}
    <details className="tv3-references"><summary>{u.sources}</summary><ul>{references.map(([label,url])=><li key={url}><a href={url} target="_blank" rel="noreferrer">{label}</a></li>)}</ul></details>
  </main>;
}
