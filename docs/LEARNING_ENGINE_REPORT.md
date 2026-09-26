# Learning Engine V1 — rapporto di consegna

Data: 26 settembre 2026. Implementazione locale completata e verificata. Nessuna scrittura su GitHub, nessun deploy e nessuna modifica al Firebase di produzione.

## 1. Repository e base

Repository: https://github.com/mcolucci97/guess-the-radionuclide. La main effettivamente verificata all’inizio del lavoro era `35b7a71218355101006bc4b7b3f62130c3a080c5`, «Add environment variable for Firebase config in build». Il pacchetto V3 FINAL è la specifica del nuovo Learning Engine; il repository resta la fonte per il gioco e i dati scientifici.

## 2. Branch locale

`feature/learning-engine-v1`. Nessun branch remoto o PR creato.

## 3. Commit locali

- `ed487f9` — Add two-level learning domain and local evidence backbone.
- `332a865` — Integrate local Learning Engine into deduction and online review.
- `0eb0264e81101c18062ae7b7ded1840ca2b48bed` — Validate learning flows and harden feedback, persistence and online recovery.

Lo ZIP contiene questo codice più i documenti finali di consegna. La directory `.git` non è inclusa. I checkpoint 01 e 02 sono stati creati durante il lavoro, prima della consegna finale.

## 4. File aggiunti

`src/learning/` contiene 22 file, inclusi i due JSON canonici. Aggiunti `tests/learning.test.mjs`, `tests/browser-learning.mjs`, documentazione, risultati e screenshot. Il pacchetto originale è conservato in `docs/learning-spec-v3/` per provenienza, senza importare i questionari di ricerca nel gioco. L’inventario esatto è `docs/LEARNING_ENGINE_FILES.txt`.

## 5. File modificati

`src/App.js`, `src/upgrade.css`, `src/multiplayer/OnlineGame.jsx`, `src/multiplayer/useOnlineRoom.js`, `package.json`, i test browser esistenti e `tests/multiplayer-recovery.test.mjs`; aggiornati i risultati e alcuni screenshot. Nessuna nuova dipendenza. Nessuna modifica a `src/engine/`, `src/data/`, `data/`, LLM, lockfile, RoomService, state machine, trasporto Firebase, regole o workflow Pages.

## 6. Compatibilità dei livelli

| Valore | Livello normale | Serializzazione online nuova |
| --- | --- | --- |
| `base` preesistente | Explorer | — |
| `intermediate` preesistente | Explorer | — |
| `expert` preesistente | Scientist | — |
| `explorer` | Explorer | `intermediate` |
| `scientist` | Scientist | `expert` |

L’adapter conserva le vecchie enum alle interfacce che le richiedono, compresi i contenuti esistenti. Le stanze precedenti mantengono la propria configurazione di assistenza.

## 7. Setup normale

Un solo selettore scientifico: Explorer / Scientist, in IT/EN/FR. Rimossi i selettori normali Base/Intermediate/Expert, Children/Adult e assistenza di eliminazione separata. `audience: adult` rimane interno. Explorer imposta eliminazione assistita, Scientist manuale. Rimangono modalità di gioco e dimensione del mazzo. Il tutorial usa lo stesso adapter. La modalità locale parlata conserva il proprio tabellone manuale e il passaggio privato del dispositivo. Online rimane il controllo preesistente dell’assistenza alla risposta, distinto dall’eliminazione.

## 8. Architettura

- `events`, `concepts`, `conceptMapping`, `evidence`: contratto semantico e interpretazione delle evidenze.
- `playerModel`, `profileStore`: profilo locale e migrazione.
- `scheduler`, `interventions`, `questionQuality`, `recap`, `adaptiveDeck`: policy deterministiche.
- `engine`: orchestrazione indipendente da React, Firebase e LLM.
- `gameplay`: adapter al motore scientifico esistente.
- `useLearning`, `LearningPanel`, `i18n`: integrazione e presentazione React.
- `content`: relazioni e correzioni modificabili, marcate provvisorie in attesa di revisione esperta.
- `researchTransport`: interfaccia disabilitata per impostazione predefinita.

## 9. Eventi semantici

Contratto versione 1: `type`, `matchId`, `actionId`, `actor`, `at`, `payload`. Supportati tutti i 15 eventi richiesti: avvio/fine partita, domanda/risposta, selezione/eliminazione, tentativo, richiesta/invio previsione, auto-spiegazione e recupero, feedback e lente. Payload con campi consentiti; nessuna domanda libera, carta segreta o UID di autenticazione nel contratto. Dedupe per attore, azione e tipo. Il gioco online genera gli eventi localmente; Firebase non è l’event bus del Learning Engine.

## 10. Tassonomia e contenuti

Tutti i 46 ID canonici del JSON V3, senza duplicati; alias solo per migrazione. Etichette IT/EN/FR per tutti. Solo le proprietà effettivamente interpretate producono evidenza: chiedere «PET?» non dimostra di conoscere l’annichilazione. Le relazioni strutturate possono poi verificarla. I nove fraintendimenti richiesti hanno correzioni e distrattori diagnostici; un errore generico sulle carte non viene etichettato arbitrariamente come un fraintendimento specifico. Isotopi e irradiazione vengono proposti in contesti pertinenti, come domande su Z, sterilizzazione o radiografia. Nessun nuovo valore nucleare e nessuna importazione scientifica esterna.

## 11. Modello del giocatore

Schema 1: ID locale, livello selezionato, partite completate, revisione di storage, evidenze per concetto, storico interventi limitato a 100, riepiloghi limitati a 50 e stato Learning della partita attiva. Le evidenze comprendono esposizioni, successi indipendenti/assistiti, usi spontanei, recuperi riusciti, errori, timestamp, contatori diagnostici per fraintendimento e deroga al cooldown.

Esposizione e filtro automatico non producono padronanza. Domanda spontanea affidabile, eliminazione manuale non assistita e recupero corretto sono evidenze più forti; previsione e auto-spiegazione corrette sono assistite. Lente o consultazione dettagli marcano l’azione come assistita. Nessuna percentuale di padronanza mostrata.

## 12. Persistenza

IndexedDB `rn-learning-v1`, object store `profiles`, slot `primary`. Snapshot sincrono in localStorage per recuperare scritture recenti, fallback in memoria se lo storage è bloccato. Timeout delle operazioni, migrazione e scarto di snapshot attivi malformati. Il fallimento dello storage non blocca una partita. Il profilo resta sul dispositivo; non è una sincronizzazione fra dispositivi né un nuovo salvataggio completo delle partite solo/locali. Il recupero dello stato online rimane quello del multiplayer esistente.

## 13. Scheduler

Massimo 3 interventi durante una partita; i normali interventi si fermano a 2, il terzo è riservato alla correzione. Un solo intervento per azione e almeno una domanda tra interventi ordinari. Priorità: correzione, recupero, previsione, auto-spiegazione, qualità della domanda.

Cooldown delle spiegazioni: almeno 3 partite completate **e** 24 ore, oppure 7 giorni. Un secondo errore diagnostico dello stesso fraintendimento può derogare una volta; errori generici non bastano. Recupero consentito durante il cooldown, con spiegazione ripetitiva omessa. Priorità di ripasso crescente intorno a 7/30/90 giorni.

## 14. Explorer

Dopo una risposta affidabile, con almeno quattro candidati, nessun valore sconosciuto e una partizione non banale, può proporre la selezione delle carte incompatibili **prima** del filtro. Confronto con la logica deterministica, feedback su una proprietà pertinente, poi eliminazione reale. È sempre possibile continuare senza esercizio. Nessuna carta segreta viene rivelata. Un refresh online durante la previsione recupera il filtro senza ripetere intervento o evidenza.

## 15. Scientist

Eliminazione manuale: gli errori sono permessi. La selezione viene valutata dopo «fine turno»; una correzione pertinente può indicare una carta eliminata erroneamente o una carta incompatibile rimasta. Nessuna previsione Explorer ridondante. Lente facoltativa limitata a proprietà chimiche secondarie e temperatura di fusione; non applicata a decadimento, emivita o ragionamento medico centrale. Domande parlate/non interpretate non ricevono valutazioni scientifiche inventate.

## 16. Valore informativo

Calcolo sulla partizione dei candidati rimasti. Rapporto del gruppo minore sul totale noto: ≥0,35 molto discriminante; ≥0,15 utile; >0 poco discriminante; 0 nessuna discriminazione. Dati sconosciuti: non disponibile. `learningValue` core/supporting/secondary rimane una dimensione separata. Nessuna entropia numerica né punteggio opaco nella UI.

## 17. Auto-spiegazione

Scelte multiple brevi collegate alla domanda appena giocata, chiave deterministica e ordine ruotato stabilmente. Nessuna risposta libera valutata da LLM. I distrattori diagnostici, quando selezionati, costituiscono l’evidenza specifica necessaria per le correzioni. Tutti i contenuti restano facilmente modificabili per la revisione scientifica.

## 18. Riepilogo e recupero

A fine partita: massimo tre concetti incontrati, ordinati per priorità, ed eventualmente una sola relazione di recupero facoltativa. Fuori dal budget degli interventi in partita. Invii duplicati e fine partita ripetuta nella sessione attiva non duplicano le evidenze. Nessun XP, badge, streak, leaderboard o esame obbligatorio.

## 19. Mazzo adattivo

Almeno `ceil(0,8 × dimensione)` estrazioni uniformi senza reinserimento. Solo il resto può avere peso 1–1,5: ancore +0,15, concetti da ripassare +0,20, errori ripetuti +0,15. Ordine finale mescolato. Nessun blocco di progressione. Le 13 ancore sono quelle V3, senza Tb-149. Online il solo host crea un unico mazzo condiviso senza leggere i profili personali per personalizzarlo.

## 20. Ricerca

Default `DisabledResearchTransport`. `InMemoryResearchTransport` disponibile per test e sviluppo; nessun trasporto di rete implementato. Metodi: `startSession`, `recordEvent`, `submitPreTest`, `submitPostTest`, `finishSession`. Nessun backend, schema Firebase di ricerca, raccolta remota educativa o questionario pre/post in gioco. Il trasporto normale delle domande fra i giocatori online rimane invariato.

## 21. Modifiche multiplayer

Solo integrazione UI in `OnlineGame` e hook locale opzionale prima/dopo `applyAnswer` in `useOnlineRoom`. Necessari per collocare la previsione prima del filtro già esistente. Il filtro rimane di RoomService. Le eccezioni del Learning Engine non impediscono il recupero; lasciare la schermata annulla l’applicazione di un filtro ormai obsoleto. Nessuna modifica a protocollo, schema, presenza, segreti, state machine o Security Rules. La serializzazione legacy evita una migrazione di produzione.

## 22–23. Test eseguiti e risultati esatti

Eseguiti in questo ambiente, con Chromium headless, Node 24.19.0 e veri emulatori Firebase Auth/Realtime Database. Le righe specifiche sono sottoinsiemi della suite unit completa, non vanno sommate a essa.

| Verifica | Risultato |
| --- | --- |
| Baseline `npm test` | 657 passati / 658; 1 errore preesistente |
| Finale `npm test` | **690 passati / 691**; lo stesso errore preesistente |
| Learning, `tests/learning.test.mjs` | **30/30** |
| Multiplayer + recovery | **22/22**, di cui 5 recovery |
| `npm run test:rules` | **7/7**, regole effettive negli emulatori |
| `npm run test:e2e` | **11/11 gruppi**, zero errori di pagina |
| `npm run test:learning:e2e` | **5/5 gruppi**, zero errori di pagina, zero richieste esterne |
| `npm run test:online` | **9/9 gruppi**, zero errori di pagina |
| `npm run build` | Passato; build di produzione ripristinata dopo gli emulatori |
| `git diff --check` | Passato |

Report browser: `docs/browser-results.json`, `docs/learning-browser-results.json`, `docs/multiplayer-browser-results.json`. Le prove includono solo, locale parlato, privacy/passaggio dispositivo, IT/EN/FR, offline, previsione prima del filtro, correzione ritardata, storage bloccato, IndexedDB reale, recap, lente, schermo 390 px e testo al 200%, refresh/reconnect, identità e tabelloni privati, rifiuto di un terzo giocatore e vittoria sincronizzata. Le nuove prove recovery verificano anche hook guasto e abbandono durante una previsione. Le asserzioni preesistenti sono conservate; i test browser ora saltano esplicitamente l’esercizio facoltativo quando stanno verificando il normale turno.

## 24. Errore noto

`tests/engine.test.mjs:7`, «All nuclear snapshots match their content hashes»: `ENOENT`, manca `data/raw/manifest.json` già nella base. Non sono stati creati dati o hash sostitutivi e il test non è stato indebolito. Di conseguenza `npm test` e `npm run verify` terminano con errore, mentre la build riesce. Il workflow Pages preesistente esegue `npm ci` e `npm run build`; è rimasto invariato.

## 25. Limiti e rinvii intenzionali

Nessun collaudo fisico fra dispositivi o deploy in produzione durante questo lavoro; le prove online usano emulatori. Nessuna inferenza generativa LLM eseguita: verificato il fallback senza download del modello, lasciando il sottosistema invariato. Il profilo è locale, senza fusione fra dispositivi o gestione di identità separate su un dispositivo condiviso. Sono rinviati backend/consenso/test pre-post di ricerca, validazione esperta definitiva dei contenuti, produzione dei radionuclidi, sezioni d’urto, curriculum esaustivo per ogni nodo e spiegazioni avanzate dell’attivazione. La tassonomia completa non equivale a una batteria esaustiva di esercizi per ogni concetto.

## 26. Applicare manualmente lo ZIP a GitHub

1. Scaricare ed estrarre `guess-rn-learning-engine-v1-complete.zip`. Aprire la cartella interna `guess-the-radionuclide/`.
2. Copiare **il contenuto** di quella cartella nella copia locale del repository esistente, sostituendo i file corrispondenti. Non annidare un secondo `guess-the-radionuclide/` e non caricare lo ZIP stesso come codice sorgente. Conservare la propria `.git` e i file di configurazione locali ignorati.
3. Controllare i file aggiunti/modificati elencati in `docs/LEARNING_ENGINE_FILES.txt`. Con GitHub Desktop o il proprio client creare un commit e caricarlo manualmente. In alternativa, usare «Add file → Upload files» nella radice del repository e caricare le cartelle/file estratti in più gruppi. I percorsi devono rimanere identici.
4. Lo ZIP include anche `.github/workflows/` e `.gitignore`; verificare che siano visibili nel programma di estrazione. Non include `.git`, `node_modules`, `dist`, cache, log degli emulatori o configurazioni personali ignorate. Tutti i sorgenti e asset già tracciati nella base sono inclusi.
5. Per verificare localmente: Node 22 o successivo, `npm ci`, `npm run build`; per i browser installare Chromium con `npx playwright install chromium`. Le regole richiedono Java e gli emulatori Firebase. Eseguire i comandi della tabella, tenendo conto del manifest mancante preesistente.
6. Mantenere l’attuale variabile GitHub Actions `RN_FIREBASE_CONFIG`, il progetto Firebase e le regole già in produzione. Non occorre creare un nuovo backend. Dopo il proprio caricamento su main, il workflow Pages esistente continuerà a usare tale variabile. Eseguire infine un breve collaudo su due dispositivi reali.
