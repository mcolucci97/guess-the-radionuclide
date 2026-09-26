# Learning Engine V1 — consegna finale

- Branch locale: `feature/learning-engine-v1`.
- Base/main verificata all’inizio: `35b7a71218355101006bc4b7b3f62130c3a080c5`.
- Commit backbone: `ed487f9`; integrazione: `332a865`.
- Ultimo commit di codice e verifiche: `0eb0264e81101c18062ae7b7ded1840ca2b48bed`.
- Stato consegnato: questo commit più i rapporti finali; nessuna scrittura remota.
- Checkpoint ZIP 01 e 02 creati durante lo sviluppo; consegna finale: `guess-rn-learning-engine-v1-complete.zip`.

## Fasi completate

Fasi 0–12 completate: ispezione/baseline; adapter Explorer/Scientist; eventi; modello locale ed evidenze; scheduler; previsione Explorer; Scientist manuale e feedback ritardato; valore informativo; lente secondaria; auto-spiegazione; recap/recupero; mazzo adattivo; trasporto ricerca disabilitato; regressioni, recupero e documentazione.

Tutti i 46 concetti canonici e le 13 ancore V3 preservati. Nove correzioni diagnostiche, con contatori specifici per evitare che errori generici aggirino il cooldown. Contenuti scientifici provvisori e modificabili, senza nuovi valori nucleari.

## File e compatibilità

Nuovo modulo `src/learning/`, test dedicati, copia della specifica e documentazione. Modificati App, CSS, OnlineGame e l’hook locale prima/dopo il filtro. Inventario esatto: `LEARNING_ENGINE_FILES.txt`; rapporto completo in 26 punti: `LEARNING_ENGINE_REPORT.md`.

Legacy base/intermediate → Explorer, expert → Scientist; nuove stanze serialize come intermediate/expert. Nessun selettore pubblico legacy o Children/Adult. Locale parlato conserva il funzionamento manuale privato. Online conserva un solo mazzo condiviso.

Invariati dati scientifici, motore, LLM, protocollo, RoomService, state machine, trasporto Firebase, regole e workflow `RN_FIREBASE_CONFIG`. Nessuna nuova dipendenza o telemetria remota educativa.

## Verifiche finali — 26 settembre 2026

- Baseline: 657/658 test unitari, un errore già esistente.
- Finale: 690/691 test unitari; soltanto lo stesso errore preesistente.
- Learning: 30/30; multiplayer/recovery: 22/22 (compresi nella suite completa).
- Regole Firebase reali negli emulatori: 7/7.
- Browser generale: 11/11 gruppi; Learning: 5/5; online emulatori: 9/9.
- Zero errori di pagina nelle tre suite browser; zero richieste esterne nella suite Learning solo.
- Build di produzione passata e ripristinata dopo le prove online.
- `git diff --check` passato; confronto dei percorsi protetti senza differenze.

Verificati refresh durante previsione pendente senza evidenza duplicata, annullamento del filtro quando si lascia la schermata, errore dell’hook senza blocco del gioco, snapshot malformato, storage bloccato, IndexedDB reale, invii duplicati, cooldown e deroga diagnostica una sola volta.

## Errore noto e limiti

`tests/engine.test.mjs:7` fallisce perché `data/raw/manifest.json` manca già nella base. Il test e i dati sono rimasti invariati. `npm test` e `npm run verify` quindi non sono completamente verdi.

Nessun test fisico su dispositivi reali, deploy o inferenza generativa LLM in questa sessione. Profilo solo locale; nessun account o sincronizzazione. Il gate di ricerca, l'identità pseudonima e il backend separato sono ora implementati; la UI pre/post e l'attivazione reale dello studio restano da fare. Sezioni d’urto, produzione e revisione scientifica definitiva restano fuori V1. Il gioco parlato non viene valutato scientificamente.

## Stato corrente e passo successivo

Nessuna fase di implementazione aperta. ZIP completo e rapporti pronti per applicazione manuale. Il prossimo passo è estrarre lo ZIP nella radice della propria copia del repository, controllare l’inventario e caricare le modifiche con il proprio accesso GitHub, conservando `RN_FIREBASE_CONFIG`. Istruzioni dettagliate nel punto 26 del rapporto.
