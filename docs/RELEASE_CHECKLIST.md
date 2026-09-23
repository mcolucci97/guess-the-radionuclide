# Consegna v3

Questa versione prosegue il codice pubblicato di Michele Colucci e conserva le 59 carte. Non richiede chiavi API.

## Gioco

- Interfaccia, tutorial e domande in italiano, inglese e francese.
- Partita contro il computer o due giocatori sullo stesso dispositivo.
- Conferma della domanda, turno successivo prima di tentare la soluzione, protezione delle carte durante il passaggio del dispositivo.
- Atlante con fonti, righe gamma e simulazione del decadimento.
- Uso offline dopo il primo caricamento; la LLM è un download facoltativo separato.

## Verifiche ripetibili

`npm test` verifica il motore e il contratto con la LLM; `npm run test:e2e` prova la partita nel browser. I rapporti inclusi documentano esecuzioni reali. `npm run test:llm` esegue separatamente la LLM quantizzata con WebGPU software: è più lento e non è richiesto dal workflow ordinario.

Il piccolo insieme linguistico in `training/llm/heldout.jsonl` è ormai un insieme di sviluppo: gli errori sono stati esaminati. Non misura la generalizzazione a tutte le domande. Le prestazioni del modello grezzo e della pipeline con regole e catalogo devono restare distinte.

## Pubblicazione

La cartella `dist/` può essere servita da un host statico. Per GitHub Pages, seguire README.md e includere `models/rn-qwen/` nel commit soltanto dopo aver esportato il modello; il workflow ricostruisce il sito. Nessun push o deploy sull’account del proprietario è stato effettuato durante la preparazione.

## Limiti da mantenere visibili

La LLM è sperimentale e può scegliere il concetto sbagliato anche producendo un JSON valido. Le risposte scientifiche sono calcolate dal database, dopo la conferma dell’interpretazione. Le associazioni narrative e i cinque valori di cattura ereditati non sono tutti rivalidati. Non è un prodotto certificato dall’IAEA.
