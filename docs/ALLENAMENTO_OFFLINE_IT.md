# Allenare la LLM sul tuo computer

**Michele, il gioco è pronto da avviare senza LLM.** Questo kit ti permette di continuare localmente l'addestramento del modello sperimentale. Non richiede abbonamenti, API o servizi di training a pagamento. Il primo allestimento richiede Internet per installare le dipendenze e scaricare il modello base; in seguito training, valutazione ed esportazione funzionano offline.

## 1. Cosa trovi nello ZIP

| Materiale | Percorso | Stato |
|---|---|---|
| Gioco con le 59 carte, IT/EN/FR | `dist/`, `src/` | Avviabile e predisposto per GitHub Pages |
| Dataset SFT | `training/llm/train.jsonl` | 1.316 esempi: 449 IT, 434 EN, 433 FR |
| Set di sviluppo | `training/llm/heldout.jsonl` | 33 casi; già esaminati, non un test finale indipendente |
| Catalogo degli identificatori | `training/llm/catalogue.json` | Etichette nelle tre lingue |
| Pesi LoRA già addestrati | `training/llm/adapter/` | Addestramento realmente concluso, circa 2,1 MB di pesi |
| Rapporto del training eseguito | `training/llm/training-run.json` | 329 aggiornamenti, un'epoca, 540.672 parametri addestrabili |
| Output completi della valutazione | `training/llm/evaluation-*.json` | Base 0/33, LoRA 6/33 in corrispondenza esatta |
| Training locale con ripresa | `scripts/train-offline.py` | CPU/CUDA, checkpoint con ottimizzatore e stato casuale |
| Valutazione e fusione | `scripts/evaluate-offline.py`, `scripts/export-llm.py` | Esecuzione locale, nessuna API |
| Conversione per WebLLM | `scripts/quantize-web.py` | Esportazione q4f32_1 per lo stesso Qwen 0.5B |

**Il modello base completo non è nello ZIP.** Lo script di download recupera circa 1 GB una sola volta, fissando Qwen2.5-0.5B-Instruct alla revisione `7ae557604adf67be50417f59c2c2f167def9a775`. I pesi LoRA non funzionano da soli: vanno caricati insieme a questa base.

Non considero la LLM attuale pronta come interprete autonomo: 6/33 è insufficiente. Il gioco usa già regole e un classificatore locale separato, quindi questa limitazione non impedisce di giocare. La build consegnata non propone di scaricare un modello browser mancante; il pulsante si abiliterà dopo un'esportazione completa e un nuovo build.

## 2. Preparare l'ambiente

Estrai lo ZIP ed entra nella cartella `guess-the-radionuclide`. Tutti i comandi seguenti partono da lì. Usa **Python 3.12**; non l'ambiente Python 3.8 di un eventuale vecchio cluster.

Linux/macOS:

```sh
python3 -m venv .venv-llm
source .venv-llm/bin/activate
```

Windows, Prompt dei comandi:

```bat
py -3.12 -m venv .venv-llm
.venv-llm\Scripts\activate.bat
```

Dopo l'attivazione, usa `python` nei comandi sottostanti.

### Solo CPU

Linux/Windows:

```sh
python -m pip install torch==2.8.0 --index-url https://download.pytorch.org/whl/cpu
python -m pip install -r training/llm/requirements.txt
```

Su macOS installa `torch==2.8.0` dall'indice pip ordinario, poi lo stesso file requirements. Lo script seleziona CPU se CUDA non è presente; il percorso MPS non è configurato in questo kit.

### GPU NVIDIA

Installa PyTorch **2.8.0** con la variante CUDA compatibile con scheda e driver. Esempio per un ambiente compatibile con CUDA 12.6:

```sh
python -m pip install torch==2.8.0 --index-url https://download.pytorch.org/whl/cu126
python -m pip install -r training/llm/requirements.txt
python -c "import torch; print(torch.__version__); print('CUDA:', torch.cuda.is_available())"
```

Deve comparire `CUDA: True`. La [pagina ufficiale delle versioni PyTorch](https://pytorch.org/get-started/previous-versions/#v280) elenca le varianti 2.8.0. Non usare `requirements-lock.txt` dell'esecuzione precedente per convertire un ambiente GPU: quel file conserva la configurazione **CPU** originale. Per il nuovo ambiente usa `requirements.txt` e la variante di torch scelta sopra.

Come punto di partenza pratico: 16 GB di RAM e almeno 10 GB di spazio libero; una GPU con 8 GB di VRAM lascia margine per batch piccoli. Sono indicazioni di pianificazione, non requisiti misurati su tutte le macchine. La nuova pipeline è stata verificata su CPU con un modello minuscolo: training, ripresa con pesi finali identici, checkpoint incompleto ignorato, avvio dai pesi precedenti, valutazione e merge. CUDA va verificato sulla tua macchina. Il rapporto è in `docs/offline-kit-test.json`.

Scarica la base mentre sei connesso:

```sh
python scripts/download-model.py
```

Da questo momento gli script di training, valutazione e merge impostano la modalità offline e caricano soltanto file locali. Nessuna domanda viene inviata a Hugging Face o a una API LLM durante queste operazioni.

## 3. Primo controllo breve

Prima di lanciare un lavoro lungo:

```sh
python scripts/train-offline.py --device cpu --max-steps 2 --save-steps 1 --output training/runs/prova
```

Con NVIDIA sostituisci `--device cpu` con `--device cuda`. Questa prova controlla memoria, tokenizzazione e scrittura dei checkpoint; due aggiornamenti non producono un modello utile. Ogni esperimento deve usare una cartella nuova. Lo script rifiuta di sovrascrivere una cartella già popolata.

## 4. Continuare dai pesi inclusi

```sh
python scripts/train-offline.py --device cpu --init-adapter training/llm/adapter --output training/runs/mio-run --epochs 3 --batch-size 1 --accumulation 8 --lr 0.0001 --save-steps 50
```

Per NVIDIA usa lo stesso comando con `--device cuda`; se serve memoria aggiungi `--gradient-checkpointing`. Riduci prima il batch se compare un errore di memoria. Non aumentare la lunghezza massima senza motivo: il programma rifiuta il troncamento silenzioso delle domande.

`--init-adapter` è un **nuovo training dai pesi esistenti**, con un nuovo ottimizzatore. Non riprende esattamente il vecchio training: i checkpoint originali contenevano i pesi LoRA, non lo stato dell'ottimizzatore. Ometti `--init-adapter` per partire dal Qwen base.

L'epoca originale CPU durò circa 547 secondi in questo ambiente, usando un diverso ciclo di training e bfloat16. Non è una previsione per la tua macchina o per la nuova pipeline. Più epoche non garantiscono migliore comprensione: possono soltanto memorizzare le formulazioni esistenti.

## 5. Interrompere e riprendere

Il nuovo script salva `checkpoint-N` con pesi, ottimizzatore, scheduler e stato casuale ogni 50 aggiornamenti. Conserva gli ultimi due checkpoint. Puoi scegliere `--save-steps 10` dall'inizio per salvataggi più frequenti.

Dopo un'interruzione, ripeti **lo stesso comando**, con gli stessi percorsi e opzioni, aggiungendo `--resume`:

```sh
python scripts/train-offline.py --device cpu --init-adapter training/llm/adapter --output training/runs/mio-run --epochs 3 --batch-size 1 --accumulation 8 --lr 0.0001 --save-steps 50 --resume
```

La ripresa usa l'ultimo checkpoint completo; gli aggiornamenti successivi all'ultimo salvataggio sono persi. Non cambiare dataset, batch, accumulo o altre opzioni nella stessa ripresa: gli hash e la configurazione vengono controllati. Per cambiare esperimento usa una nuova cartella con `--init-adapter` puntato a un checkpoint o a `final/`.

Al termine trovi `training/runs/mio-run/final/` e `training-summary.json`. Non eliminare i checkpoint durante un lavoro attivo.

## 6. Misurare i miglioramenti

```sh
python scripts/evaluate-offline.py --adapter training/runs/mio-run/final --output training/runs/mio-run/valutazione-dev.json
```

Aggiungi `--device cuda` se disponibile. Per valutare la base ometti `--adapter`, scegliendo un diverso file di output. I rapporti conservano ogni domanda, risposta grezza, errore e conteggio per lingua; nessuna correzione nascosta degli identificatori.

I 33 casi attuali sono materiale di **sviluppo**: sono già stati usati per capire gli errori. Prepara un altro file, per esempio `training/llm/test-finale.jsonl`, da non usare per scegliere iperparametri o costruire esempi di training. Valutalo soltanto alla fine:

```sh
python scripts/evaluate-offline.py --adapter training/runs/mio-run/final --data training/llm/test-finale.jsonl --output training/runs/mio-run/valutazione-finale.json
```

Controlla soprattutto: PET contro semplice emissione di positroni; negazioni; decadimento beta ambiguo; unità e numeri; identificatori inventati; richieste della carta segreta; domande fuori catalogo. Un JSON formalmente corretto può avere il significato sbagliato.

## 7. Ampliare il corpus in modo utile

Conserva `train.jsonl` originale. Crea un tuo file con gli stessi campi `lang`, `text`, `query`, `messages`. In `messages` usa tre elementi, ruoli `system`, `user`, `assistant`: il testo utente deve coincidere con `text` e il JSON della risposta con `query`. Il prompt originale è in `instruction.txt`; gli identificatori validi sono in `catalogue.json`.

Esempio di etichetta:

```json
{"type":"parsed","queryType":"concept","conceptId":"medical.pet","negated":false}
```

Esempio numerico:

```json
{"type":"parsed","queryType":"numeric","property":"halfLifeSeconds","operator":">","value":172800,"negated":false}
```

Per una domanda ambigua o fuori scopo:

```json
{"type":"clarify"}
```

Preferisci formulazioni naturali, abbreviazioni ragionevoli, errori ortografici realistici e coppie positive/negative. Bilancia le lingue e raccogli esempi dei concetti che il modello confonde. Evita di moltiplicare migliaia di volte la stessa frase cambiando una parola: aumenta la dimensione del file, non necessariamente la generalizzazione. Il controllo automatico individua etichette in conflitto e sovrapposizioni testuali fra training e sviluppo, ma non sa individuare tutte le parafrasi duplicate.

Il browser aggiunge un catalogo di candidati al prompt, mentre il primo SFT era senza quel contesto. Per un esperimento successivo, allinea i prompt di training alla forma di uso prevista e verifica separatamente i casi in cui il concetto corretto manca dai candidati. Non interpretare il risultato del test con regole come accuratezza della LLM da sola.

Per usare i nuovi dati:

```sh
python scripts/train-offline.py --train training/llm/mio-train.jsonl --dev training/llm/mio-dev.jsonl --init-adapter training/llm/adapter --output training/runs/dati-nuovi --device cpu
```

Il training deve insegnare a **interpretare la domanda**, non a inventare emivite o dati nucleari: quelli restano nel database verificabile del gioco. Usa testo tuo o con permesso/licenza compatibile. Il kit conserva licenza Apache-2.0 di Qwen e attribuzioni; non assume che qualunque contenuto reperibile online possa essere usato liberamente.

## 8. Esportare il modello per il gioco

Dopo una valutazione soddisfacente:

```sh
python scripts/export-llm.py --adapter training/runs/mio-run/final --output training/runs/mio-run/merged
python scripts/quantize-web.py --merged training/runs/mio-run/merged
npm ci
npm run build
npx playwright install chromium --only-shell
npm run test:llm
```

Questi comandi si riferiscono alla **stessa architettura Qwen2.5-0.5B**. Cambiare famiglia o dimensione del modello richiede anche un runtime WebGPU diverso. Il convertitore controlla forma, tipo e limite di errore di quantizzazione dei 267 tensori; ciò non prova che l'accuratezza linguistica sia rimasta sufficiente.

L'esportazione produce circa 324 MB sotto `models/rn-qwen/`. Il build copia i file nella struttura `dist/models/rn-qwen/resolve/main/`, necessaria per gli URL di WebLLM. I pesi sono esclusi dal precache del gioco e vengono scaricati soltanto quando si attiva il modello. Per aggiornare deliberatamente un'esportazione esistente, aggiungi `--replace` al convertitore dopo averne conservato una copia.

Il test WebGPU software può essere molto lento; nelle prove precedenti si sono verificati timeout e risposte non corrette. Non considerare l'esportazione un'approvazione automatica per la pubblicazione. Mantieni la conferma dell'interpretazione nel gioco. Prima di una nuova versione pubblica cambia anche versione/percorso del modello per evitare cache obsolete.

## 9. Pubblicare il gioco su GitHub

Il gioco funziona anche senza i pesi browser. Segui il README per GitHub Pages: copia il progetto nel repository esistente, scegli **Settings → Pages → GitHub Actions** e usa il workflow incluso. Nessun push è già stato eseguito sul tuo account.

Se includi la LLM esportata, aggiungi `models/rn-qwen/` a Git. I frammenti sono inferiori a 100 MiB; usa Git per caricarli. `dist/` viene rigenerato dal workflow. Non caricare ambiente virtuale, modello base, merge float32 o checkpoint di lavoro: sono esclusi da Git.

## 10. Macchina completamente isolata da Internet

Su una macchina con **lo stesso sistema operativo, architettura e Python 3.12** del computer offline, prepara prima il progetto, la base con `download-model.py` e le wheel. Per Linux/Windows CPU:

```sh
python -m pip download --dest training/llm/wheels torch==2.8.0 --index-url https://download.pytorch.org/whl/cpu
python -m pip download --dest training/llm/wheels --find-links training/llm/wheels torch==2.8.0+cpu -r training/llm/requirements.txt
```

Trasferisci la cartella del progetto, includendo `training/llm/base/` e `training/llm/wheels/`, che non sono presenti nello ZIP consegnato. Crea un nuovo ambiente sul computer isolato, poi:

```sh
python -m pip install --no-index --find-links training/llm/wheels torch==2.8.0+cpu -r training/llm/requirements.txt
```

Per CUDA servono wheel della variante CUDA scelta e un driver compatibile già installato; non usare il pacchetto CPU di questo esempio. Non copiare semplicemente `.venv-llm` fra sistemi diversi. Per ricostruire anche il sito offline, prepara inoltre Node e le dipendenze npm sul sistema compatibile prima del trasferimento; il `dist/` incluso può già essere servito senza ricompilazione.

## Fonti tecniche

[Qwen2.5-0.5B-Instruct e licenza](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct) · [checkpoint PEFT](https://huggingface.co/docs/peft/developer_guides/checkpoint) · [versioni PyTorch](https://pytorch.org/get-started/previous-versions/) · [WebLLM](https://llm.mlc.ai/docs/deploy/webllm.html).
