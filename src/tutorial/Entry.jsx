import React, {Suspense,useMemo,useState} from 'react';
const messages={
 it:{loading:'Caricamento del percorso…',error:'Il percorso non è stato caricato. Riprova quando la connessione è disponibile.',retry:'Riprova',back:'Torna alla home'},
 en:{loading:'Loading your path…',error:'The path could not be loaded. Try again when connected.',retry:'Retry',back:'Back to home'},
 fr:{loading:'Chargement du parcours…',error:'Le parcours n’a pas pu être chargé. Réessayez avec une connexion.',retry:'Réessayer',back:'Retour à l’accueil'},
};
class Boundary extends React.Component {
 state={error:false};
 static getDerivedStateFromError(){return {error:true};}
 render(){return this.state.error?this.props.fallback:this.props.children;}
}
export default function TutorialEntry(props){
 const [attempt,setAttempt]=useState(0),text=messages[props.lang]||messages.en;
 const Tutorial=useMemo(()=>React.lazy(()=>import('./Tutorial.jsx')),[attempt]);
 const fallback=<main className="mx-auto max-w-4xl px-5 py-8"><p role="alert">{text.error}</p><button onClick={()=>setAttempt(x=>x+1)}>{text.retry}</button> · <button onClick={props.close}>{text.back}</button></main>;
 return <Boundary key={attempt} fallback={fallback}><Suspense fallback={<main className="mx-auto max-w-4xl px-5 py-8"><p role="status">{text.loading}</p><button onClick={props.close}>{text.back}</button></main>}><Tutorial {...props}/></Suspense></Boundary>;
}
