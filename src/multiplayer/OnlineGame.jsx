import React, {useState, useEffect, useMemo} from 'react';
import {be, xe} from '../engine/advanced.js';
import {multiplayerText} from './i18n.js';
import {normalizeCode, uidOf} from './stateMachine.js';
import {answerSuggestion} from './questions.js';
import {useOnlineRoom} from './useOnlineRoom.js';

export function OnlineGame({lang, config, Card, Modal, showDetail, onBack}) {
  const text = multiplayerText[lang];
  const invite = normalizeCode(new URL(location.href).searchParams.get('room') || '');
  const [inputCode,setInputCode] = useState(invite), [question,setQuestion] = useState(''), [chosen,setChosen] = useState(null);
  const [guessMode,setGuessMode] = useState(false), [guess,setGuess] = useState(null), [bypass,setBypass] = useState(false), [copied,setCopied] = useState(false);
  const [answerAssist,setAnswerAssist] = useState(true);
  const [leaving,setLeaving] = useState(false);
  const online = useOnlineRoom(invite);
  const {service,code,room,board,seat,connected,busy,error,run,open,syncing,presence} = online;
  const disabled = !connected || busy || syncing;
  const cards = useMemo(()=>room?.config.deckIds.map(id=>xe[id]).filter(Boolean) || [],[room?.config]);
  const myTurn = room?.current === seat;
  const answering = room?.phase === 'answer' && !myTurn;
  const ownSecret = xe[board?.secretId];
  useEffect(()=>setAnswerAssist(board?.answerAssistance ?? true),[board?.answerAssistance]);
  const suggestion = useMemo(()=>answering ? answerSuggestion(room.event,ownSecret,board?.answerAssistance,lang) : null,[room?.event,answering,ownSecret,board?.answerAssistance,lang]);
  useEffect(()=>{setBypass(false);setGuess(null);setGuessMode(false);},[room?.event.id,room?.turn]);
  const send = async verbal => {
    if (await run(()=>service.question(code,room,question,lang,verbal))) setQuestion('');
  };
  const respond = (yes,query = null) => run(()=>service.answer(code,room,yes,query));
  const confirmSecret = () => run(()=>service.selectSecret(code,chosen.id));
  const create = () => open(()=> {
    const deck = [...be];
    for (let i=deck.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
    return service.create({...config,deckIds:deck.slice(0,config.deckSize).map(c=>c.id)});
  });
  const copy = async () => {
    const url = new URL(location.href); url.searchParams.set('room',code);
    try { await navigator.clipboard.writeText(url.href); setCopied(true); } catch { setCopied(false); }
  };
  const manualButtons = <div className="mp-actions"><button disabled={disabled} onClick={()=>respond(true)}>{text.yes}</button><button disabled={disabled} onClick={()=>respond(false)}>{text.no}</button></div>;
  const opponentUid = room && uidOf(room,3-seat);
  const back = () => { const url=new URL(location.href);url.searchParams.delete('room');history.replaceState(null,'',url);onBack(); };
  return <main className="mp-shell">
    <div className="mp-top"><h1>{text.online}</h1><button onClick={back}>{text.leave}</button></div>
    <p role="status" data-testid="connection">{connected ? text.connected : text.reconnecting}</p>
    {!navigator.onLine && <p role="alert">{text.offline}</p>}
    {error && <div role="alert" className="mp-error"><p>{text[error] || text.error}</p><button onClick={online.retry}>{text.retry}</button></div>}
    {!code && <section className="mp-panel">
      <button disabled={!service || !connected || busy} onClick={create}>{text.create}</button>
      <label htmlFor="room-code">{text.code}</label>
      <input id="room-code" value={inputCode} maxLength={6} autoComplete="off" autoCapitalize="characters" onChange={e=>setInputCode(normalizeCode(e.target.value))}/>
      <button disabled={!service || !connected || busy} onClick={()=>open(()=>service.join(inputCode))}>{text.join}</button>
    </section>}
    {code && <section className="mp-panel">
      <div className="mp-top"><p>{text.code}: <strong data-testid="room-code" className="mp-code">{code}</strong></p><button onClick={copy}>{copied?text.copied:text.copy}</button></div>
      <a className="mp-invite" href={'?room='+code}>{new URL('?room='+code,document.baseURI).href}</a>
      <button onClick={()=>setLeaving(true)} disabled={busy}>{text.leaveRoom}</button>
      {room?.guestUid && opponentUid && !presence[opponentUid] && <p role="status">{text.disconnected}</p>}
    </section>}
    {room && board && <>
      {room.phase === 'select' && <>
        <div className="mp-panel">
          <p>{text.player} 1: {room.ready.p1?text.ready:text.notReady} · {text.player} 2: {room.ready.p2?text.ready:text.notReady}</p>
          {!room.guestUid && <h2>{text.waiting}</h2>}
          {room.guestUid && !board.secretId && <><h2>{text.pick}</h2>{chosen && <div className="mp-confirm"><strong>{chosen.name[lang]}</strong><button disabled={disabled} onClick={confirmSecret}>{text.confirmSecret}</button></div>}</>}
          {board.secretId && <p>{text.selected} · {text.waiting}</p>}
        </div>
        {room.guestUid && !board.secretId && <div className="mp-board">{cards.map(card=><Card key={card.id} item={card} lang={lang} audience={room.config.audience} level={room.config.level} compact onClick={()=>setChosen(card)}/>)}</div>}
      </>}
      {room.phase !== 'select' && room.phase !== 'finished' && <>
        <div className="mp-top"><h2 data-testid="turn">{myTurn?text.yourTurn:text.opponentTurn}</h2><p>{cards.filter(c=>board.remaining[c.id]&&!board.manuallyDown[c.id]).length} {text.candidates}</p></div>
        <div className="mp-layout">
          <aside className="mp-panel">
            <p>{text.secret}: <strong>{ownSecret?.name[lang]}</strong></p>
            <label className="mp-check"><input type="checkbox" checked={answerAssist} disabled={disabled} onChange={async e=>{const value=e.target.checked;setAnswerAssist(value);if(!await run(()=>service.setAssistance(code,value)))setAnswerAssist(board.answerAssistance);}}/>{text.assistance}</label>
            <p>{text.elimination}: {room.config.assist==='assisted'?text.automatic:text.manual}</p>
            {room.phase === 'ask' && myTurn && <>
              {room.event.kind==='guess' && !room.event.correct && <p>{text.wrong}</p>}
              {!guessMode && <><label htmlFor="online-question">{text.write}</label><textarea id="online-question" maxLength={4000} value={question} onChange={e=>setQuestion(e.target.value)}/>
                <button disabled={disabled || !question.trim()} onClick={()=>send(false)}>{text.send}</button>
                <button disabled={disabled} onClick={()=>send(true)}>{text.verbal}</button></>}
              <button disabled={disabled} onClick={()=>setGuessMode(v=>!v)}>{guessMode?text.cancel:text.guess}</button>
              {guessMode && <p>{text.chooseGuess}</p>}
            </>}
            {room.phase === 'answer' && <>
              <p className="mp-question" data-testid="received-question">{room.event.kind==='written'?room.event.rawText:text.verbalEvent}</p>
              {myTurn ? <h3>{text.waitingAnswer}</h3> : <>
                {suggestion?.query && !bypass && <div data-testid="suggestion"><h3>{text.interpretation}</h3><p>{suggestion.label}</p><p>{text.suggested}: <strong>{suggestion.yes?text.yes:text.no}</strong></p>
                  <button disabled={disabled} onClick={()=>respond(suggestion.yes,suggestion.query)}>{text.confirmAnswer}</button>
                  <button onClick={()=>setBypass(true)}>{text.reject}</button></div>}
                {suggestion?.failed && !bypass && <><p>{text.failed}</p><button onClick={()=>setBypass(true)}>{text.bypass}</button></>}
                {(bypass || suggestion?.manual) && manualButtons}
              </>}
            </>}
            {room.phase === 'review' && <>
              <p className="mp-question">{room.event.kind==='written'?room.event.rawText:text.verbalEvent}</p>
              <h3>{text.answer}: {room.event.answer==='yes'?text.yes:text.no}</h3>
              {myTurn && <><p>{room.event.acceptedQueryJson&&room.config.assist==='assisted'?text.autoHint:text.manualHint}</p>
                <button disabled={disabled} onClick={()=>run(()=>service.end(code,room))}>{text.endTurn}</button></>}
            </>}
            {room.phase === 'guess' && <p>{text.waitingGuess}</p>}
          </aside>
          <div className="mp-board">{cards.map(card=>{
            const down = !board.remaining[card.id] || board.manuallyDown[card.id];
            return <Card key={card.id} item={card} lang={lang} compact audience={room.config.audience} level={room.config.level} inactive={down}
              onClick={()=>guessMode&&myTurn&&room.phase==='ask'?setGuess(card):showDetail(card)}
              action={!guessMode&&myTurn&&room.phase==='review'?{label:down?text.restore:text.eliminate,disabled,onClick:()=>run(()=>service.toggleCard(code,card.id))}:null}/>;
          })}</div>
        </div>
      </>}
      {room.phase === 'finished' && <section className="mp-panel"><h2>{room.winner===seat?text.won:text.lost}</h2><p>{text.reveal}: {xe[room.event.cardId]?.name[lang]}</p><button onClick={()=>{online.forgetRoom();setChosen(null);}}>{text.create}</button><button onClick={back}>{text.leave}</button></section>}
    </>}
    {guess && <Modal close={()=>setGuess(null)}><h2>{text.confirmGuess}</h2><p>{guess.name[lang]}</p><button className="confirm" disabled={disabled} onClick={async()=>{if(await run(()=>service.guess(code,room,guess.id)))setGuess(null);}}>{text.confirmGuess}</button><button onClick={()=>setGuess(null)}>{text.cancel}</button></Modal>}
    {leaving && <Modal close={()=>setLeaving(false)}><h2>{text.leaveRoom}</h2><p>{text.leaveHint}</p><button className="confirm" onClick={()=>{online.forgetRoom();setChosen(null);setLeaving(false);}}>{text.leaveRoom}</button><button onClick={()=>setLeaving(false)}>{text.cancel}</button></Modal>}
  </main>;
}
