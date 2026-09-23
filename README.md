# Guess the Radionuclide — versione 3

Il gioco di **Michele Colucci**, esteso a partire dal repository esistente e dal suo bundle pubblicato (`b87471e`). Tutte le **59 carte** sono conservate, con nomi, storie, chimica, logo e crediti RadioLAB/INFN. Interfaccia in italiano, inglese e francese.

## Avvio

Il sito pronto è in **`dist/`**. Con Node.js 22 o successivo:

```sh
npm ci
npm run build
npm run dev
```

Apri http://127.0.0.1:4173/. Serve HTTP/HTTPS: il doppio clic sul file HTML non supporta moduli, worker e modalità offline. Il gioco e l’interprete integrato non richiedono chiavi API. Dopo il primo caricamento completo il gioco può riaprirsi offline. La LLM generativa è sperimentale e non è necessaria per giocare; il suo stato misurato è in [docs/LLM.md](docs/LLM.md).

## GitHub Pages

1. Copia i file nel repository `mcolucci97/guess-the-radionuclide`, inclusa `.github/workflows/pages.yml`.
2. In **Settings → Pages**, seleziona **GitHub Actions** come sorgente di pubblicazione.
3. Esegui il push su `main` oppure avvia il workflow **Test and deploy**. Se esporti la LLM dopo l’addestramento locale, includi anche `models/rn-qwen/`. I pesi browser non sono inclusi in questa consegna; il gioco funziona senza di essi.
4. Il workflow verifica il motore, genera `dist/`, prova una partita nel browser e pubblica il sito. L’URL compare nel job `deploy`.

`dist/` è già incluso nello ZIP per l’avvio immediato, ma è escluso da Git e rigenerato dal workflow. Se installati, i pesi della LLM sono serviti dallo stesso sito e scaricati soltanto quando il giocatore attiva il modello sperimentale.

Per qualsiasi altro host statico, pubblica il contenuto di `dist/`. I percorsi relativi funzionano anche sotto `/guess-the-radionuclide/`. La consegna non implica un push o un deploy già effettuato sul tuo account.

[Configurazione ufficiale GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Miglioramenti

- 59 carte originali; emivite e rami collegati a estratti IAEA/ENSDF con provenienza e hash.
- Righe gamma principali, dati dell’isomero Tc-99m e distinzione fra cattura elettronica e positroni con intensità separate.
- Conferma dell’interpretazione prima del turno; negazioni, decimali, notazione scientifica, conversioni e intervalli.
- Correzioni per alcalino/alcalino-terroso, post-transizione/transizione, cibo naturale/contaminato e domande del catalogo.
- Gioco singolo e locale; schermo riservato nel passaggio del dispositivo, supporto tastiera e layout mobile.
- Tutorial e diagrammi IT/EN/FR; laboratorio interattivo del decadimento.
- Classificatore locale addestrato su 1.006 esempi, più LLM separata: corpus, codice, licenza, pesi e prove sono in `training/llm/`.

## Allenamento locale della LLM

Segui [la guida completa in italiano](docs/ALLENAMENTO_OFFLINE_IT.md): preparazione CPU/CUDA, download iniziale, training offline, checkpoint, valutazione, miglioramento del corpus ed esportazione. Sono inclusi i pesi LoRA e gli errori del training già eseguito; l’accuratezza attuale non è sufficiente per un interprete autonomo.

## Verifica

```sh
npm test
npm run build
npx playwright install chromium --only-shell
npm run test:e2e
```

Risultati: `docs/test-results.tap`, `docs/browser-results.json`; schermate in `docs/screenshots/`. I test automatici non equivalgono a una revisione indipendente di ogni associazione scientifica.

## Dati, crediti e limiti

[Provenienza scientifica](docs/SCIENTIFIC_DATA.md) · [Recupero del progetto](docs/RECOVERY.md) · [Licenze e attribuzioni](THIRD_PARTY_NOTICES.md)

Il progetto è didattico e indipendente, senza certificazione IAEA. Storie, chimica e cinque valori di cattura termica provengono dal gioco precedente e non sono stati tutti rivalidati. Un dato mancante non vale zero. Nessun modello può essere addestrato su “tutte le domande possibili”: consulta la valutazione effettiva della LLM.

## English / Français

**EN:** A 59-card deduction game preserving Michele Colucci’s original project. Run `npm ci`, `npm run build`, `npm run dev`. Publish `dist/` or use the supplied GitHub Pages workflow. No API key is required. Model evaluation: `docs/LLM.md`.

**FR :** Jeu de déduction de 59 cartes conservant le projet de Michele Colucci. Lancez `npm ci`, `npm run build`, `npm run dev`. Publiez `dist/` ou utilisez le workflow GitHub Pages fourni. Aucune clé API n’est nécessaire. Évaluation du modèle : `docs/LLM.md`.
